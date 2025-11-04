# GTD Task Management System

A **Getting Things Done (GTD)**-based task management system to help users organize tasks according to the GTD methodology:
1. **Capture** — Collect everything into a universal inbox
2. **Clarify** — Process inbox items into tasks or notes
3. **Organize** — Sort tasks into Next / Waiting / Someday lists, attach context or project
4. **Reflect** — Weekly review with "inbox zero" discipline
5. **Engage** — Work from the organized lists

## Prerequisites

- Docker 20.10.0+
- Docker Compose 1.29.0+
- Git

## Architectural Summary

This is a fullstack app based on:
- **Backend:** FastAPI (Python)
- **Frontend:** React (TypeScript)
- **Database:** PostgreSQL with Alembic migrations
- **Containerization:** Docker Compose for orchestrating all components

## Features

**Implemented:**
- Universal inbox capture and processing (convert to tasks/notes/projects)
- Task management with status filtering (Next/Waiting/Someday)
- Projects with statistics and task assignment
- Notes with markdown support and project links
- Context management (@home, @computer, @phone)
- Full-text search API (UI pending)
- 610 tests passing (209 backend + 401 frontend)

**Pending:**
- Global keyboard shortcuts (Cmd+K trigger)
- Search UI component
- Context and project filtering UI
- Calendar/scheduling view
- Weekly review dashboard

See [Project Status](.claude/status.md) for complete roadmap.

## Quick Start

A [Makefile](/Makefile) provides key development commands.
Run `make help` for a list of available commands.

**To start locally:**

```bash
make up           # Start backend, frontend, and database via Docker Compose
make db-migrate   # Apply latest database migrations
```

Then open [frontend](http://localhost:5173) in your browser
The backend API is available at [http://localhost:8000](http://localhost:8000), and has built-in [Swagger UI documentation](http://localhost:8000/docs)

**Environment Configuration:**

The frontend can be configured via environment variables:
- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:8000`)

For local development outside Docker, copy `frontend/.env.example` to `frontend/.env` and adjust as needed.

## Development

See [Makefile](Makefile) for all available commands including linting, formatting, and testing.

### Testing

The project has comprehensive test coverage:

**Unit & Integration Tests** (run in Docker):
```bash
make test          # Run all tests (backend + frontend)
make test-be       # Backend tests only (pytest)
make test-fe       # Frontend tests only (Vitest)
```

**E2E Tests** (run on host with Playwright):
```bash
make e2e-install   # First-time setup (install Playwright)
make test-e2e      # Run all E2E tests
make test-e2e-ui   # Run with interactive UI
```

See [e2e/README.md](e2e/README.md) for detailed E2E testing documentation.

### Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality. Every commit automatically runs:
- **Lint** - Code style and syntax checks
- **TypeCheck** - Static type validation
- **Test** - All unit and integration tests
- **E2E Tests** - End-to-end tests with Playwright

Hooks only run for files in their respective directories (backend/frontend/e2e).

**Setup:**
```bash
pip install pre-commit
pre-commit install
```

**Manual run:**
```bash
pre-commit run --all-files
```

## Repository Structure

```bash
├── backend                     # Backend service (FastAPI)
├── frontend                    # Frontend app (React)
├── .env                        # Shared environment configuration
├── .pre-commit-config.yaml     # Code quality hooks
├── docker-compose.yml          # Docker configuration for all services
└── Makefile                    # Common dev commands (run, lint, test, etc.)
```

## Troubleshooting

**Services not starting:**
```bash
docker compose ps    # Check service status
docker compose logs  # View all logs
```

**Database issues:**
```bash
make db-migrate      # Apply migrations
make db-reset        # Reset database (⚠️ deletes data)
```

**Port conflicts:**
- Backend (8000), Frontend (5173), PostgreSQL (5432)
- Check with: `docker ps` or `lsof -i :<port>`

## Documentation

- [Project Status](.claude/status.md) - Current development state and roadmap
- [API Documentation](http://localhost:8000/docs) - Interactive Swagger UI (when running)
