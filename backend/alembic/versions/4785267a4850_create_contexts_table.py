"""create_contexts_table

Revision ID: 4785267a4850
Revises:
Create Date: 2025-10-01 19:48:06.950799

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '4785267a4850'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    from sqlalchemy.dialects import postgresql

    op.create_table(
        'contexts',
        sa.Column('id', postgresql.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )

    # Add check constraint for context name format
    op.create_check_constraint(
        'context_name_format',
        'contexts',
        sa.text("name ~ '^@[a-z0-9_]+$'")
    )

    op.create_index('idx_contexts_name', 'contexts', ['name'])


def downgrade() -> None:
    op.drop_index('idx_contexts_name', table_name='contexts')
    op.drop_table('contexts')
