from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, FossilSnapshot
from app.agents.fossil import create_snapshot

router = APIRouter()


@router.post("/fossil/snapshot")
async def take_snapshot(org_id: str, db: AsyncSession = Depends(get_db)):
    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    if not org_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Organization not found")

    state = await create_snapshot(db, org_id)
    snapshot = FossilSnapshot(
        organization_id=org_id,
        snapshot_date=date.today(),
        state=state,
    )
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)
    return {"id": snapshot.id, "snapshot_date": str(snapshot.snapshot_date), "state": snapshot.state}


@router.get("/fossil/snapshots")
async def list_snapshots(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(FossilSnapshot)
        .where(FossilSnapshot.organization_id == org_id)
        .order_by(desc(FossilSnapshot.snapshot_date))
    )
    snapshots = result.scalars().all()
    return [
        {"id": s.id, "snapshot_date": str(s.snapshot_date), "created_at": str(s.created_at)}
        for s in snapshots
    ]


@router.get("/fossil/snapshot/{snapshot_id}")
async def get_snapshot(snapshot_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FossilSnapshot).where(FossilSnapshot.id == snapshot_id))
    snapshot = result.scalar_one_or_none()
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return {"id": snapshot.id, "snapshot_date": str(snapshot.snapshot_date), "state": snapshot.state}


@router.get("/fossil/compare")
async def compare_snapshots(org_id: str, before_id: str, after_id: str, db: AsyncSession = Depends(get_db)):
    before = (await db.execute(select(FossilSnapshot).where(FossilSnapshot.id == before_id))).scalar_one_or_none()
    after = (await db.execute(select(FossilSnapshot).where(FossilSnapshot.id == after_id))).scalar_one_or_none()
    if not before or not after:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    b_state = before.state or {}
    a_state = after.state or {}

    delta = {}
    for key in ["genome", "dark_matter", "metabolic", "cognitive_load"]:
        b_val = b_state.get(key, {})
        a_val = a_state.get(key, {})
        if b_val and a_val:
            diff = {}
            for k in b_val:
                if isinstance(b_val[k], (int, float)) and isinstance(a_val.get(k), (int, float)):
                    diff[k] = round(a_val[k] - b_val[k], 4)
                elif isinstance(b_val[k], str) and isinstance(a_val.get(k), str):
                    try:
                        diff[k] = round(float(a_val[k]) - float(b_val[k]), 4)
                    except (ValueError, TypeError):
                        diff[k] = None
            if diff:
                delta[key] = diff

    return {
        "before": {"snapshot_date": str(before.snapshot_date), "state": b_state},
        "after": {"snapshot_date": str(after.snapshot_date), "state": a_state},
        "delta": delta,
    }
