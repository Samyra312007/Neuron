"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "organizations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("industry", sa.String(100), server_default="Technology"),
        sa.Column("size", sa.Integer, server_default="150"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "teams",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("department", sa.String(100), server_default="Engineering"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "persons",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("role", sa.String(100), server_default="Individual Contributor"),
        sa.Column("tenure_months", sa.Integer, server_default="12"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "raw_events",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("sender_id", UUID(as_uuid=True), sa.ForeignKey("persons.id"), nullable=True),
        sa.Column("recipient_ids", JSON, nullable=True),
        sa.Column("team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=True),
        sa.Column("subject", sa.Text, nullable=True),
        sa.Column("body", sa.Text, nullable=True),
        sa.Column("extra_data", JSON, nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ingested_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("sentiment_score", sa.Float, nullable=True),
        sa.Column("entities", JSON, nullable=True),
        sa.Column("tokens", sa.Integer, nullable=True),
    )
    op.create_index("ix_raw_events_source", "raw_events", ["source"])

    op.create_table(
        "genome_sequences",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("week_start", sa.Date, nullable=False),
        sa.Column("collaboration", sa.Float, server_default="0"),
        sa.Column("decision_making", sa.Float, server_default="0"),
        sa.Column("knowledge_flow", sa.Float, server_default="0"),
        sa.Column("innovation", sa.Float, server_default="0"),
        sa.Column("resilience", sa.Float, server_default="0"),
        sa.Column("vitality", sa.Float, server_default="0"),
        sa.Column("health_score", sa.Float, server_default="0"),
        sa.Column("summary", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "dark_matter_reports",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("report_date", sa.Date, nullable=False),
        sa.Column("invisible_work_hours", sa.Integer, server_default="0"),
        sa.Column("invisible_work_cost", sa.Numeric(12, 2), server_default="0"),
        sa.Column("shadow_coordination_hours", sa.Integer, server_default="0"),
        sa.Column("shadow_coordination_cost", sa.Numeric(12, 2), server_default="0"),
        sa.Column("unlogged_hours", sa.Integer, server_default="0"),
        sa.Column("unlogged_hours_cost", sa.Numeric(12, 2), server_default="0"),
        sa.Column("meeting_overhead_hours", sa.Integer, server_default="0"),
        sa.Column("meeting_overhead_cost", sa.Numeric(12, 2), server_default="0"),
        sa.Column("context_switching_hours", sa.Integer, server_default="0"),
        sa.Column("context_switching_cost", sa.Numeric(12, 2), server_default="0"),
        sa.Column("total_cost", sa.Numeric(12, 2), server_default="0"),
        sa.Column("summary", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "metabolic_metrics",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("metric_date", sa.Date, nullable=False),
        sa.Column("decision_cycle_time_hours", sa.Float, server_default="0"),
        sa.Column("info_half_life_hours", sa.Float, server_default="0"),
        sa.Column("execution_velocity", sa.Float, server_default="0"),
        sa.Column("composite_score", sa.Float, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "immune_infections",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("infection_type", sa.String(100), nullable=False),
        sa.Column("severity", sa.String(20), server_default="medium"),
        sa.Column("severity_score", sa.Float, server_default="0"),
        sa.Column("affected_team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=True),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("spread_count", sa.Integer, server_default="1"),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("treatment", sa.Text, nullable=True),
        sa.Column("detected_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "infection_events",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("infection_id", UUID(as_uuid=True), sa.ForeignKey("immune_infections.id"), nullable=False),
        sa.Column("event", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "fossil_snapshots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("snapshot_date", sa.Date, nullable=False),
        sa.Column("state", JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("fossil_snapshots")
    op.drop_table("infection_events")
    op.drop_table("immune_infections")
    op.drop_table("metabolic_metrics")
    op.drop_table("dark_matter_reports")
    op.drop_table("genome_sequences")
    op.drop_table("raw_events")
    op.drop_table("persons")
    op.drop_table("teams")
    op.drop_table("organizations")
