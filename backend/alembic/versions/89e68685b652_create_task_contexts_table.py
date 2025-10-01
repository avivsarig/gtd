"""create_task_contexts_table

Revision ID: 89e68685b652
Revises: 25c261111a0c
Create Date: 2025-10-01 19:49:19.561514

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '89e68685b652'
down_revision: Union[str, None] = '25c261111a0c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'task_contexts',
        sa.Column('task_id', sa.UUID(), nullable=False),
        sa.Column('context_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('task_id', 'context_id'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['context_id'], ['contexts.id'], ondelete='CASCADE')
    )

    op.create_index('idx_task_contexts_context', 'task_contexts', ['context_id'])
    op.create_index('idx_task_contexts_task', 'task_contexts', ['task_id'])


def downgrade() -> None:
    op.drop_index('idx_task_contexts_task', table_name='task_contexts')
    op.drop_index('idx_task_contexts_context', table_name='task_contexts')
    op.drop_table('task_contexts')
