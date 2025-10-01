"""Unit tests for Task repository."""
from unittest.mock import Mock, MagicMock
from datetime import datetime
from uuid import uuid4

from app.models.task import Task
from app.repositories import task_repository


class TestGetAll:
    """Test get_all() repository method."""

    def test_get_all_empty_database(self):
        """Should return empty list when no tasks exist."""
        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.order_by.return_value.all.return_value = []

        tasks = task_repository.get_all(mock_db)

        assert tasks == []
        mock_db.query.assert_called_once_with(Task)

    def test_get_all_returns_tasks(self):
        """Should return all non-deleted tasks ordered by created_at desc."""
        # Create mock tasks
        task1 = Mock(spec=Task, title="First task", deleted_at=None)
        task2 = Mock(spec=Task, title="Second task", deleted_at=None)
        task3 = Mock(spec=Task, title="Third task", deleted_at=None)

        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.order_by.return_value.all.return_value = [
            task3, task2, task1
        ]

        tasks = task_repository.get_all(mock_db)

        assert len(tasks) == 3
        assert tasks[0].title == "Third task"
        assert tasks[1].title == "Second task"
        assert tasks[2].title == "First task"

    def test_get_all_filters_deleted_by_default(self):
        """Should filter out deleted tasks by default."""
        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.order_by.return_value.all.return_value = []

        task_repository.get_all(mock_db)

        # Verify filter was called (checking deleted_at == None)
        mock_query.filter.assert_called_once()

    def test_get_all_with_include_deleted(self):
        """Should skip deleted filter when include_deleted=True."""
        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.order_by.return_value.all.return_value = []

        task_repository.get_all(mock_db, include_deleted=True)

        # Verify filter was NOT called when include_deleted=True
        mock_query.filter.assert_not_called()
        mock_query.order_by.assert_called_once()

    def test_get_all_orders_by_created_at_desc(self):
        """Should order tasks by created_at descending."""
        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.order_by.return_value.all.return_value = []

        task_repository.get_all(mock_db)

        # Verify order_by was called
        mock_filter.order_by.assert_called_once()
        # The argument to order_by should be Task.created_at.desc()
        order_arg = mock_filter.order_by.call_args[0][0]
        assert hasattr(order_arg, 'element')  # SQLAlchemy UnaryExpression


class TestCreate:
    """Test create() repository method."""

    def test_create_task_with_minimal_data(self):
        """Should create task with just title."""
        from app.schemas.task import TaskCreate

        # Mock database session
        mock_db = Mock()
        mock_task = Mock(spec=Task, title="Test task", description=None)
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Create task data
        task_data = TaskCreate(title="Test task")

        # We need to mock the Task constructor to return our mock
        from unittest.mock import patch
        with patch('app.repositories.task_repository.Task', return_value=mock_task):
            result = task_repository.create(mock_db, task_data)

        # Verify database operations were called
        mock_db.add.assert_called_once_with(mock_task)
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_task)
        assert result == mock_task

    def test_create_task_with_all_fields(self):
        """Should create task with all fields."""
        from app.schemas.task import TaskCreate
        from datetime import date
        from uuid import uuid4

        project_id = uuid4()
        blocked_by_id = uuid4()

        # Mock database session
        mock_db = Mock()
        mock_task = Mock(spec=Task)
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Create task data with all fields
        task_data = TaskCreate(
            title="Complete task",
            description="Task description",
            status="waiting",
            scheduled_date=date(2025, 10, 15),
            due_date=date(2025, 10, 20),
            project_id=project_id,
            blocked_by_task_id=blocked_by_id,
        )

        # Mock the Task constructor
        from unittest.mock import patch
        with patch('app.repositories.task_repository.Task', return_value=mock_task) as MockTask:
            result = task_repository.create(mock_db, task_data)

            # Verify Task was constructed with correct data
            MockTask.assert_called_once_with(
                title="Complete task",
                description="Task description",
                status="waiting",
                scheduled_date=date(2025, 10, 15),
                scheduled_time=None,
                due_date=date(2025, 10, 20),
                project_id=project_id,
                blocked_by_task_id=blocked_by_id,
            )

        # Verify database operations
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
        assert result == mock_task
