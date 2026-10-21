"""Add encrypted github token to Organization

Revision ID: 2c1e45a7b9b7
Revises: 
Create Date: 2026-03-05 17:09:29.607741
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '2c1e45a7b9b7'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = insp.get_table_names()
    if 'organizations' in tables:
        columns = [c['name'] for c in insp.get_columns('organizations')]
        if 'github_token_encrypted' not in columns:
            op.add_column('organizations', sa.Column('github_token_encrypted', sa.String(), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = insp.get_table_names()
    if 'organizations' in tables:
        columns = [c['name'] for c in insp.get_columns('organizations')]
        if 'github_token_encrypted' in columns:
            op.drop_column('organizations', 'github_token_encrypted')

