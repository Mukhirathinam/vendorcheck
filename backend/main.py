import asyncio
import json
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scrapers import mca, ecourts, nclt, rbi_defaulter, google_news
from scoring.engine import ScoringEngine
from ocr.invoice_reader import extract_invoice_data

try:
    from setu_client import fetch_gstin_data
except ImportError:
    # Dummy mock if not present
    async def fetch_gstin_data(query: str):
        return {"source": "GST", "success": True, "score_impact": 0, "findings": []}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VendorCheck V3 API")
scoring_engine = ScoringEngine()

class CheckRequest(BaseModel):
    query_value: str
    company_name: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

async def run_all_scrapers(query_value: str, company_name: str):
    tasks = {
        'gst': fetch_gstin_data(query_value),
        'mca': mca.search_mca(company_name or query_value),
        'ecourts': ecourts.search_ecourts(company_name or query_value),
        'nclt': nclt.search_nclt(company_name or query_value),
        'rbi': rbi_defaulter.check_defaulter(company_name or query_value),
        'news': google_news.search_news(company_name or query_value),
    }
    
    results = await asyncio.gather(*tasks.values(), return_exceptions=True)
    return dict(zip(tasks.keys(), results))

@app.post("/api/v1/check/stream")
async def check_stream(req: CheckRequest, request: Request):
    query = req.query_value
    name = req.company_name or query

    async def event_generator():
        tasks = {
            'gst': fetch_gstin_data(query),
            'mca': mca.search_mca(name),
            'ecourts': ecourts.search_ecourts(name),
            'nclt': nclt.search_nclt(name),
            'rbi': rbi_defaulter.check_defaulter(name),
            'news': google_news.search_news(name),
        }
        
        pending = {asyncio.create_task(coro, name=task_name) for task_name, coro in tasks.items()}
        scraper_results = []
        
        while pending:
            done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
            for task in done:
                task_name = task.get_name()
                try:
                    result = task.result()
                    scraper_results.append(result)
                    yield f"data: {json.dumps({'event': 'scraper_result', 'task': task_name, 'data': result})}\n\n"
                except Exception as e:
                    logger.error(f"Task {task_name} failed: {e}")
                    yield f"data: {json.dumps({'event': 'scraper_error', 'task': task_name, 'error': str(e)})}\n\n"
                    
        score_report = scoring_engine.calculate(scraper_results)
        yield f"data: {json.dumps({'event': 'scoring_complete', 'data': score_report})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/v1/check")
async def check_sync(req: CheckRequest):
    results_map = await run_all_scrapers(req.query_value, req.company_name or req.query_value)
    
    valid_results = []
    for k, v in results_map.items():
        if isinstance(v, Exception):
            logger.error(f"Scraper {k} failed: {v}")
        else:
            valid_results.append(v)
            
    score_report = scoring_engine.calculate(valid_results)
    return {
        "status": "success",
        "results": valid_results,
        "score_report": score_report
    }

@app.post("/api/v1/register")
async def register():
    return {"message": "User registered successfully"}

@app.post("/api/v1/login")
async def login(req: LoginRequest):
    return {"token": "dummy_token"}

@app.get("/api/v1/analytics")
async def analytics():
    return {"stats": "dummy stats"}

@app.get("/api/v1/history")
async def history():
    return {"history": []}

@app.get("/api/v1/report/{report_id}/pdf")
async def report_pdf(report_id: str):
    return {"message": "PDF generation endpoint"}

@app.post("/api/v1/invoice/verify")
async def verify_invoice(file: UploadFile = File(...)):
    temp_path = f"/tmp/{file.filename}"
    try:
        os.makedirs("/tmp", exist_ok=True)
        with open(temp_path, "wb") as f:
            f.write(await file.read())
            
        data = extract_invoice_data(temp_path)
        
        return {"status": "success", "data": data}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
