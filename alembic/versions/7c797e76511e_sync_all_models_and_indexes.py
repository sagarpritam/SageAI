"""sync_all_models_and_indexes

Revision ID: 7c797e76511e
Revises: 9e92ee3438f2
Create Date: 2026-10-23 12:06:13.217187
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "7c797e76511e"
down_revision: Union[str, None] = "9e92ee3438f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _cols(insp: sa.Inspector, table: str) -> set[str]:
    return (
        {c["name"] for c in insp.get_columns(table)} if insp.has_table(table) else set()
    )


def _idxs(insp: sa.Inspector, table: str) -> set[str]:
    if not insp.has_table(table):
        return set()
    return {
        name
        for idx in insp.get_indexes(table)
        if isinstance((name := idx.get("name")), str)
    }


def _uqs(insp: sa.Inspector, table: str) -> set[str]:
    if not insp.has_table(table):
        return set()
    return {
        name
        for uq in insp.get_unique_constraints(table)
        if isinstance((name := uq.get("name")), str)
    }


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    existing_tables = set(insp.get_table_names())

    if conn.dialect.name == "postgresql":
        for enum_type in (
            sa.Enum(
                "new_subdomain",
                "new_ip",
                "new_port",
                "new_service",
                "port_closed",
                "service_changed",
                "dns_changed",
                "new_vulnerability",
                name="asmeventtype",
            ),
            sa.Enum(
                "info",
                "low",
                "medium",
                "high",
                "critical",
                name="asmeventseverity",
            ),
            sa.Enum(
                "new",
                "confirmed",
                "in_progress",
                "fixed",
                "accepted_risk",
                "reopened",
                name="findingstatus",
            ),
            sa.Enum(
                "proposed",
                "approved",
                "rejected",
                "applied",
                "failed",
                name="patchstatus",
            ),
        ):
            enum_type.create(conn, checkfirst=True)

    created_asm_events = False
    if "asm_events" not in existing_tables:
        op.create_table(
            "asm_events",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("asset_id", sa.String(), nullable=True),
            sa.Column("scan_id", sa.String(), nullable=True),
            sa.Column(
                "event_type",
                sa.Enum(
                    "new_subdomain",
                    "new_ip",
                    "new_port",
                    "new_service",
                    "port_closed",
                    "service_changed",
                    "dns_changed",
                    "new_vulnerability",
                    name="asmeventtype",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column(
                "severity",
                sa.Enum(
                    "info",
                    "low",
                    "medium",
                    "high",
                    "critical",
                    name="asmeventseverity",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("details", sa.Text(), nullable=False),
            sa.Column("is_alert_sent", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(["asset_id"], ["assets.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(["scan_id"], ["scans.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_asm_events_asset_id", "asm_events", ["asset_id"], unique=False
        )
        op.create_index(
            "ix_asm_events_created_at", "asm_events", ["created_at"], unique=False
        )
        op.create_index(
            "ix_asm_events_event_type", "asm_events", ["event_type"], unique=False
        )
        op.create_index(
            "ix_asm_events_organization_id",
            "asm_events",
            ["organization_id"],
            unique=False,
        )
        op.create_index(
            "ix_asm_events_scan_id", "asm_events", ["scan_id"], unique=False
        )
        created_asm_events = True

    created_remediation_patches = False
    if "remediation_patches" not in existing_tables:
        op.create_table(
            "remediation_patches",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("finding_id", sa.String(), nullable=True),
            sa.Column("repository", sa.String(), nullable=False),
            sa.Column("base_branch", sa.String(), nullable=False),
            sa.Column("patch_branch", sa.String(), nullable=False),
            sa.Column("file_path", sa.String(), nullable=False),
            sa.Column("vulnerability_type", sa.String(), nullable=False),
            sa.Column("severity", sa.String(), nullable=False),
            sa.Column("original_code", sa.Text(), nullable=False),
            sa.Column("patched_code", sa.Text(), nullable=False),
            sa.Column("diff", sa.Text(), nullable=False),
            sa.Column("lines_changed", sa.Integer(), nullable=False),
            sa.Column(
                "status",
                sa.Enum(
                    "proposed",
                    "approved",
                    "rejected",
                    "applied",
                    "failed",
                    name="patchstatus",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column("sandbox_passed", sa.Boolean(), nullable=False),
            sa.Column("sandbox_details", sa.Text(), nullable=False),
            sa.Column("requested_by", sa.String(), nullable=False),
            sa.Column("approved_by", sa.String(), nullable=True),
            sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("rejection_reason", sa.Text(), nullable=True),
            sa.Column("pr_number", sa.Integer(), nullable=True),
            sa.Column("pr_url", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["finding_id"], ["findings.id"], ondelete="SET NULL"
            ),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_patch_org_status",
            "remediation_patches",
            ["organization_id", "status"],
            unique=False,
        )
        op.create_index(
            "ix_patch_repo_branch",
            "remediation_patches",
            ["repository", "patch_branch"],
            unique=False,
        )
        op.create_index(
            "ix_remediation_patches_created_at",
            "remediation_patches",
            ["created_at"],
            unique=False,
        )
        op.create_index(
            "ix_remediation_patches_finding_id",
            "remediation_patches",
            ["finding_id"],
            unique=False,
        )
        op.create_index(
            "ix_remediation_patches_organization_id",
            "remediation_patches",
            ["organization_id"],
            unique=False,
        )
        op.create_index(
            "ix_remediation_patches_repository",
            "remediation_patches",
            ["repository"],
            unique=False,
        )
        op.create_index(
            "ix_remediation_patches_status",
            "remediation_patches",
            ["status"],
            unique=False,
        )
        created_remediation_patches = True

    if "attack_surface_diffs" not in existing_tables:
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
        op.create_index(
            "ix_attack_surface_diffs_asset_id",
            "attack_surface_diffs",
            ["asset_id"],
            unique=False,
        )
        op.create_index(
            "ix_attack_surface_diffs_organization_id",
            "attack_surface_diffs",
            ["organization_id"],
            unique=False,
        )
        op.create_index(
            "ix_attack_surface_diffs_previous_scan_id",
            "attack_surface_diffs",
            ["previous_scan_id"],
            unique=False,
        )
        op.create_index(
            "ix_attack_surface_diffs_current_scan_id",
            "attack_surface_diffs",
            ["current_scan_id"],
            unique=False,
        )

    insp = sa.inspect(conn)

    api_keys_indices = _idxs(insp, "api_keys")
    with op.batch_alter_table("api_keys", schema=None) as batch_op:
        batch_op.alter_column("is_active", existing_type=sa.Boolean(), nullable=False)
        if "ix_api_keys_created_by" not in api_keys_indices:
            batch_op.create_index(
                batch_op.f("ix_api_keys_created_by"), ["created_by"], unique=False
            )
        if "ix_api_keys_organization_id" not in api_keys_indices:
            batch_op.create_index(
                batch_op.f("ix_api_keys_organization_id"),
                ["organization_id"],
                unique=False,
            )

    if not created_asm_events:
        with op.batch_alter_table("asm_events", schema=None) as batch_op:
            batch_op.alter_column("details", existing_type=sa.TEXT(), nullable=False)
            batch_op.alter_column(
                "is_alert_sent", existing_type=sa.Boolean(), nullable=False
            )
            batch_op.alter_column(
                "created_at", existing_type=sa.DateTime(timezone=True), nullable=False
            )

    assets_cols = _cols(insp, "assets")
    assets_indices = _idxs(insp, "assets")
    assets_uqs = _uqs(insp, "assets")
    with op.batch_alter_table("assets", schema=None) as batch_op:
        if "org_id" in assets_cols and "organization_id" not in assets_cols:
            batch_op.alter_column("org_id", new_column_name="organization_id")
        if "is_verified" not in assets_cols:
            batch_op.add_column(
                sa.Column(
                    "is_verified",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                )
            )
        if "verification_token" not in assets_cols:
            batch_op.add_column(
                sa.Column("verification_token", sa.String(), nullable=True)
            )
        if "verification_method" not in assets_cols:
            batch_op.add_column(
                sa.Column("verification_method", sa.String(), nullable=True)
            )
        if "verified_at" not in assets_cols:
            batch_op.add_column(
                sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True)
            )
        batch_op.alter_column("open_ports", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("technologies", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("dns_records", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("ssl_info", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("risk_score", existing_type=sa.FLOAT(), nullable=False)
        batch_op.alter_column("risk_level", existing_type=sa.VARCHAR(), nullable=False)
        batch_op.alter_column("risk_summary", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("shodan_data", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column(
            "virustotal_data", existing_type=sa.TEXT(), nullable=False
        )
        batch_op.alter_column(
            "status",
            existing_type=sa.Enum(
                "active", "stale", "unknown", name="assetstatus", create_type=False
            ),
            nullable=False,
        )
        batch_op.alter_column(
            "first_seen", existing_type=sa.DateTime(timezone=True), nullable=False
        )
        batch_op.alter_column(
            "last_seen", existing_type=sa.DateTime(timezone=True), nullable=False
        )
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=False
        )
        batch_op.alter_column(
            "updated_at", existing_type=sa.DateTime(timezone=True), nullable=False
        )
        if "ix_assets_organization_id" not in assets_indices:
            batch_op.create_index(
                batch_op.f("ix_assets_organization_id"),
                ["organization_id"],
                unique=False,
            )
        if "ix_assets_is_verified" not in assets_indices:
            batch_op.create_index(
                batch_op.f("ix_assets_is_verified"), ["is_verified"], unique=False
            )
        if "uq_org_asset_value" not in assets_uqs:
            batch_op.create_unique_constraint(
                "uq_org_asset_value", ["organization_id", "value"]
            )

    findings_cols = _cols(insp, "findings")
    findings_indices = _idxs(insp, "findings")
    with op.batch_alter_table("findings", schema=None) as batch_op:
        if "status" not in findings_cols:
            batch_op.add_column(
                sa.Column(
                    "status",
                    sa.Enum(
                        "new",
                        "confirmed",
                        "in_progress",
                        "fixed",
                        "accepted_risk",
                        "reopened",
                        name="findingstatus",
                        create_type=False,
                    ),
                    nullable=False,
                    server_default="new",
                )
            )
        if "assigned_to" not in findings_cols:
            batch_op.add_column(sa.Column("assigned_to", sa.String(), nullable=True))
        if "resolved_at" not in findings_cols:
            batch_op.add_column(
                sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True)
            )
        if "notes" not in findings_cols:
            batch_op.add_column(sa.Column("notes", sa.Text(), nullable=True))
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=False
        )
        if "ix_findings_status" not in findings_indices:
            batch_op.create_index(
                batch_op.f("ix_findings_status"), ["status"], unique=False
            )

    kg_edges_indices = _idxs(insp, "kg_edges")
    with op.batch_alter_table("kg_edges", schema=None) as batch_op:
        batch_op.alter_column("properties", existing_type=sa.TEXT(), nullable=False)
        if "ix_kg_edges_org_id" not in kg_edges_indices:
            batch_op.create_index(
                batch_op.f("ix_kg_edges_org_id"), ["org_id"], unique=False
            )
        if "ix_kg_edges_source_id" not in kg_edges_indices:
            batch_op.create_index(
                batch_op.f("ix_kg_edges_source_id"), ["source_id"], unique=False
            )
        if "ix_kg_edges_target_id" not in kg_edges_indices:
            batch_op.create_index(
                batch_op.f("ix_kg_edges_target_id"), ["target_id"], unique=False
            )

    kg_nodes_indices = _idxs(insp, "kg_nodes")
    with op.batch_alter_table("kg_nodes", schema=None) as batch_op:
        batch_op.alter_column("properties", existing_type=sa.TEXT(), nullable=False)
        if "ix_kg_nodes_node_type" not in kg_nodes_indices:
            batch_op.create_index(
                batch_op.f("ix_kg_nodes_node_type"), ["node_type"], unique=False
            )
        if "ix_kg_nodes_org_id" not in kg_nodes_indices:
            batch_op.create_index(
                batch_op.f("ix_kg_nodes_org_id"), ["org_id"], unique=False
            )

    orgs_cols = _cols(insp, "organizations")
    with op.batch_alter_table("organizations", schema=None) as batch_op:
        if "require_verified_domains" not in orgs_cols:
            batch_op.add_column(
                sa.Column(
                    "require_verified_domains",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                )
            )
        if "ci_fail_on_critical" not in orgs_cols:
            batch_op.add_column(
                sa.Column(
                    "ci_fail_on_critical",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.true(),
                )
            )
        if "ci_fail_on_high" not in orgs_cols:
            batch_op.add_column(
                sa.Column(
                    "ci_fail_on_high",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.true(),
                )
            )
        if "ci_auto_remediate" not in orgs_cols:
            batch_op.add_column(
                sa.Column(
                    "ci_auto_remediate",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                )
            )
        batch_op.alter_column("plan", existing_type=sa.VARCHAR(), nullable=False)
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=False
        )

    if not created_remediation_patches:
        remediation_patches_indices = _idxs(insp, "remediation_patches")
        with op.batch_alter_table("remediation_patches", schema=None) as batch_op:
            batch_op.alter_column(
                "id", existing_type=sa.TEXT(), type_=sa.String(), nullable=False
            )
            batch_op.alter_column(
                "organization_id",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
            )
            batch_op.alter_column(
                "finding_id",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=True,
            )
            batch_op.alter_column(
                "repository",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
            )
            batch_op.alter_column(
                "base_branch",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
                existing_server_default=sa.text("'main'"),
            )
            batch_op.alter_column(
                "patch_branch",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
            )
            batch_op.alter_column(
                "file_path",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
            )
            batch_op.alter_column(
                "vulnerability_type",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
            )
            batch_op.alter_column(
                "severity",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
                existing_server_default=sa.text("'MEDIUM'"),
            )
            batch_op.alter_column(
                "status",
                existing_type=sa.TEXT(),
                type_=sa.Enum(
                    "proposed",
                    "approved",
                    "rejected",
                    "applied",
                    "failed",
                    name="patchstatus",
                    create_type=False,
                ),
                existing_nullable=False,
                existing_server_default=sa.text("'proposed'"),
            )
            batch_op.alter_column(
                "sandbox_passed",
                existing_type=sa.INTEGER(),
                type_=sa.Boolean(),
                existing_nullable=False,
                existing_server_default=sa.false(),
            )
            batch_op.alter_column(
                "sandbox_details",
                existing_type=sa.TEXT(),
                nullable=False,
                existing_server_default=sa.text("'{}'"),
            )
            batch_op.alter_column(
                "requested_by",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
            )
            batch_op.alter_column(
                "approved_by",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=True,
            )
            batch_op.alter_column(
                "approved_at",
                existing_type=sa.TIMESTAMP(),
                type_=sa.DateTime(timezone=True),
                existing_nullable=True,
            )
            batch_op.alter_column(
                "pr_url",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=True,
            )
            batch_op.alter_column(
                "created_at",
                existing_type=sa.TIMESTAMP(),
                type_=sa.DateTime(timezone=True),
                nullable=False,
                existing_server_default=sa.text("(CURRENT_TIMESTAMP)"),
            )
            batch_op.alter_column(
                "updated_at",
                existing_type=sa.TIMESTAMP(),
                type_=sa.DateTime(timezone=True),
                nullable=False,
                existing_server_default=sa.text("(CURRENT_TIMESTAMP)"),
            )
            if "ix_patch_finding_id" in remediation_patches_indices:
                batch_op.drop_index(batch_op.f("ix_patch_finding_id"))
            if "ix_remediation_patches_created_at" not in remediation_patches_indices:
                batch_op.create_index(
                    batch_op.f("ix_remediation_patches_created_at"),
                    ["created_at"],
                    unique=False,
                )
            if "ix_remediation_patches_finding_id" not in remediation_patches_indices:
                batch_op.create_index(
                    batch_op.f("ix_remediation_patches_finding_id"),
                    ["finding_id"],
                    unique=False,
                )
            if (
                "ix_remediation_patches_organization_id"
                not in remediation_patches_indices
            ):
                batch_op.create_index(
                    batch_op.f("ix_remediation_patches_organization_id"),
                    ["organization_id"],
                    unique=False,
                )
            if "ix_remediation_patches_repository" not in remediation_patches_indices:
                batch_op.create_index(
                    batch_op.f("ix_remediation_patches_repository"),
                    ["repository"],
                    unique=False,
                )
            if "ix_remediation_patches_status" not in remediation_patches_indices:
                batch_op.create_index(
                    batch_op.f("ix_remediation_patches_status"),
                    ["status"],
                    unique=False,
                )

    schedules_indices = _idxs(insp, "scan_schedules")
    with op.batch_alter_table("scan_schedules", schema=None) as batch_op:
        if "ix_scan_schedules_created_by" not in schedules_indices:
            batch_op.create_index(
                batch_op.f("ix_scan_schedules_created_by"),
                ["created_by"],
                unique=False,
            )
        if "ix_scan_schedules_organization_id" not in schedules_indices:
            batch_op.create_index(
                batch_op.f("ix_scan_schedules_organization_id"),
                ["organization_id"],
                unique=False,
            )

    scans_cols = _cols(insp, "scans")
    scans_indices = _idxs(insp, "scans")
    with op.batch_alter_table("scans", schema=None) as batch_op:
        if "scan_type" not in scans_cols:
            batch_op.add_column(
                sa.Column(
                    "scan_type", sa.String(), nullable=False, server_default="full"
                )
            )
        else:
            batch_op.alter_column(
                "scan_type",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=False,
                existing_server_default=sa.text("'full'"),
            )
        batch_op.alter_column("findings", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("risk_score", existing_type=sa.INTEGER(), nullable=False)
        batch_op.alter_column("risk_level", existing_type=sa.VARCHAR(), nullable=False)
        batch_op.alter_column("status", existing_type=sa.VARCHAR(), nullable=False)
        if "stage" not in scans_cols:
            batch_op.add_column(
                sa.Column("stage", sa.String(), nullable=True, server_default="init")
            )
        else:
            batch_op.alter_column(
                "stage",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=True,
                existing_server_default=sa.text("'init'"),
            )
        if "progress" not in scans_cols:
            batch_op.add_column(
                sa.Column("progress", sa.Integer(), nullable=False, server_default="0")
            )
        if "retry_count" not in scans_cols:
            batch_op.add_column(
                sa.Column(
                    "retry_count", sa.Integer(), nullable=False, server_default="0"
                )
            )
        if "idempotency_key" not in scans_cols:
            batch_op.add_column(
                sa.Column("idempotency_key", sa.String(), nullable=True)
            )
        else:
            batch_op.alter_column(
                "idempotency_key",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=True,
            )
        if "celery_task_id" not in scans_cols:
            batch_op.add_column(sa.Column("celery_task_id", sa.String(), nullable=True))
        else:
            batch_op.alter_column(
                "celery_task_id",
                existing_type=sa.TEXT(),
                type_=sa.String(),
                existing_nullable=True,
            )
        if "is_authorized" not in scans_cols:
            batch_op.add_column(
                sa.Column(
                    "is_authorized",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                )
            )
        else:
            batch_op.alter_column(
                "is_authorized",
                existing_type=sa.Boolean(),
                type_=sa.Boolean(),
                existing_nullable=False,
            )
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=False
        )
        if "ix_scans_idempotency_key" not in scans_indices:
            batch_op.create_index(
                batch_op.f("ix_scans_idempotency_key"),
                ["idempotency_key"],
                unique=False,
            )
        if "ix_scans_organization_id" not in scans_indices:
            batch_op.create_index(
                batch_op.f("ix_scans_organization_id"),
                ["organization_id"],
                unique=False,
            )
        if "ix_scans_user_id" not in scans_indices:
            batch_op.create_index(
                batch_op.f("ix_scans_user_id"), ["user_id"], unique=False
            )

    users_indices = _idxs(insp, "users")
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column("role", existing_type=sa.VARCHAR(), nullable=False)
        batch_op.alter_column("mfa_enabled", existing_type=sa.Boolean(), nullable=False)
        if "ix_users_organization_id" not in users_indices:
            batch_op.create_index(
                batch_op.f("ix_users_organization_id"),
                ["organization_id"],
                unique=False,
            )

    webhooks_indices = _idxs(insp, "webhooks")
    with op.batch_alter_table("webhooks", schema=None) as batch_op:
        batch_op.alter_column("is_active", existing_type=sa.Boolean(), nullable=False)
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=False
        )
        if "ix_webhooks_organization_id" not in webhooks_indices:
            batch_op.create_index(
                batch_op.f("ix_webhooks_organization_id"),
                ["organization_id"],
                unique=False,
            )


def downgrade() -> None:
    with op.batch_alter_table("webhooks", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_webhooks_organization_id"), if_exists=True)
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=True
        )
        batch_op.alter_column("is_active", existing_type=sa.Boolean(), nullable=True)

    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_users_organization_id"), if_exists=True)
        batch_op.alter_column("mfa_enabled", existing_type=sa.Boolean(), nullable=True)
        batch_op.alter_column("role", existing_type=sa.VARCHAR(), nullable=True)

    with op.batch_alter_table("scans", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_scans_user_id"), if_exists=True)
        batch_op.drop_index(batch_op.f("ix_scans_organization_id"), if_exists=True)
        batch_op.drop_index(batch_op.f("ix_scans_idempotency_key"), if_exists=True)

    with op.batch_alter_table("scan_schedules", schema=None) as batch_op:
        batch_op.drop_index(
            batch_op.f("ix_scan_schedules_organization_id"), if_exists=True
        )
        batch_op.drop_index(batch_op.f("ix_scan_schedules_created_by"), if_exists=True)

    with op.batch_alter_table("organizations", schema=None) as batch_op:
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=True
        )
        batch_op.alter_column("plan", existing_type=sa.VARCHAR(), nullable=True)
        batch_op.drop_column("ci_auto_remediate")
        batch_op.drop_column("ci_fail_on_high")
        batch_op.drop_column("ci_fail_on_critical")
        batch_op.drop_column("require_verified_domains")

    with op.batch_alter_table("kg_nodes", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_kg_nodes_org_id"), if_exists=True)
        batch_op.drop_index(batch_op.f("ix_kg_nodes_node_type"), if_exists=True)

    with op.batch_alter_table("kg_edges", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_kg_edges_target_id"), if_exists=True)
        batch_op.drop_index(batch_op.f("ix_kg_edges_source_id"), if_exists=True)
        batch_op.drop_index(batch_op.f("ix_kg_edges_org_id"), if_exists=True)

    with op.batch_alter_table("findings", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_findings_status"), if_exists=True)
        batch_op.alter_column(
            "created_at", existing_type=sa.DateTime(timezone=True), nullable=True
        )
        batch_op.drop_column("notes")
        batch_op.drop_column("resolved_at")
        batch_op.drop_column("assigned_to")
        batch_op.drop_column("status")

    with op.batch_alter_table("assets", schema=None) as batch_op:
        batch_op.drop_constraint("uq_org_asset_value", type_="unique")
        batch_op.drop_index(batch_op.f("ix_assets_is_verified"), if_exists=True)
        batch_op.drop_index(batch_op.f("ix_assets_organization_id"), if_exists=True)
        batch_op.drop_column("verified_at")
        batch_op.drop_column("verification_method")
        batch_op.drop_column("verification_token")
        batch_op.drop_column("is_verified")

    with op.batch_alter_table("api_keys", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_api_keys_organization_id"), if_exists=True)
        batch_op.drop_index(batch_op.f("ix_api_keys_created_by"), if_exists=True)
