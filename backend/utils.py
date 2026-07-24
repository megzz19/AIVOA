import pdfplumber
from docx import Document
import io

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    ext = filename.split(".")[-1].lower()
    text = ""
    
    try:
        if ext == "pdf":
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        elif ext == "docx":
            doc = Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif ext in ["txt", "eml"]:
            text = file_bytes.decode("utf-8")
        else:
            text = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error parsing file {filename}: {e}")
        text = str(file_bytes)
        
    return text
