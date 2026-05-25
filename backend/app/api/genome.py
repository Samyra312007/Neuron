from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, GenomeSequence
from app.agents import genotyper
from app.schemas.genome import GenomeOut

router = APIRouter()


@router.get("/genome", response_model=GenomeOut)
async def get_latest_genome(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GenomeSequence)
        .where(GenomeSequence.organization_id == org_id)
        .order_by(desc(GenomeSequence.week_start))
        .limit(1)
    )
    genome = result.scalar_one_or_none()
    if not genome:
        raise HTTPException(status_code=404, detail="No genome sequence found. Run an agent first.")
    return genome


@router.post("/genome/analyze", response_model=GenomeOut)
async def analyze_genome(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    data = await genotyper.run(db, org_id)
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])

    genome = GenomeSequence(
        organization_id=org_id,
        week_start=date.today() - timedelta(days=date.today().weekday()),
        collaboration=data.get("collaboration", 0.0),
        decision_making=data.get("decision_making", 0.0),
        knowledge_flow=data.get("knowledge_flow", 0.0),
        innovation=data.get("innovation", 0.0),
        resilience=data.get("resilience", 0.0),
        vitality=data.get("vitality", 0.0),
        health_score=data.get("health_score", 0.0),
        summary=data.get("summary"),
    )
    db.add(genome)
    await db.commit()
    await db.refresh(genome)
    return genome


@router.get("/genome/history")
async def get_genome_history(org_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GenomeSequence)
        .where(GenomeSequence.organization_id == org_id)
        .order_by(desc(GenomeSequence.week_start))
    )
    genomes = result.scalars().all()
    return genomes
