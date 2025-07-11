# 04 - Multi-Stage Builds

Multi-stage builds allow you to use multiple `FROM` statements in your Dockerfile. Each `FROM` instruction can use a different base, and each begins a new stage of the build. You can selectively copy artifacts from one stage to another, leaving behind everything you don't want in the final image.

## Why Use Multi-Stage Builds?

1. **Smaller images**: Only ship what your application needs to run
2. **Separation of concerns**: Build dependencies don't end up in production
3. **Security**: Fewer packages in the final image means fewer vulnerabilities
4. **Build caching**: Each stage has its own cache layer

## Basic Example

### Before (Single Stage) - 1.2GB
```dockerfile
FROM node:22
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
```

### After (Multi-Stage) - 180MB
```dockerfile
# ---- Build Stage ----
FROM node:22 AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
CMD ["node", "dist/main.js"]
```

## Advanced Multi-Stage Pattern

```dockerfile
# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.9.0
COPY package.json pnpm-lock.yaml ./

# ---- Dependencies ----
FROM base AS dependencies
RUN pnpm install --frozen-lockfile --prod

# ---- Dev Dependencies ----
FROM base AS dev-dependencies
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM dev-dependencies AS build
COPY . .
RUN pnpm build

# ---- Production ----
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001

# Copy only production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json .

USER appuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
```

## Naming Stages and Cross-Referencing

You can name any stage and reference it later:

```dockerfile
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

FROM scratch
COPY --from=builder /app/myapp /myapp
ENTRYPOINT ["/myapp"]
```

## Using Build Targets in Compose

```yaml
services:
  app:
    build:
      context: .
      target: development    # Build only up to this stage
    volumes:
      - .:/app
      - /app/node_modules

  app-prod:
    build:
      context: .
      target: production
```

## Stopping at a Specific Stage

```bash
# Build only the builder stage
docker build --target builder -t myapp:builder .

# Build the full image
docker build -t myapp:latest .
```

## Common Patterns

| Pattern | Use Case |
|---------|----------|
| `builder` + `runtime` | Compile code, ship binary only |
| `dependencies` + `build` + `production` | Separate dev/prod deps |
| `test` stage | Run tests inside Docker without affecting production image |

## Example: Testing Stage

```dockerfile
FROM node:22 AS builder
# ... build steps

FROM builder AS test
RUN npm run test

FROM node:22-alpine AS production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]
```

```bash
# Run tests in Docker
docker build --target test -t myapp:test .
docker run myapp:test
```

## Next Steps

Proceed to [05 - Docker Networking](./05-docker-networking.md) to understand how containers communicate.
