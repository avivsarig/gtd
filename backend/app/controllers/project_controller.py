"""Project controller - Business logic layer for Project operations."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.base_controller import BaseController
from app.models.project import Project
from app.repositories.protocols import ProjectRepositoryProtocol
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectStatus,
    ProjectUpdate,
    ProjectWithStats,
)


class ProjectController(BaseController[Project, ProjectRepositoryProtocol]):
    """Controller for Project entity with business logic."""

    def list_projects(self, db: Session, status: ProjectStatus | None = None) -> list[Project]:
        """Get list of all active (non-deleted) projects.

        Business logic:
        - Only return non-deleted projects
        - Optionally filter by status
        - Ordered by created_at descending

        Args:
            db: Database session
            status: Optional status filter

        Returns:
            List of Project objects
        """
        return self.repository.get_all(db, include_deleted=False, status=status)

    def list_projects_with_stats(
        self, db: Session, status: ProjectStatus | None = None
    ) -> list[ProjectWithStats]:
        """Get list of projects with task statistics.

        Args:
            db: Database session
            status: Optional status filter

        Returns:
            List of ProjectWithStats objects
        """
        projects = self.repository.get_all(db, include_deleted=False, status=status)
        result = []

        for project in projects:
            stats = self.repository.get_task_stats(db, project.id)
            project_response = ProjectResponse.model_validate(project)
            result.append(ProjectWithStats.from_project_and_stats(project_response, stats))

        return result

    def get_project(self, db: Session, project_id: UUID) -> Project | None:
        """Get a single project by ID.

        Args:
            db: Database session
            project_id: UUID of the project to retrieve

        Returns:
            Project object if found and not deleted, None otherwise
        """
        return self.repository.get_by_id(db, project_id)

    def get_project_with_stats(self, db: Session, project_id: UUID) -> ProjectWithStats | None:
        """Get a single project with task statistics.

        Args:
            db: Database session
            project_id: UUID of the project

        Returns:
            ProjectWithStats object if found, None otherwise
        """
        project = self.repository.get_by_id(db, project_id)
        if project is None:
            return None

        stats = self.repository.get_task_stats(db, project.id)
        project_response = ProjectResponse.model_validate(project)
        return ProjectWithStats.from_project_and_stats(project_response, stats)

    def create_project(self, db: Session, project_data: ProjectCreate) -> Project:
        """Create a new project.

        Business logic:
        - Sets initial last_activity_at to creation time

        Args:
            db: Database session
            project_data: Project creation data

        Returns:
            Created Project object
        """
        project = self.repository.create(db, project_data)
        # Set last_activity_at to creation time
        project.last_activity_at = project.created_at
        # Commit and refresh handled by repository
        db.commit()
        db.refresh(project)
        return project

    def update_project(
        self, db: Session, project_id: UUID, project_data: ProjectUpdate
    ) -> Project | None:
        """Update an existing project.

        Business logic:
        - Updates last_activity_at timestamp
        - If status changes to 'completed', sets completed_at

        Args:
            db: Database session
            project_id: UUID of project to update
            project_data: Update data

        Returns:
            Updated Project object if found, None if project doesn't exist
        """
        project = self.repository.get_by_id(db, project_id)
        if project is None:
            return None

        # If changing status to completed, set completed_at
        if project_data.status == ProjectStatus.COMPLETED and project.completed_at is None:
            project.completed_at = datetime.now(UTC)

        # Update last_activity_at
        project.last_activity_at = datetime.now(UTC)

        return self.repository.update(db, project, project_data)

    def delete_project(self, db: Session, project_id: UUID) -> Project | None:
        """Soft delete a project.

        Sets deleted_at timestamp without removing from database.

        Args:
            db: Database session
            project_id: UUID of project to delete

        Returns:
            Deleted Project object if found, None if project doesn't exist
        """
        project = self.repository.get_by_id(db, project_id)
        if project is None:
            return None

        return self.repository.soft_delete(db, project)

    def complete_project(self, db: Session, project_id: UUID) -> Project | None:
        """Mark a project as completed.

        Business logic:
        - Sets completed_at timestamp
        - Changes status to 'completed'
        - Updates last_activity_at

        Args:
            db: Database session
            project_id: UUID of project to complete

        Returns:
            Completed Project object if found, None if project doesn't exist
        """
        project = self.repository.get_by_id(db, project_id)
        if project is None:
            return None

        project.completed_at = datetime.now(UTC)
        project.status = ProjectStatus.COMPLETED.value
        project.last_activity_at = datetime.now(UTC)
        db.commit()
        db.refresh(project)
        return project
