"""Unit tests for Context controller."""

from unittest.mock import Mock, patch
from uuid import uuid4

from fastapi import HTTPException
from pytest import raises

from app.controllers import context_controller
from app.models.context import Context
from app.schemas.context import ContextCreate, ContextUpdate


class TestListContexts:
    """Test list_contexts() controller method."""

    def test_list_contexts_calls_repository(self):
        """Should call repository get_all method."""
        mock_db = Mock()
        mock_contexts = [
            Mock(spec=Context, name="@home"),
            Mock(spec=Context, name="@work"),
        ]

        with patch(
            "app.controllers.context_controller.context_repository.get_all",
            return_value=mock_contexts,
        ) as mock_get_all:
            result = context_controller.list_contexts(mock_db)

            mock_get_all.assert_called_once_with(mock_db)
            assert result == mock_contexts

    def test_list_contexts_returns_repository_result(self):
        """Should return exactly what repository returns."""
        mock_db = Mock()
        expected_contexts = []

        with patch(
            "app.controllers.context_controller.context_repository.get_all",
            return_value=expected_contexts,
        ):
            result = context_controller.list_contexts(mock_db)

            assert result == expected_contexts


class TestGetContext:
    """Test get_context() controller method."""

    def test_get_context_calls_repository(self):
        """Should call repository get_by_id method."""
        mock_db = Mock()
        context_id = uuid4()
        mock_context = Mock(spec=Context, id=str(context_id), name="@home")

        with patch(
            "app.controllers.context_controller.context_repository.get_by_id",
            return_value=mock_context,
        ) as mock_get_by_id:
            result = context_controller.get_context(mock_db, context_id)

            mock_get_by_id.assert_called_once_with(mock_db, context_id)
            assert result == mock_context

    def test_get_context_returns_none_when_not_found(self):
        """Should return None when context doesn't exist."""
        mock_db = Mock()
        context_id = uuid4()

        with patch(
            "app.controllers.context_controller.context_repository.get_by_id", return_value=None
        ):
            result = context_controller.get_context(mock_db, context_id)

            assert result is None


class TestCreateContext:
    """Test create_context() controller method."""

    def test_create_context_calls_repository(self):
        """Should call repository create method."""
        mock_db = Mock()
        context_data = ContextCreate(name="@home", description="Home tasks")
        mock_context = Mock(spec=Context)

        with (
            patch(
                "app.controllers.context_controller.context_repository.get_by_name",
                return_value=None,
            ),
            patch(
                "app.controllers.context_controller.context_repository.create",
                return_value=mock_context,
            ) as mock_create,
        ):
            result = context_controller.create_context(mock_db, context_data)

            mock_create.assert_called_once_with(mock_db, context_data)
            assert result == mock_context

    def test_create_context_raises_409_when_name_exists(self):
        """Should raise HTTPException when context name already exists."""
        mock_db = Mock()
        context_data = ContextCreate(name="@home")
        existing_context = Mock(spec=Context, name="@home")

        with patch(
            "app.controllers.context_controller.context_repository.get_by_name",
            return_value=existing_context,
        ):
            with raises(HTTPException) as exc_info:
                context_controller.create_context(mock_db, context_data)

            assert exc_info.value.status_code == 409
            assert "@home" in exc_info.value.detail


class TestUpdateContext:
    """Test update_context() controller method."""

    def test_update_context_calls_repository(self):
        """Should call repository update method."""
        mock_db = Mock()
        context_id = uuid4()
        context_data = ContextUpdate(description="Updated description")
        mock_context = Mock(spec=Context)

        with patch(
            "app.controllers.context_controller.context_repository.update",
            return_value=mock_context,
        ) as mock_update:
            result = context_controller.update_context(mock_db, context_id, context_data)

            mock_update.assert_called_once_with(mock_db, context_id, context_data)
            assert result == mock_context

    def test_update_context_raises_409_when_name_conflicts(self):
        """Should raise HTTPException when new name conflicts with existing context."""
        mock_db = Mock()
        context_id = uuid4()
        other_context_id = uuid4()
        context_data = ContextUpdate(name="@work")
        existing_context = Mock(spec=Context, id=str(other_context_id), name="@work")

        with patch(
            "app.controllers.context_controller.context_repository.get_by_name",
            return_value=existing_context,
        ):
            with raises(HTTPException) as exc_info:
                context_controller.update_context(mock_db, context_id, context_data)

            assert exc_info.value.status_code == 409
            assert "@work" in exc_info.value.detail

    def test_update_context_allows_same_name_for_same_context(self):
        """Should allow updating context with its own name."""
        mock_db = Mock()
        context_id = uuid4()
        context_data = ContextUpdate(name="@home", description="Updated")
        existing_context = Mock(spec=Context, id=context_id, name="@home")
        updated_context = Mock(spec=Context, id=context_id, name="@home")

        with (
            patch(
                "app.controllers.context_controller.context_repository.get_by_name",
                return_value=existing_context,
            ),
            patch(
                "app.controllers.context_controller.context_repository.update",
                return_value=updated_context,
            ) as mock_update,
        ):
            result = context_controller.update_context(mock_db, context_id, context_data)

            mock_update.assert_called_once_with(mock_db, context_id, context_data)
            assert result == updated_context


class TestDeleteContext:
    """Test delete_context() controller method (soft-delete)."""

    def test_delete_context_calls_repository(self):
        """Should call repository delete method (soft-delete)."""
        mock_db = Mock()
        context_id = uuid4()
        mock_context = Mock(spec=Context, id=str(context_id), name="@home")

        with patch(
            "app.controllers.context_controller.context_repository.delete",
            return_value=mock_context,
        ) as mock_delete:
            result = context_controller.delete_context(mock_db, context_id)

            mock_delete.assert_called_once_with(mock_db, context_id)
            assert result == mock_context

    def test_delete_context_returns_none_when_not_found(self):
        """Should return None when context doesn't exist."""
        mock_db = Mock()
        context_id = uuid4()

        with patch(
            "app.controllers.context_controller.context_repository.delete", return_value=None
        ):
            result = context_controller.delete_context(mock_db, context_id)

            assert result is None
