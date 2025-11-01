"""Search API endpoints - Full-text search across tasks, notes, and projects."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers.search_controller import SearchController
from app.db.database import get_db
from app.dependencies import get_search_controller
from app.schemas.search import SearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results (1-100)"),
    db: Session = Depends(get_db),
    controller: SearchController = Depends(get_search_controller),
):
    """
    Full-text search across tasks, notes, and projects.

    Searches through:
    - Task titles and descriptions
    - Note titles and content
    - Project names and outcome statements

    Results are ordered by relevance (most relevant first).

    Performance target: <1 second for typical queries.

    Args:
        q: Search query string (minimum 2 characters)
        limit: Maximum number of results to return (default 50, max 100)

    Returns:
        SearchResponse with matching results ordered by relevance

    Raises:
        400: Query too short
    """
    if len(q.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters long",
        )

    return controller.search(db, q.strip(), limit)
