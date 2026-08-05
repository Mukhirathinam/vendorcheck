import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SETU_CLIENT_ID = os.getenv("SETU_CLIENT_ID")
SETU_CLIENT_SECRET = os.getenv("SETU_CLIENT_SECRET")
SETU_BASE_URL = os.getenv("SETU_BASE_URL", "https://dg-sandbox.setu.co")

def get_headers():
    return {
        "x-client-id": SETU_CLIENT_ID,
        "x-client-secret": SETU_CLIENT_SECRET,
        "Content-Type": "application/json"
    }

async def fetch_gstin_data(gstin: str) -> dict:
    """Fetch real GSTIN data from Setu KYC API."""
    url = f"{SETU_BASE_URL}/api/kyc/gstin"
    payload = {"gstin": gstin}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload, headers=get_headers())

    if resp.status_code == 200:
        data = resp.json()
        d = data.get("data", {})
        return {
            "success": True,
            "gstin": d.get("gstin", gstin),
            "company_name": d.get("tradeName") or d.get("legalName", "Unknown Company"),
            "status": d.get("status", "Unknown"),
            "taxpayer_type": d.get("taxpayerType", "Unknown"),
            "last_return_filed": d.get("lastReturnFiledMonth", "N/A"),
            "address": d.get("principalPlace", {}).get("addr", {}).get("formatted", "N/A"),
            "incorporation_date": d.get("registrationDate", "N/A"),
        }
    else:
        # Return a fallback so the rest of the pipeline still works
        return {
            "success": False,
            "gstin": gstin,
            "company_name": "Unknown (API Error)",
            "status": "Unknown",
            "taxpayer_type": "Unknown",
            "last_return_filed": "N/A",
            "address": "N/A",
            "incorporation_date": "N/A",
            "error": resp.text
        }
