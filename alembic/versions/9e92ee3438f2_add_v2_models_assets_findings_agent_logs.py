"""Add v2 models: assets, findings, agent logs

Revision ID: 9e92ee3438f2
Revises: 2c1e45a7b9b7
Create Date: 2026-03-07 10:30:17.955851
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "9e92ee3438f2"
down_revision: Union[str, None] = "2c1e45a7b9b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = set(insp.get_table_names())

    if conn.dialect.name == "postgresql":
        for enum_type in (
            sa.Enum(
                "domain",
                "subdomain",
                "ip",
                "server",
                "api",
                "cloud_resource",
                name="assettype",
            ),
            sa.Enum("active", "stale", "unknown", name="assetstatus"),
            sa.Enum(
                "critical", "high", "medium", "low", "info", name="findingseverity"
            ),
        ):
            enum_type.create(conn, checkfirst=True)

    if "assets" not in tables:
        op.create_table(
            "assets",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column(
                "asset_type",
                sa.Enum(
                    "domain",
                    "subdomain",
                    "ip",
                    "server",
                    "api",
                    "cloud_resource",
                    name="assettype",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column("value", sa.String(), nullable=False),
            sa.Column("ip_address", sa.String(), nullable=True),
            sa.Column("open_ports", sa.Text(), nullable=True),
            sa.Column("technologies", sa.Text(), nullable=True),
            sa.Column("dns_records", sa.Text(), nullable=True),
            sa.Column("ssl_info", sa.Text(), nullable=True),
            sa.Column("http_status", sa.Integer(), nullable=True),
            sa.Column("http_title", sa.String(), nullable=True),
            sa.Column("risk_score", sa.Float(), nullable=True),
            sa.Column("risk_level", sa.String(), nullable=True),
            sa.Column("risk_summary", sa.Text(), nullable=True),
            sa.Column("shodan_data", sa.Text(), nullable=True),
            sa.Column("virustotal_data", sa.Text(), nullable=True),
            sa.Column(
                "status",
                sa.Enum(
                    "active", "stale", "unknown", name="assetstatus", create_type=False
                ),
                nullable=True,
            ),
            sa.Column("first_seen", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_seen", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_scanned", sa.DateTime(timezone=True), nullable=True),
            sa.Column("discovered_in_scan", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_assets_asset_type"), "assets", ["asset_type"], unique=False
        )
        op.create_index(
            op.f("ix_assets_ip_address"), "assets", ["ip_address"], unique=False
        )
        op.create_index(
            op.f("ix_assets_organization_id"),
            "assets",
            ["organization_id"],
            unique=False,
        )
        op.create_index(op.f("ix_assets_value"), "assets", ["value"], unique=False)

    if "agent_logs" not in tables:
        op.create_table(
            "agent_logs",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("scan_id", sa.String(), nullable=False),
            sa.Column("agent_name", sa.String(), nullable=False),
            sa.Column("action_text", sa.String(), nullable=False),
            sa.Column("details", sa.Text(), nullable=True),
            sa.Column("timestamp", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["scan_id"], ["scans.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_agent_logs_scan_id"), "agent_logs", ["scan_id"], unique=False
        )

    if "findings" not in tables:
        op.create_table(
            "findings",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("scan_id", sa.String(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column(
                "severity",
                sa.Enum(
                    "critical",
                    "high",
                    "medium",
                    "low",
                    "info",
                    name="findingseverity",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column("cvss_score", sa.Float(), nullable=True),
            sa.Column("asset_identified", sa.String(), nullable=True),
            sa.Column("remediation_steps", sa.Text(), nullable=True),
            sa.Column("evidence", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["scan_id"], ["scans.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_findings_scan_id"), "findings", ["scan_id"], unique=False
        )
        op.create_index(
            op.f("ix_findings_severity"), "findings", ["severity"], unique=False
        )


def downgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = set(insp.get_table_names())

    if "findings" in tables:
        op.drop_index(
            op.f("ix_findings_severity"), table_name="findings", if_exists=True
        )
        op.drop_index(
            op.f("ix_findings_scan_id"), table_name="findings", if_exists=True
        )
        op.drop_table("findings")
    if "agent_logs" in tables:
        op.drop_index(
            op.f("ix_agent_logs_scan_id"), table_name="agent_logs", if_exists=True
        )
        op.drop_table("agent_logs")
    if "assets" in tables:
        op.drop_index(op.f("ix_assets_value"), table_name="assets", if_exists=True)
        op.drop_index(
            op.f("ix_assets_organization_id"), table_name="assets", if_exists=True
        )
        op.drop_index(op.f("ix_assets_ip_address"), table_name="assets", if_exists=True)
        op.drop_index(op.f("ix_assets_asset_type"), table_name="assets", if_exists=True)
        op.drop_table("assets")
