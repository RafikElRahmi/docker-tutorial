# 06 - Volumes and Persistence

By default, all data inside a container is ephemeral. When the container stops or is removed, the data is lost. Volumes and bind mounts solve this problem by persisting data outside the container's filesystem.

## Types of Storage

### 1. Bind Mounts
Mounts a host directory or file into the container. Changes are immediately reflected on both sides.

```yaml
services:
  app:
    image: node:22
    volumes:
      - ./src:/app/src      # Host path : Container path
```

**Use case**: Development, when you want code changes to reflect immediately.

### 2. Named Volumes
Managed by Docker, stored in Docker's data directory on the host. Survives container removal.

```yaml
services:
  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Use case**: Production databases, any data that must persist.

### 3. Anonymous Volumes
Similar to named volumes but without a name. Docker assigns a random name.

```yaml
services:
  app:
    image: node:22
    volumes:
      - /app/node_modules
```

**Use case**: Protecting container directories from being overwritten by bind mounts.

### 4. tmpfs Mounts
Stored in host memory only. Fast but not persisted.

```yaml
services:
  app:
    image: node:22
    tmpfs:
      - /tmp
```

**Use case**: Sensitive data, temporary files.

## Volume Comparison

| Type | Persistence | Host Path Known | Use Case |
|------|-------------|-----------------|----------|
| Bind Mount | Yes | Yes | Development, config files |
| Named Volume | Yes | No | Databases, persistent data |
| Anonymous Volume | Container lifetime | No | Protecting dirs from bind mounts |
| tmpfs | No | No | Sensitive temp data |

## Advanced Volume Configuration

### Named Volume with Driver Options

```yaml
volumes:
  pgdata:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /host/path/to/pgdata
```

### Read-Only Bind Mounts

```yaml
services:
  app:
    image: nginx
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
```

### Volume from Another Container

```yaml
services:
  builder:
    build: .
    volumes:
      - build-output:/app/dist

  nginx:
    image: nginx
    volumes:
      - build-output:/usr/share/nginx/html:ro

volumes:
  build-output:
```

## Managing Volumes

```bash
# List all volumes
docker volume ls

# Inspect a volume
docker volume inspect pgdata

# Remove unused volumes
docker volume prune

# Remove a specific volume
docker volume rm pgdata
```

## The `node_modules` Problem in Node.js

When you bind mount your project root, you overwrite the container's `node_modules`:

```yaml
services:
  app:
    build: .
    volumes:
      - .:/app           # This overwrites /app/node_modules!
```

**Solution**: Use an anonymous volume to protect `node_modules`:

```yaml
services:
  app:
    build: .
    volumes:
      - .:/app
      - /app/node_modules   # Preserves container's node_modules
```

## Database Persistence Example

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  postgres-data:
  mongo-data:
  redis-data:
```

## Backing Up Volumes

```bash
# Backup a named volume
docker run --rm -v pgdata:/source -v $(pwd):/backup alpine \
  tar czf /backup/pgdata-backup.tar.gz -C /source .

# Restore a named volume
docker run --rm -v pgdata:/target -v $(pwd):/backup alpine \
  tar xzf /backup/pgdata-backup.tar.gz -C /target
```

## Next Steps

Proceed to [07 - Environment Variables](./07-environment-variables.md) to learn configuration management.
