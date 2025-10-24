# GTD Task Management Makefile

# Configuration
DC := docker compose
BE := backend
FE := frontend
DB := postgres

# Colors
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

# Phony targets
.PHONY: help setup up down restart clean status \
		logs logs-be logs-fe \
		db-migrate db-reset db-shell \
		test-db-up test-db-down test-db-reset test-db-shell \
		lint lint-be lint-fe format format-be format-fe \
		test test-be test-be-unit test-be-int test-fe test-cov

# Default target
help:
	@echo "GTD Task Management - Development Commands"
	@echo "Usage: make [target]"
	@echo "\n$(GREEN)Project Management:$(NC)"
	@echo "  setup      Prepare full development environment"
	@echo "  up         Start ALL services"
	@echo "  down       Stop ALL services"
	@echo "  restart    Restart ALL services"
	@echo "  clean      Remove ALL containers, volumes, and images"
	@echo "  status     Show ALL service statuses"
	@echo "\n$(GREEN)Logging:$(NC)"
	@echo "  logs       Show logs from ALL services"
	@echo "  logs-be    Show backend service logs"
	@echo "  logs-fe    Show frontend service logs"
	@echo "\n$(GREEN)Database:$(NC)"
	@echo "  db-migrate Run ALL database migrations"
	@echo "  db-reset   Reset entire database (DESTRUCTIVE!)"
	@echo "  db-shell   Open database shell"
	@echo "\n$(GREEN)Test Database:$(NC)"
	@echo "  test-db-up     Start test database"
	@echo "  test-db-down   Stop test database"
	@echo "  test-db-reset  Reset test database (DESTRUCTIVE!)"
	@echo "  test-db-shell  Open test database shell"
	@echo "\n$(GREEN)Code Quality:$(NC)"
	@echo "  lint       Run ALL linters (backend and frontend)"
	@echo "  lint-be    Run backend linters"
	@echo "  lint-fe    Run frontend linters"
	@echo "  format     Auto-format ALL code"
	@echo "  format-be  Auto-format backend code"
	@echo "  format-fe  Auto-format frontend code"
	@echo "\n$(GREEN)Testing:$(NC)"
	@echo "  test       Run ALL tests (backend and frontend)"
	@echo "  test-be    Run ALL backend tests"
	@echo "  test-be-unit Run backend unit tests"
	@echo "  test-be-int Run backend integration tests"
	@echo "  test-fe    Run frontend tests"
	@echo "  test-cov   Generate test coverage report"

# Project Management
setup: clean
	$(DC) build

up:
	$(DC) up -d

down:
	$(DC) down

restart: down up

clean:
	@read -p "$(YELLOW)Remove ALL containers, volumes, and images? (y/N)$(NC) " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(DC) down -v; \
		docker image prune -f; \
		echo "$(GREEN)Comprehensive cleanup complete.$(NC)"; \
	else \
		echo "$(YELLOW)Cleanup cancelled.$(NC)"; \
	fi

status:
	$(DC) ps
	@echo "\n$(GREEN)Access Points:$(NC)"
	@echo "Backend:  http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "Frontend: http://localhost:5173"

# Logging
logs:
	$(DC) logs -f

logs-be:
	$(DC) logs -f $(BE)

logs-fe:
	$(DC) logs -f $(FE)

# Database Management
db-migrate:
	$(DC) exec $(BE) alembic upgrade head

db-reset:
	@read -p "$(YELLOW)DESTRUCTIVE: Reset entire database? ALL DATA WILL BE LOST! (y/N)$(NC) " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(DC) down -v; \
		$(DC) up -d; \
		echo "$(GREEN)Database completely reset.$(NC)"; \
	else \
		echo "$(YELLOW)Database reset cancelled.$(NC)"; \
	fi

db-shell:
	$(DC) exec $(DB) psql -U gtd -d gtd

# Test Database Management
test-db-up:
	$(DC) up -d postgres-test
	@echo "$(GREEN)Test database started on port 5433$(NC)"
	@echo "$(YELLOW)Waiting for test database to be ready...$(NC)"
	@sleep 3
	@echo "$(GREEN)Running migrations on test database...$(NC)"
	@$(DC) exec -e DATABASE_URL=$(shell grep DATABASE_TEST_URL .env | cut -d '=' -f2) $(BE) alembic upgrade head
	@echo "$(GREEN)Test database is ready!$(NC)"

test-db-down:
	$(DC) stop postgres-test
	@echo "$(GREEN)Test database stopped$(NC)"

test-db-reset:
	@read -p "$(YELLOW)DESTRUCTIVE: Reset test database? ALL TEST DATA WILL BE LOST! (y/N)$(NC) " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(DC) stop postgres-test; \
		$(DC) rm -f postgres-test; \
		docker volume rm gtd_postgres-test-data 2>/dev/null || true; \
		$(DC) up -d postgres-test; \
		sleep 3; \
		$(DC) exec -e DATABASE_URL=$(shell grep DATABASE_TEST_URL .env | cut -d '=' -f2) $(BE) alembic upgrade head; \
		echo "$(GREEN)Test database completely reset.$(NC)"; \
	else \
		echo "$(YELLOW)Test database reset cancelled.$(NC)"; \
	fi

test-db-migrate:
	@echo "$(GREEN)Running migrations on test database...$(NC)"
	@$(DC) exec -e DATABASE_URL=$(shell grep DATABASE_TEST_URL .env | cut -d '=' -f2) $(BE) alembic upgrade head

test-db-shell:
	$(DC) exec postgres-test psql -U gtd_test -d gtd_test

# Code Quality
lint: lint-be lint-fe

lint-be:
	$(DC) exec $(BE) ruff check .
	$(DC) exec $(BE) black --check .
	$(DC) exec $(BE) mypy app

lint-fe:
	$(DC) exec $(FE) npm run lint
	$(DC) exec $(FE) npm run format:check

# Type Checking (separate from linting)
typecheck: typecheck-be typecheck-fe

typecheck-be:
	$(DC) exec $(BE) mypy app

typecheck-fe:
	$(DC) exec $(FE) npm run tc

format: format-be format-fe

format-be:
	$(DC) exec $(BE) black .
	$(DC) exec $(BE) ruff check --fix .

format-fe:
	$(DC) exec $(FE) npm run format

# Testing
test: test-be test-fe

test-be: test-be-unit test-be-int

test-be-unit:
	$(DC) exec $(BE) pytest tests/unit

test-be-int:
	$(DC) exec $(BE) pytest tests/integration

test-fe:
	$(DC) exec $(FE) npm test

test-cov:
	@echo "$(GREEN)Generating backend test coverage:$(NC)"
	$(DC) exec $(BE) pytest tests/unit \
		--quiet \
		--cov=app --cov-report=term-missing \
		--cov-report=html --cov-report=xml \
		--cov-fail-under=60
	@echo "\n$(GREEN)Generating frontend test coverage:$(NC)"
	$(DC) exec $(FE) npm run test:coverage