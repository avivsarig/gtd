"""Base Pydantic schemas for API response models.

This module provides base classes that eliminate duplication across response schemas
by extracting common patterns (DRY principle). The hierarchy mirrors the database
layer's mixin pattern (UUIDPrimaryKeyMixin, TimestampMixin, SoftDeletableMixin).

Hierarchy:
    ResponseBase - Standard API responses with ID and timestamps
    └── SoftDeletableResponseBase - Responses for soft-deletable entities

Usage:
    class TaskResponse(ResponseBase):
        title: str
        status: str
        # id, created_at, updated_at, model_config inherited automatically

    class NoteResponse(SoftDeletableResponseBase):
        title: str
        content: str | None
        # id, created_at, updated_at, deleted_at, model_config inherited
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResponseBase(BaseModel):
    """Base schema for all resource responses.

    Provides standard fields present in all API responses:
    - id: Unique identifier (UUID)
    - created_at: Entity creation timestamp
    - updated_at: Last modification timestamp
    - model_config: ORM mode for SQLAlchemy model serialization

    This mirrors the TimestampMixin + UUIDPrimaryKeyMixin pattern at the model layer.
    """

    model_config = {"from_attributes": True}

    id: UUID
    created_at: datetime
    updated_at: datetime


class SoftDeletableResponseBase(ResponseBase):
    """Base schema for soft-deletable resource responses.

    Extends ResponseBase with soft-delete tracking:
    - deleted_at: Soft-delete timestamp (None if not deleted)

    This mirrors the SoftDeletableMixin pattern at the model layer.

    Note: Not all soft-deletable models expose deleted_at in their response schemas.
    Task and Project use domain-specific lifecycle fields (completed_at, archived_at)
    instead, which provide richer semantics than generic soft-delete.
    """

    deleted_at: datetime | None = None
