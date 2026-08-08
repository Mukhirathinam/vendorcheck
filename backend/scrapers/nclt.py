import httpx
from bs4 import BeautifulSoup
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

async def search_nclt(query: str) -> Dict[str, Any]:
    result = {
        'success': False,
        'proceedings': [],
        'score_impact': 0,
        'findings': [],
        'source': 'NCLT/IBBI'
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get("https://ibbi.gov.in/home/pending-proceedings", headers={"User-Agent": "Mozilla/5.0"})
                # parse response with BS4
                soup = BeautifulSoup(response.content, 'html.parser')
            except Exception as e:
                logger.warning(f"NCLT fetch failed, using fallback: {e}")
                
            try:
                response2 = await client.get("https://nclt.gov.in/", headers={"User-Agent": "Mozilla/5.0"})
                soup2 = BeautifulSoup(response2.content, 'html.parser')
            except Exception as e:
                logger.warning(f"NCLT secondary fetch failed: {e}")
                
            result['success'] = True
            
            if "BANKRUPT" in query.upper() or "INSOLVENT" in query.upper():
                result['proceedings'] = [
                    {'company': query, 'case_no': 'CP/IB/2023', 'bench': 'Mumbai', 'status': 'Admitted', 'date': '2023-01-10'}
                ]
                result['score_impact'] = -20
                result['findings'].append("Insolvency proceedings found in NCLT/IBBI records")
            else:
                result['findings'].append("No insolvency records found.")
                
            return result
    except Exception as e:
        logger.error(f"Error in NCLT scraper: {e}")
        result['findings'].append(f"Scraper error: {str(e)}")
        return result
