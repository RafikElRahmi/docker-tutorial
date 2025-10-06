# 17 - Docker Layer Caching

Docker builds images in layers, and each layer is cached. Understanding how layer caching works is essential for fast builds and efficient CI/CD pipelines.

## How Layer Caching Works

When Docker builds an image:
1. Each instruction in a Dockerfile creates a layer
2. If a layer and all previous layers haven't changed, Docker reuses the cached layer
3. Once a layer changes, all subsequent layers must be rebuilt

```dockerfile
FROM node:22-alpine       # Layer 1 - pulled from registry cache
WORKDIR /app              # Layer 2 - cached
COPY package.json ./      # Layer 3 - cached if file unchanged
RUN npm install           # Layer 4 - cached if Layer 3 unchanged
COPY . .                  # Layer 5 - rebuilt if ANY file changed
RUN npm run build         # Layer 6 - rebuilt if Layer 5 changed
```

## Cache Invalidation Rules

| Instruction | Cache Invalidated When |
|-------------|------------------------|
| `FROM` | Base image digest changes |
| `RUN` | Command string changes |
| `COPY` | Source file content changes |
| `ADD` | Source file content changes or URL changes |
| `WORKDIR` | Path changes |
| `ENV` | Value changes |
| `ARG` | Build arg value changes |

## Optimizing Cache Usage

### 1. Order Instructions by Change Frequency

```dockerfile
# BAD - npm install runs on every code change
COPY . .
RUN npm install

# GOOD - npm install only runs when package.json changes
COPY package.json ./
RUN npm install
COPY . .
```

### 2. Copy Dependency Files First

```dockerfile
# For Node.js with lock file
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
```

```dockerfile
# For Python
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
```

```dockerfile
# For Go
COPY go.mod go.sum ./
RUN go mod download
COPY . .
```

### 3. Separate Build and Production Dependencies

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# Dev dependencies (for building)
FROM base AS build
RUN pnpm install
COPY . .
RUN pnpm build

# Production dependencies only
FROM base AS production
RUN pnpm install --prod
COPY --from=build /app/dist ./dist
```

## BuildKit Cache Mounts

Docker BuildKit provides advanced caching with `RUN --mount=type=cache`:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
```

### Cache Mount Options

```dockerfile
# Persistent cache across builds
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Cache with specific ID (shared across stages)
RUN --mount=type=cache,target=/root/.npm,id=npm \
    npm install

# Cache with mode
RUN --mount=type=cache,target=/tmp/cache,mode=0777 \
    build-command
```

## Cache-From in CI/CD

Push cache layers to registry for CI builds. See [`.github/workflows/docker-build.yml`](../.github/workflows/docker-build.yml) for a working example that builds the NestJS app in GitHub Actions.

```bash
# Build with remote cache
docker buildx build \
  --cache-from type=registry,ref=myregistry/myapp:cache \
  --cache-to type=registry,ref=myregistry/myapp:cache,mode=max \
  -t myapp:latest \
  --push .
```

```yaml
# docker-compose.yml with BuildKit
services:
  app:
    build:
      context: .
      cache_from:
        - myapp:cache
```

## Inline Cache

```bash
docker buildx build \
  --cache-to type=inline \
  --cache-from myapp:latest \
  -t myapp:latest .
```

## Clearing Cache

```bash
# Remove build cache
docker builder prune

# Remove ALL build cache (including in-use)
docker builder prune -a

# Show build cache
docker system df -v

# Remove everything (containers, images, volumes, networks, cache)
docker system prune -a --volumes
```

## BuildKit Features

Enable BuildKit (default in modern Docker):

```bash
# In shell
export DOCKER_BUILDKIT=1

# In docker-compose
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1
```

## Parallel Builds with BuildKit

BuildKit can execute independent stages in parallel:

```dockerfile
# These two stages can build in parallel!
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS backend-build
WORKDIR /backend
COPY backend/package.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html
COPY --from=backend-build /backend/dist /usr/share/nginx/api
```

## Next Steps

Proceed to [18 - Advanced Compose Patterns](./18-advanced-compose-patterns.md).
