import csv
import io
import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import (
    Organization, Team, Person, GenomeSequence, DarkMatterReport,
    MetabolicMetric, CognitiveLoadMetric, ImmuneInfection, FossilSnapshot,
    RawEvent,
)

router = APIRouter()


@router.get("/export-all/json")
async def export_all_json(org_id: str, db: AsyncSession = Depends(get_db)):
    org = (await db.execute(select(Organization).where(Organization.id == org_id))).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    teams = (await db.execute(select(Team).where(Team.organization_id == org_id))).scalars().all()
    team_ids = [t.id for t in teams]

    persons = []
    if team_ids:
        persons = (await db.execute(select(Person).where(Person.team_id.in_(team_ids)))).scalars().all()

    genomes = (await db.execute(
        select(GenomeSequence).where(GenomeSequence.organization_id == org_id).order_by(desc(GenomeSequence.week_start))
    )).scalars().all()

    dm = (await db.execute(
        select(DarkMatterReport).where(DarkMatterReport.organization_id == org_id).order_by(desc(DarkMatterReport.report_date))
    )).scalars().all()

    metabolic = (await db.execute(
        select(MetabolicMetric).where(MetabolicMetric.organization_id == org_id).order_by(desc(MetabolicMetric.metric_date))
    )).scalars().all()

    cognitive = (await db.execute(
        select(CognitiveLoadMetric).where(CognitiveLoadMetric.organization_id == org_id).order_by(desc(CognitiveLoadMetric.metric_date))
    )).scalars().all()

    infections = (await db.execute(
        select(ImmuneInfection).where(ImmuneInfection.organization_id == org_id)
    )).scalars().all()

    snapshots = (await db.execute(
        select(FossilSnapshot).where(FossilSnapshot.organization_id == org_id).order_by(desc(FossilSnapshot.snapshot_date))
    )).scalars().all()

    events = (await db.execute(
        select(RawEvent).where(RawEvent.organization_id == org_id).limit(500)
    )).scalars().all()

    def serialize(records):
        return [r.__dict__ for r in records]

    backup = {
        "version": "1.0",
        "exported_at": str(date.today()),
        "organization": {"name": org.name, "industry": org.industry, "size": org.size},
        "teams": [{"name": t.name, "department": t.department} for t in teams],
        "persons": [{"name": p.name, "role": p.role, "tenure_months": p.tenure_months} for p in persons],
        "genome_sequences": [{"week_start": str(g.week_start), "health_score": g.health_score, "collaboration": g.collaboration, "decision_making": g.decision_making, "knowledge_flow": g.knowledge_flow, "innovation": g.innovation, "resilience": g.resilience, "vitality": g.vitality} for g in genomes],
        "dark_matter_reports": [{"report_date": str(d.report_date), "total_cost": str(d.total_cost)} for d in dm],
        "metabolic_metrics": [{"metric_date": str(m.metric_date), "composite_score": m.composite_score} for m in metabolic],
        "cognitive_load_metrics": [{"metric_date": str(c.metric_date), "composite_score": c.composite_score} for c in cognitive],
        "infections": [{"infection_type": i.infection_type, "severity": i.severity, "is_active": i.is_active} for i in infections],
        "snapshot_count": len(snapshots),
        "event_count": len(events),
    }

    return Response(
        content=json.dumps(backup, indent=2, default=str),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=neuron_backup.json"},
    )


@router.post("/import/teams")
async def import_teams_csv(org_id: str, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    teams = []
    persons = []
    for row in reader:
        team_name = row.get("team", "").strip()
        person_name = row.get("name", "").strip()
        role = row.get("role", "Individual Contributor").strip()
        email = row.get("email", f"{person_name.lower().replace(' ', '.')}@imported.com").strip()

        if not team_name or not person_name:
            continue

        team = None
        for t in teams:
            if t.name == team_name:
                team = t
                break
        if not team:
            team = Team(organization_id=org_id, name=team_name, department=row.get("department", "Engineering").strip())
            db.add(team)
            await db.flush()
            teams.append(team)

        person = Person(team_id=team.id, name=person_name, email=email, role=role)
        db.add(person)
        persons.append(person)

    await db.commit()
    return {"teams_created": len(teams), "people_imported": len(persons)}
