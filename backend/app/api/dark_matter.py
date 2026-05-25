from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, DarkMatterReport
from app.agents import dark_scanner
from app.schemas.genome import DarkMatterOut

router = APIRouter()


@router.get("/dark-matter", response_model=DarkMatterOut)
async def get_latest_dark_matter(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DarkMatterReport)
        .where(DarkMatterReport.organization_id == org_id)
        .order_by(desc(DarkMatterReport.report_date))
        .limit(1)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="No dark matter report found. Run an agent first.")
    return report


@router.post("/dark-matter/analyze", response_model=DarkMatterOut)
async def analyze_dark_matter(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    data = await dark_scanner.run(db, org_id)
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])

    report = DarkMatterReport(
        organization_id=org_id,
        report_date=date.today(),
        invisible_work_hours=data.get("invisible_work_hours", 0),
        invisible_work_cost=data.get("invisible_work_cost", 0),
        shadow_coordination_hours=data.get("shadow_coordination_hours", 0),
        shadow_coordination_cost=data.get("shadow_coordination_cost", 0),
        unlogged_hours=data.get("unlogged_hours", 0),
        unlogged_hours_cost=data.get("unlogged_hours_cost", 0),
        meeting_overhead_hours=data.get("meeting_overhead_hours", 0),
        meeting_overhead_cost=data.get("meeting_overhead_cost", 0),
        context_switching_hours=data.get("context_switching_hours", 0),
        context_switching_cost=data.get("context_switching_cost", 0),
        total_cost=data.get("total_cost", 0),
        summary=data.get("summary"),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report
