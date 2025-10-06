"""Unit tests for Task repository."""

from datetime import datetime
from unittest.mock import Mock
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
            task3,
            task2,
            task1,
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
        assert hasattr(order_arg, "element")  # SQLAlchemy UnaryExpression


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

        with patch("app.repositories.task_repository.Task", return_value=mock_task):
            result = task_repository.create(mock_db, task_data)

        # Verify database operations were called
        mock_db.add.assert_called_once_with(mock_task)
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_task)
        assert result == mock_task

    def test_create_task_with_all_fields(self):
        """Should create task with all fields."""
        from datetime import date

        from app.schemas.task import TaskCreate

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

        with patch("app.repositories.task_repository.Task", return_value=mock_task) as MockTask:
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


class TestGetById:
    """Test get_by_id() repository method."""

    def test_get_by_id_returns_task(self):
        """Should return task when found."""

        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, title="Found task")

        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.first.return_value = mock_task

        result = task_repository.get_by_id(mock_db, task_id)

        # Verify query was constructed correctly
        mock_db.query.assert_called_once_with(Task)
        mock_query.filter.assert_called_once()
        assert result == mock_task

    def test_get_by_id_returns_none_when_not_found(self):
        """Should return None when task doesn't exist."""

        task_id = uuid4()

        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.first.return_value = None

        result = task_repository.get_by_id(mock_db, task_id)

        assert result is None

    def test_get_by_id_excludes_deleted_tasks(self):
        """Should not return deleted tasks."""

        task_id = uuid4()

        # Mock database session - return None for deleted task
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.first.return_value = None

        result = task_repository.get_by_id(mock_db, task_id)

        # Verify filter includes deleted_at check
        mock_query.filter.assert_called_once()
        assert result is None


class TestUpdate:
    """Test update() repository method."""

    def test_update_task_with_partial_data(self):
        """Should update only provided fields."""
        from app.schemas.task import TaskUpdate

        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, title="Old title", description="Old description")
        mock_db = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Update only title
        update_data = TaskUpdate(title="New title")

        result = task_repository.update(mock_db, mock_task, update_data)

        # Verify title was updated
        assert mock_task.title == "New title"
        # Verify commit and refresh were called
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_task)
        assert result == mock_task

    def test_update_task_with_multiple_fields(self):
        """Should update multiple fields at once."""
        from datetime import date

        from app.schemas.task import TaskUpdate

        mock_task = Mock(spec=Task, title="Old", status="next", scheduled_date=None)
        mock_db = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Update multiple fields
        update_data = TaskUpdate(
            title="Updated title", status="waiting", scheduled_date=date(2025, 10, 15)
        )

        result = task_repository.update(mock_db, mock_task, update_data)

        # Verify all fields were updated
        assert mock_task.title == "Updated title"
        assert mock_task.status == "waiting"
        assert mock_task.scheduled_date == date(2025, 10, 15)
        mock_db.commit.assert_called_once()

    def test_update_task_with_none_fields_ignored(self):
        """Should not update fields that are None/unset."""
        from app.schemas.task import TaskUpdate

        mock_task = Mock(spec=Task, title="Original title", description="Original desc")
        mock_db = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Create update with no fields set
        update_data = TaskUpdate()

        task_repository.update(mock_db, mock_task, update_data)

        # Original values should remain
        assert mock_task.title == "Original title"
        assert mock_task.description == "Original desc"


class TestSoftDelete:
    """Test soft_delete() repository method."""

    def test_soft_delete_sets_deleted_at(self):
        """Should set deleted_at timestamp."""

        mock_task = Mock(spec=Task, deleted_at=None)
        mock_db = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        result = task_repository.soft_delete(mock_db, mock_task)

        # Verify deleted_at was set
        assert mock_task.deleted_at is not None
        assert isinstance(mock_task.deleted_at, datetime)
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_task)
        assert result == mock_task

    def test_soft_delete_preserves_task_data(self):
        """Should only set deleted_at, not modify other fields."""

        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, title="My task", deleted_at=None)
        mock_db = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        task_repository.soft_delete(mock_db, mock_task)

        # Other fields should remain unchanged
        assert mock_task.id == task_id
        assert mock_task.title == "My task"
