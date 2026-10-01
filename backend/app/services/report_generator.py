import io
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(scan_data: Dict[str, Any]) -> io.BytesIO:
    """Generate a high-grade, styled PDF cybersecurity assessment report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )
    cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=cell_style,
        fontName='Helvetica-Bold'
    )

    elements = []

    # 1. Header with Brand & Meta
    header_data = [
        [
            Paragraph("<b>DRISHTI SCAN</b><br/><font size=8 color='#0284c7'>CYBERSECURITY ASSESSMENT PLATFORM</font>", title_style),
            Paragraph(f"<b>Report ID:</b> DSK-{scan_data.get('id', 'N/A')}<br/><b>Generated:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}<br/><b>Classification:</b> TLP:CLEAR", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[3.8 * inch, 3.8 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=12))

    # 2. Target & Risk Summary Block
    risk_score = scan_data.get("risk_score", 0)
    severity = scan_data.get("severity_level", "Unknown")

    if risk_score >= 80:
        score_color = colors.HexColor("#dc2626")  # Red
        badge_bg = colors.HexColor("#fee2e2")
    elif risk_score >= 60:
        score_color = colors.HexColor("#ea580c")  # Orange
        badge_bg = colors.HexColor("#ffedd5")
    elif risk_score >= 30:
        score_color = colors.HexColor("#d97706")  # Amber
        badge_bg = colors.HexColor("#fef3c7")
    else:
        score_color = colors.HexColor("#16a34a")  # Green
        badge_bg = colors.HexColor("#dcfce7")

    score_display = Paragraph(
        f"<font size=28 color='{score_color.hexval()}'><b>{risk_score}/100</b></font><br/>"
        f"<b>{severity.upper()}</b>",
        ParagraphStyle('ScoreDisplay', parent=styles['Normal'], alignment=1, leading=26)
    )

    meta_text = (
        f"<b>Target URL:</b> {scan_data.get('url', 'N/A')}<br/>"
        f"<b>Hostname:</b> {scan_data.get('hostname', 'N/A')}<br/>"
        f"<b>Protocol:</b> {scan_data.get('scheme', 'N/A').upper()}<br/>"
        f"<b>Shannon Entropy:</b> {scan_data.get('entropy', 0.0):.2f} bits<br/>"
        f"<b>Assessment Date:</b> {scan_data.get('created_at', datetime.now(timezone.utc)).strftime('%Y-%m-%d %H:%M:%S')}"
    )

    overview_table = Table(
        [[Paragraph(meta_text, body_style), score_display]],
        colWidths=[5.4 * inch, 2.2 * inch]
    )
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (1, 0), (1, 0), badge_bg),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(overview_table)
    elements.append(Spacer(1, 10))

    # 3. Executive Summary
    elements.append(Paragraph("Executive Threat Summary", heading_style))
    elements.append(Paragraph(scan_data.get("summary", "Assessment completed."), body_style))
    elements.append(Spacer(1, 10))

    # 4. Detailed Findings Table
    findings = scan_data.get("findings", [])
    elements.append(Paragraph(f"Identified Indicators & Technical Evidence ({len(findings)})", heading_style))

    if findings:
        table_rows = [[
            Paragraph("Indicator / Category", cell_bold),
            Paragraph("Severity", cell_bold),
            Paragraph("Impact", cell_bold),
            Paragraph("Evidence & Explanation", cell_bold)
        ]]

        for f in findings:
            sev = f.get('severity', 'info').upper()
            table_rows.append([
                Paragraph(f"<b>{f.get('title')}</b><br/><font color='#64748b'>{f.get('category').upper()}</font>", cell_style),
                Paragraph(f"<b>{sev}</b>", cell_style),
                Paragraph(f"+{f.get('score_impact', 0)}", cell_style),
                Paragraph(f"<b>Evidence:</b> {f.get('evidence')}<br/>{f.get('explanation')}", cell_style)
            ])

        findings_table = Table(table_rows, colWidths=[2.2 * inch, 0.9 * inch, 0.6 * inch, 3.9 * inch])
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#94a3b8')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(findings_table)
    else:
        elements.append(Paragraph("No anomalous heuristic indicators or threat signatures were triggered during analysis.", body_style))

    elements.append(Spacer(1, 12))

    # 5. Recommended Mitigations
    recs = scan_data.get("recommendations", [])
    if recs:
        elements.append(Paragraph("Actionable Defensive Recommendations", heading_style))
        for idx, rec in enumerate(recs, 1):
            elements.append(Paragraph(f"<b>{idx}.</b> {rec}", body_style))
            elements.append(Spacer(1, 3))

    elements.append(Spacer(1, 12))

    # 6. Disclaimer & Limitations (Crucial requirement from prompt)
    disclaimer_block = [
        [Paragraph(
            "<b>Assessment Limitations & Defensive Usage Notice:</b><br/>"
            "This report is generated using deterministic heuristic pattern detection, structural validation, "
            "and threat-intelligence cross-referencing. Risk scores represent an automated assessment of observed threat indicators, "
            "not a definitive guarantee that a destination is malicious or completely benign. Driscoll Scan does not execute arbitrary "
            "active crawls against untrusted endpoints to prevent SSRF and exposure. Intended strictly for defensive security awareness.",
            ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=7.5, leading=10.5, textColor=colors.HexColor('#475569'))
        )]
    ]
    disclaimer_table = Table(disclaimer_block, colWidths=[7.6 * inch])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(KeepTogether(disclaimer_table))

    # Build document
    doc.build(elements)
    buffer.seek(0)
    return buffer
