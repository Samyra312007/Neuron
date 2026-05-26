from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import CrisisPattern, CrisisMatch, FossilSnapshot

router = APIRouter()

PREDEFINED_PATTERNS = [
    {
        "name": "Collaboration Collapse",
        "description": "When collaboration drops below 0.4 and decision fatigue rises above 0.7, the org enters a silo death spiral",
        "severity": "high",
        "pattern_data": {"genome_collaboration_lt": 0.4, "cognitive_decision_fatigue_gt": 0.7},
    },
    {
        "name": "Burnout Cascade",
        "description": "High workload (>0.7) + high meeting pressure (>0.6) + low vitality (<0.4) signals imminent burnout wave",
        "severity": "critical",
        "pattern_data": {"cognitive_workload_gt": 0.7, "cognitive_meeting_pressure_gt": 0.6, "genome_vitality_lt": 0.4},
    },
    {
        "name": "Meeting Metastasis",
        "description": "Meeting overhead > 500h/month indicates meeting culture is consuming productive time",
        "severity": "medium",
        "pattern_data": {"dm_meeting_overhead_gt": 500},
    },
    {
        "name": "Decision Paralysis",
        "description": "Decision cycle time > 48h combined with decision fatigue > 0.6 means the org is stuck",
        "severity": "high",
        "pattern_data": {"metabolic_decision_cycle_gt": 48, "cognitive_decision_fatigue_gt": 0.6},
    },
]


@router.post("/crisis/seed-patterns")
async def seed_crisis_patterns(org_id: str, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(
        select(CrisisPattern).where(CrisisPattern.organization_id == org_id).limit(1)
    )).scalar_one_or_none()
    if existing:
        return {"message": "Patterns already seeded"}

    for pat in PREDEFINED_PATTERNS:
        db.add(CrisisPattern(
            organization_id=org_id,
            name=pat["name"],
            description=pat["description"],
            pattern_data=pat["pattern_data"],
            severity=pat["severity"],
        ))
    await db.commit()
    return {"message": f"Seeded {len(PREDEFINED_PATTERNS)} crisis patterns"}


@router.get("/crisis/matches")
async def get_crisis_matches(org_id: str, db: AsyncSession = Depends(get_db)):
    patterns = (await db.execute(
        select(CrisisPattern).where(CrisisPattern.organization_id == org_id)
    )).scalars().all()

    if not patterns:
        return {"matches": [], "message": "No crisis patterns defined. POST /crisis/seed-patterns first."}

    snapshot = (await db.execute(
        select(FossilSnapshot).where(FossilSnapshot.organization_id == org_id)
        .order_by(desc(FossilSnapshot.snapshot_date)).limit(1)
    )).scalar_one_or_none()

    if not snapshot:
        return {"matches": [], "message": "No snapshots available for comparison"}

    state = snapshot.state or {}

    matches = []
    for pattern in patterns:
        score = 0.0
        details = {}
        pd = pattern.pattern_data

        for key, condition in pd.items():
            parts = key.split("_", 1)
            if len(parts) != 2:
                continue
            domain, metric_condition = parts
            domain_data = state.get(domain, {})

            if "_lt_" in metric_condition:
                metric, _ = metric_condition.split("_lt_", 1)
                val = domain_data.get(metric)
                threshold = condition
                if val is not None and isinstance(val, (int, float)) and val < threshold:
                    score += 0.25
                    details[metric] = f"{val} < {threshold} (matched)"
                elif val is not None:
                    details[metric] = f"{val} >= {threshold}"

            elif "_gt_" in metric_condition:
                metric, _ = metric_condition.split("_gt_", 1)
                val = domain_data.get(metric)
                threshold = condition
                if val is not None and isinstance(val, (int, float)) and val > threshold:
                    score += 0.25
                    details[metric] = f"{val} > {threshold} (matched)"
                elif val is not None:
                    details[metric] = f"{val} <= {threshold}"

        if score > 0:
            match = CrisisMatch(
                organization_id=org_id,
                pattern_id=pattern.id,
                snapshot_id=snapshot.id,
                match_score=score,
                details=details,
            )
            db.add(match)
            matches.append({
                "pattern_name": pattern.name,
                "pattern_description": pattern.description,
                "severity": pattern.severity,
                "match_score": score,
                "details": details,
            })

    if matches:
        await db.commit()

    return {"matches": matches, "snapshot_date": str(snapshot.snapshot_date)}
