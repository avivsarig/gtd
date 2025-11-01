"""Dependency injection providers for FastAPI.

This module centralizes the creation and injection of repository dependencies
using a lightweight DI container pattern. It enables:
- Type-safe dependency injection through FastAPI's Depends() mechanism
- Easy swapping of implementations (testing, different databases, caching layers)
- Explicit dependency declaration in function signatures
- Single source of truth for repository instantiation
- Elimination of wrapper classes and boilerplate

Usage in API routes:
    @router.get("/")
    def list_tasks(
        db: Session = Depends(get_db),
        repository: TaskRepositoryProtocol = Depends(get_task_repository),
    ):
        return controller.list_tasks(db, repository)
"""

from app.core.container import get_container
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
from app.repositories.search_repository import SearchRepository
from app.repositories.task_repository import TaskRepository


def _setup_container() -> None:
    """Register all repositories with the DI container.

    Called once during application startup to configure dependency injection.
    Uses factory pattern to create new instances for each resolution.
    """
    container = get_container()

    # Register repository factories (protocols need type:ignore for mypy)
    container.register(TaskRepositoryProtocol, lambda: TaskRepository())  # type: ignore[type-abstract]
    container.register(NoteRepositoryProtocol, lambda: NoteRepository())  # type: ignore[type-abstract]
    container.register(InboxRepositoryProtocol, lambda: InboxRepository())  # type: ignore[type-abstract]
    container.register(ProjectRepositoryProtocol, lambda: ProjectRepository())  # type: ignore[type-abstract]
    container.register(ContextRepositoryProtocol, lambda: ContextRepository())  # type: ignore[type-abstract]
    container.register(SearchRepositoryProtocol, lambda: SearchRepository())  # type: ignore[type-abstract]


# Setup container on module import
_setup_container()


def get_task_repository() -> TaskRepositoryProtocol:
    """Provide TaskRepository instance for dependency injection.

    Returns:
        TaskRepository instance implementing TaskRepositoryProtocol
    """
    return get_container().resolve(TaskRepositoryProtocol)  # type: ignore[type-abstract]


def get_note_repository() -> NoteRepositoryProtocol:
    """Provide NoteRepository instance for dependency injection.

    Returns:
        NoteRepository instance implementing NoteRepositoryProtocol
    """
    return get_container().resolve(NoteRepositoryProtocol)  # type: ignore[type-abstract]


def get_inbox_repository() -> InboxRepositoryProtocol:
    """Provide InboxRepository instance for dependency injection.

    Returns:
        InboxRepository instance implementing InboxRepositoryProtocol
    """
    return get_container().resolve(InboxRepositoryProtocol)  # type: ignore[type-abstract]


def get_project_repository() -> ProjectRepositoryProtocol:
    """Provide ProjectRepository instance for dependency injection.

    Returns:
        ProjectRepository instance implementing ProjectRepositoryProtocol
    """
    return get_container().resolve(ProjectRepositoryProtocol)  # type: ignore[type-abstract]


def get_context_repository() -> ContextRepositoryProtocol:
    """Provide ContextRepository instance for dependency injection.

    Returns:
        ContextRepository instance implementing ContextRepositoryProtocol
    """
    return get_container().resolve(ContextRepositoryProtocol)  # type: ignore[type-abstract]


def get_search_repository() -> SearchRepositoryProtocol:
    """Provide search repository for dependency injection.

    Returns:
        SearchRepository instance implementing SearchRepositoryProtocol
    """
    return get_container().resolve(SearchRepositoryProtocol)  # type: ignore[type-abstract]


# Controller providers
def get_task_controller():
    """Provide TaskController instance for dependency injection.

    Returns:
        TaskController instance
    """
    from app.controllers.task_controller import TaskController

    return TaskController(repository=get_task_repository())


def get_note_controller():
    """Provide NoteController instance for dependency injection.

    Returns:
        NoteController instance
    """
    from app.controllers.note_controller import NoteController

    return NoteController(repository=get_note_repository())


def get_inbox_controller():
    """Provide InboxController instance for dependency injection.

    Returns:
        InboxController instance with all required repositories
    """
    from app.controllers.inbox_controller import InboxController

    return InboxController(
        repository=get_inbox_repository(),
        task_repository=get_task_repository(),
        note_repository=get_note_repository(),
        project_repository=get_project_repository(),
    )


def get_project_controller():
    """Provide ProjectController instance for dependency injection.

    Returns:
        ProjectController instance
    """
    from app.controllers.project_controller import ProjectController

    return ProjectController(repository=get_project_repository())


def get_context_controller():
    """Provide ContextController instance for dependency injection.

    Returns:
        ContextController instance
    """
    from app.controllers.context_controller import ContextController

    return ContextController(repository=get_context_repository())


def get_search_controller():
    """Provide SearchController instance for dependency injection.

    Returns:
        SearchController instance
    """
    from app.controllers.search_controller import SearchController

    return SearchController(repository=get_search_repository())
