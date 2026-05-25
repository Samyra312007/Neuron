from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization
from app.agents.ripple import ripple

router = APIRouter()


class SimulateRequest(BaseModel):
    change_description: str
    target_team: str | None = None
    intensity: str = "medium"


@router.post("/ripple/simulate")
async def simulate_ripple(org_id: str, body: SimulateRequest, db: AsyncSession = Depends(get_db)):
    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    if not org_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Organization not found")

    full_change = f"{body.change_description} (target: {body.target_team or 'organization-wide'}, intensity: {body.intensity})"
    data = await ripple.simulate(db, org_id, full_change)
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])
    return data
