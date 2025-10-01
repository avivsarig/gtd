"""create_note_task_links_table

Revision ID: adb6e3090ecf
Revises: 4949df84ab54
Create Date: 2025-10-01 19:49:19.991739

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'adb6e3090ecf'
down_revision: Union[str, None] = '4949df84ab54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'note_task_links',
        sa.Column('note_id', sa.UUID(), nullable=False),
        sa.Column('task_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('note_id', 'task_id'),
        sa.ForeignKeyConstraint(['note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE')
    )

    op.create_index('idx_note_task_links_task', 'note_task_links', ['task_id'])
    op.create_index('idx_note_task_links_note', 'note_task_links', ['note_id'])


def downgrade() -> None:
    op.drop_index('idx_note_task_links_note', table_name='note_task_links')
    op.drop_index('idx_note_task_links_task', table_name='note_task_links')
    op.drop_table('note_task_links')
