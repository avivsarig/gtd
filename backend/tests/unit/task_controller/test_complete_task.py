"""Unit tests for complete_task() controller method."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers.task_controller import TaskController
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol


class TestCompleteTask:
    """Test complete_task() controller method."""

    def test_complete_task_sets_completed_at_timestamp(self):
        """Should set completed_at to current time."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, completed_at=None)
        mock_repository.get_by_id.return_value = mock_task

        controller = TaskController(repository=mock_repository)

        controller.complete_task(mock_db, task_id)

        assert mock_task.completed_at is not None
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_task)

    def test_complete_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_repository.get_by_id.return_value = None

        controller = TaskController(repository=mock_repository)

        created_task = controller.complete_task(mock_db, task_id)

        assert created_task is None
        mock_db.commit.assert_not_called()
