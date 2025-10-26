"""Unit tests for Context repository."""

from datetime import UTC, datetime
from unittest.mock import Mock
from uuid import uuid4

from app.models.context import Context
from app.repositories import context_repository


class TestGetAll:
    """Test get_all() repository method."""

    def test_get_all_empty_database(self):
        """Should return empty list when no contexts exist."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.order_by.return_value.all.return_value = []

        contexts = context_repository.get_all(mock_db)

        assert contexts == []
        mock_db.query.assert_called_once_with(Context)

    def test_get_all_returns_contexts_ordered(self):
        """Should return all non-deleted contexts ordered by sort_order, then name."""
        context1 = Mock(spec=Context, name="@home", sort_order=0, deleted_at=None)
        context2 = Mock(spec=Context, name="@work", sort_order=1, deleted_at=None)
        context3 = Mock(spec=Context, name="@computer", sort_order=0, deleted_at=None)

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.order_by.return_value.all.return_value = [
            context1,
            context3,
            context2,
        ]

        contexts = context_repository.get_all(mock_db)

        assert len(contexts) == 3
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.order_by.assert_called_once()

    def test_get_all_filters_deleted_by_default(self):
        """Should filter out soft-deleted contexts by default."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.order_by.return_value.all.return_value = []

        context_repository.get_all(mock_db)

        mock_query.filter.assert_called_once()

    def test_get_all_with_include_deleted(self):
        """Should include soft-deleted contexts when include_deleted=True."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.order_by.return_value.all.return_value = []

        context_repository.get_all(mock_db, include_deleted=True)

        mock_query.filter.assert_not_called()
        mock_query.order_by.assert_called_once()


class TestGetById:
    """Test get_by_id() repository method."""

    def test_get_by_id_returns_context(self):
        """Should return context when ID exists and not deleted."""
        context_id = uuid4()
        mock_context = Mock(spec=Context, id=str(context_id), name="@home", deleted_at=None)

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_context

        result = context_repository.get_by_id(mock_db, context_id)

        assert result == mock_context
        mock_db.query.assert_called_once_with(Context)

    def test_get_by_id_excludes_deleted_contexts(self):
        """Should return None for soft-deleted contexts."""
        context_id = uuid4()
        mock_context = Mock(
            spec=Context, id=str(context_id), name="@home", deleted_at=datetime.now(UTC)
        )

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_context

        result = context_repository.get_by_id(mock_db, context_id)

        assert result is None

    def test_get_by_id_returns_none_when_not_found(self):
        """Should return None when context ID doesn't exist."""
        context_id = uuid4()

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        result = context_repository.get_by_id(mock_db, context_id)

        assert result is None


class TestGetByName:
    """Test get_by_name() repository method."""

    def test_get_by_name_returns_context(self):
        """Should return context when name matches."""
        mock_context = Mock(spec=Context, name="@home", deleted_at=None)

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_context

        result = context_repository.get_by_name(mock_db, "@home")

        assert result == mock_context

    def test_get_by_name_returns_none_when_not_found(self):
        """Should return None when name doesn't exist."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        result = context_repository.get_by_name(mock_db, "@nonexistent")

        assert result is None


class TestDelete:
    """Test delete() repository method (soft-delete)."""

    def test_delete_sets_deleted_at(self):
        """Should set deleted_at timestamp for soft-delete."""
        context_id = uuid4()
        mock_context = Mock(spec=Context, id=str(context_id), name="@home", deleted_at=None)

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_context
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        result = context_repository.delete(mock_db, context_id)

        assert mock_context.deleted_at is not None
        assert isinstance(mock_context.deleted_at, datetime)
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_context)
        assert result == mock_context

    def test_delete_preserves_context_data(self):
        """Should only set deleted_at, not modify other fields."""
        context_id = uuid4()

        # Create a mock with fixed attribute values
        mock_context = Mock(spec=Context, deleted_at=None)
        mock_context.id = str(context_id)
        mock_context.name = "@home"
        mock_context.description = "Home tasks"

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_context
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        context_repository.delete(mock_db, context_id)

        # Verify original fields weren't changed
        assert mock_context.id == str(context_id)
        assert mock_context.name == "@home"
        assert mock_context.description == "Home tasks"

    def test_delete_returns_none_when_not_found(self):
        """Should return None when context doesn't exist."""
        context_id = uuid4()

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        result = context_repository.delete(mock_db, context_id)

        assert result is None
        mock_db.commit.assert_not_called()
