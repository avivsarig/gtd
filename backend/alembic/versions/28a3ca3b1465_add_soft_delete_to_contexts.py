"""add_soft_delete_to_contexts

Revision ID: 28a3ca3b1465
Revises: 965429e94db2
Create Date: 2025-10-26 15:06:39.302648

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "28a3ca3b1465"
down_revision: str | None = "965429e94db2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add soft-delete support to contexts table.

    Adds updated_at and deleted_at columns to enable soft-delete functionality
    and maintain consistency with other models (Task, Note, Project).

    Replaces the unique constraint on name with a partial unique index
    that only applies to non-deleted contexts, allowing name reuse after soft-delete.
    """
    # Add updated_at column with default to NOW()
    op.add_column(
        "contexts",
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("NOW()"), nullable=False),
    )

    # Add deleted_at column for soft-delete support
    op.add_column(
        "contexts",
        sa.Column("deleted_at", sa.TIMESTAMP(), nullable=True),
    )

    # Drop the old unique constraint on name
    op.drop_constraint("contexts_name_key", "contexts", type_="unique")

    # Add partial unique index for name (only for non-deleted contexts)
    # This allows reusing names after soft-delete
    op.create_index(
        "idx_contexts_name_not_deleted",
        "contexts",
        ["name"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    """Remove soft-delete support from contexts table."""
    # Drop partial unique index
    op.drop_index("idx_contexts_name_not_deleted", table_name="contexts")

    # Restore original unique constraint on name
    op.create_unique_constraint("contexts_name_key", "contexts", ["name"])

    # Drop soft-delete columns
    op.drop_column("contexts", "deleted_at")
    op.drop_column("contexts", "updated_at")
