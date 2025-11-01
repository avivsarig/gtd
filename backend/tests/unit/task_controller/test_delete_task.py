"""Unit tests for delete_task() controller method."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers.task_controller import TaskController
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol


class TestDeleteTask:
    """Test delete_task() controller method."""

    def test_delete_task_calls_repository(self):
        """Should fetch task and call repository soft_delete."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id)
        mock_repository.get_by_id.return_value = mock_task
        mock_repository.soft_delete.return_value = mock_task

        controller = TaskController(repository=mock_repository)

        result = controller.delete_task(mock_db, task_id)

        mock_repository.get_by_id.assert_called_once_with(mock_db, task_id)
        mock_repository.soft_delete.assert_called_once_with(mock_db, mock_task)
        assert result == mock_task

    def test_delete_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_repository.get_by_id.return_value = None

        controller = TaskController(repository=mock_repository)

        created_task = controller.delete_task(mock_db, task_id)

        assert created_task is None
        # Should not call soft_delete if task not found
        mock_repository.get_by_id.assert_called_once()
