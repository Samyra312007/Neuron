from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, OrganizationSetting

router = APIRouter()


@router.get("/settings")
async def get_settings(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(OrganizationSetting).where(OrganizationSetting.organization_id == org_id)
    )
    settings = result.scalars().all()
    org = (await db.execute(select(Organization).where(Organization.id == org_id))).scalar_one_or_none()
    return {
        "org_name": org.name if org else "NEURON",
        "settings": {s.key: s.value for s in settings},
    }


class SettingsUpdate(BaseModel):
    org_name: str | None = None
    settings: dict[str, str] | None = None


@router.put("/settings")
async def update_settings(
    org_id: str, body: SettingsUpdate, db: AsyncSession = Depends(get_db)
):
    if body.org_name:
        org = (await db.execute(select(Organization).where(Organization.id == org_id))).scalar_one_or_none()
        if org:
            org.name = body.org_name

    if body.settings:
        for key, value in body.settings.items():
            existing = (
                await db.execute(
                    select(OrganizationSetting).where(
                        OrganizationSetting.organization_id == org_id,
                        OrganizationSetting.key == key,
                    )
                )
            ).scalar_one_or_none()
            if existing:
                existing.value = value
            else:
                db.add(OrganizationSetting(organization_id=org_id, key=key, value=value))

    await db.commit()
    return {"ok": True}
