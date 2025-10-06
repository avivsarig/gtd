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
```

## Documentation

- See [/backend/README.md](backend/README.md) for backend details
- See [/frontend/README.md](frontend/README.md) for frontend details
- See [/CLAUDE.md](CLAUDE.md) for AI development guide
- See [/.claude/status.md](.claude/status.md) for project status

## Project Status

**Overall Completion: ~40%** (Foundation Phase)
- 62 backend tests passing
- Tasks, Projects & Notes APIs complete
- Full-stack status management working
- ⚠️ **Critical**: QuickCapture needs GTD methodology compliance (see [status.md](.claude/status.md))
