"""create_projects_table

Revision ID: 03363227c007
Revises: 4785267a4850
Create Date: 2025-10-01 19:48:28.060785

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '03363227c007'
down_revision: str | None = '4785267a4850'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'projects',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('outcome_statement', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('parent_project_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('completed_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('archived_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('last_activity_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['parent_project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.CheckConstraint("status IN ('active', 'on_hold', 'completed', 'archived')", name='valid_project_status')
    )

    op.create_index('idx_projects_status', 'projects', ['status'], postgresql_where=sa.text('deleted_at IS NULL'))
    op.create_index('idx_projects_last_activity', 'projects', [sa.text('last_activity_at DESC')])
    op.create_index('idx_projects_parent', 'projects', ['parent_project_id'], postgresql_where=sa.text('deleted_at IS NULL'))


def downgrade() -> None:
    op.drop_index('idx_projects_parent', table_name='projects')
    op.drop_index('idx_projects_last_activity', table_name='projects')
    op.drop_index('idx_projects_status', table_name='projects')
    op.drop_table('projects')
