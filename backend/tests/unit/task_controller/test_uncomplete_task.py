"""Unit tests for uncomplete_task() controller method."""

from datetime import UTC, datetime
from unittest.mock import Mock
from uuid import uuid4

from app.controllers.task_controller import TaskController
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol


class TestUncompleteTask:
    """Test uncomplete_task() controller method."""

    def test_uncomplete_task_clears_completed_at(self):
        """Should clear completed_at timestamp."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, completed_at=datetime.now(UTC))
        mock_repository.get_by_id.return_value = mock_task

        controller = TaskController(repository=mock_repository)

        controller.uncomplete_task(mock_db, task_id)

        assert mock_task.completed_at is None
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_task)

    def test_uncomplete_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_repository.get_by_id.return_value = None

        controller = TaskController(repository=mock_repository)

        created_task = controller.uncomplete_task(mock_db, task_id)

        assert created_task is None
        mock_db.commit.assert_not_called()
