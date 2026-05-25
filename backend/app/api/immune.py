from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, ImmuneInfection
from app.agents import immune
from app.schemas.genome import InfectionOut, TreatmentRequest, TreatmentResponse

router = APIRouter()


@router.get("/immune/infections")
async def get_active_infections(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ImmuneInfection)
        .where(ImmuneInfection.organization_id == org_id, ImmuneInfection.is_active == True)
        .order_by(desc(ImmuneInfection.severity_score))
    )
    infections = result.scalars().all()
    return infections


@router.post("/immune/analyze")
async def analyze_infections(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    data = await immune.run(db, org_id)
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])

    infections = []
    for inf in data.get("infections", []):
        infection = ImmuneInfection(
            organization_id=org_id,
            infection_type=inf.get("infection_type", "Unknown"),
            severity=inf.get("severity", "medium"),
            severity_score=inf.get("severity_score", 0.0),
            description=inf.get("description", ""),
            spread_count=inf.get("spread_count", 1),
            treatment=inf.get("treatment"),
            is_active=True,
        )
        db.add(infection)
        infections.append(infection)

    await db.commit()
    for inf in infections:
        await db.refresh(inf)
    return infections


@router.post("/immune/treat", response_model=TreatmentResponse)
async def treat_infection(req: TreatmentRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ImmuneInfection).where(ImmuneInfection.id == req.infection_id)
    )
    infection = result.scalar_one_or_none()
    if not infection:
        raise HTTPException(status_code=404, detail="Infection not found")
    if not infection.is_active:
        return TreatmentResponse(success=False, message="Infection already resolved")

    infection.is_active = False
    infection.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    return TreatmentResponse(success=True, message=f"Treatment applied: {infection.treatment}")
