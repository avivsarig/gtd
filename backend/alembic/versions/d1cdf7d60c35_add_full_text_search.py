"""add_full_text_search

Revision ID: d1cdf7d60c35
Revises: adb6e3090ecf
Create Date: 2025-10-01 19:49:52.760509

"""
from collections.abc import Sequence

from alembic import op
from alembic.utils.search_helpers import drop_search_vector_sql, generate_search_vector_sql

# Import models to use their __search_fields__ configuration (single source of truth)
from app.models.note import Note
from app.models.project import Project
from app.models.task import Task

# revision identifiers, used by Alembic.
revision: str = 'd1cdf7d60c35'
down_revision: str | None = 'adb6e3090ecf'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Use model __search_fields__ as single source of truth
    searchable_models = [
        ("tasks", Task),
        ("notes", Note),
        ("projects", Project),
    ]

    # Apply search_vector column and index to all tables
    for table_name, model in searchable_models:
        field_weights = model.get_search_config()
        add_column_sql, create_index_sql = generate_search_vector_sql(table_name, field_weights)
        op.execute(add_column_sql)
        op.execute(create_index_sql)


def downgrade() -> None:
    # Remove search vectors in reverse order
    for table_name in ["projects", "notes", "tasks"]:
        drop_index_sql, drop_column_sql = drop_search_vector_sql(table_name)
        op.execute(drop_index_sql)
        op.execute(drop_column_sql)
