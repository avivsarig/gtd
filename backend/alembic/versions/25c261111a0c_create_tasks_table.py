"""create_tasks_table

Revision ID: 25c261111a0c
Revises: 03363227c007
Create Date: 2025-10-01 19:48:52.347174

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "25c261111a0c"
down_revision: str | None = "03363227c007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tasks",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="next"),
        sa.Column("scheduled_date", sa.Date(), nullable=True),
        sa.Column("scheduled_time", sa.Time(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("project_id", sa.UUID(), nullable=True),
        sa.Column("blocked_by_task_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("completed_at", sa.TIMESTAMP(), nullable=True),
        sa.Column("archived_at", sa.TIMESTAMP(), nullable=True),
        sa.Column("deleted_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["blocked_by_task_id"], ["tasks.id"], ondelete="SET NULL"),
        sa.CheckConstraint(
            "status IN ('next', 'waiting', 'someday', 'completed', 'archived')", name="valid_status"
        ),
    )

    op.create_index(
        "idx_tasks_status", "tasks", ["status"], postgresql_where=sa.text("deleted_at IS NULL")
    )
    op.create_index(
        "idx_tasks_project", "tasks", ["project_id"], postgresql_where=sa.text("deleted_at IS NULL")
    )
    op.create_index(
        "idx_tasks_scheduled",
        "tasks",
        ["scheduled_date"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "idx_tasks_blocked_by",
        "tasks",
        ["blocked_by_task_id"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index("idx_tasks_created", "tasks", [sa.text("created_at DESC")])


def downgrade() -> None:
    op.drop_index("idx_tasks_created", table_name="tasks")
    op.drop_index("idx_tasks_blocked_by", table_name="tasks")
    op.drop_index("idx_tasks_scheduled", table_name="tasks")
    op.drop_index("idx_tasks_project", table_name="tasks")
    op.drop_index("idx_tasks_status", table_name="tasks")
    op.drop_table("tasks")
