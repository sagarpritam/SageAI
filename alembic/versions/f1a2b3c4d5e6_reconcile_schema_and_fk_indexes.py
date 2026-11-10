"""Reconcile canonical ORM indexes, missing tables, and drop redundant *_fk aliases.

Revision ID: f1a2b3c4d5e6
Revises: e8f9a0b1c2d3
Create Date: 2026-11-10 23:35:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "e8f9a0b1c2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Canonical ORM-declared covering indexes replacing duplicate d4f8e12a9b3c *_fk indexes
REDUNDANT_FK_INDEXES = [
    ("agent_logs", "scan_id", "ix_agent_logs_scan_id", "ix_agent_logs_scan_id_fk"),
    ("api_keys", "created_by", "ix_api_keys_created_by", "ix_api_keys_created_by_fk"),
    (
        "api_keys",
        "organization_id",
        "ix_api_keys_organization_id",
        "ix_api_keys_organization_id_fk",
    ),
    ("asm_events", "asset_id", "ix_asm_events_asset_id", "ix_asm_events_asset_id_fk"),
    (
        "asm_events",
        "organization_id",
        "ix_asm_events_organization_id",
        "ix_asm_events_organization_id_fk",
    ),
    ("asm_events", "scan_id", "ix_asm_events_scan_id", "ix_asm_events_scan_id_fk"),
    (
        "attack_surface_diffs",
        "asset_id",
        "ix_attack_surface_diffs_asset_id",
        "ix_attack_surface_diffs_asset_id_fk",
    ),
    (
        "attack_surface_diffs",
        "current_scan_id",
        "ix_attack_surface_diffs_current_scan_id",
        "ix_attack_surface_diffs_current_scan_id_fk",
    ),
    (
        "attack_surface_diffs",
        "organization_id",
        "ix_attack_surface_diffs_organization_id",
        "ix_attack_surface_diffs_organization_id_fk",
    ),
    (
        "attack_surface_diffs",
        "previous_scan_id",
        "ix_attack_surface_diffs_previous_scan_id",
        "ix_attack_surface_diffs_previous_scan_id_fk",
    ),
    (
        "audit_logs",
        "organization_id",
        "ix_audit_logs_organization_id",
        "ix_audit_logs_organization_id_fk",
    ),
    ("audit_logs", "user_id", "ix_audit_logs_user_id", "ix_audit_logs_user_id_fk"),
    ("findings", "scan_id", "ix_findings_scan_id", "ix_findings_scan_id_fk"),
    ("kg_edges", "org_id", "ix_kg_edges_org_id", "ix_kg_edges_org_id_fk"),
    ("kg_nodes", "org_id", "ix_kg_nodes_org_id", "ix_kg_nodes_org_id_fk"),
    (
        "remediation_patches",
        "finding_id",
        "ix_remediation_patches_finding_id",
        "ix_remediation_patches_finding_id_fk",
    ),
    (
        "remediation_patches",
        "organization_id",
        "ix_remediation_patches_organization_id",
        "ix_remediation_patches_organization_id_fk",
    ),
    (
        "scan_schedules",
        "created_by",
        "ix_scan_schedules_created_by",
        "ix_scan_schedules_created_by_fk",
    ),
    (
        "scan_schedules",
        "organization_id",
        "ix_scan_schedules_organization_id",
        "ix_scan_schedules_organization_id_fk",
    ),
    (
        "scans",
        "organization_id",
        "ix_scans_organization_id",
        "ix_scans_organization_id_fk",
    ),
    ("scans", "user_id", "ix_scans_user_id", "ix_scans_user_id_fk"),
    (
        "users",
        "organization_id",
        "ix_users_organization_id",
        "ix_users_organization_id_fk",
    ),
    (
        "webhooks",
        "organization_id",
        "ix_webhooks_organization_id",
        "ix_webhooks_organization_id_fk",
    ),
]


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = set(insp.get_table_names())

    if "attack_surface_diffs" not in tables:
        op.create_table(
            "attack_surface_diffs",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("asset_id", sa.String(), nullable=True),
            sa.Column("previous_scan_id", sa.String(), nullable=True),
            sa.Column("current_scan_id", sa.String(), nullable=False),
            sa.Column("ports_diff", sa.Text(), nullable=True),
            sa.Column("vulnerabilities_diff", sa.Text(), nullable=True),
            sa.Column("subdomains_diff", sa.Text(), nullable=True),
            sa.Column("technologies_diff", sa.Text(), nullable=True),
            sa.Column("overall_risk_shift", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["asset_id"], ["assets.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(
                ["current_scan_id"], ["scans.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(
                ["previous_scan_id"], ["scans.id"], ondelete="SET NULL"
            ),
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

    # Ensure every canonical FK index exists and drop duplicate *_fk alias indexes
    op.create_index(
        "ix_assets_organization_id", "assets", ["organization_id"], if_not_exists=True
    )
    op.create_index(
        "ix_notification_channels_organization_id",
        "notification_channels",
        ["organization_id"],
        if_not_exists=True,
    )
    for col in (
        "action",
        "created_at",
        "organization_id",
        "resource_id",
        "resource_type",
        "user_id",
    ):
        op.create_index(f"ix_audit_logs_{col}", "audit_logs", [col], if_not_exists=True)
    op.create_index(
        "ix_audit_org_action_date",
        "audit_logs",
        ["organization_id", "action", "created_at"],
        if_not_exists=True,
    )

    for table, col, canonical_idx, duplicate_fk_idx in REDUNDANT_FK_INDEXES:
        op.create_index(canonical_idx, table, [col], if_not_exists=True)
        op.drop_index(duplicate_fk_idx, table_name=table, if_exists=True)

    if bind.dialect.name == "postgresql":
        for table in ("attack_surface_diffs", "audit_logs", "notification_channels"):
            op.execute(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;")
            op.execute(f'DROP POLICY IF EXISTS "deny_all_access" ON public.{table};')
            op.execute(
                f'CREATE POLICY "deny_all_access" ON public.{table} FOR ALL USING (false);'
            )
        op.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
                END IF;
            END $$;
            """
        )


def downgrade() -> None:
    for table, col, _, duplicate_fk_idx in reversed(REDUNDANT_FK_INDEXES):
        op.create_index(duplicate_fk_idx, table, [col], if_not_exists=True)
    op.drop_index(
        "ix_attack_surface_diffs_current_scan_id",
        table_name="attack_surface_diffs",
        if_exists=True,
    )
    op.drop_index(
        "ix_attack_surface_diffs_previous_scan_id",
        table_name="attack_surface_diffs",
        if_exists=True,
    )
