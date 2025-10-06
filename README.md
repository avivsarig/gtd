# GTD Task Management System

A keyboard-first, single-user GTD (Getting Things Done) task management system.

## Architecture

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Infrastructure**: Docker + Docker Compose

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

## Development Commands

```bash
make help          # Show all available commands
make up            # Start services
make down          # Stop services
make logs          # View logs
make db-shell      # PostgreSQL shell
make test          # Run backend tests
make test-cov      # Tests with coverage
make lint          # Run all linters
```

## Project Status

**Overall: ~40% Complete** (Foundation Phase)

See [.claude/status.md](.claude/status.md) for detailed progress and [CLAUDE.md](CLAUDE.md) for feature implementation status.

## Documentation

- [TESTING.md](TESTING.md) - Testing guide and framework documentation
- [CLAUDE.md](CLAUDE.md) - AI development guide and project overview
- [backend/README.md](backend/README.md) - Backend API documentation
- [frontend/README.md](frontend/README.md) - Frontend component documentation
- [.claude/](. claude/) - User stories, requirements, and technical specs

---

## Documentation Guidelines

**Structure:**
- Main README: overview + quick start + links
- Subdirectory READMEs: implementation details only

**Rules:**
- One explanation per concept - link, don't duplicate
- Keep examples minimal and current
- Remove deprecated content immediately
- Use specific headers (not "Setup" but "Docker Setup")
- Target: each README scannable in <2 minutes

**Before committing doc changes:**
- [ ] Removed duplicate content?
- [ ] Updated cross-references?
- [ ] Verified all commands work?
- [ ] Kept token count minimal?
