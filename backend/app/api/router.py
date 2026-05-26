from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Organization, GenomeSequence, DarkMatterReport, ImmuneInfection, MetabolicMetric, CognitiveLoadMetric
from app.agents import genotyper, dark_scanner, immune
from app.agents.metabolic import metabolic
from app.agents.cognitive_load import cognitive_load
from app.utils.activity import record_event
from app.api.health import router as health_router
from app.api.genome import router as genome_router
from app.api.dark_matter import router as dark_matter_router
from app.api.immune import router as immune_router
from app.api.orgs import router as orgs_router
from app.api.metabolic import router as metabolic_router
from app.api.cognitive_load import router as cognitive_load_router
from app.api.ripple import router as ripple_router
from app.api.fossil import router as fossil_router
from app.api.activity import router as activity_router
from app.api.settings import router as settings_router
from app.api.alerts import router as alerts_router
from app.api.benchmarks import router as benchmarks_router
from app.api.export_all import router as export_all_router
from app.api.crisis import router as crisis_router
from app.api.sentiment import router as sentiment_router
from app.api.vulnerability import router as vulnerability_router
from app.api.decisions import router as decisions_router
from app.api.notifications import router as notifications_router
from app.api.email_reports import router as email_reports_router
from app.api.github_connector import router as github_connector_router
from app.api.auth import router as auth_router
from app.api.data_io import router as data_io_router

router = APIRouter()

router.include_router(health_router)
router.include_router(genome_router)
router.include_router(dark_matter_router)
router.include_router(immune_router)
router.include_router(orgs_router)
router.include_router(metabolic_router)
router.include_router(cognitive_load_router)
router.include_router(ripple_router)
router.include_router(fossil_router)
router.include_router(activity_router)
router.include_router(settings_router)
router.include_router(alerts_router)
router.include_router(benchmarks_router)
router.include_router(export_all_router)
router.include_router(crisis_router)
router.include_router(sentiment_router)
router.include_router(vulnerability_router)
router.include_router(decisions_router)
router.include_router(notifications_router)
router.include_router(email_reports_router)
router.include_router(github_connector_router)
router.include_router(auth_router)
router.include_router(data_io_router)


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
        await record_event(db, org_id, "genome_sequenced", "genotyper",
                           f"Genome sequenced — health score {genome.health_score*100:.0f}%",
                           severity="info", related_entity_type="genome", related_entity_id=str(genome.id))
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
        await record_event(db, org_id, "dark_matter_scanned", "dark_scanner",
                           f"Dark matter scan complete — ${report.total_cost} invisible cost detected",
                           severity="warning", related_entity_type="dark_matter", related_entity_id=str(report.id))
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
        await record_event(db, org_id, "infections_scanned", "immune",
                           f"Immune scan found {count} active infection(s)",
                           severity="critical" if count > 2 else "warning",
                           related_entity_type="immune")
    else:
        results["immune"] = {"error": immune_data["error"]}

    metabolic_data = await metabolic.run(db, org_id)
    if "error" not in metabolic_data:
        metric = MetabolicMetric(
            organization_id=org_id,
            metric_date=date.today(),
            decision_cycle_time_hours=metabolic_data.get("decision_cycle_time_hours", 0.0),
            info_half_life_hours=metabolic_data.get("info_half_life_hours", 0.0),
            execution_velocity=metabolic_data.get("execution_velocity", 0.0),
            composite_score=metabolic_data.get("composite_score", 0.0),
        )
        db.add(metric)
        await db.flush()
        results["metabolic"] = {"composite_score": metric.composite_score}
        await record_event(db, org_id, "metabolic_analyzed", "metabolic",
                           f"Metabolic rate analyzed — composite score {metric.composite_score:.2f}",
                           severity="info", related_entity_type="metabolic", related_entity_id=str(metric.id))
    else:
        results["metabolic"] = {"error": metabolic_data["error"]}

    cognitive_data = await cognitive_load.run(db, org_id)
    if "error" not in cognitive_data:
        metric = CognitiveLoadMetric(
            organization_id=org_id,
            metric_date=date.today(),
            workload_score=cognitive_data.get("workload_score", 0.0),
            interaction_density=cognitive_data.get("interaction_density", 0.0),
            meeting_pressure=cognitive_data.get("meeting_pressure", 0.0),
            task_fragmentation=cognitive_data.get("task_fragmentation", 0.0),
            decision_fatigue=cognitive_data.get("decision_fatigue", 0.0),
            burnout_risk=cognitive_data.get("burnout_risk", 0.0),
            composite_score=cognitive_data.get("composite_score", 0.0),
            team_breakdown=cognitive_data.get("team_breakdown"),
        )
        db.add(metric)
        await db.flush()
        results["cognitive_load"] = {"composite_score": metric.composite_score}
        await record_event(db, org_id, "cognitive_load_analyzed", "cognitive_load",
                           f"Cognitive load analyzed — composite score {metric.composite_score:.2f}",
                           severity="info", related_entity_type="cognitive_load", related_entity_id=str(metric.id))
    else:
        results["cognitive_load"] = {"error": cognitive_data["error"]}

    await db.commit()
    return results
