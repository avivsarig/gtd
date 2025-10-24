"""Base repository with common CRUD operations using Python generics."""

from datetime import UTC, datetime
from typing import Any, Generic, Protocol, TypeVar
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy.orm import Session


class HasIdProtocol(Protocol):
    """Protocol for models with an id attribute."""

    id: Any


class HasDeletedAtProtocol(Protocol):
    """Protocol for models with deleted_at attribute."""

    deleted_at: Any


class HasCreatedAtProtocol(Protocol):
    """Protocol for models with created_at attribute."""

    created_at: Any


class HasUpdatedAtProtocol(Protocol):
    """Protocol for models with updated_at attribute."""

    updated_at: Any


ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Generic base repository implementing common CRUD operations.

    Type Parameters:
        ModelType: SQLAlchemy model class (e.g., Task, Note)
        CreateSchemaType: Pydantic schema for creation (e.g., TaskCreate)
        UpdateSchemaType: Pydantic schema for updates (e.g., TaskUpdate)

    This base class provides:
    - get_by_id: Retrieve single entity by UUID
    - get_all: Retrieve all entities with soft-delete filtering
    - create: Create new entity
    - update: Update existing entity
    - soft_delete: Soft delete entity
    - _uuid_to_str: UUID conversion helper for SQLite compatibility

    Child repositories should:
    - Call super().__init__(ModelClass) in their __init__
    - Override methods when domain-specific logic is needed
    - Add domain-specific methods (e.g., get_by_name, custom filters)
    """

    def __init__(self, model: type[ModelType]):
        """Initialize repository with model class.

        Args:
            model: SQLAlchemy model class
        """
        self.model = model

    def _uuid_to_str(self, uuid_val: UUID | None) -> str | None:
        """Convert UUID object to string, or return None if input is None.

        This is needed for SQLite compatibility which stores UUIDs as strings.

        Args:
            uuid_val: UUID to convert

        Returns:
            String representation of UUID, or None
        """
        return str(uuid_val) if uuid_val is not None else None

    def get_by_id(self, db: Session, entity_id: UUID) -> ModelType | None:
        """Get a single entity by ID.

        Args:
            db: Database session
            entity_id: UUID of the entity

        Returns:
            Entity object if found and not deleted, None otherwise
        """
        result = db.query(self.model).filter(self.model.id == self._uuid_to_str(entity_id)).first()
        if result and hasattr(result, "deleted_at") and result.deleted_at is None:
            return result
        elif result and not hasattr(result, "deleted_at"):
            # Model doesn't have soft delete
            return result
        return None

    def get_all(self, db: Session, include_deleted: bool = False) -> list[ModelType]:
        """Get all entities from database.

        Args:
            db: Database session
            include_deleted: If True, include soft-deleted entities (default: False)

        Returns:
            List of entities ordered by created_at descending
        """
        query = db.query(self.model)

        if not include_deleted and hasattr(self.model, "deleted_at"):
            query = query.filter(self.model.deleted_at.is_(None))

        if hasattr(self.model, "created_at"):
            return query.order_by(self.model.created_at.desc()).all()
        return query.all()

    def create(self, db: Session, data: CreateSchemaType) -> ModelType:
        """Create a new entity in the database.

        Base implementation creates entity from schema dictionary.
        Override this method if custom field handling is needed.

        Args:
            db: Database session
            data: Entity creation data

        Returns:
            Created entity object with all fields populated
        """
        entity = self.model(**data.model_dump())
        db.add(entity)
        db.commit()
        db.refresh(entity)
        return entity

    def update(self, db: Session, entity: ModelType, data: UpdateSchemaType) -> ModelType:
        """Update an existing entity in the database.

        Args:
            db: Database session
            entity: Existing entity object to update
            data: Update data (only non-None fields are updated)

        Returns:
            Updated entity object
        """
        update_dict = data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(entity, field, value)

        if hasattr(entity, "updated_at"):
            entity.updated_at = datetime.now(UTC)

        db.commit()
        db.refresh(entity)
        return entity

    def soft_delete(self, db: Session, entity: ModelType) -> ModelType:
        """Soft delete an entity by setting deleted_at timestamp.

        Args:
            db: Database session
            entity: Entity object to delete

        Returns:
            Entity object with deleted_at set
        """
        if not hasattr(entity, "deleted_at"):
            raise AttributeError(f"{self.model.__name__} does not support soft delete")

        entity.deleted_at = datetime.now(UTC)
        db.commit()
        db.refresh(entity)
        return entity
