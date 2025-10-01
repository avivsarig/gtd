"""seed_default_contexts

Revision ID: ae77d803455f
Revises: f0538523920e
Create Date: 2025-10-01 19:49:53.198326

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae77d803455f'
down_revision: Union[str, None] = 'f0538523920e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Seed default contexts
    op.execute("""
        INSERT INTO contexts (name, description, icon, sort_order) VALUES
        ('@computer', 'Tasks requiring a computer', 'computer', 1),
        ('@phone', 'Calls to make', 'phone', 2),
        ('@home', 'Tasks to do at home', 'home', 3),
        ('@office', 'Tasks to do at office', 'briefcase', 4),
        ('@errands', 'Things to do while out', 'shopping-cart', 5),
        ('@waiting', 'Waiting for someone else', 'clock', 6),
        ('@anywhere', 'Can do from anywhere', 'globe', 7)
        ON CONFLICT (name) DO NOTHING
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM contexts WHERE name IN (
            '@computer', '@phone', '@home', '@office',
            '@errands', '@waiting', '@anywhere'
        )
    """)
