from sqlalchemy import Column, Integer, String, Text, Date
from database import Base

class ComplaintRecord(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    # Origin & Customer Details
    complaint_source = Column(String, index=True)
    customer_name = Column(String, index=True)

    # Product & Batch Identification
    product_name = Column(String, index=True)
    product_strength_grade = Column(String)
    batch_lot_number = Column(String, index=True)
    manufacturing_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    quantity_affected = Column(String)

    # Complaint Details
    complaint_type = Column(String, index=True)
    complaint_date = Column(Date, nullable=True)
    detailed_description = Column(Text)

    # Initial Assessment & Priority
    initial_severity = Column(String)
    priority = Column(String)
    
    status = Column(String, default="Pending Triage")

    # Bonus fields
    risk_level = Column(String, nullable=True)
    risk_justification = Column(Text, nullable=True)
    root_cause_suggestion = Column(Text, nullable=True)
    capa_suggestion = Column(Text, nullable=True)
    executive_summary = Column(Text, nullable=True)
