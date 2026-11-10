"""Add notifications inbox table with FK index and PostgreSQL RLS policy.

Revision ID: e8f9a0b1c2d3
Revises: d4f8e12a9b3c
Create Date: 2026-11-10 22:20:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "e8f9a0b1c2d3"
down_revision: Union[str, None] = "d4f8e12a9b3c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    if not insp.has_table("notifications"):
        op.create_table(
            "notifications",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("organization_id", sa.String(), nullable=False),
            sa.Column("source_ref", sa.String(length=200), nullable=False),
            sa.Column("type", sa.String(length=50), nullable=False),
            sa.Column("title", sa.String(length=200), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column(
                "is_read", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "organization_id",
                "source_ref",
                name="uq_org_notification_source_ref",
            ),
        )
    op.create_index(
        "ix_notifications_organization_id",
        "notifications",
        ["organization_id"],
        if_not_exists=True,
    )
    op.create_index(
        "ix_notifications_created_at",
        "notifications",
        ["created_at"],
        if_not_exists=True,
    )

    if conn.dialect.name == "postgresql":
        op.execute("ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;")
        op.execute('DROP POLICY IF EXISTS "deny_all_access" ON public.notifications;')
        op.execute(
            'CREATE POLICY "deny_all_access" ON public.notifications FOR ALL USING (false);'
        )
        op.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                    REVOKE ALL ON TABLE public.notifications FROM anon;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                    REVOKE ALL ON TABLE public.notifications FROM authenticated;
                END IF;
            END $$;
            """
        )


def downgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name == "postgresql":
        op.execute('DROP POLICY IF EXISTS "deny_all_access" ON public.notifications;')
        op.execute("ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;")

    op.drop_index("ix_notifications_created_at", if_exists=True)
    op.drop_index("ix_notifications_organization_id", if_exists=True)
    op.drop_table("notifications")
