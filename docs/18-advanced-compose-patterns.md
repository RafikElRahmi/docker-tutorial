# 18 - Advanced Compose Patterns

Docker Compose offers powerful features for managing complex multi-container applications. This guide covers advanced patterns for scaling, modularity, and real-world scenarios.

## Compose Include (Modular Stacks)

Split your stack into reusable modules:

```yaml
# docker-compose.yml
include:
  - path: ./infra/docker-compose.db.yml
  - path: ./infra/docker-compose.cache.yml

services:
  app:
    build: .
    depends_on:
      - postgres
      - redis
```

```yaml
# infra/docker-compose.db.yml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```yaml
# infra/docker-compose.cache.yml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

## Compose Extends (DRY Principle)

Define common configurations once:

```yaml
# docker-compose.base.yml
services:
  app-base:
    build:
      context: .
      target: development
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
```

```yaml
# docker-compose.dev.yml
services:
  app:
    extends:
      file: docker-compose.base.yml
      service: app-base
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
```

## Profiles for Optional Services

Run only the services you need:

```yaml
services:
  app:
    build: .
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine

  # Optional - only with --profile monitoring
  prometheus:
    image: prom/prometheus
    profiles: ["monitoring"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    profiles: ["monitoring"]
    ports:
      - "3001:3000"

  # Optional - only with --profile testing
  test-db:
    image: postgres:16-alpine
    profiles: ["testing"]
    environment:
      POSTGRES_DB: test
```

```bash
# Start only app + postgres
docker compose up -d

# Start with monitoring stack
docker compose --profile monitoring up -d

# Start with multiple profiles
docker compose --profile monitoring --profile testing up -d
```

## Multiple Compose Files

Override configurations per environment:

```bash
# Base + dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Base + prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Base + test
docker compose -f docker-compose.yml -f docker-compose.test.yml up -d
```

## Service Scaling

```bash
# Scale a service to 3 instances
docker compose up -d --scale app=3

# With compose file
docker compose up -d --scale app=3 --scale worker=2
```

```yaml
services:
  app:
    build: .
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 256M
```

## Init Containers

Run initialization tasks before the main app starts:

```yaml
services:
  migrate:
    build: .
    command: pnpm migrate
    depends_on:
      - postgres
    restart: "no"

  app:
    build: .
    depends_on:
      migrate:
        condition: service_completed_successfully

  postgres:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

**Note**: `condition: service_completed_successfully` requires Compose v2.20+.

## Sidecar Pattern

Run auxiliary services alongside your main app:

```yaml
services:
  app:
    build: .
    network_mode: service:nginx
    depends_on:
      - nginx

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  # Log shipping sidecar
  fluent-bit:
    image: fluent/fluent-bit
    volumes:
      - app-logs:/var/log/app
    depends_on:
      - app

volumes:
  app-logs:
```

## One-Off Jobs

Run tasks that complete and exit:

```bash
# Database migration
docker compose run --rm app pnpm migrate

# Seed data
docker compose run --rm app pnpm seed

# Run tests
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm test
```

```yaml
# docker-compose.test.yml
services:
  test:
    build:
      context: .
      target: test
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgres://test:test@test-db:5432/test
    depends_on:
      - test-db
```

## Dependency Conditions

Fine-grained control over service startup order:

```yaml
services:
  app:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      migrate:
        condition: service_completed_successfully
```

| Condition | Description |
|-----------|-------------|
| `service_started` | Container has started |
| `service_healthy` | Health check passes |
| `service_completed_successfully` | Container exited with code 0 |

## Environment-Specific Config with .env

```bash
# .env (development)
COMPOSE_PROFILES=debug
APP_PORT=3000
LOG_LEVEL=debug

# .env.production
COMPOSE_PROFILES=
APP_PORT=80
LOG_LEVEL=warn
```

```yaml
services:
  app:
    build: .
    ports:
      - "${APP_PORT}:3000"
    environment:
      - LOG_LEVEL=${LOG_LEVEL}
```

## Watch Mode (Compose File Sync)

Newer Docker Compose supports file watching for automatic rebuilds:

```yaml
services:
  app:
    build: .
    develop:
      watch:
        - path: ./src
          action: sync
          target: /app/src
        - path: ./package.json
          action: rebuild
```

```bash
docker compose up --watch
```

## Summary of Compose Features

| Feature | Use Case |
|---------|----------|
| `include` | Modular, reusable compose files |
| `extends` | DRY - share common config |
| `profiles` | Optional service groups |
| Multiple files | Environment-specific overrides |
| `depends_on` conditions | Fine-grained startup order |
| `deploy.replicas` | Service scaling |
| Init containers | Run tasks before app starts |
| Sidecars | Auxiliary services |

## Next Steps

You have completed the Docker tutorial! Review any topics as needed, and explore the `examples/` directory for hands-on practice with each concept.
