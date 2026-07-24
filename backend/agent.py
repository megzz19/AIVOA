import os
from typing import Dict, Any, TypedDict
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
import json
from dotenv import load_dotenv

load_dotenv()

# We will use llama-3.3-70b-versatile as per PRD (since gemma2-9b-it is decommissioned)
# Initialize with a dummy key if missing to allow the app to boot
groq_api_key = os.getenv("GROQ_API_KEY", "dummy")
try:
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=groq_api_key)
except Exception:
    llm = None

class ComplaintState(TypedDict):
    raw_text: str
    extracted_data: Dict[str, Any]
    is_complete: bool
    missing_fields: list
    risk_assessment: Dict[str, Any]
    capa_recommendations: Dict[str, Any]
    executive_summary: str

class ExtractedComplaint(BaseModel):
    complaint_source: str = Field(default="")
    customer_name: str = Field(default="")
    product_name: str = Field(default="")
    product_strength_grade: str = Field(default="")
    batch_lot_number: str = Field(default="")
    manufacturing_date: str = Field(default="")
    expiry_date: str = Field(default="")
    quantity_affected: str = Field(default="")
    complaint_type: str = Field(default="")
    complaint_date: str = Field(default="")
    detailed_description: str = Field(default="")
    initial_severity: str = Field(default="")
    priority: str = Field(default="")

def extraction_node(state: ComplaintState):
    if not llm:
        return state

    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""
    Extract the following information from the complaint text and return as JSON.
    Origin & Customer Details: Complaint Source, Customer Name
    Product & Batch: Product Name, Product Strength/Grade, Batch/Lot Number, Manufacturing Date, Expiry Date, Quantity Affected
    Complaint Details: Complaint Type, Complaint Date, Detailed Complaint Description
    Initial Assessment: Initial Severity (Low, Medium, High, Critical), Priority (Low, Medium, High)

    IMPORTANT INSTRUCTIONS:
    - If "Complaint Date" is not mentioned, use today's date: {today}
    - If "Initial Severity" or "Priority" are not explicitly mentioned, INFER them based on the severity of the issue (e.g., product defects like discoloration are usually Medium or High).
    - If "Quantity Affected" or any other field is completely missing and cannot be inferred, explicitly output "Not Specified".

    Return a JSON object with these exact keys:
    complaint_source, customer_name, product_name, product_strength_grade, batch_lot_number, manufacturing_date, expiry_date, quantity_affected, complaint_type, complaint_date, detailed_description, initial_severity, priority

    Complaint Text:
    {state['raw_text']}
    """
    
    try:
        llm_with_structured_output = llm.with_structured_output(ExtractedComplaint, method="json_mode")
        extracted = llm_with_structured_output.invoke([HumanMessage(content=prompt)])
        state["extracted_data"] = extracted.dict()
    except Exception as e:
        print(f"Extraction failed: {e}")
        state["extracted_data"] = {}
        
    return state

def completeness_checker_node(state: ComplaintState):
    data = state.get("extracted_data", {})
    required_fields = ["product_name", "batch_lot_number", "detailed_description"]
    missing = [f for f in required_fields if not data.get(f)]
    state["is_complete"] = len(missing) == 0
    state["missing_fields"] = missing
    return state

def risk_classification_node(state: ComplaintState):
    if not llm: return state
    desc = state.get("extracted_data", {}).get("detailed_description", "")
    if not desc:
        return state
        
    prompt = f"""Based on this pharmaceutical complaint, classify the risk severity as exactly ONE of these words: Critical, Major, or Minor.

Complaint: {desc}

