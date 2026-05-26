from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import RawEvent

router = APIRouter()


@router.get("/sentiment")
async def get_sentiment(
    org_id: str,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RawEvent).where(
            RawEvent.organization_id == org_id,
            RawEvent.sentiment_score.isnot(None),
        ).order_by(desc(RawEvent.occurred_at)).limit(500)
    )
    events = result.scalars().all()

    sentiment_by_source = {}
    total = len(events)
    positive = sum(1 for e in events if e.sentiment_score and e.sentiment_score > 0.1)
    negative = sum(1 for e in events if e.sentiment_score and e.sentiment_score < -0.1)
    neutral = total - positive - negative

    for e in events:
        source = e.source or "unknown"
        if source not in sentiment_by_source:
            sentiment_by_source[source] = []
        sentiment_by_source[source].append(e.sentiment_score or 0)

    avg_sentiment = sum(e.sentiment_score or 0 for e in events) / total if total else 0

    return {
        "total_events": total,
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "avg_sentiment": round(avg_sentiment, 3),
        "trend": "improving" if avg_sentiment > 0.05 else "declining" if avg_sentiment < -0.05 else "stable",
        "by_source": {
            source: round(sum(scores) / len(scores), 3)
            for source, scores in sentiment_by_source.items()
        },
    }
