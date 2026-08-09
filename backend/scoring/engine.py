import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ScoringEngine:
    SOURCE_WEIGHTS = {
        'GST': {'max': 25, 'label': 'GST Portal Compliance'},
        'MCA21': {'max': 20, 'label': 'MCA21 Corporate Registry'},
        'eCourts': {'max': 20, 'label': 'Court Litigation Records'},
        'NCLT/IBBI': {'max': 20, 'label': 'NCLT/IBBI Insolvency'},
        'RBI/SEBI': {'max': 10, 'label': 'RBI/SEBI Defaulters List'},
        'Google News': {'max': 5, 'label': 'Adverse Media Intelligence'},
    }
    
    def calculate(self, scraper_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Takes list of scraper results, calculates score, and attaches raw evidence data."""
        trust_score = 100
        breakdown = []
        risk_flags = []
        is_critical_blocker = False
        critical_reasons = []

        # Initialize breakdown
        for source, config in self.SOURCE_WEIGHTS.items():
            breakdown.append({
                'source': source,
                'label': config['label'],
                'max_score': config['max'],
                'actual_score': config['max'],
                'status': 'verified',
                'findings': [],
                'evidence': {}
            })
            
        breakdown_map = {b['source']: b for b in breakdown}
        
        for result in scraper_results:
            if not isinstance(result, dict) or 'source' not in result:
                continue
                
            source = result.get('source')
            if source not in breakdown_map:
                continue
                
            b_entry = breakdown_map[source]
            b_entry['evidence'] = result  # Attach complete raw evidence for UI drill-down!
            
            # MCA Struck Off / Defunct Check
            if source == 'MCA21':
                mca_status = str(result.get('status', '')).upper()
                if mca_status in ['STRUCK OFF', 'UNDER LIQUIDATION', 'DORMANT']:
                    is_critical_blocker = True
                    critical_reasons.append(f"Company status in MCA21 is '{result.get('status')}'")
                    b_entry['actual_score'] = 0
                    trust_score -= 20
                
                # Check disqualified directors
                for director in result.get('directors', []):
                    if director.get('disqualified'):
                        trust_score -= 15
                        risk_flags.append({
                            'source': 'MCA21',
                            'severity': 'CRITICAL',
                            'description': f"Director {director.get('name')} (DIN: {director.get('din')}) is DISQUALIFIED under Section 164(2)"
                        })

            # GST Active Check
            elif source == 'GST':
                gst_status = str(result.get('status', '')).upper()
                if gst_status and gst_status not in ['ACTIVE', 'ACT', 'UNKNOWN']:
                    trust_score -= 20
                    risk_flags.append({
                        'source': 'GST',
                        'severity': 'HIGH',
                        'description': f"GST Registration status is '{result.get('status')}' (Cancelled/Suspended)"
                    })

            # eCourts Litigation Check
            elif source == 'eCourts':
                cases = result.get('cases', [])
                if len(cases) > 0:
                    deduction = min(20, len(cases) * 10)
                    b_entry['actual_score'] = max(0, 20 - deduction)
                    trust_score -= deduction
                    for case in cases:
                        risk_flags.append({
                            'source': 'eCourts',
                            'severity': 'HIGH',
                            'description': f"Pending Case #{case.get('case_number')} in {case.get('court')}: {case.get('description', 'Legal Dispute')}"
                        })

            # Insolvency Check
            elif source == 'NCLT/IBBI':
                proceedings = result.get('proceedings', [])
                if len(proceedings) > 0:
                    is_critical_blocker = True
                    critical_reasons.append("Active NCLT Insolvency Proceedings Found")
                    b_entry['actual_score'] = 0
                    trust_score -= 20
                    for proc in proceedings:
                        risk_flags.append({
                            'source': 'NCLT/IBBI',
                            'severity': 'CRITICAL',
                            'description': f"Insolvency proceeding filed at {proc.get('bench')} Bench (Case #{proc.get('case_no')})"
                        })

            # RBI Defaulters Check
            elif source == 'RBI/SEBI':
                if result.get('rbi_defaulter') or result.get('sebi_debarred'):
                    is_critical_blocker = True
                    critical_reasons.append("Entity listed on RBI Wilful Defaulters or SEBI Debarred List")
                    b_entry['actual_score'] = 0
                    trust_score -= 10
                    risk_flags.append({
                        'source': 'RBI/SEBI',
                        'severity': 'CRITICAL',
                        'description': "Matches official RBI Wilful Defaulter or SEBI Debarred Entities database"
                    })

            # Google News Scraper
            elif source == 'Google News':
                if result.get('fraud_mentioned'):
                    b_entry['actual_score'] = 0
                    trust_score -= 5
                    for article in result.get('articles', [])[:2]:
                        risk_flags.append({
                            'source': 'Google News',
                            'severity': 'MEDIUM',
                            'description': f"Adverse Media: '{article.get('title')}' ({article.get('source')})"
                        })

            # Generic findings aggregation
            for finding in result.get('findings', []):
                if not any(rf['description'] == finding for rf in risk_flags):
                    risk_flags.append({
                        'source': source,
                        'severity': 'CRITICAL' if is_critical_blocker else 'MEDIUM',
                        'description': finding
                    })

        # Apply critical blocker cap
        if is_critical_blocker:
            trust_score = min(trust_score, 18)  # Cap score at 18 if Struck Off / Insolvency / RBI Defaulter!
            risk_level = "CRITICAL"
            recommendation = "DO NOT PROCEED — Defunct / High Fraud Risk Entity"
        else:
            trust_score = max(0, min(100, trust_score))
            if trust_score < 40:
                risk_level = "CRITICAL"
                recommendation = "DO NOT PROCEED — High Fraud Risk"
            elif trust_score < 65:
                risk_level = "HIGH"
                recommendation = "Do Not Proceed Without Further Investigation"
            elif trust_score < 80:
                risk_level = "MEDIUM"
                recommendation = "Proceed with Caution"
            else:
                risk_level = "LOW"
                recommendation = "Approved for Onboarding"

        return {
            'trust_score': trust_score,
            'recommendation': recommendation,
            'risk_level': risk_level,
            'breakdown': breakdown,
            'risk_flags': risk_flags
        }
