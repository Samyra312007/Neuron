from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import ActivityEvent


async def record_event(
    db: AsyncSession,
    org_id: str,
    event_type: str,
    source: str,
    description: str,
    severity: str = "info",
    related_entity_type: str | None = None,
    related_entity_id: str | None = None,
):
    event = ActivityEvent(
        organization_id=org_id,
        event_type=event_type,
        source=source,
        description=description,
        severity=severity,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
    )
    db.add(event)
