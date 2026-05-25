# ============================================
# TalentBank-Hackathon Makefile
# ============================================

.PHONY: help build up down seed logs restart clean fresh

# Default target
help:
	@echo "TalentBank-Hackathon Docker Management"
	@echo ""
	@echo "Available targets:"
	@echo "  build      Build Docker images (backend + frontend)"
	@echo "  up         Start containers in detached mode"
	@echo "  down       Stop and remove containers"
	@echo "  seed       Seed the database (must run after 'up')"
	@echo "  logs       View container logs (follow mode)"
	@echo "  restart    Restart all containers"
	@echo "  clean      Stop containers, remove volumes (⚠️ deletes database)"
	@echo "  fresh      Full rebuild: clean + build + up + seed"
	@echo ""

# Build images
build:
	docker compose build

# Start containers in background
up:
	docker compose up -d
	@echo "Containers started. Run 'make seed' to initialise database."

# Stop and remove containers (preserves volumes)
down:
	docker compose down

# Seed the database
seed:
	@echo "Seeding database..."
	@CONTAINER=$$(docker ps --filter "name=backend" --format "{{.Names}}"); \
	if [ -z "$$CONTAINER" ]; then \
		echo "Backend container not running. Start with 'make up' first."; \
		exit 1; \
	fi; \
	docker exec -it $$CONTAINER npm run seed

# Follow logs
logs:
	docker compose logs -f

# Restart containers
restart: down up
	@echo "Restarted. Run 'make seed' if database is empty."

# Stop and remove containers + volumes (database will be lost)
clean:
	docker compose down -v
	@echo "Containers and volumes removed. Database wiped."

# Fresh start: clean + build + up + seed
fresh: clean build up seed
	@echo "Fresh environment ready! Access at http://localhost"