from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import ActivityEvent

router = APIRouter()


@router.get("/activity")
async def get_activity(
    org_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    event_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(ActivityEvent).where(ActivityEvent.organization_id == org_id)
    if event_type:
        q = q.where(ActivityEvent.event_type == event_type)
    q = q.order_by(desc(ActivityEvent.created_at)).offset(offset).limit(limit)
    result = await db.execute(q)
    events = result.scalars().all()
    return [
        {
            "id": str(e.id),
            "event_type": e.event_type,
            "source": e.source,
            "description": e.description,
            "related_entity_type": e.related_entity_type,
            "related_entity_id": e.related_entity_id,
            "severity": e.severity,
            "created_at": str(e.created_at),
        }
        for e in events
    ]
