"""Base controller class with common functionality.

Provides shared methods for all controllers:
- Error handling and HTTP exception conversion
- Common retrieval patterns (get_or_404)
- Transaction management helpers
- Response transformation utilities

All domain controllers should inherit from this class to ensure
consistent behavior and reduce code duplication.
"""

from typing import Any, Generic, TypeVar
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.protocols import BaseRepositoryProtocol

ModelType = TypeVar("ModelType")
RepositoryType = TypeVar("RepositoryType", bound=BaseRepositoryProtocol)


class BaseController(Generic[ModelType, RepositoryType]):
    """Base class for all controllers with common functionality.

    Provides:
    - get_or_404: Retrieve entity or raise 404
    - Error handling patterns
    - Transaction management helpers
    """

    def __init__(self, repository: RepositoryType):
        """Initialize controller with its repository.

        Args:
            repository: Repository instance for data access
        """
        self.repository = repository

    def get_or_404(self, db: Session, entity_id: UUID, entity_name: str = "Entity") -> ModelType:
        """Retrieve an entity by ID or raise 404 if not found.

        Args:
            db: Database session
            entity_id: UUID of the entity to retrieve
            entity_name: Human-readable entity name for error messages

        Returns:
            The entity instance

        Raises:
            HTTPException: 404 if entity not found

        Example:
            task = self.get_or_404(db, task_id, "Task")
        """
        entity = self.repository.get_by_id(db, entity_id)
        if entity is None:
            raise HTTPException(
                status_code=404, detail=f"{entity_name} with ID {entity_id} not found"
            )
        return entity  # type: ignore[no-any-return]

    def validate_unique_name(
        self,
        db: Session,
        name: str,
        entity_name: str = "Entity",
        exclude_id: UUID | None = None,
    ) -> None:
        """Validate that a name is unique (if repository supports get_by_name).

        Args:
            db: Database session
            name: Name to check for uniqueness
            entity_name: Human-readable entity name for error messages
            exclude_id: Optional ID to exclude from check (for updates)

        Raises:
            HTTPException: 409 Conflict if name already exists

        Example:
            self.validate_unique_name(db, "home", "Context")
        """
        # Only works if repository has get_by_name method
        if not hasattr(self.repository, "get_by_name"):
            return

        existing = self.repository.get_by_name(db, name)
        if existing and (exclude_id is None or existing.id != exclude_id):
            raise HTTPException(
                status_code=409,
                detail=f"{entity_name} with name '{name}' already exists",
            )


class ControllerRegistry:
    """Registry for controller instances to support dependency injection."""

    def __init__(self):
        """Initialize empty controller registry."""
        self._controllers: dict[type, Any] = {}

    def register(self, controller_class: type, instance: Any) -> None:
        """Register a controller instance.

        Args:
            controller_class: The controller class type
            instance: The controller instance
        """
        self._controllers[controller_class] = instance

    def get(self, controller_class: type) -> Any:
        """Get a registered controller instance.

        Args:
            controller_class: The controller class type

        Returns:
            Controller instance

        Raises:
            KeyError: If controller not registered
        """
        if controller_class not in self._controllers:
            raise KeyError(
                f"Controller {controller_class.__name__} not registered. "
                f"Use registry.register() first."
            )
        return self._controllers[controller_class]


# Global controller registry
_controller_registry = ControllerRegistry()


def get_controller_registry() -> ControllerRegistry:
    """Get the global controller registry.

    Returns:
        Global ControllerRegistry instance
    """
    return _controller_registry
