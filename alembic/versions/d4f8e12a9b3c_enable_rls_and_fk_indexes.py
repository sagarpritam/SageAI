"""Enable RLS, deny-all policies, and covering foreign key indexes

Revision ID: d4f8e12a9b3c
Revises: 7c797e76511e
Create Date: 2026-11-02 20:55:00.000000
"""

from typing import Sequence, Union
from alembic import op

revision: str = "d4f8e12a9b3c"
down_revision: Union[str, None] = "7c797e76511e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = [
    "organizations",
    "assets",
    "kg_edges",
    "kg_nodes",
    "notification_channels",
    "users",
    "webhooks",
    "api_keys",
    "audit_logs",
    "scan_schedules",
    "scans",
    "agent_logs",
    "asm_events",
    "attack_surface_diffs",
    "findings",
    "remediation_patches",
]

INDEXES = [
    ("agent_logs", "scan_id", "ix_agent_logs_scan_id_fk"),
    ("api_keys", "created_by", "ix_api_keys_created_by_fk"),
    ("api_keys", "organization_id", "ix_api_keys_organization_id_fk"),
    ("asm_events", "asset_id", "ix_asm_events_asset_id_fk"),
    ("asm_events", "organization_id", "ix_asm_events_organization_id_fk"),
    ("asm_events", "scan_id", "ix_asm_events_scan_id_fk"),
    ("attack_surface_diffs", "asset_id", "ix_attack_surface_diffs_asset_id_fk"),
    ("attack_surface_diffs", "current_scan_id", "ix_attack_surface_diffs_current_scan_id_fk"),
    ("attack_surface_diffs", "organization_id", "ix_attack_surface_diffs_organization_id_fk"),
    ("attack_surface_diffs", "previous_scan_id", "ix_attack_surface_diffs_previous_scan_id_fk"),
    ("audit_logs", "organization_id", "ix_audit_logs_organization_id_fk"),
    ("audit_logs", "user_id", "ix_audit_logs_user_id_fk"),
    ("findings", "scan_id", "ix_findings_scan_id_fk"),
    ("kg_edges", "org_id", "ix_kg_edges_org_id_fk"),
    ("kg_nodes", "org_id", "ix_kg_nodes_org_id_fk"),
    ("remediation_patches", "finding_id", "ix_remediation_patches_finding_id_fk"),
    ("remediation_patches", "organization_id", "ix_remediation_patches_organization_id_fk"),
    ("scan_schedules", "created_by", "ix_scan_schedules_created_by_fk"),
    ("scan_schedules", "organization_id", "ix_scan_schedules_organization_id_fk"),
    ("scans", "organization_id", "ix_scans_organization_id_fk"),
    ("scans", "user_id", "ix_scans_user_id_fk"),
    ("users", "organization_id", "ix_users_organization_id_fk"),
    ("webhooks", "organization_id", "ix_webhooks_organization_id_fk"),
]


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    # 1. Covering foreign key indexes (cross-dialect safe)
    for table, col, idx_name in INDEXES:
        op.create_index(idx_name, table, [col], if_not_exists=True)

    # 2. Postgres-specific RLS hardening & role revocation
    if is_postgres:
        for table in TABLES:
            op.execute(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;")
            op.execute(f'DROP POLICY IF EXISTS "deny_all_access" ON public.{table};')
            op.execute(
                f'CREATE POLICY "deny_all_access" ON public.{table} FOR ALL USING (false);'
            )

        op.execute("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;")
        op.execute("REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;")
        op.execute("REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;")


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        for table in TABLES:
            op.execute(f'DROP POLICY IF EXISTS "deny_all_access" ON public.{table};')
            op.execute(f"ALTER TABLE public.{table} DISABLE ROW LEVEL SECURITY;")

    for _, _, idx_name in reversed(INDEXES):
        op.drop_index(idx_name, if_exists=True)

