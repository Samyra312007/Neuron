from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, CognitiveLoadMetric
from app.agents.cognitive_load import cognitive_load

router = APIRouter()


@router.get("/cognitive-load")
async def get_latest_cognitive_load(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CognitiveLoadMetric)
        .where(CognitiveLoadMetric.organization_id == org_id)
        .order_by(desc(CognitiveLoadMetric.metric_date))
        .limit(1)
    )
    metric = result.scalar_one_or_none()
    if not metric:
        raise HTTPException(status_code=404, detail="No cognitive load data found.")
    return metric


@router.post("/cognitive-load/analyze")
async def analyze_cognitive_load(org_id: str, db: AsyncSession = Depends(get_db)):
    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    if not org_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Organization not found")

    data = await cognitive_load.run(db, org_id)
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])

    metric = CognitiveLoadMetric(
        organization_id=org_id,
        metric_date=date.today(),
        workload_score=data.get("workload_score", 0.0),
        interaction_density=data.get("interaction_density", 0.0),
        meeting_pressure=data.get("meeting_pressure", 0.0),
        task_fragmentation=data.get("task_fragmentation", 0.0),
        decision_fatigue=data.get("decision_fatigue", 0.0),
        burnout_risk=data.get("burnout_risk", 0.0),
        composite_score=data.get("composite_score", 0.0),
        team_breakdown=data.get("team_breakdown"),
    )
    db.add(metric)
    await db.commit()
    await db.refresh(metric)
    return metric
