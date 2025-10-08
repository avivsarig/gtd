# GTD Task Management System

Keyboard-first, single-user GTD (Getting Things Done) task management system.

## Quick Start

```bash
docker compose up -d     # Start all services
make db-migrate          # Run database migrations
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

## Key Commands

```bash
make help          # Show all commands
make up/down       # Start/stop services
make logs          # View logs
make db-shell      # PostgreSQL shell

# Testing
make test          # Backend unit tests (87 passing)
make test-cov      # With coverage report

# Code Quality
make lint          # Run all linters
make format        # Auto-format all code
```

See [CODE_QUALITY.md](CODE_QUALITY.md) for linter details and pre-commit hook setup.

## Project Status

**Phase 1: ~50% Complete** (Foundation + Inbox)

✅ Implemented:
- Inbox API (universal GTD capture)
- Tasks, Projects, Notes APIs
- Status management (Next/Waiting/Someday)
- 87 unit tests, 25 integration tests

🚧 In Progress:
- Inbox UI (Cmd+K capture modal)
- Context tagging
- Full-text search

See [.claude/status.md](.claude/status.md) for detailed progress.

## Architecture

- **Backend:** FastAPI + PostgreSQL (3-layer clean architecture)
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui
- **Infrastructure:** Docker Compose

**GTD Workflow:**
1. **Capture** → Universal inbox (zero classification)
2. **Process** → Convert to task/note/project during review
3. **Organize** → Next/Waiting/Someday lists + contexts
4. **Review** → Weekly review with inbox zero
5. **Engage** → Work from organized lists

## Documentation

**Implementation:**
- [backend/README.md](backend/README.md) - API & database
- [frontend/README.md](frontend/README.md) - UI components

**Development:**
- [CLAUDE.md](CLAUDE.md) - AI development guide
- [backend/CLAUDE.md](backend/CLAUDE.md) - Backend architecture & patterns
- [frontend/CLAUDE.md](frontend/CLAUDE.md) - Frontend architecture & GTD compliance

**Requirements:**
- [.claude/](.claude/) - User stories, technical requirements, data model

**Testing:**
- [TESTING.md](TESTING.md) - Testing guide & framework

---

## Documentation Maintenance

**Structure:**
- Main README: overview + quick start + links only
- Subdirectory READMEs: implementation specifics
- CLAUDE.md files: AI development guidance

**Rules:**
- Single source of truth - link, don't duplicate
- Remove deprecated content immediately
- Examples must be minimal and current
- Each README scannable in <2 minutes

**Before committing doc changes:**
- [ ] Removed duplicate content?
- [ ] Updated cross-references?
- [ ] Verified all commands work?
- [ ] Kept token count minimal?
