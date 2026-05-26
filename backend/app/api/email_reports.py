import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import OrganizationSetting

router = APIRouter()


class EmailConfig(BaseModel):
    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    smtp_pass: str
    from_email: str
    to_email: str


class SendReportRequest(BaseModel):
    config: EmailConfig
    report_type: str = "pdf"


@router.post("/email-reports/test")
async def test_email_config(body: EmailConfig):
    msg = MIMEText("NEURON test email — your SMTP configuration is working!")
    msg["Subject"] = "NEURON Test Email"
    msg["From"] = body.from_email
    msg["To"] = body.to_email

    try:
        with smtplib.SMTP(body.smtp_host, body.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(body.smtp_user, body.smtp_pass)
            server.send_message(msg)
        return {"ok": True, "message": f"Test email sent to {body.to_email}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SMTP failed: {str(e)}")


@router.post("/email-reports/send")
async def send_report(body: SendReportRequest, org_id: str, db: AsyncSession = Depends(get_db)):
    from app.utils.export import build_pdf_base
    from app.database.models import GenomeSequence, DarkMatterReport, MetabolicMetric, CognitiveLoadMetric

    genome = (await db.execute(
        select(GenomeSequence).where(GenomeSequence.organization_id == org_id)
        .order_by(GenomeSequence.week_start.desc()).limit(1)
    )).scalar_one_or_none()

    dm = (await db.execute(
        select(DarkMatterReport).where(DarkMatterReport.organization_id == org_id)
        .order_by(DarkMatterReport.report_date.desc()).limit(1)
    )).scalar_one_or_none()

    sections = []

    if genome:
        sections.append(("Genome", [
            ("Health Score", f"{genome.health_score*100:.0f}%"),
            ("Collaboration", f"{genome.collaboration*100:.0f}%"),
            ("Decision Making", f"{genome.decision_making*100:.0f}%"),
            ("Knowledge Flow", f"{genome.knowledge_flow*100:.0f}%"),
            ("Innovation", f"{genome.innovation*100:.0f}%"),
            ("Resilience", f"{genome.resilience*100:.0f}%"),
            ("Vitality", f"{genome.vitality*100:.0f}%"),
        ]))

    if dm:
        sections.append(("Dark Matter", [
            ("Invisible Work", f"{dm.invisible_work_hours}h"),
            ("Shadow Coordination", f"{dm.shadow_coordination_hours}h"),
            ("Unlogged Hours", f"{dm.unlogged_hours}h"),
            ("Meeting Overhead", f"{dm.meeting_overhead_hours}h"),
            ("Context Switching", f"{dm.context_switching_hours}h"),
            ("Total Cost", f"${dm.total_cost}"),
        ]))

    def build_pdf(pdf):
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 12, "NEURON Scheduled Report", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)
        for section_title, items in sections:
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(30, 144, 255)
            pdf.cell(0, 8, section_title, new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            pdf.set_font("Helvetica", "", 9)
            for label, value in items:
                pdf.cell(70, 5, label)
                pdf.cell(0, 5, value, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(3)

    pdf_bytes = build_pdf_base(build_pdf)

    msg = MIMEMultipart()
    msg["Subject"] = "NEURON Scheduled Organization Report"
    msg["From"] = body.config.from_email
    msg["To"] = body.config.to_email
    msg.attach(MIMEText("Please find attached your NEURON organization report."))
    msg.attach(MIMEApplication(pdf_bytes, _subtype="pdf", _filename="neuron_report.pdf"))

    try:
        with smtplib.SMTP(body.config.smtp_host, body.config.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(body.config.smtp_user, body.config.smtp_pass)
            server.send_message(msg)
        return {"ok": True, "message": f"Report sent to {body.config.to_email}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Send failed: {str(e)}")
