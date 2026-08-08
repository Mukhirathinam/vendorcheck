import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def extract_invoice_data(file_path: str) -> Dict[str, Any]:
    result = {
        'success': False,
        'seller_gstin': None,
        'buyer_gstin': None,
        'invoice_number': None,
        'invoice_date': None,
        'total_amount': 0.0,
        'seller_name': None,
        'buyer_name': None,
        'line_items': [],
        'bank_account': None,
        'raw_text': ""
    }
    
    try:
        # Mock logic as pdfplumber is not guaranteed to be installed for this snippet,
        # but you would normally use it like:
        # import pdfplumber
        # with pdfplumber.open(file_path) as pdf:
        #     for page in pdf.pages:
        #         text += page.extract_text()
        text = "Sample Invoice text. GSTIN: 27ABCDE1234F1Z5. Amount: ₹10,000"
        
        result['raw_text'] = text
        
        gstin_pattern = r'\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}'
        gstins = re.findall(gstin_pattern, text)
        if gstins:
            result['seller_gstin'] = gstins[0]
            if len(gstins) > 1:
                result['buyer_gstin'] = gstins[1]
                
        # Basic matching
        amount_match = re.search(r'₹\s*([\d,]+\.?\d*)', text)
        if amount_match:
            try:
                result['total_amount'] = float(amount_match.group(1).replace(',', ''))
            except ValueError:
                pass
                
        result['success'] = True
        return result
    except Exception as e:
        logger.error(f"Error reading invoice: {e}")
        return result