Respond with ONLY a single word: Critical, Major, or Minor."""
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        severity = res.content.strip().split()[0].strip(".,!:;")  # Take only the first word
        if severity not in ("Critical", "Major", "Minor"):
            severity = "Major"  # Default fallback
        state["risk_assessment"] = {"justification": severity}
    except Exception:
        pass
    return state

def capa_root_cause_node(state: ComplaintState):
    if not llm: return state
    desc = state.get("extracted_data", {}).get("detailed_description", "")
    prompt = f"Suggest Root Cause (5-Why/Ishikawa) and initial CAPA for:\n{desc}"
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        state["capa_recommendations"] = {"details": res.content}
    except Exception:
        pass
    return state
    
def executive_summary_node(state: ComplaintState):
    if not llm: return state
    desc = state.get("extracted_data", {}).get("detailed_description", "")
    prompt = f"Provide a brief 1-paragraph executive summary of this complaint:\n{desc}"
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        state["executive_summary"] = res.content
    except Exception:
        pass
    return state

workflow = StateGraph(ComplaintState)
workflow.add_node("extract", extraction_node)
workflow.add_node("check_completeness", completeness_checker_node)
workflow.add_node("risk_assess", risk_classification_node)
workflow.add_node("capa", capa_root_cause_node)
workflow.add_node("summary", executive_summary_node)

workflow.set_entry_point("extract")
workflow.add_edge("extract", "check_completeness")
workflow.add_edge("check_completeness", "risk_assess")
workflow.add_edge("risk_assess", "capa")
workflow.add_edge("capa", "summary")
workflow.add_edge("summary", END)

agent_app = workflow.compile()

def process_complaint_text(text: str) -> Dict[str, Any]:
    initial_state = {
        "raw_text": text,
        "extracted_data": {},
        "is_complete": False,
        "missing_fields": [],
        "risk_assessment": {},
        "capa_recommendations": {},
        "executive_summary": ""
    }
    result = agent_app.invoke(initial_state)
    return result

def chat_with_complaint(context: str, question: str) -> str:
    if not llm: return "API key not configured."
    prompt = f"Context: {context}\n\nQuestion: {question}"
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        return res.content
    except Exception as e:
        return f"Error: {e}"

class FieldUpdate(BaseModel):
    """Model for structured field updates from the LLM."""
    complaint_source: str = Field(default="")
    customer_name: str = Field(default="")
    product_name: str = Field(default="")
    product_strength_grade: str = Field(default="")
    batch_lot_number: str = Field(default="")
    manufacturing_date: str = Field(default="")
    expiry_date: str = Field(default="")
    quantity_affected: str = Field(default="")
    complaint_type: str = Field(default="")
    complaint_date: str = Field(default="")
    detailed_description: str = Field(default="")
    initial_severity: str = Field(default="")
    priority: str = Field(default="")

def edit_complaint_fields(current_data: dict, instruction: str) -> dict:
    """Uses LLM to interpret an edit instruction and return only the changed fields."""
    if not llm:
        return {"updated_fields": {}, "message": "API key not configured."}

    prompt = f"""You are an assistant that helps edit complaint form fields. Return a JSON object.

The current complaint form has the following data:
{json.dumps(current_data, indent=2)}

The user wants to make the following change:
"{instruction}"

INSTRUCTIONS:
- Determine which field(s) the user wants to change based on their instruction.
- Return ALL fields as a JSON object, but ONLY change the values for the fields the user mentioned.
- For fields NOT being changed, return their EXACT current value.
- The JSON keys must be: complaint_source, customer_name, product_name, product_strength_grade, batch_lot_number, manufacturing_date, expiry_date, quantity_affected, complaint_type, complaint_date, detailed_description, initial_severity, priority
- For initial_severity, valid values are: Low, Medium, High, Critical
- For priority, valid values are: Low, Medium, High
"""

    try:
        llm_with_structured_output = llm.with_structured_output(FieldUpdate, method="json_mode")
        result = llm_with_structured_output.invoke([HumanMessage(content=prompt)])
        new_data = result.dict()

        # Find which fields actually changed
        changed = {}
        for key, new_val in new_data.items():
            old_val = current_data.get(key, "")
            if new_val and new_val != old_val:
                changed[key] = new_val

        # Build a human-readable confirmation message
        if changed:
            changes_list = []
            field_labels = {
                "complaint_source": "Complaint Source", "customer_name": "Customer Name",
                "product_name": "Product Name", "product_strength_grade": "Product Strength/Grade",
                "batch_lot_number": "Batch/Lot Number", "manufacturing_date": "Manufacturing Date",
                "expiry_date": "Expiry Date", "quantity_affected": "Quantity Affected",
                "complaint_type": "Complaint Type", "complaint_date": "Complaint Date",
                "detailed_description": "Detailed Description", "initial_severity": "Initial Severity",
                "priority": "Priority"
            }
            for key, val in changed.items():
                label = field_labels.get(key, key)
                changes_list.append(f"• **{label}**: {val}")
            message = "Done! I've updated the following fields:\n" + "\n".join(changes_list)
        else:
            message = "I couldn't determine which field to change. Could you be more specific? For example: \"Change severity to Critical\" or \"Update customer name to MedPlus\"."

        return {"updated_fields": changed, "message": message}
    except Exception as e:
        return {"updated_fields": {}, "message": f"Error processing edit: {e}"}

