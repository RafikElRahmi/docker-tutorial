.PHONY: help dev prod build clean validate

help: ## Show available targets
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Run development environment
	pnpm docker server up development

prod: ## Run production environment
	pnpm docker server up production

build: ## Build all images
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml build
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml build

clean: ## Stop and remove containers/volumes
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml down -v || true
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down -v || true
	docker system prune -f

validate: ## Run shellcheck on scripts (if applicable)
	@if command -v shellcheck >/dev/null 2>&1; then \
		shellcheck scripts/*.sh 2>/dev/null || echo "No .sh scripts found or shellcheck issues detected"; \
	else \
		echo "shellcheck not installed. Install with: brew install shellcheck (macOS) or apt-get install shellcheck (Linux)"; \
	fi
