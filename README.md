# GTD Task Management System

A **Getting Things Done (GTD)**-based task management system to help users organize tasks according to the GTD methodology:
1. **Capture** — Collect everything into a universal inbox  
2. **Clarify** — Process inbox items into tasks or notes  
3. **Organize** — Sort tasks into Next / Waiting / Someday lists, attach context or project  
4. **Reflect** — Weekly review with “inbox zero” discipline  
5. **Engage** — Work from the organized lists

## Architectural Summary

This is a fullstack app based on:
- **Backend:** FastAPI (Python) - (see [Backend README](/backend/README.md))
- **Frontend:** React (TypeScript) - (see [Frontend README](/frontend/README.md))
- **Database:** PostgreSQL with Alembic migrations
- **Containerization:** Docker Compose for orchestrating all components

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

## Repository Structure

```bash
├── backend                     # Backend service (FastAPI)
├── frontend                    # Frontend app (React)
├── .env                        # Shared environment configuration
├── .pre-commit-config.yaml     # Code quality hooks
├── docker-compose.yml          # Docker configuration for all services
└── Makefile                    # Common dev commands (run, lint, test, etc.)
```

## Deployment Instructions

### Prerequisites
- Docker (version 20.10.0 or higher)
- Docker Compose (version 1.29.0 or higher)
- Git (for cloning the repository)

### Local Development Deployment
1. Clone the repository:
    ```bash
    git clone https://github.com/avivsarig/gtd-task-management.git
    cd gtd-task-management
    ```

2. Set up environment variables (optional):
- Copy `.env.example` to `.env`
- Modify database credentials and other configuration as needed

3. Start the application:
    ```bash
    make up           # Starts backend, frontend, and PostgreSQL services
    make db-migrate   # Applies database migrations
    ```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

### Stopping the Application
```bash
make down           # Stops and removes containers
make clean          # Removes all containers and volumes
```

### Troubleshooting
- Ensure Docker is running
- Check container logs with docker-compose logs
- Verify network ports are not in use by other services