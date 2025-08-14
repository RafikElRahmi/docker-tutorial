# 10 - Healthchecks and Restarts

Docker provides mechanisms to monitor container health and automatically recover from failures. Properly configured health checks and restart policies are essential for production reliability.

## Health Checks

A health check tells Docker whether your application inside the container is actually working, not just whether the process is running.

### Dockerfile HEALTHCHECK

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "server.js"]
```

### docker-compose Healthcheck

```yaml
services:
  api:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Healthcheck Options

| Option | Description | Default |
|--------|-------------|---------|
| `interval` | Time between checks | 30s |
| `timeout` | Maximum time for check to complete | 30s |
| `retries` | Consecutive failures before unhealthy | 3 |
| `start_period` | Grace period during startup | 0s |
| `disable` | Disable healthcheck | false |

### Healthcheck States

- `starting` - Initial grace period (`start_period`)
- `healthy` - Check passed
- `unhealthy` - Check failed `retries` times

### Viewing Health Status

```bash
# Check container health
docker ps
# STATUS column shows (healthy), (unhealthy), or (health: starting)

# Inspect health details
docker inspect --format='{{.State.Health.Status}}' my-container

# View health check logs
docker inspect --format='{{json .State.Health}}' my-container | jq
```

### Custom Health Check Script

```javascript
// healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.error(`Health check failed with status ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();
```

## Restart Policies

Control what happens when a container exits.

| Policy | Behavior |
|--------|----------|
| `no` | Never restart (default) |
| `always` | Always restart, regardless of exit code |
| `unless-stopped` | Always restart unless manually stopped |
| `on-failure` | Restart only on non-zero exit code |

### Examples

```yaml
services:
  api:
    image: myapp
    restart: unless-stopped

  worker:
    image: myworker
    restart: on-failure:5    # Max 5 restart attempts

  one-shot:
    image: myjob
    restart: "no"            # Run once and done
```

### Restart Delay Backoff

Docker automatically applies an exponential backoff delay between restarts:
- 1st restart: immediate
- 2nd restart: 100ms
- 3rd restart: 200ms
- 4th restart: 400ms
- ... up to a maximum delay

## Combining Health Checks and Restart Policies

```yaml
services:
  api:
    build: .
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy    # Wait for postgres to be healthy

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    volumes:
      - pgdata:/var/lib/postgresql/data
```

**Note**: `condition: service_healthy` requires Compose v2.20+ or the older `version: "3.9"` format with compatible Docker Engine.

## Database Health Checks

### PostgreSQL
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### MongoDB
```yaml
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### Redis
```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## Next Steps

Proceed to [11 - Nginx Reverse Proxy](./11-nginx-reverse-proxy.md).
