"""Search controller - Business logic for full-text search."""

from sqlalchemy.orm import Session

from app.repositories import search_repository
from app.schemas.search import SearchResponse, SearchResultItem


def search(db: Session, query: str, limit: int = 50) -> SearchResponse:
    """
    Perform full-text search across tasks, notes, and projects.

    Business rules:
    - Minimum query length should be 2 characters for performance
    - Results ordered by relevance (most relevant first)
    - Limit to 50 results by default to maintain <1s performance target

    Args:
        db: Database session
        query: Search query string
        limit: Maximum number of results (default 50, max 100)

    Returns:
        SearchResponse with query, total count, and results
    """
    # Enforce maximum limit for performance
    if limit > 100:
        limit = 100

    # Perform search
    results = search_repository.search_all(db, query, limit)

    # Convert to response objects
    search_items = [SearchResultItem(**item) for item in results]

    return SearchResponse(query=query, total_results=len(search_items), results=search_items)
