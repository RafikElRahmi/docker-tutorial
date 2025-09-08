# 14 - Debugging Containers

Debugging containerized applications requires a different set of tools compared to local development. This guide covers common debugging scenarios and techniques.

## Viewing Logs

### Container Logs

```bash
# View logs of a running container
docker logs my-container

# Follow logs in real-time
docker logs -f my-container

# Show last 100 lines
docker logs --tail 100 my-container

# Show logs with timestamps
docker logs -t my-container

# Show logs since a specific time
docker logs --since 2024-01-01T00:00:00 my-container
```

### Compose Logs

```bash
# View all service logs
docker compose logs -f

# View specific service
docker compose logs -f app

# Show last 50 lines of all services
docker compose logs --tail 50
```

## Executing Commands Inside Containers

```bash
# Open a shell in a running container
docker exec -it my-container sh

# For containers without bash/sh
docker exec -it my-container /bin/sh

# Run a one-off command
docker exec my-container ps aux

# Run as root (even if container runs as another user)
docker exec -u 0 -it my-container sh

# With docker compose
docker compose exec app sh
docker compose exec -u root app sh
```

## Inspecting Containers

```bash
# Full container inspection (JSON output)
docker inspect my-container

# Get specific fields
docker inspect my-container --format='{{.State.Status}}'
docker inspect my-container --format='{{.NetworkSettings.IPAddress}}'
docker inspect my-container --format='{{.Config.Env}}'

# View processes running in container
docker top my-container

# View resource usage stats
docker stats my-container

# View all stats (live updating)
docker stats
```

## Network Debugging

```bash
# Inspect container network
docker network inspect bridge

# Check container's network interfaces
docker exec my-container ip addr

# Test connectivity between containers
docker exec my-container ping other-container

# Check open ports
docker exec my-container netstat -tlnp

# Trace network requests
docker exec my-container apk add --no-cache curl curl
```

## Common Issues and Solutions

### 1. Container Exits Immediately

```bash
# Check exit code
docker inspect my-container --format='{{.State.ExitCode}}'

# Check for error messages
docker logs my-container

# Override CMD to keep container running
docker run --rm -it my-image sh
```

### 2. Port Binding Issues

```bash
# Check what's using a port
lsof -i :3000
netstat -tlnp | grep 3000

# Check container port mappings
docker port my-container

# Use random host port
docker run -p 3000 my-image
# Then find assigned port:
docker port my-container
```

### 3. Permission Denied

```bash
# Check container user
docker inspect my-container --format='{{.Config.User}}'

# Run as root for debugging
docker exec -u root -it my-container sh

# Check file permissions inside container
docker exec my-container ls -la /app
```

### 4. Volume Mount Issues

```bash
# Verify mount points
docker inspect my-container --format='{{json .Mounts}}' | jq

# Check if file exists in container
docker exec my-container cat /app/config.json

# Check bind mount on host
docker inspect my-container --format='{{range .Mounts}}{{if eq .Type "bind"}}{{.Source}} -> {{.Destination}}{{end}}{{end}}'
```

## Debugging Node.js Applications

### Enable Debug Mode

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
    command: node --inspect=0.0.0.0:9229 dist/main.js
```

### Attach Debugger

In VS Code `launch.json`:
```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker Debug",
  "remoteRoot": "/app",
  "localRoot": "${workspaceFolder}",
  "port": 9229
}
```

### Heap Dumps and Profiling

```bash
# Generate heap dump inside container
docker exec app node -e "require('v8').writeHeapSnapshot('/tmp/heap.heapsnapshot')"

# Copy to host
docker cp app:/tmp/heap.heapsnapshot ./heap.heapsnapshot
```

## Using Docker Desktop for Debugging

Docker Desktop provides a GUI for:
- Viewing container logs
- Inspecting container details
- Accessing container filesystem
- Monitoring resource usage
- Port forwarding visualization

## Debugging with Watch Mode

For rapid iteration during debugging:

```yaml
services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    command: pnpm start:debug
```

## Next Steps

Proceed to [15 - Docker Best Practices](./15-docker-best-practices.md).
