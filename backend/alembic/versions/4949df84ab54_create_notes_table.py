"""create_notes_table

Revision ID: 4949df84ab54
Revises: 89e68685b652
Create Date: 2025-10-01 19:49:19.777548

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "4949df84ab54"
down_revision: str | None = "89e68685b652"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "notes",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("project_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("deleted_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="SET NULL"),
    )

    op.create_index(
        "idx_notes_project", "notes", ["project_id"], postgresql_where=sa.text("deleted_at IS NULL")
    )
    op.create_index("idx_notes_updated", "notes", [sa.text("updated_at DESC")])


def downgrade() -> None:
    op.drop_index("idx_notes_updated", table_name="notes")
    op.drop_index("idx_notes_project", table_name="notes")
    op.drop_table("notes")
