# Example: Resource Limits

This example demonstrates how to constrain CPU, memory, and other resources for containers.

## How to Run

```bash
cd examples/06-resource-limits

# Start with resource limits
docker compose up --build -d

# Monitor resource usage
docker stats

# Stress test the app
curl http://localhost:3000/memory/100

# Watch memory usage climb and get constrained
docker stats resource-limits-app-1

# Check if OOM killed
docker inspect resource-limits-app-1 --format='{{.State.OOMKilled}}'

# Stop everything
docker compose down
```

## Key Concepts Demonstrated

- Memory limits and reservations
- CPU limits and shares
- Pid limits
- ulimits (file descriptors)
- OOM (Out of Memory) behavior
- Resource monitoring with `docker stats`
