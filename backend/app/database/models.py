import uuid
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import String, Integer, Float, DateTime, Date, Text, ForeignKey, Enum as SAEnum, JSON, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.session import Base


def gen_uuid():
    return uuid.uuid4()


# ─────────────────────────────────────────────
# CORE
# ─────────────────────────────────────────────

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(100), default="Technology")
    size: Mapped[int] = mapped_column(Integer, default=150)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    teams: Mapped[list["Team"]] = relationship("Team", back_populates="organization", cascade="all, delete-orphan")
    genome_sequences: Mapped[list["GenomeSequence"]] = relationship("GenomeSequence", back_populates="organization", cascade="all, delete-orphan")
    dark_matter_reports: Mapped[list["DarkMatterReport"]] = relationship("DarkMatterReport", back_populates="organization", cascade="all, delete-orphan")
    metabolic_metrics: Mapped[list["MetabolicMetric"]] = relationship("MetabolicMetric", back_populates="organization", cascade="all, delete-orphan")
    cognitive_load_metrics: Mapped[list["CognitiveLoadMetric"]] = relationship("CognitiveLoadMetric", back_populates="organization", cascade="all, delete-orphan")
    immune_infections: Mapped[list["ImmuneInfection"]] = relationship("ImmuneInfection", back_populates="organization", cascade="all, delete-orphan")
    fossil_snapshots: Mapped[list["FossilSnapshot"]] = relationship("FossilSnapshot", back_populates="organization", cascade="all, delete-orphan")
    activity_events: Mapped[list["ActivityEvent"]] = relationship("ActivityEvent", back_populates="organization", cascade="all, delete-orphan")
    alert_configs: Mapped[list["AlertConfiguration"]] = relationship("AlertConfiguration", back_populates="organization", cascade="all, delete-orphan")
    alert_history: Mapped[list["AlertHistory"]] = relationship("AlertHistory", back_populates="organization", cascade="all, delete-orphan")
    settings: Mapped[list["OrganizationSetting"]] = relationship("OrganizationSetting", back_populates="organization", cascade="all, delete-orphan")
    decision_records: Mapped[list["DecisionRecord"]] = relationship("DecisionRecord", back_populates="organization", cascade="all, delete-orphan")


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(100), default="Engineering")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="teams")
    persons: Mapped[list["Person"]] = relationship("Person", back_populates="team", cascade="all, delete-orphan")


class Person(Base):
    __tablename__ = "persons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    team_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(100), default="Individual Contributor")
    tenure_months: Mapped[int] = mapped_column(Integer, default=12)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    team: Mapped["Team"] = relationship("Team", back_populates="persons")


class RawEvent(Base):
    __tablename__ = "raw_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    sender_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True)
    recipient_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
    team_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    subject: Mapped[str | None] = mapped_column(Text, nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    entities: Mapped[list | None] = mapped_column(JSON, nullable=True)
    tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)


# ─────────────────────────────────────────────
# GENOME
# ─────────────────────────────────────────────

class GenomeSequence(Base):
    __tablename__ = "genome_sequences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    week_start: Mapped[date] = mapped_column(Date, nullable=False)

    collaboration: Mapped[float] = mapped_column(Float, default=0.0)
    decision_making: Mapped[float] = mapped_column(Float, default=0.0)
    knowledge_flow: Mapped[float] = mapped_column(Float, default=0.0)
    innovation: Mapped[float] = mapped_column(Float, default=0.0)
    resilience: Mapped[float] = mapped_column(Float, default=0.0)
    vitality: Mapped[float] = mapped_column(Float, default=0.0)

    health_score: Mapped[float] = mapped_column(Float, default=0.0)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="genome_sequences")


# ─────────────────────────────────────────────
# DARK MATTER
# ─────────────────────────────────────────────

class DarkMatterReport(Base):
    __tablename__ = "dark_matter_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    report_date: Mapped[date] = mapped_column(Date, nullable=False)

    invisible_work_hours: Mapped[int] = mapped_column(Integer, default=0)
    invisible_work_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)

    shadow_coordination_hours: Mapped[int] = mapped_column(Integer, default=0)
    shadow_coordination_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)

    unlogged_hours: Mapped[int] = mapped_column(Integer, default=0)
    unlogged_hours_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)

    meeting_overhead_hours: Mapped[int] = mapped_column(Integer, default=0)
    meeting_overhead_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)

    context_switching_hours: Mapped[int] = mapped_column(Integer, default=0)
    context_switching_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)

    total_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="dark_matter_reports")


