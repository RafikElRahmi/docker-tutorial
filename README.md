# Docker Tutorial

A hands-on tutorial for [Docker](https://www.docker.com/) — the platform for building, running, and shipping containerized applications.

## What You'll Learn

| Topic | Description |
|-------|-------------|
| **Dockerfile Fundamentals** | FROM, WORKDIR, COPY, RUN, CMD, and image layering |
| **Docker Compose** | Multi-service apps, ports, volumes, networks |
| **Multi-Stage Builds** | Optimize image size and separate build from runtime |
| **Networking** | Bridge networks, custom networks, container communication |
| **Volumes & Persistence** | Bind mounts, named volumes, data backup strategies |
| **Environment Variables** | Configuration with .env files, ARG vs ENV |
| **Development Workflow** | Hot reload, VS Code dev containers, live debugging |
| **Production Deployment** | Security, non-root users, minimal base images |
| **Healthchecks & Restarts** | Monitoring containers and auto-recovery policies |
| **Nginx Reverse Proxy** | Load balancing, SSL termination, rate limiting |
| **Databases in Docker** | PostgreSQL, MongoDB, Redis with persistent storage |
| **Caching Strategies** | Redis caching and Docker build cache optimization |
| **Debugging Containers** | Logs, exec, inspect, network troubleshooting |
| **Resource Limits** | CPU, memory, and disk constraints |
| **Layer Caching** | BuildKit, cache mounts, CI/CD pipeline optimization |
| **Advanced Compose Patterns** | Profiles, extends, includes, init containers |

## Prerequisites

- Docker Desktop installed ([download](https://www.docker.com/products/docker-desktop/))
- Node.js 20+
- pnpm or npm
- Basic command-line knowledge

## Project Structure

```
docker-tutorial/
├── docs/               # 18 topic guides (read these first)
├── examples/           # 11 hands-on runnable examples
├── docker/             # Compose files for this app (dev/prod)
├── src/                # NestJS demo app used across examples
├── scripts/            # Docker helper script
├── .github/workflows/  # CI/CD pipeline
└── Makefile            # Common tasks
```

## Getting Started

```bash
pnpm install
```

Run the demo NestJS app with Docker:

```bash
# Development (with hot reload)
pnpm docker server up development

# Production
pnpm docker server up production

# Or use Docker Compose directly
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build
```

## Learning Path

**Beginner**: Start with `docs/01-introduction.md` → `02-dockerfile-fundamentals.md` → `03-docker-compose-basics.md`, then run examples `01-basic-node-app` and `02-multi-stage-build`.

**Intermediate**: Continue with docs `04–08`, try examples `03-nginx-load-balancer` through `05-healthchecks`.

**Advanced**: Study docs `09–18`, explore examples `06-resource-limits` through `11-volume-backup`.

## Hands-On Examples

Each example is self-contained with its own `docker-compose.yml` and `README.md`:

| Example | What You'll Learn |
|---------|-------------------|
| [`01-basic-node-app`](examples/01-basic-node-app/) | Build and run a simple containerized Node.js app |
| [`02-multi-stage-build`](examples/02-multi-stage-build/) | Shrink image size from ~1.2 GB to ~180 MB |
| [`03-nginx-load-balancer`](examples/03-nginx-load-balancer/) | Load balance across multiple app replicas |
| [`04-environment-config`](examples/04-environment-config/) | Manage config with .env files and ARG/ENV |
| [`05-healthchecks`](examples/05-healthchecks/) | Health checks and restart policies |
| [`06-resource-limits`](examples/06-resource-limits/) | CPU/memory constraints and OOM handling |
| [`07-debugging`](examples/07-debugging/) | Logs, exec, and inspect for troubleshooting |
| [`08-advanced-networking`](examples/08-advanced-networking/) | Custom networks and service isolation |
| [`09-compose-profiles`](examples/09-compose-profiles/) | Optional service groups with Compose profiles |
| [`10-postgres-redis`](examples/10-postgres-redis/) | Multi-service app with PostgreSQL, Redis, and health checks |
| [`11-volume-backup`](examples/11-volume-backup/) | Backup and restore named volumes with tar |

## CI/CD

A GitHub Actions workflow (`.github/workflows/docker-build.yml`) is included to demonstrate building the NestJS app in CI, running smoke tests, and pushing to GHCR.

## Full Documentation

See [`docs/README.md`](docs/README.md) for the complete table of contents.
