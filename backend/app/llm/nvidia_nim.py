import httpx
from app.config import settings


class NvidiaNIMClient:
    def __init__(self):
        self.api_key = settings.nvidia_nim_api_key
        self.base_url = settings.nvidia_nim_base_url
        self.model = settings.nvidia_nim_model
        self.client = httpx.AsyncClient(timeout=60.0)

    async def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 2048) -> str:
        if settings.mock_ai_enabled:
            return self._mock_response(system_prompt, user_prompt)

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.3,
            "max_tokens": max_tokens,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        response = await self.client.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

    def _mock_response(self, system_prompt: str, user_prompt: str) -> str:
        if "genome" in system_prompt.lower() or "gene" in system_prompt.lower():
            return """{
                "collaboration": 0.72,
                "decision_making": 0.58,
                "knowledge_flow": 0.64,
                "innovation": 0.45,
                "resilience": 0.81,
                "vitality": 0.63,
                "health_score": 0.64,
                "summary": "Organization shows strong resilience and collaboration. Innovation and decision-making velocity are areas for improvement."
            }"""
        elif "dark matter" in system_prompt.lower():
            return """{
                "invisible_work_hours": 320,
                "invisible_work_cost": 1280000.00,
                "shadow_coordination_hours": 180,
                "shadow_coordination_cost": 720000.00,
                "unlogged_hours": 450,
                "unlogged_hours_cost": 1800000.00,
                "meeting_overhead_hours": 280,
                "meeting_overhead_cost": 1120000.00,
                "context_switching_hours": 210,
                "context_switching_cost": 840000.00,
                "total_cost": 5760000.00,
                "summary": "Significant dark matter detected. Unlogged hours and invisible work are the largest contributors to organizational friction."
            }"""
        elif "immune" in system_prompt.lower() or "infection" in system_prompt.lower():
            return """{
                "infections": [
                    {
                        "infection_type": "Meeting Metastasis",
                        "severity": "high",
                        "severity_score": 0.85,
                        "description": "Excessive meeting culture detected in Engineering and Product teams averaging 8+ hours per week in meetings.",
                        "spread_count": 3,
                        "treatment": "Implement no-meeting Wednesday policy. Cap recurring meetings at 30 minutes. Use async standups."
                    },
                    {
                        "infection_type": "Context Switching Plague",
                        "severity": "medium",
                        "severity_score": 0.62,
                        "description": "High context switching frequency across Design team with 12+ task switches per day.",
                        "spread_count": 2,
                        "treatment": "Introduce focus blocks (4-hour uninterrupted work). Limit Jira status changes. Batch communications."
                    },
                    {
                        "infection_type": "Knowledge Silos",
                        "severity": "low",
                        "severity_score": 0.35,
                        "description": "Two key documentation repositories not shared with frontend team.",
                        "spread_count": 1,
                        "treatment": "Cross-team documentation review. Establish centralized knowledge base."
                    }
                ]
            }"""
        return '{"error": "unknown prompt type"}'

    async def close(self):
        await self.client.aclose()


nim_client = NvidiaNIMClient()
