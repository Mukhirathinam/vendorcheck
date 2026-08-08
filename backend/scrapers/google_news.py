import httpx
from bs4 import BeautifulSoup
import logging
from typing import Dict, Any
import urllib.parse

logger = logging.getLogger(__name__)

async def search_news(query: str) -> Dict[str, Any]:
    result = {
        'success': False,
        'articles': [],
        'fraud_mentioned': False,
        'score_impact': 0,
        'findings': [],
        'source': 'Google News'
    }
    
    risk_keywords = ['fraud', 'scam', 'cheated', 'arrested', 'FIR', 'defaulter', 'bankrupt', 'complaint']
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            encoded_query = urllib.parse.quote_plus(query)
            url = f"https://news.google.com/rss/search?q={encoded_query}+fraud+scam+India&hl=en-IN&gl=IN&ceid=IN:en"
            try:
                response = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'xml')
                    items = soup.find_all('item')[:10]
                    for item in items:
                        title = item.title.text if item.title else ''
                        link = item.link.text if item.link else ''
                        pubDate = item.pubDate.text if item.pubDate else ''
                        
                        found_keywords = [kw for kw in risk_keywords if kw.lower() in title.lower()]
                        if found_keywords:
                            result['articles'].append({
                                'title': title,
                                'url': link,
                                'published': pubDate,
                                'source': 'Google News',
                                'risk_keywords': found_keywords
                            })
                            result['fraud_mentioned'] = True
            except Exception as e:
                logger.warning(f"Google News fetch failed: {e}")
            
            result['success'] = True
            
            if result['fraud_mentioned']:
                result['score_impact'] = -5
                result['findings'].append(f"Found {len(result['articles'])} articles mentioning risk keywords.")
            else:
                result['findings'].append("No negative news found.")
                
            return result
    except Exception as e:
        logger.error(f"Error in Google News scraper: {e}")
        result['findings'].append(f"Scraper error: {str(e)}")
        return result
