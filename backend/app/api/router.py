from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, GenomeSequence, DarkMatterReport, ImmuneInfection
from app.agents import genotyper, dark_scanner, immune
from app.api.health import router as health_router
from app.api.genome import router as genome_router
from app.api.dark_matter import router as dark_matter_router
from app.api.immune import router as immune_router
from app.api.orgs import router as orgs_router

router = APIRouter()

router.include_router(health_router)
router.include_router(genome_router)
router.include_router(dark_matter_router)
router.include_router(immune_router)
router.include_router(orgs_router)


@router.get("/")
async def root():
    return {"message": "NEURON API v0.1.0"}


@router.post("/agents/run-all")
async def run_all_agents(org_id: str, db: AsyncSession = Depends(get_db)):
    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = org_result.scalar_one_or_none()
    if not org:
        return {"error": "Organization not found"}

    results = {}

    genome_data = await genotyper.run(db, org_id)
    if "error" not in genome_data:
        genome = GenomeSequence(
            organization_id=org_id,
            week_start=date.today() - timedelta(days=date.today().weekday()),
            collaboration=genome_data.get("collaboration", 0.0),
            decision_making=genome_data.get("decision_making", 0.0),
            knowledge_flow=genome_data.get("knowledge_flow", 0.0),
            innovation=genome_data.get("innovation", 0.0),
            resilience=genome_data.get("resilience", 0.0),
            vitality=genome_data.get("vitality", 0.0),
            health_score=genome_data.get("health_score", 0.0),
            summary=genome_data.get("summary"),
        )
        db.add(genome)
        await db.flush()
        results["genome"] = {"health_score": genome.health_score}
    else:
        results["genome"] = {"error": genome_data["error"]}

    dm_data = await dark_scanner.run(db, org_id)
    if "error" not in dm_data:
        report = DarkMatterReport(
            organization_id=org_id,
            report_date=date.today(),
            invisible_work_hours=dm_data.get("invisible_work_hours", 0),
            invisible_work_cost=dm_data.get("invisible_work_cost", 0),
            shadow_coordination_hours=dm_data.get("shadow_coordination_hours", 0),
            shadow_coordination_cost=dm_data.get("shadow_coordination_cost", 0),
            unlogged_hours=dm_data.get("unlogged_hours", 0),
            unlogged_hours_cost=dm_data.get("unlogged_hours_cost", 0),
            meeting_overhead_hours=dm_data.get("meeting_overhead_hours", 0),
            meeting_overhead_cost=dm_data.get("meeting_overhead_cost", 0),
            context_switching_hours=dm_data.get("context_switching_hours", 0),
            context_switching_cost=dm_data.get("context_switching_cost", 0),
            total_cost=dm_data.get("total_cost", 0),
            summary=dm_data.get("summary"),
        )
        db.add(report)
        await db.flush()
        results["dark_matter"] = {"total_cost": str(report.total_cost)}
    else:
        results["dark_matter"] = {"error": dm_data["error"]}

    immune_data = await immune.run(db, org_id)
    if "error" not in immune_data:
        count = 0
        for inf in immune_data.get("infections", []):
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
            count += 1
        await db.flush()
        results["immune"] = {"active_infections": count}
    else:
        results["immune"] = {"error": immune_data["error"]}

    await db.commit()
    return results
