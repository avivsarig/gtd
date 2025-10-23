"""Search repository - Full-text search across tasks, notes, and projects."""

from typing import Any

from sqlalchemy import func, literal_column
from sqlalchemy.orm import Session

from app.models.mixins import SearchableMixin
from app.models.note import Note
from app.models.project import Project
from app.models.task import Task


def _build_search_query(
    db: Session,
    model: type[SearchableMixin],
    result_type: str,
    tsquery: Any,
    include_project_id: bool = True,
) -> Any:
    """Build a standardized search query for a searchable model.

    Automatically derives title and snippet fields from model's __search_fields__
    configuration (highest weight field becomes title, second becomes snippet).

    Args:
        db: Database session
        model: Model class (must use SearchableMixin)
        result_type: Type identifier ('task', 'note', 'project')
        tsquery: PostgreSQL tsquery object for matching
        include_project_id: Whether to include project_id field

    Returns:
        SQLAlchemy query object

    Raises:
        ValueError: If model has no searchable fields configured
        AttributeError: If configured fields don't exist on model
    """
    # Get search configuration from model
    search_config = model.get_search_config()

    if not search_config:
        raise ValueError(f"{model.__name__} has no search fields configured")

    # Sort fields by weight (A=highest priority, then B, C, D)
    sorted_fields = sorted(search_config.items(), key=lambda x: x[1])

    # First field (highest weight) becomes title, second becomes snippet
    title_field = sorted_fields[0][0]
    snippet_field = sorted_fields[1][0] if len(sorted_fields) > 1 else sorted_fields[0][0]

    # Validate fields exist on model
    if not hasattr(model, title_field):
        raise AttributeError(f"{model.__name__} has no attribute '{title_field}'")
    if not hasattr(model, snippet_field):
        raise AttributeError(f"{model.__name__} has no attribute '{snippet_field}'")

    project_id_field = model.project_id if include_project_id else literal_column("NULL::uuid")

    return (
        db.query(
            model.id,
            literal_column(f"'{result_type}'").label("type"),
            getattr(model, title_field).label("title"),
            getattr(model, snippet_field).label("snippet"),
            func.ts_rank(model.search_vector, tsquery).label("rank"),
            model.created_at,
            project_id_field.label("project_id"),
        )
        .filter(model.deleted_at.is_(None))
        .filter(model.search_vector.op("@@")(tsquery))
    )


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
    tsquery = func.plainto_tsquery("english", query)

    # Build search queries using helper (fields auto-derived from __search_fields__)
    task_results = _build_search_query(db, Task, "task", tsquery)

    note_results = _build_search_query(db, Note, "note", tsquery)

    project_results = _build_search_query(db, Project, "project", tsquery, include_project_id=False)

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
            "snippet": row.snippet[:500] if row.snippet else None,
            "rank": float(row.rank),
            "created_at": row.created_at,
            "project_id": row.project_id,
        }
        for row in results
    ]
