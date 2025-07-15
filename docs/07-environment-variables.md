# 07 - Environment Variables

Environment variables are the standard way to configure containerized applications. They allow you to change behavior without modifying code or rebuilding images.

## Methods to Pass Environment Variables

### 1. Directly in docker-compose.yml

```yaml
services:
  app:
    image: node:22
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
```

Or using key-value syntax:

```yaml
services:
  app:
    image: node:22
    environment:
      NODE_ENV: production
      PORT: 3000
```

### 2. From an .env File

Create a `.env` file in the same directory as your `docker-compose.yml`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:pass@db:5432/mydb
REDIS_URL=redis://redis:6379
```

Then reference it:

```yaml
services:
  app:
    image: node:22
    env_file:
      - .env
      - .env.local
```

### 3. From Host Environment

```yaml
services:
  app:
    image: node:22
    environment:
      - NODE_ENV           # Takes value from host's NODE_ENV
      - HOSTNAME           # Takes value from host's HOSTNAME
```

### 4. Variable Substitution in Compose

```yaml
services:
  app:
    image: node:22
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
```

- `${VAR}` - Substitute value
- `${VAR:-default}` - Use default if VAR is unset
- `${VAR:?error}` - Raise error if VAR is unset

### 5. Build-Time Variables (ARG)

```dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
```

```yaml
services:
  app:
    build:
      context: .
      args:
        NODE_ENV: development
```

## ARG vs ENV

| | `ARG` | `ENV` |
|--|-------|-------|
| Available at build time | Yes | Yes |
| Available at runtime | No | Yes |
| Cached in layers | Yes | Yes |
| Can be overridden at run | No | Yes |

## .env File Best Practices

### Example .env file:
```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb

# MongoDB
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_USER=mongouser
MONGO_PASSWORD=mongopass

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redispass
```

### .env.example

Always commit a `.env.example` (without secrets) so new developers know what to configure:

```env
NODE_ENV=development
PORT=3000
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

### Never Commit .env

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

## Accessing Environment Variables in Node.js

```typescript
// config/database.config.ts
export const databaseConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
};
```

## Docker Secrets (Production Alternative)

For production, consider using Docker Swarm secrets or external secret managers instead of `.env` files.

```yaml
services:
  app:
    image: myapp
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## Next Steps

Proceed to [08 - Development Workflow](./08-development-workflow.md) to learn about hot reload and dev setups.
