import uuid
import random
from datetime import datetime, timedelta, date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Organization, Team, Person, RawEvent
from app.seed.constants import TEAMS, FIRST_NAMES, LAST_NAMES, DEPARTMENT_DISTRIBUTION, ROLE_WEIGHTS


def _pick_role(dept: str) -> str:
    roles = DEPARTMENT_DISTRIBUTION[dept]["roles"]
    weights = [ROLE_WEIGHTS[r] for r in roles]
    return random.choices(roles, weights=weights, k=1)[0]


def _person_name(used_names: set) -> str:
    for _ in range(100):
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        if name not in used_names:
            used_names.add(name)
            return name
    return f"Employee {len(used_names) + 1}"


def _generate_events(org_id, team_ids, person_ids, start_date, end_date) -> list[RawEvent]:
    events = []
    sources = ["email", "chat", "meeting", "task", "calendar"]
    event_types = {
        "email": ["sent", "received", "forwarded", "replied"],
        "chat": ["message", "thread_reply", "reaction", "file_share"],
        "meeting": ["scheduled", "attended", "canceled", "overran"],
        "task": ["created", "completed", "overdue", "assigned"],
        "calendar": ["event_created", "event_declined", "double_booked", "focus_time"],
    }

    current = start_date
    while current <= end_date:
        num_events = random.randint(30, 80)
        for _ in range(num_events):
            source = random.choice(sources)
            event_type = random.choice(event_types[source])
            sender = random.choice(person_ids)
            recipients = random.sample(
                [p for p in person_ids if p != sender],
                k=random.randint(1, 5),
            )

            subject_prefixes = {
                "email": ["Re: Sprint planning", "Status update:", "Action required:", "FYI:", "Meeting notes:"],
                "chat": ["", "", "", ""],
                "meeting": ["Daily Standup", "Sprint Review", "1:1", "Design Critique", "All Hands"],
                "task": ["[JIRA] ", "[LINEAR] ", "[ASANA] ", ""],
                "calendar": ["", "", ""],
            }

            subject = ""
            if subject_prefixes.get(source):
                prefix = random.choice(subject_prefixes[source])
                if prefix:
                    topics = ["Q2 roadmap", "bug fix", "deployment", "customer feedback", "sprint goals",
                              "architecture review", "budget planning", "team building", "onboarding", "tech debt"]
                    subject = f"{prefix} {random.choice(topics)}"

            bodies = {
                "email": "Please review the attached document and provide feedback by EOD.",
                "chat": "Hey team, quick question about the API endpoint.",
                "meeting": "Agenda: Project updates, blockers, next steps.",
                "task": "",
                "calendar": "",
            }

            event = RawEvent(
                organization_id=org_id,
                source=source,
                event_type=event_type,
                sender_id=sender,
                recipient_ids=[str(r) for r in recipients],
                subject=subject,
                body=bodies.get(source, ""),
                extra_data={"source": source, "channel": f"#{random.choice(['general', 'engineering', 'design', 'random', 'announcements'])}"},
                occurred_at=current + timedelta(
                    hours=random.randint(6, 22),
                    minutes=random.randint(0, 59),
                ),
                sentiment_score=round(random.uniform(-1.0, 1.0), 2),
                tokens=random.randint(10, 500),
            )
            events.append(event)

        current += timedelta(days=1)

    return events


async def seed_database(session: AsyncSession, org_name: str = "TechNova Inc.") -> uuid.UUID:
    org = Organization(
        name=org_name,
        industry="Technology",
        size=150,
    )
    session.add(org)
    await session.flush()

    team_ids = []
    person_ids = []
    used_names = set()

    for team_name, department in TEAMS:
        team = Team(
            organization_id=org.id,
            name=team_name,
            department=department,
        )
        session.add(team)
        await session.flush()
        team_ids.append(team.id)

    for idx, (team_id, (team_name, department)) in enumerate(zip(team_ids, TEAMS)):
        dept_size = DEPARTMENT_DISTRIBUTION[department]["size"]
        team_size = max(2, dept_size // len([t for t in TEAMS if t[1] == department]))

        if department == "Leadership" and team_name == "Executive Office":
            team_size = 5
        elif department == "Leadership":
            team_size = 3

        for _ in range(team_size):
            person = Person(
                team_id=team_id,
                name=_person_name(used_names),
                email=f"user{len(person_ids) + 1}@technova.com",
                role=_pick_role(department),
                tenure_months=random.randint(1, 84),
            )
            session.add(person)
            await session.flush()
            person_ids.append(person.id)

    # Generate 90 days of events
    start_date = datetime.now() - timedelta(days=90)
    end_date = datetime.now()
    events = _generate_events(org.id, team_ids, person_ids, start_date, end_date)

    for event in events:
        session.add(event)

    await session.commit()
    return org.id
