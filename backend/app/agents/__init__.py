from app.agents.base import GenotyperAgent, DarkScannerAgent, ImmuneAgent

genotyper = GenotyperAgent()
dark_scanner = DarkScannerAgent()
immune = ImmuneAgent()

__all__ = ["genotyper", "dark_scanner", "immune"]
