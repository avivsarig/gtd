"""Unit tests for Project controller."""

from datetime import UTC, datetime
from unittest.mock import Mock
from uuid import uuid4

from app.controllers.project_controller import ProjectController
from app.models.project import Project
from app.repositories.protocols import ProjectRepositoryProtocol
from app.schemas.project import (
    ProjectCreate,
    ProjectStatus,
    ProjectUpdate,
    ProjectWithStats,
)


class TestListProjects:
    """Test list_projects() controller method."""

    def test_list_projects_calls_repository(self):
        """Should call repository get_all method with include_deleted=False."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        mock_projects = [
            Mock(spec=Project, name="Project 1"),
            Mock(spec=Project, name="Project 2"),
        ]
        mock_repository.get_all.return_value = mock_projects

        controller = ProjectController(repository=mock_repository)

        result = controller.list_projects(mock_db)

        mock_repository.get_all.assert_called_once_with(mock_db, include_deleted=False, status=None)
        assert result == mock_projects

    def test_list_projects_returns_repository_result(self):
        """Should return exactly what repository returns."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        expected_projects = []
        mock_repository.get_all.return_value = expected_projects

        controller = ProjectController(repository=mock_repository)

        result = controller.list_projects(mock_db)

        assert result == expected_projects


class TestListProjectsWithStats:
    """Test list_projects_with_stats() controller method."""

    def test_list_projects_with_stats_calls_repository(self):
        """Should call repository get_all and get_task_stats methods."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        now = datetime.now(UTC)
        mock_project = Project(
            id=project_id,
            name="Test Project",
            outcome_statement="Test outcome",
            status=ProjectStatus.ACTIVE.value,
            parent_project_id=None,
            created_at=now,
            updated_at=now,
            last_activity_at=now,
            completed_at=None,
            archived_at=None,
            deleted_at=None,
        )
        mock_stats = {
            "task_count": 10,
            "completed_task_count": 5,
            "next_task_count": 3,
        }
        mock_repository.get_all.return_value = [mock_project]
        mock_repository.get_task_stats.return_value = mock_stats

        controller = ProjectController(repository=mock_repository)

        result = controller.list_projects_with_stats(mock_db)

        mock_repository.get_all.assert_called_once_with(mock_db, include_deleted=False, status=None)
        mock_repository.get_task_stats.assert_called_once_with(mock_db, project_id)
        assert len(result) == 1
        assert isinstance(result[0], ProjectWithStats)
        assert result[0].task_count == 10
        assert result[0].completed_task_count == 5
        assert result[0].next_task_count == 3

    def test_list_projects_with_stats_returns_empty_list(self):
        """Should return empty list when no projects exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        mock_repository.get_all.return_value = []

        controller = ProjectController(repository=mock_repository)

        result = controller.list_projects_with_stats(mock_db)

        assert result == []


class TestGetProject:
    """Test get_project() controller method."""

    def test_get_project_calls_repository(self):
        """Should call repository get_by_id method."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        mock_project = Mock(spec=Project, id=project_id, name="Test Project")
        mock_repository.get_by_id.return_value = mock_project

        controller = ProjectController(repository=mock_repository)

        result = controller.get_project(mock_db, project_id)

        mock_repository.get_by_id.assert_called_once_with(mock_db, project_id)
        assert result == mock_project

    def test_get_project_returns_none_when_not_found(self):
        """Should return None when project doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        mock_repository.get_by_id.return_value = None

        controller = ProjectController(repository=mock_repository)

        result = controller.get_project(mock_db, project_id)

        assert result is None


class TestGetProjectWithStats:
    """Test get_project_with_stats() controller method."""

    def test_get_project_with_stats_calls_repository(self):
        """Should call repository get_by_id and get_task_stats methods."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        now = datetime.now(UTC)
        mock_project = Project(
            id=project_id,
            name="Test Project",
            outcome_statement="Test outcome",
            status=ProjectStatus.ACTIVE.value,
            parent_project_id=None,
            created_at=now,
            updated_at=now,
            last_activity_at=now,
            completed_at=None,
            archived_at=None,
            deleted_at=None,
        )
        mock_stats = {
            "task_count": 5,
            "completed_task_count": 2,
            "next_task_count": 2,
        }
        mock_repository.get_by_id.return_value = mock_project
        mock_repository.get_task_stats.return_value = mock_stats

        controller = ProjectController(repository=mock_repository)

        result = controller.get_project_with_stats(mock_db, project_id)

        mock_repository.get_by_id.assert_called_once_with(mock_db, project_id)
        mock_repository.get_task_stats.assert_called_once_with(mock_db, project_id)
        assert isinstance(result, ProjectWithStats)
        assert result.task_count == 5
        assert result.completed_task_count == 2
        assert result.next_task_count == 2

    def test_get_project_with_stats_returns_none_when_not_found(self):
        """Should return None when project doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        mock_repository.get_by_id.return_value = None

        controller = ProjectController(repository=mock_repository)

        result = controller.get_project_with_stats(mock_db, project_id)

        assert result is None
        mock_repository.get_task_stats.assert_not_called()