# ─────────────────────────────────────────────
# METABOLIC
# ─────────────────────────────────────────────

class MetabolicMetric(Base):
    __tablename__ = "metabolic_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    metric_date: Mapped[date] = mapped_column(Date, nullable=False)

    decision_cycle_time_hours: Mapped[float] = mapped_column(Float, default=0.0)
    info_half_life_hours: Mapped[float] = mapped_column(Float, default=0.0)
    execution_velocity: Mapped[float] = mapped_column(Float, default=0.0)
    composite_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="metabolic_metrics")


# ─────────────────────────────────────────────
# COGNITIVE LOAD
# ─────────────────────────────────────────────

class CognitiveLoadMetric(Base):
    __tablename__ = "cognitive_load_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    metric_date: Mapped[date] = mapped_column(Date, nullable=False)

    workload_score: Mapped[float] = mapped_column(Float, default=0.0)
    interaction_density: Mapped[float] = mapped_column(Float, default=0.0)
    meeting_pressure: Mapped[float] = mapped_column(Float, default=0.0)
    task_fragmentation: Mapped[float] = mapped_column(Float, default=0.0)
    decision_fatigue: Mapped[float] = mapped_column(Float, default=0.0)
    burnout_risk: Mapped[float] = mapped_column(Float, default=0.0)
    composite_score: Mapped[float] = mapped_column(Float, default=0.0)
    team_breakdown: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="cognitive_load_metrics")


# ─────────────────────────────────────────────
# IMMUNE
# ─────────────────────────────────────────────

class ImmuneInfection(Base):
    __tablename__ = "immune_infections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    infection_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    severity_score: Mapped[float] = mapped_column(Float, default=0.0)
    affected_team_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    spread_count: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(default=True)
    treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="immune_infections")


class InfectionEvent(Base):
    __tablename__ = "infection_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    infection_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("immune_infections.id"), nullable=False)
    event: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────
# FOSSIL
# ─────────────────────────────────────────────

class FossilSnapshot(Base):
    __tablename__ = "fossil_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    state: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="fossil_snapshots")


# ─────────────────────────────────────────────
# ACTIVITY FEED
# ─────────────────────────────────────────────

class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    related_entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    related_entity_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    severity: Mapped[str] = mapped_column(String(20), default="info")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="activity_events")


# ─────────────────────────────────────────────
# ALERTS
# ─────────────────────────────────────────────

class AlertConfiguration(Base):
    __tablename__ = "alert_configurations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    comparison_operator: Mapped[str] = mapped_column(String(20), nullable=False)
    threshold_value: Mapped[float] = mapped_column(Float, nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="alert_configs")


class AlertHistory(Base):
    __tablename__ = "alert_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    alert_config_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("alert_configurations.id"), nullable=False)
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    threshold_value: Mapped[float] = mapped_column(Float, nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="alert_history")


# ─────────────────────────────────────────────
# ORGANIZATION SETTINGS
# ─────────────────────────────────────────────

class OrganizationSetting(Base):
    __tablename__ = "organization_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="settings")


# ─────────────────────────────────────────────
# CRISIS PATTERNS
# ─────────────────────────────────────────────

class CrisisPattern(Base):
    __tablename__ = "crisis_patterns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    pattern_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CrisisMatch(Base):
    __tablename__ = "crisis_matches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    pattern_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("crisis_patterns.id"), nullable=False)
    snapshot_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("fossil_snapshots.id"), nullable=False)
    match_score: Mapped[float] = mapped_column(Float, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────
# DECISION ARCHAEOLOGY
# ─────────────────────────────────────────────

class DecisionRecord(Base):
    __tablename__ = "decision_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="proposed")
    initiator_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True)
    initiator_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reverted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship("Organization", back_populates="decision_records")


# ─────────────────────────────────────────────
# USER / AUTH
# ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="member")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
