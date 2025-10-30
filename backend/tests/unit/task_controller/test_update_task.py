"""Unit tests for update_task() controller method."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers import task_controller
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol
from app.schemas.task import TaskStatus, TaskUpdate


class TestUpdateTask:
    """Test update_task() controller method."""

    def test_update_task_calls_repository(self):
        """Should fetch task and call repository update."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, title="Old title")
        update_data = TaskUpdate(title="New title")
        mock_repository.get_by_id.return_value = mock_task
        mock_repository.update.return_value = mock_task

        task_controller.update_task(mock_db, mock_repository, task_id, update_data)

        mock_repository.get_by_id.assert_called_once_with(mock_db, task_id)
        mock_repository.update.assert_called_once_with(mock_db, mock_task, update_data)

    def test_update_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        update_data = TaskUpdate(title="New title")
        mock_repository.get_by_id.return_value = None

        created_task = task_controller.update_task(mock_db, mock_repository, task_id, update_data)

        assert created_task is None
        # Should not call update if task not found
        mock_repository.get_by_id.assert_called_once()

    def test_update_task_with_blocked_by_sets_waiting_status(self):
        """Should set status to 'waiting' when blocked_by_task_id is set."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        blocking_task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, status="next")

        update_data = TaskUpdate(title="Blocked task", blocked_by_task_id=blocking_task_id)
        mock_repository.get_by_id.return_value = mock_task
        mock_repository.update.return_value = mock_task

        task_controller.update_task(mock_db, mock_repository, task_id, update_data)

        # Verify status was auto-set to waiting
        assert update_data.status == TaskStatus.WAITING

    def test_update_task_without_blocked_by_keeps_status(self):
        """Should not change status when blocked_by_task_id is not set."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id)

        update_data = TaskUpdate(title="Updated title")
        mock_repository.get_by_id.return_value = mock_task
        mock_repository.update.return_value = mock_task

        task_controller.update_task(mock_db, mock_repository, task_id, update_data)

        # Status should not be set
        assert update_data.status is None
