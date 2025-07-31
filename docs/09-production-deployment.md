# 09 - Production Deployment

Running containers in production requires careful attention to security, performance, and reliability. This guide covers essential practices.

## Production Dockerfile Checklist

### 1. Use a Minimal Base Image

```dockerfile
# Good - Alpine is ~5MB
FROM node:22-alpine AS production

# Avoid - Full Debian is ~900MB
FROM node:22 AS production
```

### 2. Run as Non-Root User

```dockerfile
FROM node:22-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

COPY --chown=appuser:nodejs . .
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 3. Multi-Stage Build

See [04 - Multi-Stage Builds](./04-multi-stage-builds.md) for details.

### 4. Pin Dependency Versions

```dockerfile
# Good
RUN npm install -g pnpm@10.9.0

# Risky
RUN npm install -g pnpm
```

## Production docker-compose.yml

```yaml
services:
  app:
    build:
      context: .
      target: production
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-prod:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 1G

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-prod:/data
    command: redis-server --requirepass ${REDIS_PASSWORD}
    deploy:
      resources:
        limits:
          memory: 256M

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

volumes:
  postgres-prod:
  redis-prod:
```

## Security Best Practices

### 1. Don't Run as Root
```dockerfile
USER appuser
```

### 2. Read-Only Root Filesystem
```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /var/log
```

### 3. Drop Unnecessary Capabilities
```yaml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### 4. No New Privileges
```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
```

### 5. Resource Limits
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 256M
    reservations:
      cpus: '0.25'
      memory: 128M
```

## Graceful Shutdown

Your application should handle SIGTERM signals properly:

```typescript
// NestJS bootstrap
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable shutdown hooks
  app.enableShutdownHooks();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## Health Checks in Production

Always define health checks so Docker knows when your app is ready:

```yaml
services:
  app:
    image: myapp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Logging

Configure proper logging in production:

```yaml
services:
  app:
    image: myapp
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Or use a log aggregation driver:
```yaml
logging:
  driver: fluentd
  options:
    fluentd-address: localhost:24224
    tag: docker.app
```

## Next Steps

Proceed to [10 - Healthchecks and Restarts](./10-healthchecks-and-restarts.md).
