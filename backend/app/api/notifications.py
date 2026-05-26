import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import OrganizationSetting

router = APIRouter()


class WebhookConfig(BaseModel):
    type: str  # slack or discord
    url: str


@router.post("/notifications/test-webhook")
async def test_webhook(body: WebhookConfig):
    type_name = body.type
    url = body.url

    if type_name == "slack":
        payload = {"text": "🧪 NEURON test notification — your webhook is working!"}
    elif type_name == "discord":
        payload = {"content": "🧪 NEURON test notification — your webhook is working!"}
    else:
        raise HTTPException(status_code=400, detail="Unsupported type. Use 'slack' or 'discord'.")

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code >= 400:
            raise HTTPException(status_code=400, detail=f"Webhook returned {resp.status_code}: {resp.text}")

    return {"ok": True, "message": f"Test {type_name} notification sent"}


@router.get("/notifications/configs")
async def get_notification_configs(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(OrganizationSetting).where(
            OrganizationSetting.organization_id == org_id,
            OrganizationSetting.key.like("webhook_%"),
        )
    )
    configs = result.scalars().all()
    return [
        {"id": str(c.id), "key": c.key.replace("webhook_", ""), "value": c.value}
        for c in configs
    ]


@router.post("/notifications/configs")
async def save_notification_config(org_id: str, body: WebhookConfig, db: AsyncSession = Depends(get_db)):
    key = f"webhook_{body.type}"
    existing = (await db.execute(
        select(OrganizationSetting).where(
            OrganizationSetting.organization_id == org_id,
            OrganizationSetting.key == key,
        )
    )).scalar_one_or_none()
    if existing:
        existing.value = body.url
    else:
        db.add(OrganizationSetting(organization_id=org_id, key=key, value=body.url))
    await db.commit()
    return {"ok": True}
