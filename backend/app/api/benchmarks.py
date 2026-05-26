from fastapi import APIRouter, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import GenomeSequence, MetabolicMetric, CognitiveLoadMetric

router = APIRouter()

INDUSTRY_BENCHMARKS = {
    "health_score": {"avg": 0.65, "top": 0.85},
    "collaboration": {"avg": 0.60, "top": 0.80},
    "decision_making": {"avg": 0.55, "top": 0.78},
    "knowledge_flow": {"avg": 0.58, "top": 0.82},
    "innovation": {"avg": 0.50, "top": 0.75},
    "resilience": {"avg": 0.62, "top": 0.80},
    "vitality": {"avg": 0.60, "top": 0.85},
    "composite_score": {"avg": 0.58, "top": 0.80},
    "execution_velocity": {"avg": 0.55, "top": 0.78},
    "cognitive_composite": {"avg": 0.50, "top": 0.30},
}


@router.get("/benchmarks")
async def get_benchmarks(org_id: str, db: AsyncSession = Depends(get_db)):
    genome = (await db.execute(
        select(GenomeSequence).where(GenomeSequence.organization_id == org_id)
        .order_by(desc(GenomeSequence.week_start)).limit(1)
    )).scalar_one_or_none()

    metabolic = (await db.execute(
        select(MetabolicMetric).where(MetabolicMetric.organization_id == org_id)
        .order_by(desc(MetabolicMetric.metric_date)).limit(1)
    )).scalar_one_or_none()

    cognitive = (await db.execute(
        select(CognitiveLoadMetric).where(CognitiveLoadMetric.organization_id == org_id)
        .order_by(desc(CognitiveLoadMetric.metric_date)).limit(1)
    )).scalar_one_or_none()

    comparisons = []

    if genome:
        for field in ["health_score", "collaboration", "decision_making", "knowledge_flow", "innovation", "resilience", "vitality"]:
            val = getattr(genome, field, None)
            bench = INDUSTRY_BENCHMARKS.get(field)
            if val is not None and bench:
                comparisons.append({
                    "metric": field.replace("_", " ").title(),
                    "current": round(val, 3),
                    "industry_avg": bench["avg"],
                    "top_quartile": bench["top"],
                    "gap_vs_avg": round(val - bench["avg"], 3),
                })

    if metabolic:
        for field in ["composite_score", "execution_velocity"]:
            val = getattr(metabolic, field, None)
            bench = INDUSTRY_BENCHMARKS.get(field)
            if val is not None and bench:
                comparisons.append({
                    "metric": field.replace("_", " ").title(),
                    "current": round(val, 3),
                    "industry_avg": bench["avg"],
                    "top_quartile": bench["top"],
                    "gap_vs_avg": round(val - bench["avg"], 3),
                })

    if cognitive:
        val = cognitive.composite_score
        bench = INDUSTRY_BENCHMARKS.get("cognitive_composite")
        if bench:
            comparisons.append({
                "metric": "Cognitive Load",
                "current": round(val, 3),
                "industry_avg": bench["avg"],
                "top_quartile": bench["top"],
                "gap_vs_avg": round(val - bench["avg"], 3),
            })

    return {"benchmarks": comparisons, "industry_label": "Technology Sector (2026)"}
