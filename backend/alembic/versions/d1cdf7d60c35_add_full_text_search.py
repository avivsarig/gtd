"""add_full_text_search

Revision ID: d1cdf7d60c35
Revises: adb6e3090ecf
Create Date: 2025-10-01 19:49:52.760509

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1cdf7d60c35'
down_revision: Union[str, None] = 'adb6e3090ecf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add tsvector columns for full-text search
    op.execute("""
        ALTER TABLE tasks ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B')
        ) STORED
    """)

    op.execute("""
        ALTER TABLE notes ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(content, '')), 'B')
        ) STORED
    """)

    op.execute("""
        ALTER TABLE projects ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
            setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(outcome_statement, '')), 'B')
        ) STORED
    """)

    # Create GIN indexes for fast text search
    op.create_index('idx_tasks_search', 'tasks', ['search_vector'], postgresql_using='gin')
    op.create_index('idx_notes_search', 'notes', ['search_vector'], postgresql_using='gin')
    op.create_index('idx_projects_search', 'projects', ['search_vector'], postgresql_using='gin')


def downgrade() -> None:
    op.drop_index('idx_projects_search', table_name='projects')
    op.drop_index('idx_notes_search', table_name='notes')
    op.drop_index('idx_tasks_search', table_name='tasks')

    op.execute('ALTER TABLE projects DROP COLUMN search_vector')
    op.execute('ALTER TABLE notes DROP COLUMN search_vector')
    op.execute('ALTER TABLE tasks DROP COLUMN search_vector')
