from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf():
    pdf_filename = "sample_complaint.pdf"
    doc = SimpleDocTemplate(pdf_filename, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    story = []

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor("#1e3a8a"),
        spaceAfter=12
    )
    
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor("#4b5563"),
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor("#1f2937"),
        spaceBefore=10,
        spaceAfter=10,
        leading=16
    )

    story.append(Paragraph("<b>QUALITY DEVIATION REPORT</b>", title_style))
    story.append(Paragraph("<b>Date:</b> July 24, 2026", meta_style))
    story.append(Paragraph("<b>Sender:</b> MedPlus Pharmacy Services", meta_style))
    story.append(Paragraph("<b>Contact:</b> Dr. Rajesh Kumar (Quality Lead)", meta_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Dear Quality Assurance Team,", body_style))
    
    story.append(Paragraph(
        "We are writing to report a significant quality deviation observed in our recent shipment of <b>Paracetamol Tablets 500mg</b>. "
        "The shipment details are as follows:<br/>"
        "• <b>Product Name:</b> Paracetamol Tablets<br/>"
        "• <b>Strength:</b> 500mg<br/>"
        "• <b>Batch/Lot Number:</b> PCT202611<br/>"
        "• <b>Manufacturing Date:</b> April 2026<br/>"
        "• <b>Expiry Date:</b> March 2028<br/>"
        "• <b>Quantity Affected:</b> 200 packs (approx 10 kg of material)<br/>"
        "• <b>Complaint Type:</b> Packaging Defect", 
        body_style
    ))

    story.append(Paragraph(
        "<b>Detailed Description of Issue:</b><br/>"
        "Upon unpacking the pallets of batch PCT202611, our warehouse staff discovered that approximately 200 blister packs "
        "were crushed due to inadequate outer carton packaging structure. Inside these damaged blisters, the tablets "
        "had crumbled into powder. Since the seal integrity of the blisters was compromised, we cannot distribute these "
        "tablets to patients. Please log this incident, issue a CAPA investigation, and arrange a replacement dispatch immediately.",
        body_style
    ))

    story.append(Spacer(1, 20))
    story.append(Paragraph("Sincerely,", body_style))
    story.append(Paragraph("<b>Dr. Rajesh Kumar</b><br/>MedPlus QA Division", body_style))

    doc.build(story)
    print(f"Generated PDF: {pdf_filename}")

if __name__ == "__main__":
    generate_pdf()
