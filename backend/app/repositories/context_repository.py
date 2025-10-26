"""Context repository - Database access layer for contexts."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.context import Context
from app.repositories.base_repository import BaseRepository
from app.schemas.context import ContextCreate, ContextUpdate


class ContextRepository(BaseRepository[Context, ContextCreate, ContextUpdate]):
    """Repository for Context entity with custom sorting and soft-delete support."""

    def __init__(self):
        """Initialize ContextRepository with Context model."""
        super().__init__(Context)

    def get_all(self, db: Session, include_deleted: bool = False) -> list[Context]:
        """Get all contexts ordered by sort_order, then name.

        Args:
            db: Database session
            include_deleted: If True, include soft-deleted contexts (default: False)

        Returns:
            List of contexts ordered by sort_order, then name
        """
        query = db.query(Context)

        if not include_deleted:
            query = query.filter(Context.deleted_at.is_(None))

        return query.order_by(Context.sort_order, Context.name).all()

    def get_by_name(self, db: Session, name: str) -> Context | None:
        """Get a context by name (case-sensitive), excluding soft-deleted contexts.

        Args:
            db: Database session
            name: Context name to search for

        Returns:
            Context if found and not deleted, None otherwise
        """
        return db.query(Context).filter(Context.name == name, Context.deleted_at.is_(None)).first()

    def update_by_id(
        self, db: Session, context_id: UUID, context_data: ContextUpdate
    ) -> Context | None:
        """Update an existing context by ID.

        Args:
            db: Database session
            context_id: UUID of context to update
            context_data: Updated context data

        Returns:
            Updated context if found, None otherwise
        """
        context = self.get_by_id(db, context_id)
        if context is None:
            return None

        # Update only provided fields
        update_data = context_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(context, field, value)

        db.commit()
        db.refresh(context)
        return context

    def delete(self, db: Session, context_id: UUID) -> Context | None:
        """Soft-delete a context by setting deleted_at timestamp.

        Args:
            db: Database session
            context_id: UUID of context to delete

        Returns:
            Soft-deleted context if found, None otherwise
        """
        context = self.get_by_id(db, context_id)
        if context is None:
            return None

        return self.soft_delete(db, context)


# Singleton instance for backward compatibility with existing code
_repository = ContextRepository()

# Export functions at module level for backward compatibility
get_all = _repository.get_all
get_by_id = _repository.get_by_id
get_by_name = _repository.get_by_name
create = _repository.create
update = _repository.update_by_id
delete = _repository.delete
