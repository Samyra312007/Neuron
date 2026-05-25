from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
import uuid


class OrganizationOut(BaseModel):
    id: uuid.UUID
    name: str
    industry: str
    size: int

    class Config:
        from_attributes = True


class GenomeOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    week_start: date
    collaboration: float
    decision_making: float
    knowledge_flow: float
    innovation: float
    resilience: float
    vitality: float
    health_score: float
    summary: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class DarkMatterOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    report_date: date
    invisible_work_hours: int
    invisible_work_cost: Decimal
    shadow_coordination_hours: int
    shadow_coordination_cost: Decimal
    unlogged_hours: int
    unlogged_hours_cost: Decimal
    meeting_overhead_hours: int
    meeting_overhead_cost: Decimal
    context_switching_hours: int
    context_switching_cost: Decimal
    total_cost: Decimal
    summary: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class InfectionOut(BaseModel):
    id: uuid.UUID
    infection_type: str
    severity: str
    severity_score: float
    description: str
    spread_count: int
    is_active: bool
    treatment: str | None
    detected_at: datetime

    class Config:
        from_attributes = True


class TreatmentRequest(BaseModel):
    infection_id: uuid.UUID


class TreatmentResponse(BaseModel):
    success: bool
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str
    mock_ai: bool
