"""Unit tests for get_task() controller method."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers import task_controller
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol


class TestGetTask:
    """Test get_task() controller method."""

    def test_get_task_calls_repository(self):
        """Should call repository get_by_id method."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, title="Test task")
        mock_repository.get_by_id.return_value = mock_task

        created_task = task_controller.get_task(mock_db, mock_repository, task_id)

        mock_repository.get_by_id.assert_called_once_with(mock_db, task_id)
        assert created_task == mock_task

    def test_get_task_returns_none_when_not_found(self):
        """Should return None when task doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_repository.get_by_id.return_value = None

        result = task_controller.get_task(mock_db, mock_repository, task_id)

        assert result is None
