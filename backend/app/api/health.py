from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization
from app.schemas.genome import HealthResponse
from app.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Organization).limit(1))
        result.scalar_one_or_none()
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    return HealthResponse(
        status=db_status,
        version="0.1.0",
        mock_ai=settings.mock_ai_enabled,
    )
