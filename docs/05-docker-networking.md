# 05 - Docker Networking

Docker networking allows containers to communicate with each other and with the outside world. Understanding Docker's networking model is essential for building multi-container applications.

## Default Network Drivers

### `bridge` (Default)
- Private internal network on the host
- Containers on the same bridge network can communicate
- Each container gets its own IP address

### `host`
- Container shares the host's network stack
- No network isolation
- Fastest option but least secure

### `none`
- No networking at all
- Container is completely isolated

### `overlay`
- Connects multiple Docker daemons across hosts
- Used in Docker Swarm

## How Container Communication Works

When you use Docker Compose, it automatically creates a default bridge network for your project. Containers can reach each other by service name:

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"

  postgres:
    image: postgres:16

  redis:
    image: redis
```

From the `api` container:
```
postgres:5432   # reaches the postgres container
redis:6379      # reaches the redis container
api:3000        # reaches itself
```

## Custom Networks

```yaml
services:
  frontend:
    build: ./frontend
    networks:
      - public
      - backend

  api:
    build: ./api
    networks:
      - backend
      - database

  postgres:
    image: postgres:16
    networks:
      - database

networks:
  public:
    driver: bridge
  backend:
    driver: bridge
    internal: true    # No external access
  database:
    driver: bridge
    internal: true
```

## Network Aliases

```yaml
services:
  postgres-primary:
    image: postgres:16
    networks:
      mynet:
        aliases:
          - postgres
          - db
```

## Inspecting Networks

```bash
# List all networks
docker network ls

# Inspect a network
docker network inspect bridge

# Create a custom network
docker network create my-network

# Connect a container to a network
docker network connect my-network my-container

# Disconnect a container from a network
docker network disconnect my-network my-container
```

## DNS Resolution

Docker provides built-in DNS resolution. Inside a container:

```bash
# Resolve another container's IP
nslookup postgres

# Or ping
ping redis
```

## Port Binding

```yaml
services:
  app:
    image: nginx
    ports:
      - "8080:80"          # Bind host 8080 to container 80
      - "127.0.0.1:8081:80" # Bind localhost only
      - "3000"              # Bind to random host port
```

## Network Security Best Practices

1. **Use custom networks** to isolate services that don't need to talk
2. **Mark internal networks** with `internal: true` for databases
3. **Don't expose database ports** to the host unless necessary
4. **Use reverse proxies** (like Nginx) as the only public-facing service

```yaml
services:
  nginx:
    image: nginx
    ports:
      - "80:80"
    networks:
      - frontend

  api:
    build: .
    networks:
      - frontend
      - backend

  db:
    image: postgres
    networks:
      - backend
    # No ports exposed to host!

networks:
  frontend:
  backend:
    internal: true
```

## Debugging Network Issues

```bash
# Check container's network settings
docker inspect <container> --format '{{ .NetworkSettings }}'

# Test connectivity from inside a container
docker compose exec api sh
# Then inside the container:
apt-get update && apt-get install -y iputils-ping curl
ping postgres
curl http://api:3000/health
```

## Next Steps

Proceed to [06 - Volumes and Persistence](./06-volumes-and-persistence.md) to learn how to persist data.
