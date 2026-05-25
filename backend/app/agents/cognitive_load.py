from app.agents.base import BaseAgent
from app.llm.prompts import COGNITIVE_LOAD_SYSTEM


class CognitiveLoadAgent(BaseAgent):
    def __init__(self):
        super().__init__(COGNITIVE_LOAD_SYSTEM)


cognitive_load = CognitiveLoadAgent()
