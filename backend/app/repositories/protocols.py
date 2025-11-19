"""Repository protocol definitions for dependency injection.

These protocols define the interface contracts for all repositories in the application.
They enable dependency injection, improve testability, and provide type safety through
structural subtyping (duck typing).

Protocols follow the SOLID principles:
- Single Responsibility: Each protocol defines interface for one domain
- Open/Closed: Open for extension via new implementations, closed for modification
- Liskov Substitution: Any implementation can substitute for another
- Interface Segregation: Minimal, focused interfaces
- Dependency Inversion: Controllers depend on protocols, not concrete classes
"""

from datetime import date
from typing import Any, Protocol, runtime_checkable
from uuid import UUID

from sqlalchemy.orm import Session


@runtime_checkable
class BaseRepositoryProtocol(Protocol):
    """Protocol defining core CRUD operations for all repositories.

    This protocol defines the minimal interface that all repositories must implement.
    It provides the foundation for data access patterns across the application.

    Note: Uses Any for flexibility - concrete implementations will have specific types.
    This follows Python's duck typing philosophy while enabling static analysis.
    """

    def get_by_id(self, db: Session, entity_id: UUID) -> Any:
        """Retrieve a single entity by its UUID.

        Args:
            db: Database session
            entity_id: UUID of the entity

        Returns:
            Entity object if found and not deleted, None otherwise
        """
        ...

    def get_all(self, db: Session, include_deleted: bool = False) -> list[Any]:
        """Retrieve all entities from the database.

        Args:
            db: Database session
            include_deleted: If True, include soft-deleted entities

        Returns:
            List of entities ordered by creation date (most recent first)
        """
        ...

    def create(self, db: Session, data: Any) -> Any:
        """Create a new entity in the database.

        Args:
            db: Database session
            data: Entity creation data

        Returns:
            Created entity object with all fields populated
        """
        ...

    def update(self, db: Session, entity: Any, data: Any) -> Any:
        """Update an existing entity in the database.

        Args:
            db: Database session
            entity: Existing entity object to update
            data: Update data (only non-None fields are updated)

        Returns:
            Updated entity object
        """
        ...

    def soft_delete(self, db: Session, entity: Any) -> Any:
        """Soft delete an entity by setting deleted_at timestamp.

        Args:
            db: Database session
            entity: Entity object to delete

        Returns:
            Entity object with deleted_at set
        """
        ...


@runtime_checkable
class TaskRepositoryProtocol(Protocol):
    """Protocol for Task repository operations.

    Extends base CRUD operations with Task-specific filtering and status management.
    Supports GTD workflow patterns (Next/Waiting/Someday status filtering).
    """

    def get_by_id(self, db: Session, entity_id: UUID) -> Any | None:
        """Retrieve a task by its UUID."""
        ...

    def get_all(
        self,
        db: Session,
        include_deleted: bool = False,
        status: Any | None = None,
        project_id: UUID | None = None,
        context_id: UUID | None = None,
        scheduled_after: date | None = None,
        scheduled_before: date | None = None,
        show_completed: bool = True,
    ) -> list[Any]:
        """Retrieve all tasks with optional filters.

        Args:
            db: Database session
            include_deleted: If True, include soft-deleted tasks
            status: Filter by task status (next/waiting/someday)
            project_id: Filter by project ID
            context_id: Filter by context ID (tasks with this context)
            scheduled_after: Filter tasks scheduled after this date (inclusive)
            scheduled_before: Filter tasks scheduled before this date (inclusive)
            show_completed: Include completed tasks (default: True)

        Returns:
            List of Task objects ordered by created_at descending
        """
        ...

    def create(self, db: Session, data: Any) -> Any:
        """Create a new task."""
        ...

    def update(self, db: Session, entity: Any, data: Any) -> Any:
        """Update an existing task."""
        ...

    def soft_delete(self, db: Session, entity: Any) -> Any:
        """Soft delete a task."""
        ...


@runtime_checkable
class NoteRepositoryProtocol(Protocol):
    """Protocol for Note repository operations.

    Extends base CRUD operations with Note-specific project filtering and markdown support.
    """

    def get_by_id(self, db: Session, entity_id: UUID) -> Any | None:
        """Retrieve a note by its UUID."""
        ...

    def get_all(
        self,
        db: Session,
        include_deleted: bool = False,
        project_id: UUID | None = None,
        created_after: date | None = None,
        created_before: date | None = None,
    ) -> list[Any]:
        """Retrieve all notes with optional filters.

        Args:
            db: Database session
            include_deleted: Whether to include soft-deleted notes
            project_id: Optional project UUID to filter by
            created_after: Filter notes created on or after this date (inclusive)
            created_before: Filter notes created on or before this date (inclusive)

        Returns:
            List of Note objects ordered by updated_at descending
        """
        ...

    def create(self, db: Session, data: Any) -> Any:
        """Create a new note."""
        ...

    def update(self, db: Session, entity: Any, data: Any) -> Any:
        """Update an existing note."""
        ...

    def soft_delete(self, db: Session, entity: Any) -> Any:
        """Soft delete a note."""
        ...


