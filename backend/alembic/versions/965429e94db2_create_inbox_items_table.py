"""create_inbox_items_table

Revision ID: 965429e94db2
Revises: f0538523920e
Create Date: 2025-10-08 14:25:36.557441

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '965429e94db2'
down_revision: str | None = 'f0538523920e'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'inbox_items',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('processed_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Index for unprocessed items query (most common: WHERE processed_at IS NULL AND deleted_at IS NULL)
    op.create_index(
        'idx_inbox_unprocessed',
        'inbox_items',
        ['processed_at', 'deleted_at'],
        postgresql_where=sa.text('processed_at IS NULL AND deleted_at IS NULL')
    )

    # Index for ordering by creation date (oldest first in processing)
    op.create_index('idx_inbox_created', 'inbox_items', [sa.text('created_at ASC')])


def downgrade() -> None:
    op.drop_index('idx_inbox_created', table_name='inbox_items')
    op.drop_index('idx_inbox_unprocessed', table_name='inbox_items')
    op.drop_table('inbox_items')
