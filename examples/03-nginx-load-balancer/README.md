# Example: Nginx Load Balancer

This example demonstrates load balancing multiple application instances behind an Nginx reverse proxy.

## Architecture

```
Client -> Nginx (port 80)
            |
    +-------+-------+
    |       |       |
  App-1   App-2   App-3
 (3001)  (3002)  (3003)
```

## How to Run

```bash
cd examples/03-nginx-load-balancer

# Start all services
docker compose up --build -d

# Test load balancing
curl http://localhost
# Refresh multiple times to see different hostnames

# View logs from all app instances
docker compose logs -f app-1 app-2 app-3

# Scale up even more
docker compose up -d --scale app-1=2
```

## Key Concepts Demonstrated

- `upstream` directive in Nginx
- Load balancing algorithms (`round_robin`, `least_conn`, `ip_hash`)
- Reverse proxy configuration
- Multi-service Docker Compose setup
- Service-to-service communication
