"""add cognitive load metrics

Revision ID: 002
Revises: 001
Create Date: 2026-05-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "cognitive_load_metrics",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("metric_date", sa.Date(), nullable=False),
        sa.Column("workload_score", sa.Float(), server_default="0.0"),
        sa.Column("interaction_density", sa.Float(), server_default="0.0"),
        sa.Column("meeting_pressure", sa.Float(), server_default="0.0"),
        sa.Column("task_fragmentation", sa.Float(), server_default="0.0"),
        sa.Column("decision_fatigue", sa.Float(), server_default="0.0"),
        sa.Column("burnout_risk", sa.Float(), server_default="0.0"),
        sa.Column("composite_score", sa.Float(), server_default="0.0"),
        sa.Column("team_breakdown", JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("cognitive_load_metrics")
