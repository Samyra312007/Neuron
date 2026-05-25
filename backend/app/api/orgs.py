from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization
from app.schemas.genome import OrganizationOut

router = APIRouter()


@router.get("/orgs", response_model=list[OrganizationOut])
async def list_orgs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).limit(10))
    orgs = result.scalars().all()
    return orgs


@router.get("/orgs/first", response_model=OrganizationOut)
async def get_first_org(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="No organizations found")
    return org
