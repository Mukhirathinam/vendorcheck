import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ScoringEngine:
    SOURCE_WEIGHTS = {
        'GST': {'max': 25, 'label': 'GST Compliance'},
        'MCA21': {'max': 20, 'label': 'Corporate Registry'},
        'eCourts': {'max': 20, 'label': 'Court Records'},
        'NCLT/IBBI': {'max': 20, 'label': 'Insolvency Records'},
        'RBI/SEBI': {'max': 10, 'label': 'Defaulter Lists'},
        'Google News': {'max': 5, 'label': 'Media Intelligence'},
    }
    
    def calculate(self, scraper_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Takes list of scraper results, returns full scoring report."""
        trust_score = 100
        breakdown = []
        risk_flags = []
        
        # Initialize breakdown
        for source, config in self.SOURCE_WEIGHTS.items():
            breakdown.append({
                'source': source,
                'label': config['label'],
                'max_score': config['max'],
                'actual_score': config['max'],
                'status': 'unavailable',
                'findings': []
            })
            
        breakdown_map = {b['source']: b for b in breakdown}
        
        for result in scraper_results:
            if not isinstance(result, dict) or 'source' not in result:
                continue
                
            source = result.get('source')
            if source not in breakdown_map:
                continue
                
            impact = result.get('score_impact', 0)
            if impact is None:
                impact = 0
                
            b_entry = breakdown_map[source]
            
            if result.get('success', False):
                b_entry['status'] = 'verified' if impact == 0 else 'risk_found'
                b_entry['actual_score'] = max(0, b_entry['max_score'] + impact)
                b_entry['findings'] = result.get('findings', [])
                
                trust_score += impact
                
                if impact < 0:
                    for finding in result.get('findings', []):
                        risk_flags.append({
                            'source': source,
                            'severity': 'HIGH' if impact <= -10 else 'MEDIUM',
                            'description': finding
                        })
                        
        trust_score = max(0, min(100, trust_score))
        
        risk_level = "LOW"
        recommendation = "Approved for Onboarding"
        
        if trust_score < 25:
            risk_level = "CRITICAL"
            recommendation = "DO NOT PROCEED — High Fraud Risk"
        elif trust_score < 50:
            risk_level = "HIGH"
            recommendation = "Do Not Proceed Without Further Investigation"
        elif trust_score < 75:
            risk_level = "MEDIUM"
            recommendation = "Proceed with Caution"
            
        return {
            'trust_score': trust_score,
            'recommendation': recommendation,
            'risk_level': risk_level,
            'breakdown': breakdown,
            'risk_flags': risk_flags
        }
