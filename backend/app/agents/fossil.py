import json
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Organization, GenomeSequence, DarkMatterReport, ImmuneInfection, MetabolicMetric, CognitiveLoadMetric


async def create_snapshot(session: AsyncSession, org_id: str) -> dict:
    genome = await session.execute(
        select(GenomeSequence).where(GenomeSequence.organization_id == org_id).order_by(GenomeSequence.week_start.desc()).limit(1)
    )
    genome = genome.scalar_one_or_none()

    dark_matter = await session.execute(
        select(DarkMatterReport).where(DarkMatterReport.organization_id == org_id).order_by(DarkMatterReport.report_date.desc()).limit(1)
    )
    dark_matter = dark_matter.scalar_one_or_none()

    infections = await session.execute(
        select(ImmuneInfection).where(ImmuneInfection.organization_id == org_id, ImmuneInfection.is_active == True)
    )
    infections = infections.scalars().all()

    metabolic = await session.execute(
        select(MetabolicMetric).where(MetabolicMetric.organization_id == org_id).order_by(MetabolicMetric.metric_date.desc()).limit(1)
    )
    metabolic = metabolic.scalar_one_or_none()

    cognitive = await session.execute(
        select(CognitiveLoadMetric).where(CognitiveLoadMetric.organization_id == org_id).order_by(CognitiveLoadMetric.metric_date.desc()).limit(1)
    )
    cognitive = cognitive.scalar_one_or_none()

    state = {
        "snapshot_date": str(date.today()),
        "genome": {
            "health_score": genome.health_score if genome else None,
            "collaboration": genome.collaboration if genome else None,
            "decision_making": genome.decision_making if genome else None,
            "knowledge_flow": genome.knowledge_flow if genome else None,
            "innovation": genome.innovation if genome else None,
            "resilience": genome.resilience if genome else None,
            "vitality": genome.vitality if genome else None,
        } if genome else None,
        "dark_matter": {
            "total_cost": str(dark_matter.total_cost) if dark_matter else None,
        } if dark_matter else None,
        "infections": [
            {"type": i.infection_type, "severity": i.severity, "score": i.severity_score}
            for i in infections
        ],
        "metabolic": {
            "composite_score": metabolic.composite_score if metabolic else None,
        } if metabolic else None,
        "cognitive_load": {
            "composite_score": cognitive.composite_score if cognitive else None,
        } if cognitive else None,
    }

    return state
