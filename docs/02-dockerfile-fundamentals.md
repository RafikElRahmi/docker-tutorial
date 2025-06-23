# 02 - Dockerfile Fundamentals

A `Dockerfile` is a text document that contains all the commands a user could call on the command line to assemble an image. Understanding each instruction is key to building efficient containers.

## Essential Instructions

### `FROM`
Sets the base image for subsequent instructions. Every Dockerfile must start with `FROM`.

```dockerfile
FROM node:22-alpine
```

**Tip**: Use specific version tags (`node:22-alpine`) instead of `latest` to ensure reproducible builds.

### `WORKDIR`
Sets the working directory for any `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, and `ADD` instructions that follow.

```dockerfile
WORKDIR /app
```

**Tip**: Use `WORKDIR` instead of `cd` in `RUN` commands. It is cleaner and creates the directory if it does not exist.

### `COPY` vs `ADD`
Both copy files from the host into the image, but `COPY` is preferred for local files because it is more transparent.

```dockerfile
COPY package.json pnpm-lock.yaml ./
COPY . .
```

- Use `COPY` for local files and directories.
- Use `ADD` only when you need auto-extraction of tar archives or fetching remote URLs.

### `RUN`
Executes commands in a new layer on top of the current image and commits the results.

```dockerfile
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

**Tip**: Chain commands with `&&` and clean up in the same layer to reduce image size.

### `CMD`
Provides defaults for an executing container. There can only be one `CMD` in a Dockerfile.

```dockerfile
CMD ["node", "dist/main.js"]
```

### `ENTRYPOINT`
Configures a container that will run as an executable. `CMD` arguments are appended to `ENTRYPOINT`.

```dockerfile
ENTRYPOINT ["node"]
CMD ["dist/main.js"]
```

### `EXPOSE`
Documents which ports the container listens on at runtime. It does not actually publish the port.

```dockerfile
EXPOSE 3000
```

### `ENV`
Sets environment variables that persist when the container is running.

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

### `ARG`
Defines variables that users can pass at build-time with `docker build --build-arg`.

```dockerfile
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
```

**Difference**: `ARG` values are only available during build. `ENV` values are available during build AND at runtime.

### `USER`
Sets the user name or UID to use when running the image.

```dockerfile
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
```

**Security Tip**: Never run containers as root in production. Always create and switch to a non-root user.

### `.dockerignore`
Like `.gitignore`, it prevents unwanted files from being copied into the image.

```
node_modules
.git
.env
coverage
dist
.vscode
.idea
```

## Example: Complete Dockerfile

```dockerfile
# ---- Base Stage ----
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.9.0
COPY package.json pnpm-lock.yaml ./

# ---- Dependencies Stage ----
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# ---- Build Stage ----
FROM dependencies AS build
COPY . .
RUN pnpm build

# ---- Production Stage ----
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json .
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Layer Caching Explained

Docker builds images in layers. If a layer hasn't changed, Docker reuses the cached version. This is why you should order instructions from least-changing to most-changing:

1. Base image (`FROM`)
2. System dependencies (`RUN apt-get`)
3. Application dependencies (`COPY package.json && npm install`)
4. Application code (`COPY . .`)
5. Build command (`RUN npm run build`)

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Using `latest` tag | Pin specific versions |
| Running as root | Add `USER` instruction |
| Large image size | Use `-alpine` or `-slim` base images |
| Forgetting `.dockerignore` | Add one to exclude `node_modules`, `.git`, etc. |
| One giant `RUN` layer | Chain commands, but group logically |

## Next Steps

Proceed to [03 - Docker Compose Basics](./03-docker-compose-basics.md) to learn how to orchestrate multiple containers.
