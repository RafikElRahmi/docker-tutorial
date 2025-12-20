# Example: PostgreSQL + Redis with Node.js

This example demonstrates a multi-service Docker Compose setup with persistent storage, service dependency management, and health checks.

## Files

- `Dockerfile` - Node.js app image
- `docker-compose.yml` - PostgreSQL, Redis, and Node.js app services
- `package.json` - Express app with `pg` and `ioredis`
- `server.js` - App connecting to PostgreSQL and Redis
- `init.sql` - Schema initialization for PostgreSQL

## How to Run

```bash
cd examples/10-postgres-redis

# Build and start all services
docker compose up --build

# Visit http://localhost:3000
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | App status and counts |
| `GET /health` | Health check |

## Key Concepts Demonstrated

- **Named volumes** - PostgreSQL data persists across container restarts
- **Service dependencies** - App waits for `postgres` and `redis` to be healthy
- **Health checks** - Each service reports readiness before dependents start
- **Init scripts** - `init.sql` is mounted to `/docker-entrypoint-initdb.d/` for automatic schema creation

## Cleanup

```bash
# Stop and remove containers
docker compose down

# Stop and remove containers + volumes
docker compose down -v
```
