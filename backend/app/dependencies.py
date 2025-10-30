"""Dependency injection providers for FastAPI.

This module centralizes the creation and injection of repository dependencies.
It enables:
- Type-safe dependency injection through FastAPI's Depends() mechanism
- Easy swapping of implementations (testing, different databases, caching layers)
- Explicit dependency declaration in function signatures
- Single source of truth for repository instantiation

Usage in controllers:
    def my_function(repository: TaskRepositoryProtocol = Depends(get_task_repository)):
        ...

Usage in API routes:
    @router.get("/")
    def list_tasks(
        db: Session = Depends(get_db),
        repository: TaskRepositoryProtocol = Depends(get_task_repository),
    ):
        return controller.list_tasks(db, repository)
"""

from collections.abc import Callable

from app.repositories.context_repository import ContextRepository
from app.repositories.inbox_repository import InboxRepository
from app.repositories.note_repository import NoteRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.protocols import (
    ContextRepositoryProtocol,
    InboxRepositoryProtocol,
    NoteRepositoryProtocol,
    ProjectRepositoryProtocol,
    SearchRepositoryProtocol,
    TaskRepositoryProtocol,
)
from app.repositories.task_repository import TaskRepository


def get_task_repository() -> TaskRepositoryProtocol:
    """Provide TaskRepository instance for dependency injection.

    Returns:
        TaskRepository instance implementing TaskRepositoryProtocol
    """
    return TaskRepository()


def get_note_repository() -> NoteRepositoryProtocol:
    """Provide NoteRepository instance for dependency injection.

    Returns:
        NoteRepository instance implementing NoteRepositoryProtocol
    """
    return NoteRepository()


def get_inbox_repository() -> InboxRepositoryProtocol:
    """Provide InboxRepository instance for dependency injection.

    Returns:
        InboxRepository instance implementing InboxRepositoryProtocol
    """
    return InboxRepository()


def get_project_repository() -> ProjectRepositoryProtocol:
    """Provide ProjectRepository instance for dependency injection.

    Returns:
        ProjectRepository instance implementing ProjectRepositoryProtocol
    """
    return ProjectRepository()


def get_context_repository() -> ContextRepositoryProtocol:
    """Provide ContextRepository instance for dependency injection.

    Returns:
        ContextRepository instance implementing ContextRepositoryProtocol
    """
    return ContextRepository()


def get_search_repository() -> SearchRepositoryProtocol:
    """Provide search repository functions for dependency injection.

    Note: SearchRepository is implemented as a module with functions rather than
    a class. This dependency provider wraps the module functions in a simple
    object that implements the SearchRepositoryProtocol.

    Returns:
        Object implementing SearchRepositoryProtocol
    """
    from app.repositories import search_repository

    class SearchRepositoryWrapper:
        """Wrapper to make search_repository module compatible with protocol."""

        def search_all(self, db, query: str, limit: int = 50) -> list[dict]:
            return search_repository.search_all(db, query, limit)

    return SearchRepositoryWrapper()


# Type aliases for easier importing
TaskRepositoryDependency = Callable[[], TaskRepositoryProtocol]
NoteRepositoryDependency = Callable[[], NoteRepositoryProtocol]
InboxRepositoryDependency = Callable[[], InboxRepositoryProtocol]
ProjectRepositoryDependency = Callable[[], ProjectRepositoryProtocol]
ContextRepositoryDependency = Callable[[], ContextRepositoryProtocol]
SearchRepositoryDependency = Callable[[], SearchRepositoryProtocol]
