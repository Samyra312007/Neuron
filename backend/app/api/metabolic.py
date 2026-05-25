from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, MetabolicMetric
from app.agents.metabolic import metabolic

router = APIRouter()


@router.get("/metabolic")
async def get_latest_metabolic(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MetabolicMetric)
        .where(MetabolicMetric.organization_id == org_id)
        .order_by(desc(MetabolicMetric.metric_date))
        .limit(1)
    )
    metric = result.scalar_one_or_none()
    if not metric:
        raise HTTPException(status_code=404, detail="No metabolic data found. Run an agent first.")
    return metric


@router.post("/metabolic/analyze")
async def analyze_metabolic(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    data = await metabolic.run(db, org_id)
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])

    metric = MetabolicMetric(
        organization_id=org_id,
        metric_date=date.today(),
        decision_cycle_time_hours=data.get("decision_cycle_time_hours", 0.0),
        info_half_life_hours=data.get("info_half_life_hours", 0.0),
        execution_velocity=data.get("execution_velocity", 0.0),
        composite_score=data.get("composite_score", 0.0),
    )
    db.add(metric)
    await db.commit()
    await db.refresh(metric)
    return metric
