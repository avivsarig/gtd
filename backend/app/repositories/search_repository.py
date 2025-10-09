"""Search repository - Full-text search across tasks, notes, and projects."""

from sqlalchemy import func, literal_column
from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.project import Project
from app.models.task import Task


def search_all(db: Session, query: str, limit: int = 50) -> list[dict]:
    """
    Perform full-text search across tasks, notes, and projects.

    Uses PostgreSQL's tsvector and ts_rank for relevance ranking.
    Results are ordered by relevance (most relevant first).

    Args:
        db: Database session
        query: Search query string
        limit: Maximum number of results to return (default 50)

    Returns:
        List of dictionaries containing search results with:
        - id: UUID
        - type: 'task', 'note', or 'project'
        - title: Item title/name
        - snippet: Description/content excerpt
        - rank: Relevance score
        - created_at: Creation timestamp
        - project_id: Associated project (for tasks/notes)
    """
    # Convert query to tsquery format
    tsquery = func.plainto_tsquery("english", query)

    # Search tasks
    task_results = (
        db.query(
            Task.id,
            literal_column("'task'").label("type"),
            Task.title,
            Task.description.label("snippet"),
            func.ts_rank(Task.search_vector, tsquery).label("rank"),
            Task.created_at,
            Task.project_id,
        )
        .filter(Task.deleted_at.is_(None))
        .filter(Task.search_vector.op("@@")(tsquery))
    )

    # Search notes
    note_results = (
        db.query(
            Note.id,
            literal_column("'note'").label("type"),
            Note.title,
            Note.content.label("snippet"),
            func.ts_rank(Note.search_vector, tsquery).label("rank"),
            Note.created_at,
            Note.project_id,
        )
        .filter(Note.deleted_at.is_(None))
        .filter(Note.search_vector.op("@@")(tsquery))
    )

    # Search projects
    project_results = (
        db.query(
            Project.id,
            literal_column("'project'").label("type"),
            Project.name.label("title"),
            Project.outcome_statement.label("snippet"),
            func.ts_rank(Project.search_vector, tsquery).label("rank"),
            Project.created_at,
            literal_column("NULL::uuid").label("project_id"),  # Projects don't have a parent project
        )
        .filter(Project.deleted_at.is_(None))
        .filter(Project.search_vector.op("@@")(tsquery))
    )

    # Combine all results using UNION ALL
    combined = task_results.union_all(note_results, project_results)

    # Order by relevance and limit
    results = combined.order_by(literal_column("rank DESC")).limit(limit).all()

    # Convert to list of dictionaries
    return [
        {
            "id": row.id,
            "type": row.type,
            "title": row.title,
            "snippet": row.snippet[:500] if row.snippet else None,  # Limit snippet length
            "rank": float(row.rank),
            "created_at": row.created_at,
            "project_id": row.project_id,
        }
        for row in results
    ]
