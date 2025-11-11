# Example: Health Checks and Restart Policies

This example demonstrates how Docker monitors container health and automatically recovers from failures.

## How to Run

```bash
cd examples/05-healthchecks

# Start the stack
docker compose up --build -d

# Check container health status
docker ps
# Look for (healthy) or (unhealthy) in STATUS column

# View health check logs
docker inspect --format='{{json .State.Health}}' healthchecks-app-1 | jq

# Simulate a failure (app will restart automatically)
docker compose exec app kill 1

# Watch the restart
docker compose logs -f app

# Stop everything
docker compose down
```

## Key Concepts Demonstrated

- Dockerfile `HEALTHCHECK` instruction
- Compose `healthcheck` configuration
- `depends_on` with `condition: service_healthy`
- Restart policies (`unless-stopped`, `on-failure`)
- Startup grace period with `start_period`
- Custom health check scripts
