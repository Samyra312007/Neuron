from app.agents.base import GenotyperAgent, DarkScannerAgent, ImmuneAgent
from app.agents.cognitive_load import cognitive_load
from app.agents.ripple import ripple

genotyper = GenotyperAgent()
dark_scanner = DarkScannerAgent()
immune = ImmuneAgent()

__all__ = ["genotyper", "dark_scanner", "immune", "cognitive_load", "ripple"]
