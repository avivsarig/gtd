# Testing Guide

Comprehensive testing framework for the GTD Task Management System.

## Overview

The project uses a multi-layered testing approach:
- **Backend**: pytest with coverage, factories, and fixtures
- **Frontend**: Vitest + React Testing Library
- **Coverage**: Automated coverage reporting with thresholds

## Backend Testing

### Tech Stack
- **pytest** - Test framework
- **pytest-cov** - Coverage reporting
- **pytest-xdist** - Parallel test execution
- **pytest-mock** - Mocking utilities
- **factory-boy** - Test data factories
- **faker** - Realistic fake data generation

### Running Tests

```bash
# All tests
make test

# Unit tests only
make test-unit

# Integration tests only (note: SQLite compatibility issues)
make test-int

# With coverage report
make test-cov

# Fast tests (exclude slow tests)
make test-fast
```

### Test Structure

```
backend/tests/
├── conftest.py              # Shared fixtures
├── fixtures/
│   ├── __init__.py
│   └── factories.py         # Factory Boy factories
├── unit/                    # Unit tests
│   ├── test_task_repository.py
│   ├── test_task_controller.py
│   ├── test_note_repository.py
│   └── test_note_controller.py
└── integration/             # Integration tests
    ├── test_task_api.py
    ├── test_note_api.py
    └── test_project_api.py
```

### Available Fixtures

#### Database Fixtures
- `db_session` - Fresh in-memory SQLite database for each test
- `db` - Alias for db_session
- `client` - TestClient with database override

#### Model Fixtures
- `sample_project` - Single project instance
- `sample_task` - Single task instance
- `sample_note` - Single note instance
- `sample_task_with_project` - Task associated with project
- `multiple_tasks` - List of tasks with different statuses
- `multiple_projects` - List of projects with different statuses

### Using Factories

```python
from tests.fixtures.factories import create_task, create_project, create_note

# Create instances with defaults
task = create_task()
project = create_project(name="Custom Project")
note = create_note(title="Custom Note", content="Content here")

# Create with relationships
project, tasks = create_project_with_tasks(num_tasks=5)

# Create completed task
completed_task = create_completed_task(title="Done Task")

# Create blocked task
blocked_task = create_blocked_task(blocking_task_id=task.id)
```

### Writing Tests

#### Unit Test Example
```python
import pytest
from app.repositories import task_repository
from app.schemas.task import TaskCreate

def test_create_task(db_session):
    """Should create a task in the database."""
    task_data = TaskCreate(title="Test Task", status="next")
    task = task_repository.create(db_session, task_data)

    assert task.id is not None
    assert task.title == "Test Task"
    assert task.status == "next"
```

#### Integration Test Example
```python
def test_create_task_api(client):
    """Should create task via API."""
    response = client.post(
        "/api/v1/tasks/",
        json={"title": "New Task"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Task"
```

### Test Markers

Use markers to categorize tests:

```python
@pytest.mark.unit
def test_repository_function():
    pass

@pytest.mark.integration
def test_api_endpoint():
    pass

@pytest.mark.slow
def test_heavy_operation():
    pass
```

Run specific markers:
```bash
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m "not slow"    # Exclude slow tests
```

### Coverage Requirements

- **Current threshold**: 60%
- **Target**: 80%
- Coverage reports generated in:
  - Terminal (term-missing)
  - HTML (`htmlcov/index.html`)
  - XML (`coverage.xml`)

### Known Issues

**SQLite Compatibility**: Integration tests fail with SQLite due to PostgreSQL-specific features:
- UUID type with `gen_random_uuid()`
- Timestamp defaults
- Full-text search

**Workaround**: Integration tests should be run against PostgreSQL in CI/CD.

## Frontend Testing

### Tech Stack
- **Vitest** - Fast Vite-native test framework
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom matchers
- **jsdom** - DOM environment for Node
- **@vitest/coverage-v8** - Coverage reporting

### Running Tests

```bash
# Install dependencies first
cd frontend && npm install

# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

### Test Structure

```
frontend/src/
├── test/
│   └── setup.ts                    # Global test setup
└── components/
    ├── QuickCapture.tsx
    ├── QuickCapture.test.tsx       # Component tests
    ├── TaskList.tsx
    └── TaskList.test.tsx
```

### Writing Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickCapture } from './QuickCapture'

describe('QuickCapture', () => {
  it('calls onSubmit when form is submitted', async () => {
    const mockOnSubmit = vi.fn()
    const user = userEvent.setup()

    render(<QuickCapture onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(input, 'New task')

    const button = screen.getByRole('button', { name: /create/i })
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New task',
      description: undefined
    })
  })
})
```

### Testing Patterns

#### 1. User Interactions
```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.type(input, 'text')
await user.click(button)
await user.keyboard('{Enter}')
```

#### 2. Async Assertions
```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

#### 3. Mocking API Calls
```typescript
import { vi } from 'vitest'

// Mock the API module
vi.mock('@/lib/api', () => ({
  getTasks: vi.fn().mockResolvedValue([
    { id: '1', title: 'Task 1' }
  ])
}))
```

## CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: gtd
          POSTGRES_PASSWORD: gtd_dev
          POSTGRES_DB: gtd
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm test
      - name: Run coverage
        run: |
          cd frontend
          npm run test:coverage
```

## Best Practices

### 1. Test Naming
- Use descriptive test names that explain what's being tested
- Format: `test_<what>_<condition>_<expected>`
- Example: `test_create_task_with_empty_title_returns_422`

### 2. Arrange-Act-Assert Pattern
```python
def test_example():
    # Arrange - Set up test data
    task_data = TaskCreate(title="Test")

    # Act - Perform the action
    result = create_task(db, task_data)

    # Assert - Verify the outcome
    assert result.title == "Test"
```

### 3. Test Independence
- Each test should be independent
- Use fixtures to set up clean state
- Don't rely on test execution order

### 4. Mock External Dependencies
- Mock API calls, external services
- Use factories for database objects
- Keep tests fast and reliable

### 5. Test Coverage Goals
- **Critical paths**: 100% coverage
- **Business logic**: 90%+ coverage
- **API endpoints**: 80%+ coverage
- **UI components**: 70%+ coverage

## Troubleshooting

### Backend Tests Failing
```bash
# Check if containers are running
docker compose ps

# View backend logs
docker compose logs backend

# Run tests with verbose output
docker compose exec backend pytest -vv --tb=long
```

### Frontend Tests Failing
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run with debug output
npm run test -- --reporter=verbose
```

### Coverage Not Generating
```bash
# Backend - check pytest-cov is installed
docker compose exec backend pip list | grep cov

# Frontend - check coverage tool
cd frontend && npm list @vitest/coverage-v8
```

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Factory Boy](https://factoryboy.readthedocs.io/)
