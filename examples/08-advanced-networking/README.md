# Example: Advanced Networking

This example demonstrates custom Docker networks, network isolation, and cross-network communication.

## How to Run

```bash
cd examples/08-advanced-networking

# Start the stack
docker compose up --build -d

# Test public API
curl http://localhost:8080/api

# Test that database is NOT accessible from public network
docker compose exec public ping db
# Should fail - db is on internal network only

# Test that API can reach database
docker compose exec api ping db
# Should succeed

# Inspect networks
docker network ls
docker network inspect advanced-networking_public
docker network inspect advanced-networking_backend

# Clean up
docker compose down
```

## Architecture

```
Public Network (8080)
    |
  Nginx (public)
    |
Backend Network
    |
  API ----> Database (internal only)
```

## Key Concepts Demonstrated

- Custom bridge networks
- `internal: true` for isolated networks
- Service aliases
- Cross-network communication
- Network security boundaries
