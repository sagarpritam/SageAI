"""Add encrypted github token to Organization

Revision ID: 2c1e45a7b9b7
Revises:
Create Date: 2026-03-05 17:09:29.607741
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "2c1e45a7b9b7"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _bootstrap_core_tables(insp: sa.Inspector) -> None:
    """Create pre-Alembic baseline tables idempotently when starting from an empty DB."""
    tables = set(insp.get_table_names())

    if "organizations" not in tables:
        op.create_table(
            "organizations",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("plan", sa.String(), nullable=False),
            sa.Column("stripe_customer_id", sa.String(), nullable=True),
            sa.Column("stripe_subscription_id", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("stripe_customer_id"),
            sa.UniqueConstraint("stripe_subscription_id"),
        )

    if "users" not in tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("password_hash", sa.String(), nullable=False),
            sa.Column("role", sa.String(), nullable=False),
            sa.Column("mfa_secret", sa.String(), nullable=True),
            sa.Column("mfa_enabled", sa.Boolean(), nullable=False),
            sa.Column("mfa_backup_codes", sa.String(), nullable=True),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if "scans" not in tables:
        op.create_table(
            "scans",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=False),
            sa.Column("target", sa.String(), nullable=False),
            sa.Column("findings", sa.Text(), nullable=False),
            sa.Column("risk_score", sa.Integer(), nullable=False),
            sa.Column("risk_level", sa.String(), nullable=False),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column("share_token", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("share_token"),
        )

    if "api_keys" not in tables:
        op.create_table(
            "api_keys",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("key", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("created_by", sa.String(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_api_keys_key", "api_keys", ["key"], unique=True)

    if "webhooks" not in tables:
        op.create_table(
            "webhooks",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("url", sa.String(), nullable=False),
            sa.Column("event", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("secret", sa.String(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )

    if "scan_schedules" not in tables:
        op.create_table(
            "scan_schedules",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("created_by", sa.String(), nullable=False),
            sa.Column("target", sa.String(), nullable=False),
            sa.Column("frequency", sa.String(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=True),
            sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("next_run_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("run_count", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    if "notification_channels" not in tables:
        op.create_table(
            "notification_channels",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("channel_type", sa.String(length=50), nullable=False),
            sa.Column("webhook_url", sa.String(length=1000), nullable=False),
            sa.Column("min_severity", sa.String(length=20), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "organization_id", "name", name="uq_org_notification_name"
            ),
        )
        op.create_index(
            "ix_notification_channels_organization_id",
            "notification_channels",
            ["organization_id"],
            unique=False,
        )

    if "audit_logs" not in tables:
        op.create_table(
            "audit_logs",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("action", sa.String(), nullable=False),
            sa.Column("resource_type", sa.String(), nullable=False),
            sa.Column("resource_id", sa.String(), nullable=True),
            sa.Column("details", sa.Text(), nullable=True),
            sa.Column("ip_address", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_audit_logs_action", "audit_logs", ["action"], unique=False)
        op.create_index(
            "ix_audit_logs_created_at", "audit_logs", ["created_at"], unique=False
        )
        op.create_index(
            "ix_audit_logs_organization_id",
            "audit_logs",
            ["organization_id"],
            unique=False,
        )
        op.create_index(
            "ix_audit_logs_resource_id", "audit_logs", ["resource_id"], unique=False
        )
        op.create_index(
            "ix_audit_logs_resource_type",
            "audit_logs",
            ["resource_type"],
            unique=False,
        )
        op.create_index(
            "ix_audit_logs_user_id", "audit_logs", ["user_id"], unique=False
        )
        op.create_index(
            "ix_audit_org_action_date",
            "audit_logs",
            ["organization_id", "action", "created_at"],
            unique=False,
        )

    if "kg_nodes" not in tables:
        op.create_table(
            "kg_nodes",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("org_id", sa.String(), nullable=False),
            sa.Column("node_type", sa.String(), nullable=False),
            sa.Column("label", sa.String(), nullable=False),
            sa.Column("properties", sa.Text(), nullable=False),
            sa.Column("risk_score", sa.Float(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["org_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )

    if "kg_edges" not in tables:
        op.create_table(
            "kg_edges",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("org_id", sa.String(), nullable=False),
            sa.Column("source_id", sa.String(), nullable=False),
            sa.Column("target_id", sa.String(), nullable=False),
            sa.Column("edge_type", sa.String(), nullable=False),
            sa.Column("weight", sa.Float(), nullable=True),
            sa.Column("properties", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["org_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    _bootstrap_core_tables(insp)

    insp = sa.inspect(conn)
    tables = insp.get_table_names()
    if "organizations" in tables:
        columns = [c["name"] for c in insp.get_columns("organizations")]
        if "github_token_encrypted" not in columns:
            op.add_column(
                "organizations",
                sa.Column("github_token_encrypted", sa.String(), nullable=True),
            )


def downgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = insp.get_table_names()
    if "organizations" in tables:
        columns = [c["name"] for c in insp.get_columns("organizations")]
        if "github_token_encrypted" in columns:
            op.drop_column("organizations", "github_token_encrypted")
