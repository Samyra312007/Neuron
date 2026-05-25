from app.agents.base import BaseAgent
from app.llm.prompts import RIPPLE_SIMULATOR_SYSTEM


class RippleAgent(BaseAgent):
    def __init__(self):
        super().__init__(RIPPLE_SIMULATOR_SYSTEM)

    async def simulate(self, db, org_id, change_description: str) -> dict:
        context = await self._get_org_context(db, org_id)
        prompt = f"Proposed change: {change_description}\n\nOrganization context:\n{context}"
        response = await self._llm_generate(self.system_prompt, prompt)
        return response


ripple = RippleAgent()
