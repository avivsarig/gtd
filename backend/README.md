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
├── api/v1/          # FastAPI routes (inbox, tasks, projects, notes, contexts, search)
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
- `/api/v1/tasks` - CRUD, status management, completion, **filtering** (status, project, context, dates)
- `/api/v1/projects` - CRUD, statistics, task assignment
- `/api/v1/notes` - CRUD, markdown, project association
- `/api/v1/contexts` - CRUD for task contexts (@home, @computer, etc.)
- `/api/v1/search` - Full-text search (tasks, notes, projects) with relevance ranking

**Task Filtering Examples:**
```bash
# Next actions only
GET /api/v1/tasks/?status=next

# Tasks in project with specific context
GET /api/v1/tasks/?project_id={uuid}&context_id={uuid}

# Tasks scheduled this week
GET /api/v1/tasks/?scheduled_after=2025-10-07&scheduled_before=2025-10-13
```

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
- 3-layer architecture (API → Controller → Repository)
- Inbox API (universal capture + conversion to task/note/project)
- Tasks API (CRUD, status management, completion, **filtering**)
- Projects API (CRUD, statistics, activity tracking)
- Notes API (CRUD, markdown, project links)
- **Contexts API (CRUD for @home, @computer, etc.)**
- **Search API (full-text search with relevance ranking)**
- 87 unit tests + 25 integration tests

🚧 **Next Steps:**
- Frontend integration for contexts/search/filtering
- Performance optimization
- Integration tests for new endpoints
