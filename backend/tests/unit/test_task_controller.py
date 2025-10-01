"""Unit tests for Task controller."""
from unittest.mock import Mock, patch

from app.models.task import Task
from app.controllers import task_controller


class TestListTasks:
    """Test list_tasks() controller method."""

    def test_list_tasks_calls_repository(self):
        """Should call repository get_all with include_deleted=False."""
        mock_db = Mock()
        mock_tasks = [
            Mock(spec=Task, title="Task 1"),
            Mock(spec=Task, title="Task 2"),
        ]

        with patch('app.controllers.task_controller.task_repository.get_all', return_value=mock_tasks) as mock_get_all:
            result = task_controller.list_tasks(mock_db)

            # Verify repository was called correctly
            mock_get_all.assert_called_once_with(mock_db, include_deleted=False)
            assert result == mock_tasks

    def test_list_tasks_returns_repository_result(self):
        """Should return exactly what repository returns."""
        mock_db = Mock()
        expected_tasks = []

        with patch('app.controllers.task_controller.task_repository.get_all', return_value=expected_tasks) as mock_get_all:
            result = task_controller.list_tasks(mock_db)

            assert result == expected_tasks


class TestCreateTask:
    """Test create_task() controller method."""

    def test_create_task_calls_repository(self):
        """Should call repository create method."""
        from app.schemas.task import TaskCreate

        mock_db = Mock()
        task_data = TaskCreate(title="Test task")
        mock_task = Mock(spec=Task)

        with patch('app.controllers.task_controller.task_repository.create', return_value=mock_task) as mock_create:
            result = task_controller.create_task(mock_db, task_data)

            mock_create.assert_called_once_with(mock_db, task_data)
            assert result == mock_task

    def test_create_task_with_blocked_by_sets_waiting_status(self):
        """Should automatically set status to 'waiting' if task is blocked."""
        from app.schemas.task import TaskCreate
        from uuid import uuid4

        mock_db = Mock()
        blocking_task_id = uuid4()

        # Create task with blocked_by set
        task_data = TaskCreate(
            title="Blocked task",
            status="next",  # User tries to set to 'next'
            blocked_by_task_id=blocking_task_id
        )
        mock_task = Mock(spec=Task, status="waiting")

        with patch('app.controllers.task_controller.task_repository.create', return_value=mock_task) as mock_create:
            result = task_controller.create_task(mock_db, task_data)

            # Verify status was changed to 'waiting'
            assert task_data.status == "waiting"
            mock_create.assert_called_once_with(mock_db, task_data)

    def test_create_task_without_blocked_by_keeps_original_status(self):
        """Should keep original status if task is not blocked."""
        from app.schemas.task import TaskCreate

        mock_db = Mock()
        task_data = TaskCreate(title="Normal task", status="next")
        mock_task = Mock(spec=Task, status="next")

        with patch('app.controllers.task_controller.task_repository.create', return_value=mock_task) as mock_create:
            result = task_controller.create_task(mock_db, task_data)

            # Verify status was NOT changed
            assert task_data.status == "next"
            mock_create.assert_called_once()

    def test_create_task_uses_default_status(self):
        """Should use default 'next' status when none provided."""
        from app.schemas.task import TaskCreate

        mock_db = Mock()
        task_data = TaskCreate(title="Task with default status")
        mock_task = Mock(spec=Task)

        with patch('app.controllers.task_controller.task_repository.create', return_value=mock_task) as mock_create:
            result = task_controller.create_task(mock_db, task_data)

            # Default status from schema should be 'next'
            assert task_data.status == "next"
            mock_create.assert_called_once()
