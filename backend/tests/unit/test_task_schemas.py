"""Unit tests for Task Pydantic schemas."""

from datetime import UTC, date, datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.task import TaskCreate, TaskResponse, TaskStatus, TaskUpdate


class TestTaskCreate:
    """Test TaskCreate schema validation."""

    def test_create_with_title_only(self):
        """Should create task with just a title."""
        task = TaskCreate(title="Test task")
        assert task.title == "Test task"
        assert task.description is None
        assert task.status == TaskStatus.NEXT  # Default status

    def test_create_with_all_fields(self):
        """Should create task with all fields."""
        project_id = uuid4()
        task = TaskCreate(
            title="Complete task",
            description="Task description",
            status=TaskStatus.WAITING,
            scheduled_date=date(2025, 10, 15),
            due_date=date(2025, 10, 20),
            project_id=project_id,
        )
        assert task.title == "Complete task"
        assert task.description == "Task description"
        assert task.status == TaskStatus.WAITING
        assert task.scheduled_date == date(2025, 10, 15)
        assert task.project_id == project_id

    def test_create_without_title_fails(self):
        """Should fail validation without title."""
        with pytest.raises(ValidationError) as exc:
            TaskCreate()
        assert "title" in str(exc.value)

    def test_create_with_empty_title_fails(self):
        """Should fail validation with empty title."""
        with pytest.raises(ValidationError) as exc:
            TaskCreate(title="")
        assert "title" in str(exc.value)

    def test_create_with_too_long_title_fails(self):
        """Should fail validation with title > 500 chars."""
        with pytest.raises(ValidationError) as exc:
            TaskCreate(title="x" * 501)
        assert "title" in str(exc.value)


class TestTaskUpdate:
    """Test TaskUpdate schema validation."""

    def test_update_partial_fields(self):
        """Should allow updating only some fields."""
        task = TaskUpdate(title="New title")
        assert task.title == "New title"
        assert task.description is None
        assert task.status is None

    def test_update_all_optional(self):
        """Should allow empty update (all fields optional)."""
        task = TaskUpdate()
        assert task.title is None
        assert task.status is None


class TestTaskResponse:
    """Test TaskResponse schema."""

    def test_response_from_dict(self):
        """Should create response from dict."""
        task_id = uuid4()
        now = datetime.now(UTC)
        data = {
            "id": task_id,
            "title": "Test task",
            "description": "Description",
            "status": TaskStatus.NEXT.value,
            "scheduled_date": None,
            "scheduled_time": None,
            "due_date": None,
            "project_id": None,
            "blocked_by_task_id": None,
            "created_at": now,
            "updated_at": now,
            "completed_at": None,
            "archived_at": None,
        }
        task = TaskResponse(**data)
        assert task.id == task_id
        assert task.title == "Test task"
        assert task.status == TaskStatus.NEXT.value
        assert task.created_at == now
