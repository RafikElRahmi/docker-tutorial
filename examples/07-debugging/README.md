# Example: Debugging Containers

This example provides common debugging scenarios and techniques for containerized applications.

## How to Run

```bash
cd examples/07-debugging

# Start the stack
docker compose up --build -d

# View logs
docker compose logs -f app

# Execute commands inside the container
docker compose exec app sh
# Inside container:
#   ps aux
#   netstat -tlnp
#   cat /etc/os-release

# Inspect container details
docker inspect debugging-app-1

# Check network
docker network inspect debugging_default

# Debug a crashing container
docker compose run --rm app sh
# Then manually run: node server.js

# Copy files from container to host
docker cp debugging-app-1:/app/package.json ./copied-package.json
```

## Key Concepts Demonstrated

- `docker logs` and `docker compose logs`
- `docker exec` for interactive debugging
- `docker inspect` for detailed information
- `docker cp` for file transfer
- Network debugging inside containers
- Running one-off commands for troubleshooting
