# 08 - Development Workflow

One of Docker's biggest strengths is creating consistent development environments. This guide covers best practices for developing inside containers.

## Hot Reload with Bind Mounts

For Node.js/NestJS development, you want code changes to reflect immediately without rebuilding.

### docker-compose.dev.yml

```yaml
services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app              # Bind mount source code
      - /app/node_modules   # Protect container's node_modules
      - /app/dist           # Protect container's build output
    environment:
      - NODE_ENV=development
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: devdb
    volumes:
      - postgres-dev:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres-dev:
```

### Dockerfile with Dev Target

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.9.0
COPY package.json pnpm-lock.yaml ./

FROM base AS development
RUN pnpm install
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "start:dev"]   # NestJS watch mode

FROM base AS production
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "start:prod"]
```

## Running with Multiple Compose Files

Use a base file plus environment-specific overrides:

```bash
# Base + dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Base + prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### docker-compose.yml (base)
```yaml
services:
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
```

### docker-compose.dev.yml (override)
```yaml
services:
  app:
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

### docker-compose.prod.yml (override)
```yaml
services:
  app:
    build:
      target: production
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## VS Code + Dev Containers

For the ultimate development experience, use VS Code Dev Containers:

1. Install the "Dev Containers" extension
2. Create `.devcontainer/devcontainer.json`:

```json
{
  "name": "Node.js & PostgreSQL",
  "dockerComposeFile": ["../docker-compose.dev.yml"],
  "service": "app",
  "workspaceFolder": "/app",
  "forwardPorts": [3000, 5432, 8081],
  "postCreateCommand": "pnpm install",
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  }
}
```

## Debugging Inside Containers

### Node.js Debug with VS Code

Launch configuration:
```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach to Node",
  "remoteRoot": "/app",
  "localRoot": "${workspaceFolder}",
  "port": 9229
}
```

Update docker-compose.dev.yml:
```yaml
services:
  app:
    # ... other config
    ports:
      - "3000:3000"
      - "9229:9229"   # Debug port
    command: pnpm start:debug   # Runs with --inspect-brk
```

## Useful Dev Commands

```bash
# Watch logs in real-time
docker compose logs -f app

# Execute commands inside the container
docker compose exec app pnpm test
docker compose exec app sh

# Restart a single service
docker compose restart app

# Rebuild after dependency changes
docker compose up -d --build app

# Run one-off commands
docker compose run --rm app pnpm migrate
```

## Next Steps

Proceed to [09 - Production Deployment](./09-production-deployment.md) to learn production best practices.