@runtime_checkable
class InboxRepositoryProtocol(Protocol):
    """Protocol for InboxItem repository operations.

    Extends base CRUD operations with GTD inbox processing patterns:
    - Marking items as processed
    - Filtering by processed status
    - Counting unprocessed items
    """

    def get_by_id(self, db: Session, entity_id: UUID) -> Any | None:
        """Retrieve an inbox item by its UUID."""
        ...

    def get_all(
        self, db: Session, include_processed: bool = False, include_deleted: bool = False
    ) -> list[Any]:
        """Retrieve all inbox items with processing filters.

        Args:
            db: Database session
            include_processed: If True, include processed items
            include_deleted: If True, include soft-deleted items

        Returns:
            List of InboxItem objects ordered by created_at ascending (oldest first)
        """
        ...

    def create(self, db: Session, data: Any) -> Any:
        """Create a new inbox item."""
        ...

    def update(self, db: Session, entity: Any, data: Any) -> Any:
        """Update an existing inbox item."""
        ...

    def soft_delete(self, db: Session, entity: Any) -> Any:
        """Soft delete an inbox item."""
        ...

    def mark_processed(self, db: Session, item: Any) -> Any:
        """Mark an inbox item as processed by setting processed_at timestamp.

        Args:
            db: Database session
            item: InboxItem object to mark as processed

        Returns:
            Updated InboxItem object with processed_at timestamp
        """
        ...

    def count_unprocessed(self, db: Session) -> int:
        """Count unprocessed inbox items (processed_at IS NULL and not deleted).

        Args:
            db: Database session

        Returns:
            Integer count of unprocessed items
        """
        ...


@runtime_checkable
class ProjectRepositoryProtocol(Protocol):
    """Protocol for Project repository operations.

    Extends base CRUD operations with project-specific task statistics and progress tracking.
    """

    def get_by_id(self, db: Session, entity_id: UUID) -> Any | None:
        """Retrieve a project by its UUID."""
        ...

    def get_all(
        self, db: Session, include_deleted: bool = False, status: Any | None = None
    ) -> list[Any]:
        """Retrieve all projects.

        Args:
            db: Database session
            include_deleted: Whether to include soft-deleted projects
            status: Optional status filter (active/on_hold/completed)

        Returns:
            List of Project objects ordered by created_at descending
        """
        ...

    def create(self, db: Session, data: Any) -> Any:
        """Create a new project."""
        ...

    def update(self, db: Session, entity: Any, data: Any) -> Any:
        """Update an existing project."""
        ...

    def soft_delete(self, db: Session, entity: Any) -> Any:
        """Soft delete a project."""
        ...

    def get_task_stats(self, db: Session, project_id: UUID) -> dict:
        """Get task statistics for a project.

        Args:
            db: Database session
            project_id: UUID of the project

        Returns:
            Dictionary with:
            - task_count: Total tasks in project
            - completed_task_count: Number of completed tasks
            - next_task_count: Number of tasks with status=NEXT
        """
        ...


@runtime_checkable
class ContextRepositoryProtocol(Protocol):
    """Protocol for Context repository operations.

    Extends base CRUD operations with context-specific name lookups and custom sorting.
    Contexts represent GTD contexts (@home, @computer, @phone, etc).
    """

    def get_by_id(self, db: Session, entity_id: UUID) -> Any | None:
        """Retrieve a context by its UUID."""
        ...

    def get_all(self, db: Session, include_deleted: bool = False) -> list[Any]:
        """Retrieve all contexts ordered by sort_order, then name.

        Args:
            db: Database session
            include_deleted: If True, include soft-deleted contexts

        Returns:
            List of contexts ordered by sort_order, then name
        """
        ...

    def get_by_name(self, db: Session, name: str) -> Any | None:
        """Get a context by name (case-sensitive), excluding soft-deleted contexts.

        Args:
            db: Database session
            name: Context name to search for

        Returns:
            Context if found and not deleted, None otherwise
        """
        ...

    def create(self, db: Session, data: Any) -> Any:
        """Create a new context."""
        ...

    def update(self, db: Session, entity: Any, data: Any) -> Any:
        """Update an existing context."""
        ...

    def update_by_id(self, db: Session, context_id: UUID, data: Any) -> Any | None:
        """Update an existing context by ID.

        Args:
            db: Database session
            context_id: UUID of context to update
            data: Updated context data

        Returns:
            Updated context if found, None otherwise
        """
        ...

    def soft_delete(self, db: Session, entity: Any) -> Any:
        """Soft delete a context."""
        ...

    def delete(self, db: Session, context_id: UUID) -> Any | None:
        """Soft-delete a context by ID.

        Args:
            db: Database session
            context_id: UUID of context to delete

        Returns:
            Soft-deleted context if found, None otherwise
        """
        ...


@runtime_checkable
class SearchRepositoryProtocol(Protocol):
    """Protocol for full-text search operations.

    Provides unified search across tasks, notes, and projects using PostgreSQL
    full-text search capabilities (tsvector, tsquery, ts_rank).
    """

    def search_all(self, db: Session, query: str, limit: int = 50) -> list[dict]:
        """Perform full-text search across tasks, notes, and projects.

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
        ...
