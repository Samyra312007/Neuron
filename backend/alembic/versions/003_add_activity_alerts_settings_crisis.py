"""add activity feed, alerts, settings, crisis patterns

Revision ID: 003
Revises: 002
Create Date: 2026-05-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "activity_events",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False, index=True),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("related_entity_type", sa.String(50), nullable=True),
        sa.Column("related_entity_id", sa.String(255), nullable=True),
        sa.Column("severity", sa.String(20), server_default="info"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "alert_configurations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("metric_name", sa.String(100), nullable=False),
        sa.Column("comparison_operator", sa.String(20), nullable=False),
        sa.Column("threshold_value", sa.Float(), nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("enabled", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "alert_history",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("alert_config_id", UUID(as_uuid=True), sa.ForeignKey("alert_configurations.id"), nullable=False),
        sa.Column("metric_value", sa.Float(), nullable=False),
        sa.Column("threshold_value", sa.Float(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("triggered_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "organization_settings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("key", sa.String(100), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
    )
    op.create_table(
        "crisis_patterns",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("pattern_data", JSON(), nullable=False),
        sa.Column("severity", sa.String(20), server_default="medium"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "crisis_matches",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("pattern_id", UUID(as_uuid=True), sa.ForeignKey("crisis_patterns.id"), nullable=False),
        sa.Column("snapshot_id", UUID(as_uuid=True), sa.ForeignKey("fossil_snapshots.id"), nullable=False),
        sa.Column("match_score", sa.Float(), nullable=False),
        sa.Column("details", JSON(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("crisis_matches")
    op.drop_table("crisis_patterns")
    op.drop_table("organization_settings")
    op.drop_table("alert_history")
    op.drop_table("alert_configurations")
    op.drop_table("activity_events")
