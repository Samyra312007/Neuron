from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import GenomeSequence, DarkMatterReport, MetabolicMetric, CognitiveLoadMetric, ImmuneInfection
from app.utils.export import pdf_response

router = APIRouter()


@router.get("/export-all/pdf")
async def export_all_pdf(org_id: str, db: AsyncSession = Depends(get_db)):
    genome = (await db.execute(
        select(GenomeSequence).where(GenomeSequence.organization_id == org_id)
        .order_by(desc(GenomeSequence.week_start)).limit(1)
    )).scalar_one_or_none()

    dm = (await db.execute(
        select(DarkMatterReport).where(DarkMatterReport.organization_id == org_id)
        .order_by(desc(DarkMatterReport.report_date)).limit(1)
    )).scalar_one_or_none()

    metabolic = (await db.execute(
        select(MetabolicMetric).where(MetabolicMetric.organization_id == org_id)
        .order_by(desc(MetabolicMetric.metric_date)).limit(1)
    )).scalar_one_or_none()

    cognitive = (await db.execute(
        select(CognitiveLoadMetric).where(CognitiveLoadMetric.organization_id == org_id)
        .order_by(desc(CognitiveLoadMetric.metric_date)).limit(1)
    )).scalar_one_or_none()

    infections = (await db.execute(
        select(ImmuneInfection).where(
            ImmuneInfection.organization_id == org_id,
            ImmuneInfection.is_active == True,
        )
    )).scalars().all()

    sections = []

    if genome:
        sections.append(("Genome Lab", [
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
            ("Total Monthly Cost", f"${dm.total_cost}"),
        ]))

    if metabolic:
        sections.append(("Metabolic Rate", [
            ("Decision Cycle Time", f"{metabolic.decision_cycle_time_hours}h"),
            ("Info Half-Life", f"{metabolic.info_half_life_hours}h"),
            ("Execution Velocity", f"{metabolic.execution_velocity:.2f}"),
            ("Composite Score", f"{metabolic.composite_score:.2f}"),
        ]))

    if cognitive:
        sections.append(("Cognitive Load", [
            ("Workload Score", f"{cognitive.workload_score:.2f}"),
            ("Interaction Density", f"{cognitive.interaction_density:.2f}"),
            ("Meeting Pressure", f"{cognitive.meeting_pressure:.2f}"),
            ("Task Fragmentation", f"{cognitive.task_fragmentation:.2f}"),
            ("Decision Fatigue", f"{cognitive.decision_fatigue:.2f}"),
            ("Burnout Risk", f"{cognitive.burnout_risk:.2f}"),
            ("Composite Score", f"{cognitive.composite_score:.2f}"),
        ]))

    if infections:
        inf_items = [(f"Infection {i+1}", f"{inf.infection_type} ({inf.severity})") for i, inf in enumerate(infections[:10])]
        sections.append(("Active Infections", inf_items))

    buf = pdf_response("NEURON Full Organization Report", sections)
    return Response(content=buf, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=neuron_full_report.pdf"})
