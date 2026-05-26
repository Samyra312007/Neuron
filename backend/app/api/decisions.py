from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import DecisionRecord, Person, RawEvent

router = APIRouter()


@router.get("/decisions")
async def get_decisions(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DecisionRecord)
        .where(DecisionRecord.organization_id == org_id)
        .order_by(desc(DecisionRecord.created_at))
    )
    records = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "title": r.title,
            "description": r.description,
            "status": r.status,
            "initiator_name": r.initiator_name,
            "decided_at": str(r.decided_at) if r.decided_at else None,
            "completed_at": str(r.completed_at) if r.completed_at else None,
            "reverted_at": str(r.reverted_at) if r.reverted_at else None,
            "created_at": str(r.created_at),
        }
        for r in records
    ]


class DecisionCreate(BaseModel):
    title: str
    description: str = ""
    initiator_name: str = ""


@router.post("/decisions")
async def create_decision(org_id: str, body: DecisionCreate, db: AsyncSession = Depends(get_db)):
    record = DecisionRecord(
        organization_id=org_id,
        title=body.title,
        description=body.description,
        initiator_name=body.initiator_name or None,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return {"id": str(record.id), "status": record.status, "title": record.title}


@router.post("/decisions/{decision_id}/{action}")
async def transition_decision(decision_id: str, action: str, org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DecisionRecord).where(
            DecisionRecord.id == decision_id,
            DecisionRecord.organization_id == org_id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Decision not found")

    now = datetime.now(timezone.utc)
    if action == "decide":
        record.status = "decided"
        record.decided_at = now
    elif action == "complete":
        record.status = "completed"
        record.completed_at = now
    elif action == "revert":
        record.status = "reverted"
        record.reverted_at = now
    elif action == "cancel":
        record.status = "cancelled"
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {action}")

    await db.commit()
    return {"id": str(record.id), "status": record.status}


@router.post("/decisions/auto-discover")
async def auto_discover_decisions(org_id: str, db: AsyncSession = Depends(get_db)):
    events = (await db.execute(
        select(RawEvent).where(
            RawEvent.organization_id == org_id,
            RawEvent.subject.isnot(None),
        ).order_by(desc(RawEvent.occurred_at)).limit(200)
    )).scalars().all()

    keywords = ["decision", "approved", "rejected", "go ahead", "sign off", "greenlit", "blocked", "paused"]
    count = 0
    for e in events:
        if e.subject and any(kw in e.subject.lower() for kw in keywords):
            existing = await db.execute(
                select(DecisionRecord).where(
                    DecisionRecord.organization_id == org_id,
                    DecisionRecord.title == e.subject,
                ).limit(1)
            )
            if not existing.scalar_one_or_none():
                person = (await db.execute(select(Person).where(Person.id == e.sender_id))).scalar_one_or_none()
                db.add(DecisionRecord(
                    organization_id=org_id,
                    title=e.subject,
                    description=e.body or "",
                    initiator_name=person.name if person else None,
                    status="proposed",
                ))
                count += 1

    if count:
        await db.commit()
    return {"discovered": count}
