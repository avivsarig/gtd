# GTD Task Management Makefile

DC := docker compose
EXEC := $(DC) exec $(if $(shell [ -t 0 ] || echo 1),-T,)

.PHONY: help up down restart clean status logs \
	db-migrate db-reset db-shell \
	lint typecheck format test

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Services:     up down restart clean status logs"
	@echo "Database:     db-migrate db-reset db-shell"
	@echo "Code Quality: lint typecheck format test"

up:
	$(DC) up -d

down:
	$(DC) down

restart: down up

clean:
	$(DC) down -v && docker image prune -f

status:
	@$(DC) ps
	@echo "\nBackend:  http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "Frontend: http://localhost:5173"

logs:
	$(DC) logs -f $(filter-out $@,$(MAKECMDGOALS))

db-migrate:
	$(EXEC) backend alembic upgrade head

db-reset:
	$(DC) down -v && $(DC) up -d

db-shell:
	$(EXEC) postgres psql -U gtd -d gtd

lint: lint-be lint-fe
lint-be:
	@$(EXEC) backend ruff check .
	@$(EXEC) backend black --check .
	@$(EXEC) backend mypy app
lint-fe:
	@$(EXEC) frontend npm run lint

typecheck: typecheck-be typecheck-fe
typecheck-be:
	@$(EXEC) backend mypy app
typecheck-fe:
	@$(EXEC) frontend npm run tc

format: format-be format-fe
format-be:
	@$(EXEC) backend black .
	@$(EXEC) backend ruff check --fix .
format-fe:
	@$(EXEC) frontend npm run format

test: test-be test-fe
test-be:
	@$(EXEC) backend pytest tests/
test-fe:
	@$(EXEC) frontend npm test
