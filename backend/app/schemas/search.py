"""Search schemas for API request/response validation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SearchResultItem(BaseModel):
    """Individual search result item."""

    id: UUID
    type: str = Field(..., description="Type of result: 'task', 'note', or 'project'")
    title: str = Field(..., description="Title or name of the item")
    snippet: str | None = Field(None, description="Content snippet or description")
    rank: float = Field(..., description="Search relevance rank (higher is more relevant)")
    created_at: datetime
    project_id: UUID | None = Field(None, description="Associated project ID (for tasks/notes)")

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """Search results response."""

    query: str = Field(..., description="The search query that was executed")
    total_results: int = Field(..., description="Total number of results found")
    results: list[SearchResultItem] = Field(..., description="List of search results ordered by relevance")