class TestCreateProject:
    """Test create_project() controller method."""

    def test_create_project_calls_repository(self):
        """Should call repository create method and set last_activity_at."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_data = ProjectCreate(name="New Project", description="Test project")
        mock_project = Mock(
            spec=Project,
            created_at=datetime.now(UTC),
            last_activity_at=None,
        )
        mock_repository.create.return_value = mock_project

        controller = ProjectController(repository=mock_repository)

        result = controller.create_project(mock_db, project_data)

        mock_repository.create.assert_called_once_with(mock_db, project_data)
        assert mock_project.last_activity_at == mock_project.created_at
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_project)
        assert result == mock_project


class TestUpdateProject:
    """Test update_project() controller method."""

    def test_update_project_calls_repository(self):
        """Should call repository update method and update timestamps."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        project_data = ProjectUpdate(description="Updated description")
        mock_project = Mock(
            spec=Project,
            completed_at=None,
            last_activity_at=datetime.now(UTC),
        )
        mock_updated_project = Mock(spec=Project)
        mock_repository.get_by_id.return_value = mock_project
        mock_repository.update.return_value = mock_updated_project

        controller = ProjectController(repository=mock_repository)
        result = controller.update_project(mock_db, project_id, project_data)

        mock_repository.get_by_id.assert_called_once_with(mock_db, project_id)
        mock_repository.update.assert_called_once_with(mock_db, mock_project, project_data)
        assert isinstance(mock_project.last_activity_at, datetime)
        assert result == mock_updated_project

    def test_update_project_sets_completed_at_when_status_completed(self):
        """Should set completed_at when status changes to completed."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        project_data = ProjectUpdate(status=ProjectStatus.COMPLETED)
        mock_project = Mock(
            spec=Project,
            completed_at=None,
            last_activity_at=datetime.now(UTC),
        )
        mock_updated_project = Mock(spec=Project)
        mock_repository.get_by_id.return_value = mock_project
        mock_repository.update.return_value = mock_updated_project

        controller = ProjectController(repository=mock_repository)
        result = controller.update_project(mock_db, project_id, project_data)

        assert isinstance(mock_project.completed_at, datetime)
        assert result == mock_updated_project

    def test_update_project_does_not_override_existing_completed_at(self):
        """Should not override completed_at if already set."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        existing_completed_at = datetime.now(UTC)
        project_data = ProjectUpdate(status=ProjectStatus.COMPLETED)
        mock_project = Mock(
            spec=Project,
            completed_at=existing_completed_at,
            last_activity_at=datetime.now(UTC),
        )
        mock_updated_project = Mock(spec=Project)
        mock_repository.get_by_id.return_value = mock_project
        mock_repository.update.return_value = mock_updated_project

        controller = ProjectController(repository=mock_repository)
        result = controller.update_project(mock_db, project_id, project_data)

        assert mock_project.completed_at == existing_completed_at
        assert result == mock_updated_project

    def test_update_project_returns_none_when_not_found(self):
        """Should return None when project doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        project_data = ProjectUpdate(description="Updated")
        mock_repository.get_by_id.return_value = None

        controller = ProjectController(repository=mock_repository)
        result = controller.update_project(mock_db, project_id, project_data)

        assert result is None
        mock_repository.update.assert_not_called()


class TestDeleteProject:
    """Test delete_project() controller method (soft-delete)."""

    def test_delete_project_calls_repository(self):
        """Should call repository soft_delete method."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        mock_project = Mock(spec=Project, id=project_id, name="Test Project")
        mock_deleted_project = Mock(spec=Project)
        mock_repository.get_by_id.return_value = mock_project
        mock_repository.soft_delete.return_value = mock_deleted_project

        controller = ProjectController(repository=mock_repository)

        result = controller.delete_project(mock_db, project_id)

        mock_repository.get_by_id.assert_called_once_with(mock_db, project_id)
        mock_repository.soft_delete.assert_called_once_with(mock_db, mock_project)
        assert result == mock_deleted_project

    def test_delete_project_returns_none_when_not_found(self):
        """Should return None when project doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        mock_repository.get_by_id.return_value = None

        controller = ProjectController(repository=mock_repository)

        result = controller.delete_project(mock_db, project_id)

        assert result is None
        mock_repository.soft_delete.assert_not_called()


class TestCompleteProject:
    """Test complete_project() controller method."""

    def test_complete_project_sets_completed_at_and_status(self):
        """Should set completed_at, status, and last_activity_at."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        mock_project = Mock(
            spec=Project,
            id=project_id,
            completed_at=None,
            status=ProjectStatus.ACTIVE.value,
            last_activity_at=datetime.now(UTC),
        )
        mock_repository.get_by_id.return_value = mock_project

        controller = ProjectController(repository=mock_repository)

        result = controller.complete_project(mock_db, project_id)

        mock_repository.get_by_id.assert_called_once_with(mock_db, project_id)
        assert isinstance(mock_project.completed_at, datetime)
        assert mock_project.status == ProjectStatus.COMPLETED.value
        assert isinstance(mock_project.last_activity_at, datetime)
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_project)
        assert result == mock_project

    def test_complete_project_returns_none_when_not_found(self):
        """Should return None when project doesn't exist."""
        mock_db = Mock()
        mock_repository = Mock(spec=ProjectRepositoryProtocol)
        project_id = uuid4()
        mock_repository.get_by_id.return_value = None

        controller = ProjectController(repository=mock_repository)

        result = controller.complete_project(mock_db, project_id)

        assert result is None
        mock_db.commit.assert_not_called()
