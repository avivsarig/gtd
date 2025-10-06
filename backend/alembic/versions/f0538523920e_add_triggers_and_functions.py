"""add_triggers_and_functions

Revision ID: f0538523920e
Revises: d1cdf7d60c35
Create Date: 2025-10-01 19:49:52.980150

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'f0538523920e'
down_revision: str | None = 'd1cdf7d60c35'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Function to update updated_at timestamp
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Triggers for updated_at on tasks, projects, notes
    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    op.execute("""
        CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    op.execute("""
        CREATE TRIGGER update_notes_updated_at
        BEFORE UPDATE ON notes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    # Function to update project last_activity_at when tasks change
    op.execute("""
        CREATE OR REPLACE FUNCTION update_project_last_activity()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'DELETE' THEN
                UPDATE projects SET last_activity_at = NOW() WHERE id = OLD.project_id;
                RETURN OLD;
            ELSE
                UPDATE projects SET last_activity_at = NOW() WHERE id = NEW.project_id;
                RETURN NEW;
            END IF;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE TRIGGER task_activity_updates_project
        AFTER INSERT OR UPDATE OR DELETE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_project_last_activity();
    """)


def downgrade() -> None:
    op.execute('DROP TRIGGER IF EXISTS task_activity_updates_project ON tasks')
    op.execute('DROP TRIGGER IF EXISTS update_notes_updated_at ON notes')
    op.execute('DROP TRIGGER IF EXISTS update_projects_updated_at ON projects')
    op.execute('DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks')
    op.execute('DROP FUNCTION IF EXISTS update_project_last_activity()')
    op.execute('DROP FUNCTION IF EXISTS update_updated_at_column()')
