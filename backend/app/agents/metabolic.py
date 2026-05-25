from app.agents.base import BaseAgent
from app.llm.prompts import METABOLIC_SYSTEM


class MetabolicAgent(BaseAgent):
    def __init__(self):
        super().__init__(METABOLIC_SYSTEM)


metabolic = MetabolicAgent()
