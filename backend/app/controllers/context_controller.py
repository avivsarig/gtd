"""Context controller - Business logic for context management."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.core.base_controller import BaseController
from app.models.context import Context
from app.repositories.protocols import ContextRepositoryProtocol
from app.schemas.context import ContextCreate, ContextUpdate


class ContextController(BaseController[Context, ContextRepositoryProtocol]):
    """Controller for Context entity with business logic."""

    def list_contexts(self, db: Session):
        """Get all contexts.

        Returns contexts ordered by sort_order, then name for consistent UI display.

        Args:
            db: Database session

        Returns:
            List of all contexts
        """
        return self.repository.get_all(db)

    def get_context(self, db: Session, context_id: UUID):
        """Get a single context by ID.

        Args:
            db: Database session
            context_id: UUID of context to retrieve

        Returns:
            Context if found, None otherwise
        """
        return self.repository.get_by_id(db, context_id)

    def create_context(self, db: Session, context_data: ContextCreate):
        """Create a new context.

        Business rules:
        - Context names must be unique (enforced by database constraint)

        Args:
            db: Database session
            context_data: Context data from request

        Returns:
            Created context

        Raises:
            HTTPException: If context name already exists
        """
        # Use base controller helper for uniqueness validation
        self.validate_unique_name(db, context_data.name, "Context")

        return self.repository.create(db, context_data)

    def update_context(self, db: Session, context_id: UUID, context_data: ContextUpdate):
        """Update an existing context.

        Business rules:
        - If name is being changed, ensure new name doesn't conflict

        Args:
            db: Database session
            context_id: UUID of context to update
            context_data: Updated context data

        Returns:
            Updated context if found, None otherwise

        Raises:
            HTTPException: If new name conflicts with existing context
        """
        # If name is being updated, check for conflicts
        if context_data.name is not None:
            self.validate_unique_name(db, context_data.name, "Context", exclude_id=context_id)

        return self.repository.update_by_id(db, context_id, context_data)

    def delete_context(self, db: Session, context_id: UUID):
        """Soft-delete a context.

        Sets deleted_at timestamp instead of removing from database.
        Task associations remain in the database for potential restoration.

        Args:
            db: Database session
            context_id: UUID of context to delete

        Returns:
            Soft-deleted context if found, None otherwise
        """
        return self.repository.delete(db, context_id)
