import json
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.llm.nvidia_nim import nim_client
from app.llm.prompts import GENOTYPER_SYSTEM, DARK_SCANNER_SYSTEM, IMMUNE_SYSTEM
from app.database.models import Organization, Person, Team, RawEvent


async def _get_org_context(session: AsyncSession, org_id) -> str:
    result = await session.execute(
        select(Organization).where(Organization.id == org_id)
    )
    org = result.scalar_one_or_none()
    if not org:
        return ""

    teams_result = await session.execute(
        select(Team).where(Team.organization_id == org_id)
    )
    teams = teams_result.scalars().all()

    persons_result = await session.execute(
        select(Person).where(Person.team_id.in_([t.id for t in teams]))
    )
    persons = persons_result.scalars().all()

    events_result = await session.execute(
        select(RawEvent).where(RawEvent.organization_id == org_id).limit(50)
    )
    events = events_result.scalars().all()

    context = f"Organization: {org.name} ({org.industry}, {org.size} employees)\n\n"
    context += f"Teams ({len(teams)}): {', '.join(t.name for t in teams)}\n"
    context += f"Departments: {', '.join(set(t.department for t in teams))}\n\n"
    context += f"People ({len(persons)}): {len(persons)} employees across teams\n"
    context += f"Roles: {len(set(p.role for p in persons))} unique roles\n\n"
    context += f"Recent Events ({len(events)}):\n"
    for e in events[:20]:
        context += f"  [{e.source}] {e.event_type}: {e.subject or 'N/A'}\n"

    return context


class BaseAgent:
    def __init__(self, system_prompt: str):
        self.system_prompt = system_prompt

    async def run(self, session: AsyncSession, org_id) -> dict:
        context = await _get_org_context(session, org_id)
        response = await nim_client.generate(
            self.system_prompt,
            f"Analyze this organization's data and provide structured output:\n\n{context}",
        )
        try:
            cleaned = response.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {"error": "Failed to parse LLM response", "raw": response}


class GenotyperAgent(BaseAgent):
    def __init__(self):
        super().__init__(GENOTYPER_SYSTEM)


class DarkScannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(DARK_SCANNER_SYSTEM)


class ImmuneAgent(BaseAgent):
    def __init__(self):
        super().__init__(IMMUNE_SYSTEM)
