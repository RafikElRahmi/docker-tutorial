# Example: Compose Profiles

This example shows how to use Docker Compose profiles to manage optional services.

## How to Run

```bash
cd examples/09-compose-profiles

# Start only required services (app + db)
docker compose up --build -d

# Start with monitoring stack
docker compose --profile monitoring up -d

# Start with testing stack
docker compose --profile testing up -d

# Start with everything
docker compose --profile monitoring --profile testing up -d

# Check what's running
docker compose ps

# Access services
# App: http://localhost:3000
# Prometheus: http://localhost:9090
# Test Runner: docker compose --profile testing run --rm test

# Clean up
docker compose --profile monitoring --profile testing down
```

## Key Concepts Demonstrated

- `profiles` in service definition
- Running services selectively
- Multiple profiles at once
- Optional infrastructure stacks
- Testing profiles for CI/CD
