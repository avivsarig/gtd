# GTD Backend

FastAPI REST API for GTD Task Management System.

## Quick Start (Docker - Recommended)

```bash
cd ..
docker compose up -d     # Starts backend + postgres
make db-migrate          # Apply migrations
```

API: http://localhost:8000/docs

## Architecture

**3-Layer Clean Architecture:**
```
HTTP Request → API (routes) → Controller (business logic) → Repository (database) → PostgreSQL
```

**Directory:**
```
app/
├── api/v1/          # FastAPI routes (inbox, tasks, projects, notes)
├── controllers/     # Business logic
├── repositories/    # Database operations (CRUD only)
├── models/          # SQLAlchemy ORM models
├── schemas/         # Pydantic validation
└── db/              # Database config
```

See [CLAUDE.md](CLAUDE.md) for layer responsibilities, patterns, and business rules.

## API Endpoints

**Implemented:**
- `/api/v1/inbox` - Universal capture + GTD processing
- `/api/v1/tasks` - CRUD, status management, completion
- `/api/v1/projects` - CRUD, statistics, task assignment
- `/api/v1/notes` - CRUD, markdown, project association

See http://localhost:8000/docs for interactive documentation and all endpoints.

## Testing

**Status:** 87 unit tests, 25 integration tests passing

```bash
pytest                      # All tests
pytest tests/unit -v        # Unit tests only
pytest --cov=app            # With coverage
```

See [../TESTING.md](../TESTING.md) for testing patterns and fixtures.

## Development

**Key Files:**
- [CLAUDE.md](CLAUDE.md) - Architecture patterns, data models, business logic
- Git history for implementation details: `git log --oneline`

**Performance Requirements:**
- Inbox capture: <2s
- Inbox conversion: <500ms
- Search queries: <1s
- List operations: <100ms

## Current Implementation

✅ **Complete:**
- 3-layer architecture
- Inbox API (universal capture + conversion)
- Tasks API (status management, completion)
- Projects API (statistics, activity tracking)
- Notes API (markdown, project links)
- 87 unit tests + 25 integration tests

🚧 **In Progress:**
- Context tagging API
- Full-text search
- Performance optimization
