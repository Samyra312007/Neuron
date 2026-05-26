from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import AlertConfiguration, AlertHistory, GenomeSequence, MetabolicMetric, CognitiveLoadMetric

router = APIRouter()


@router.get("/alerts/configs")
async def get_alert_configs(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AlertConfiguration).where(AlertConfiguration.organization_id == org_id)
    )
    configs = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "metric_name": c.metric_name,
            "comparison_operator": c.comparison_operator,
            "threshold_value": c.threshold_value,
            "label": c.label,
            "enabled": c.enabled,
        }
        for c in configs
    ]


@router.get("/alerts/history")
async def get_alert_history(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AlertHistory)
        .where(AlertHistory.organization_id == org_id)
        .order_by(desc(AlertHistory.triggered_at))
        .limit(50)
    )
    alerts = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "alert_config_id": str(a.alert_config_id),
            "metric_value": a.metric_value,
            "threshold_value": a.threshold_value,
            "resolved_at": str(a.resolved_at) if a.resolved_at else None,
            "triggered_at": str(a.triggered_at),
        }
        for a in alerts
    ]


class AlertConfigCreate(BaseModel):
    metric_name: str
    comparison_operator: str
    threshold_value: float
    label: str


@router.post("/alerts/configs")
async def create_alert_config(
    org_id: str, body: AlertConfigCreate, db: AsyncSession = Depends(get_db)
):
    config = AlertConfiguration(
        organization_id=org_id,
        metric_name=body.metric_name,
        comparison_operator=body.comparison_operator,
        threshold_value=body.threshold_value,
        label=body.label,
    )
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return {"id": str(config.id)}


@router.delete("/alerts/configs/{config_id}")
async def delete_alert_config(
    config_id: str, org_id: str, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AlertConfiguration).where(
            AlertConfiguration.id == config_id,
            AlertConfiguration.organization_id == org_id,
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Alert config not found")
    await db.delete(config)
    await db.commit()
    return {"ok": True}


@router.post("/alerts/evaluate")
async def evaluate_alerts(org_id: str, db: AsyncSession = Depends(get_db)):
    configs = (await db.execute(
        select(AlertConfiguration).where(
            AlertConfiguration.organization_id == org_id,
            AlertConfiguration.enabled == True,
        )
    )).scalars().all()

    if not configs:
        return {"triggered": []}

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

    metrics = {}
    if genome:
        metrics["health_score"] = genome.health_score
    if metabolic:
        metrics["composite_score"] = metabolic.composite_score
    if cognitive:
        metrics["cognitive_composite"] = cognitive.composite_score

    triggered = []
    for c in configs:
        current = metrics.get(c.metric_name)
        if current is None:
            continue
        fired = False
        if c.comparison_operator == "lt" and current < c.threshold_value:
            fired = True
        elif c.comparison_operator == "gt" and current > c.threshold_value:
            fired = True
        elif c.comparison_operator == "lte" and current <= c.threshold_value:
            fired = True
        elif c.comparison_operator == "gte" and current >= c.threshold_value:
            fired = True

        if fired:
            record = AlertHistory(
                organization_id=org_id,
                alert_config_id=c.id,
                metric_value=current,
                threshold_value=c.threshold_value,
            )
            db.add(record)
            triggered.append({
                "config_id": str(c.id),
                "label": c.label,
                "metric_value": current,
                "threshold": c.threshold_value,
            })

    if triggered:
        await db.commit()

    return {"triggered": triggered}
