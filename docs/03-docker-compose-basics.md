# 03 - Docker Compose Basics

Docker Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application's services, networks, and volumes.

## Why Docker Compose?

- Define your entire stack in one file
- Start everything with `docker compose up`
- Consistent environment across teams
- Easy to version control your infrastructure

## docker-compose.yml Structure

```yaml
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:
      - api

  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:

networks:
  backend:
    driver: bridge
```

## Key Sections

### `services`
Defines the containers you want to run. Each service becomes a container.

### `build` vs `image`
- `image`: Use an existing image from a registry
- `build`: Build an image from a Dockerfile

```yaml
services:
  app:
    build:
      context: ../          # Where the Dockerfile lives
      dockerfile: Dockerfile
      target: development   # Specific build stage
      args:
        NODE_ENV: development
```

### `ports`
Maps host ports to container ports.

```yaml
ports:
  - "8080:80"      # Host:Container
  - "3000-3010:3000-3010"  # Range mapping
```

### `volumes`
Mounts persistent storage or host directories into containers.

```yaml
volumes:
  - ./src:/app/src        # Bind mount (development)
  - app-data:/app/data    # Named volume (persistence)
  - /app/node_modules     # Anonymous volume (protect from bind mount)
```

### `depends_on`
Controls startup order. Note: it waits for the container to start, not for the service inside to be ready.

```yaml
depends_on:
  - postgres
  - redis
```

### `environment`
Sets environment variables inside the container.

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
# OR
environment:
  NODE_ENV: production
  PORT: 3000
```

### `env_file`
Loads environment variables from a file.

```yaml
env_file:
  - .env
  - .env.local
```

## Essential Commands

```bash
# Start all services in detached mode
docker compose up -d

# Start with specific compose files
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Stop and remove containers, networks
docker compose down

# Stop and remove containers + volumes
docker compose down -v

# View logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f api

# Restart a service
docker compose restart api

# Build or rebuild services
docker compose build

# Scale a service
docker compose up -d --scale api=3

# Execute a command in a running container
docker compose exec api sh

# List running containers
docker compose ps
```

## Compose File Versions

Modern Docker uses the Compose Specification (no version required). The old `version: "3.9"` syntax is still supported but optional.

## Profiles

Run specific services based on profiles:

```yaml
services:
  backend:
    image: myapp

  frontend:
    image: myfrontend
    profiles: ["frontend"]
```

```bash
# Only starts backend
docker compose up -d

# Starts both backend and frontend
docker compose --profile frontend up -d
```

## Next Steps

Proceed to [04 - Multi-Stage Builds](./04-multi-stage-builds.md) to optimize your Docker images.
