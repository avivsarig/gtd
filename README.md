# GTD Task Management System

A keyboard-first, single-user GTD (Getting Things Done) task management system.

## Architecture

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Infrastructure**: Docker + Docker Compose

## Features

✅ **Implemented:**
- Quick task capture (⚠️ needs GTD methodology compliance fix)
- Task status management (Next/Waiting/Someday)
- Task completion tracking
- Project organization with task assignment
- Notes management with project association
- Status filtering
- Dark mode UI

🚧 **In Progress:**
- Universal inbox / GTD-compliant capture
- Context tagging
- Keyboard shortcuts
- Search functionality
- Calendar/scheduling

## Quick Start

```bash
# Start all services
docker compose up -d

# Run database migrations
make db-migrate
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Development

```bash
make help          # Show all available commands
make up            # Start services
make down          # Stop services
make logs          # View logs
make db-shell      # Open PostgreSQL shell
make test          # Run all backend tests
make test-cov      # Run tests with coverage
make lint          # Run linters (frontend + backend)
```

## Testing

The project includes comprehensive testing infrastructure:

**Backend Testing:**
- pytest with 62 unit tests passing
- Factory Boy for test data generation
- Coverage reporting (61% current, 80% target)
- Integration tests for API endpoints

**Frontend Testing:**
- Vitest + React Testing Library
- Component testing with user interaction simulation
- Coverage reporting

```bash
# Backend tests
make test              # Run all tests
make test-unit         # Unit tests only
make test-cov          # With coverage report

# Frontend tests (in container)
docker compose exec frontend npm test
docker compose exec frontend npm run test:coverage
```

See [TESTING.md](TESTING.md) for comprehensive testing guide.

## Documentation

- [/backend/README.md](backend/README.md) - Backend architecture and API
- [/frontend/README.md](frontend/README.md) - Frontend structure and components
- [/TESTING.md](TESTING.md) - **Testing guide and best practices**
- [/CLAUDE.md](CLAUDE.md) - AI development guide
- [/.claude/status.md](.claude/status.md) - Project status and progress

## Project Status

**Overall Completion: ~40%** (Foundation Phase)
- 62 backend tests passing
- Tasks, Projects & Notes APIs complete
- Full-stack status management working
- ⚠️ **Critical**: QuickCapture needs GTD methodology compliance (see [status.md](.claude/status.md))
