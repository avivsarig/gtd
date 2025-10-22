"""Pytest configuration and shared fixtures."""

import os
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.database import Base, get_db
from app.main import app
from app.models.context import Context
from app.models.note import Note
from app.models.project import Project
from app.models.task import Task


@pytest.fixture(scope="function")
def db_session():
    """
    Create a fresh in-memory SQLite database for each test.

    Use this fixture for unit tests that need fast, isolated database access.

    Yields:
        SQLAlchemy Session for testing
    """
    # Create in-memory SQLite database
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create session factory
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create session
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session_postgres():
    """
    Create a PostgreSQL database session for integration tests.

    This fixture connects to the test PostgreSQL database and cleans up
    all data after each test to ensure test isolation.

    Use this fixture for integration tests that need PostgreSQL-specific
    features or realistic database behavior.

    Note: This assumes the test database schema is already set up.
    Run migrations on the test database before running tests.

    Yields:
        SQLAlchemy Session connected to test PostgreSQL database
    """
    from sqlalchemy import text

    # Use test database URL from settings
    test_db_url = settings.DATABASE_TEST_URL

    # Create engine for test database
    engine = create_engine(test_db_url)

    # Create session factory
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create session
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        # Clean up all data after test (keep schema intact)
        session.rollback()
        with engine.begin() as conn:
            # Truncate all tables to clean up test data
            conn.execute(text("TRUNCATE tasks, notes, projects, contexts, inbox_items, task_contexts, note_task_links CASCADE"))
        session.close()
        engine.dispose()


@pytest.fixture(scope="function")
def db(db_session):
    """Alias for db_session for convenience."""
    return db_session


@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a test client with SQLite database dependency override.

    Use this fixture for unit/API tests that don't require PostgreSQL.

    Args:
        db_session: Test database session fixture (SQLite)

    Yields:
        FastAPI TestClient
    """

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client_postgres(db_session_postgres):
    """
    Create a test client with PostgreSQL database dependency override.

    Use this fixture for integration tests that require PostgreSQL.

    Args:
        db_session_postgres: Test database session fixture (PostgreSQL)

    Yields:
        FastAPI TestClient
    """

    def override_get_db():
        try:
            yield db_session_postgres
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# Model instance fixtures
@pytest.fixture
def sample_project(db_session):
    """Create and persist a sample project."""
    project = Project(
        name="Test Project", outcome_statement="Complete all testing", status="active"
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture
def sample_task(db_session):
    """Create and persist a sample task."""
    task = Task(title="Test Task", description="This is a test task", status="next")
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task


@pytest.fixture
def sample_note(db_session):
    """Create and persist a sample note."""
    note = Note(title="Test Note", content="This is test content for the note")
    db_session.add(note)
    db_session.commit()
    db_session.refresh(note)
    return note


@pytest.fixture
def sample_task_with_project(db_session, sample_project):
    """Create a task associated with a project."""
    task = Task(
        title="Project Task",
        description="Task in a project",
        status="next",
        project_id=sample_project.id,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task


@pytest.fixture
def multiple_tasks(db_session):
    """Create multiple tasks with different statuses."""
    tasks = [
        Task(title="Next Task", status="next"),
        Task(title="Waiting Task", status="waiting"),
        Task(title="Someday Task", status="someday"),
        Task(title="Completed Task", status="next", completed_at=datetime.now(UTC)),
    ]
    for task in tasks:
        db_session.add(task)
    db_session.commit()
    for task in tasks:
        db_session.refresh(task)
    return tasks


@pytest.fixture
def multiple_projects(db_session):
    """Create multiple projects with different statuses."""
    projects = [
        Project(name="Active Project", status="active"),
        Project(name="On Hold Project", status="on_hold"),
        Project(name="Completed Project", status="completed"),
    ]
    for project in projects:
        db_session.add(project)
    db_session.commit()
    for project in projects:
        db_session.refresh(project)
    return projects
