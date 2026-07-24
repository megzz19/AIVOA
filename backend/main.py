from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine, Base
import models
import utils
import agent
from typing import Optional
import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Customer Complaint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/extract")
async def extract_complaint(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    extracted_text = ""
    if file:
        file_bytes = await file.read()
        extracted_text = utils.extract_text_from_file(file_bytes, file.filename)
    elif text:
        extracted_text = text
    else:
        raise HTTPException(status_code=400, detail="No text or file provided")

    result = agent.process_complaint_text(extracted_text)
    return {
        "raw_text": result.get("raw_text"),
        "extracted_data": result.get("extracted_data"),
        "is_complete": result.get("is_complete"),
        "missing_fields": result.get("missing_fields"),
        "risk_assessment": result.get("risk_assessment"),
        "capa_recommendations": result.get("capa_recommendations"),
        "executive_summary": result.get("executive_summary")
    }

@app.post("/api/chat")
async def chat_context(
    context: str = Form(...),
    question: str = Form(...)
):
    answer = agent.chat_with_complaint(context, question)
    return {"answer": answer}

@app.post("/api/edit")
async def edit_fields(payload: dict):
    current_data = payload.get("current_data", {})
    instruction = payload.get("instruction", "")
    if not instruction:
        raise HTTPException(status_code=400, detail="No edit instruction provided")
    result = agent.edit_complaint_fields(current_data, instruction)
    return result

def parse_date(date_str):
    if not date_str:
        return None
    try:
        # Simplistic parsing for demo
        return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except:
        return None

@app.post("/api/complaints")
async def save_complaint(complaint_data: dict, db: Session = Depends(get_db)):
    try:
        # Check for duplicate complaint (same product + batch + complaint type)
        product_name = complaint_data.get("product_name", "").strip()
        batch_lot = complaint_data.get("batch_lot_number", "").strip()
        complaint_type = complaint_data.get("complaint_type", "").strip()

        if product_name and batch_lot:
            existing = db.query(models.ComplaintRecord).filter(
                models.ComplaintRecord.product_name == product_name,
                models.ComplaintRecord.batch_lot_number == batch_lot,
                models.ComplaintRecord.complaint_type == complaint_type
            ).first()

            if existing:
                raise HTTPException(
                    status_code=409,
                    detail=f"Duplicate complaint detected! A complaint for '{product_name}' (Batch: {batch_lot}, Type: {complaint_type}) already exists with ID #{existing.id}."
                )

        new_record = models.ComplaintRecord(
            complaint_source=complaint_data.get("complaint_source"),
            customer_name=complaint_data.get("customer_name"),
            product_name=product_name,
            product_strength_grade=complaint_data.get("product_strength_grade"),
            batch_lot_number=batch_lot,
            manufacturing_date=parse_date(complaint_data.get("manufacturing_date")),
            expiry_date=parse_date(complaint_data.get("expiry_date")),
            quantity_affected=complaint_data.get("quantity_affected"),
            complaint_type=complaint_type,
            complaint_date=parse_date(complaint_data.get("complaint_date")),
            detailed_description=complaint_data.get("detailed_description"),
            initial_severity=complaint_data.get("initial_severity"),
            priority=complaint_data.get("priority"),
            status="Pending Triage"
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return {"id": new_record.id, "status": "saved"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
