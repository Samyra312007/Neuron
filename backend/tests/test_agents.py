import pytest
from app.agents.base import GenotyperAgent, DarkScannerAgent, ImmuneAgent


def test_genotyper_agent_exists():
    agent = GenotyperAgent()
    assert agent.system_prompt is not None
    assert "collaboration" in agent.system_prompt.lower() or "gene" in agent.system_prompt.lower()


def test_dark_scanner_agent_exists():
    agent = DarkScannerAgent()
    assert agent.system_prompt is not None
    assert "invisible" in agent.system_prompt.lower() or "dark" in agent.system_prompt.lower()


def test_immune_agent_exists():
    agent = ImmuneAgent()
    assert agent.system_prompt is not None
    assert "infection" in agent.system_prompt.lower()
