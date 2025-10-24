"""Factory Boy factories for test data generation."""

from datetime import UTC, datetime
from uuid import uuid4

import factory
from factory import fuzzy

from app.models.note import Note
from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectStatus
from app.schemas.task import TaskStatus


class ProjectFactory(factory.Factory):
    """Factory for creating Project test instances."""

    class Meta:
        model = Project

    id = factory.LazyFunction(lambda: str(uuid4()))
    name = factory.Sequence(lambda n: f"Project {n}")
    outcome_statement = factory.Faker("sentence")
    status = fuzzy.FuzzyChoice([ProjectStatus.ACTIVE.value, ProjectStatus.ON_HOLD.value, ProjectStatus.COMPLETED.value])
    parent_project_id = None
    created_at = factory.LazyFunction(lambda: datetime.now(UTC))
    updated_at = factory.LazyFunction(lambda: datetime.now(UTC))
    completed_at = None
    archived_at = None
    deleted_at = None
    last_activity_at = factory.LazyFunction(lambda: datetime.now(UTC))


class TaskFactory(factory.Factory):
    """Factory for creating Task test instances."""

    class Meta:
        model = Task

    id = factory.LazyFunction(lambda: str(uuid4()))
    title = factory.Faker("sentence", nb_words=4)
    description = factory.Faker("paragraph")
    status = fuzzy.FuzzyChoice([TaskStatus.NEXT.value, TaskStatus.WAITING.value, TaskStatus.SOMEDAY.value])
    project_id = None
    blocked_by_task_id = None
    scheduled_date = None
    scheduled_time = None
    due_date = None
    created_at = factory.LazyFunction(lambda: datetime.now(UTC))
    updated_at = factory.LazyFunction(lambda: datetime.now(UTC))
    completed_at = None
    archived_at = None
    deleted_at = None


class NoteFactory(factory.Factory):
    """Factory for creating Note test instances."""

    class Meta:
        model = Note

    id = factory.LazyFunction(lambda: str(uuid4()))
    title = factory.Faker("sentence", nb_words=3)
    content = factory.Faker("paragraph", nb_sentences=5)
    project_id = None
    created_at = factory.LazyFunction(lambda: datetime.now(UTC))
    updated_at = factory.LazyFunction(lambda: datetime.now(UTC))
    deleted_at = None


# Convenience functions for creating instances
def create_project(**kwargs):
    """Create a project with optional overrides."""
    return ProjectFactory(**kwargs)


def create_task(**kwargs):
    """Create a task with optional overrides."""
    return TaskFactory(**kwargs)


def create_note(**kwargs):
    """Create a note with optional overrides."""
    return NoteFactory(**kwargs)


def create_completed_task(**kwargs):
    """Create a completed task."""
    defaults = {"completed_at": datetime.now(UTC), "status": TaskStatus.NEXT.value}
    defaults.update(kwargs)
    return TaskFactory(**defaults)


def create_project_with_tasks(num_tasks=3, **kwargs):
    """Create a project with multiple tasks."""
    project = ProjectFactory(**kwargs)
    tasks = [TaskFactory(project_id=project.id) for _ in range(num_tasks)]
    return project, tasks


def create_blocked_task(blocking_task_id, **kwargs):
    """Create a task that is blocked by another task."""
    defaults = {"blocked_by_task_id": blocking_task_id, "status": TaskStatus.WAITING.value}
    defaults.update(kwargs)
    return TaskFactory(**defaults)
