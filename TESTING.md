# Testing Guide

Comprehensive testing framework for the GTD Task Management System.

## Overview

- **Backend**: pytest + coverage + factories + fixtures
- **Frontend**: Vitest + React Testing Library
- **Coverage**: 60% current, 80% target

## Backend Testing

### Tech Stack

- **pytest** - Test framework
- **pytest-cov** - Coverage reporting
- **pytest-xdist** - Parallel execution
- **factory-boy** - Test data factories
- **faker** - Realistic fake data

### Running Tests

```bash
# All tests
make test

# With coverage report
make test-cov

# Unit tests only
make test-unit

# Fast tests (exclude slow)
make test-fast
```

### Test Structure

```
backend/tests/
├── conftest.py              # Shared fixtures
├── fixtures/
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

**Database:**
- `db_session` / `db` - Fresh in-memory SQLite database
- `client` - TestClient with database override

**Models:**
- `sample_project`, `sample_task`, `sample_note` - Single instances
- `sample_task_with_project` - Task with project relationship
- `multiple_tasks`, `multiple_projects` - Lists with different statuses

### Using Factories

```python
from tests.fixtures.factories import create_task, create_project, create_note

# Create with defaults
task = create_task()
project = create_project(name="Custom Project")

# Create with relationships
project, tasks = create_project_with_tasks(num_tasks=5)
completed_task = create_completed_task(title="Done Task")
```

### Writing Tests

**Unit Test Pattern:**
```python
def test_create_task(db_session):
    """Should create task in database."""
    task_data = TaskCreate(title="Test Task", status="next")
    task = task_repository.create(db_session, task_data)

    assert task.id is not None
    assert task.title == "Test Task"
```

**Integration Test Pattern:**
```python
def test_create_task_api(client):
    """Should create task via API."""
    response = client.post("/api/v1/tasks/", json={"title": "New Task"})

    assert response.status_code == 201
    assert response.json()["title"] == "New Task"
```

### Test Markers

```python
@pytest.mark.unit          # Unit test
@pytest.mark.integration   # Integration test
@pytest.mark.slow          # Slow test (>1s)
```

Run specific markers:
```bash
pytest -m unit             # Unit tests only
pytest -m "not slow"       # Exclude slow tests
```

### Known Issues

**SQLite Compatibility**: Integration tests fail with SQLite due to PostgreSQL-specific features (UUID, timestamps, full-text search). Run integration tests against PostgreSQL in CI/CD.

## Frontend Testing

### Tech Stack

- **Vitest** - Fast Vite-native test framework
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment
- **@vitest/coverage-v8** - Coverage reporting

### Running Tests

```bash
# In frontend directory
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:ui           # Interactive UI
npm run test:coverage     # With coverage
```

### Test Structure

```
frontend/src/
├── test/
│   └── setup.ts              # Global setup
└── components/
    ├── QuickCapture.tsx
    ├── QuickCapture.test.tsx # Co-located tests
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
  it('submits form with user input', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<QuickCapture onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/what needs/i), 'New task')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).toHaveBeenCalledWith({ title: 'New task' })
  })
})
```

### Testing Patterns

**User Interactions:**
```typescript
const user = userEvent.setup()
await user.type(input, 'text')
await user.click(button)
await user.keyboard('{Enter}')
```

**Async Assertions:**
```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

**Mocking API Calls:**
```typescript
vi.mock('@/lib/api', () => ({
  getTasks: vi.fn().mockResolvedValue([{ id: '1', title: 'Task 1' }])
}))
```

## Best Practices

**Test Naming:**
- Format: `test_<what>_<condition>_<expected>`
- Example: `test_create_task_with_empty_title_returns_422`

**Arrange-Act-Assert Pattern:**
```python
def test_example():
    # Arrange - Set up test data
    task_data = TaskCreate(title="Test")

    # Act - Perform the action
    result = create_task(db, task_data)

    # Assert - Verify the outcome
    assert result.title == "Test"
```

**Test Independence:**
- Each test should be independent
- Use fixtures for clean state
- Don't rely on execution order

**Coverage Goals:**
- Critical paths: 100%
- Business logic: 90%+
- API endpoints: 80%+
- UI components: 70%+

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Factory Boy](https://factoryboy.readthedocs.io/)
