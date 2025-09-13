# 15 - Docker Best Practices

Following best practices ensures your Docker images are secure, small, and build quickly. This guide compiles essential rules for production-grade containers.

## 1. Use Minimal Base Images

```dockerfile
# Avoid - large attack surface
FROM ubuntu:22.04

# Better - smaller, still glibc
FROM node:22-slim

# Best - minimal, musl libc
FROM node:22-alpine

# Ultra-minimal - only for static binaries
FROM scratch
```

Alpine Linux is ~5MB compared to Debian's ~100MB. However, Alpine uses `musl` instead of `glibc`, which can cause issues with some native modules.

## 2. Pin Image Versions

```dockerfile
# Bad - non-reproducible builds
FROM node:latest

# Good - reproducible builds
FROM node:22.11.0-alpine

# Better - with SHA for immutability
FROM node:22.11.0-alpine@sha256:ab71c...
```

## 3. Run as Non-Root User

```dockerfile
FROM node:22-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Set ownership
COPY --chown=appuser:nodejs . .

# Switch to non-root
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
```

## 4. Optimize Layer Ordering

Order instructions from least-changing to most-changing:

```dockerfile
# 1. Base image (rarely changes)
FROM node:22-alpine

# 2. System dependencies (rarely changes)
RUN apk add --no-cache dumb-init

# 3. Application dependencies (changes when package.json changes)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 4. Application code (changes frequently)
COPY . .
RUN pnpm build

# 5. Runtime config
EXPOSE 3000
CMD ["dumb-init", "node", "dist/main.js"]
```

## 5. Use .dockerignore

Prevent unnecessary files from being copied into the build context. A large context slows down builds and bloats the cache.

### Before (no .dockerignore)

```bash
# Build context includes everything — node_modules, .git, logs, docs
# Result: context size ~500 MB, slow COPY and cache invalidation
docker build -t myapp .
```

### After (with .dockerignore)

```
# Dependencies
node_modules

# Git
.git
.gitignore

# Environment
.env
.env.*

# IDE
.vscode
.idea

# Logs
logs
*.log

# Tests
coverage
test
*.spec.ts
*.test.ts

# Build artifacts
dist
build

# Documentation
README.md
docs

# CI/CD
.github
.gitlab-ci.yml
```

```bash
# Build context shrinks to ~5 MB — only source code and manifests are sent
docker build -t myapp .
```

Check your build context size anytime with:

```bash
docker build --no-cache -t myapp .  # watch the "Sending build context" line
```

## 6. Minimize Layer Count

Combine related commands:

```dockerfile
# Bad - creates 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# Good - creates 1 layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
```

## 7. Clean Up in the Same Layer

```dockerfile
# Bad - package cache remains in a previous layer
RUN apt-get update && apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# Good - clean up in the same layer
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

## 8. Use Multi-Stage Builds

See [04 - Multi-Stage Builds](./04-multi-stage-builds.md) for details.

## 9. Handle Signals Properly

Use `dumb-init` or `tini` as PID 1 to properly handle signals:

```dockerfile
FROM node:22-alpine
RUN apk add --no-cache dumb-init
USER node
EXPOSE 3000
CMD ["dumb-init", "node", "server.js"]
```

Or use Docker's `--init` flag:
```bash
docker run --init my-image
```

## 10. Scan Images for Vulnerabilities

### Docker Scout

Docker Scout analyzes images for CVEs and provides actionable remediation advice:

```bash
# Quick CVE scan
docker scout cves my-image:latest

# Compare two images (e.g., before/after a base image update)
docker scout compare --to my-image:old my-image:new

# Generate a SARIF report for CI integration
docker scout cves --format sarif --output report.sarif my-image:latest

# Enforce a policy (e.g., no critical CVEs)
docker scout policy my-image:latest
```

> Docker Scout requires a Docker Hub account and is available in Docker Desktop 4.17+ and Docker Engine with the `docker scout` CLI plugin.

### Alternative Scanners

```bash
# Using Trivy
trivy image my-image:latest

# Using Snyk
snyk container test my-image:latest
```

## 11. Don't Store Secrets in Images

```dockerfile
# BAD - secrets embedded in image layers
ENV DATABASE_PASSWORD=supersecret123

# GOOD - use env vars at runtime
docker run -e DATABASE_PASSWORD=supersecret123 my-image

# BETTER - use Docker secrets (Swarm) or external vaults
```

## 12. Set Resource Limits

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 13. Use Read-Only Root Filesystem

```yaml
services:
  app:
    image: myapp
    read_only: true
    tmpfs:
      - /tmp
      - /var/log
```

## 14. Keep Images Updated

Regularly rebuild images to get security patches:

```bash
# Pull latest base image
docker pull node:22-alpine

# Rebuild your image
docker build --no-cache -t myapp:latest .
```

## 15. Document Your Dockerfile

```dockerfile
# syntax=docker/dockerfile:1
# Description: Production NestJS API
# Author: Dev Team

FROM node:22-alpine AS base
# ... rest of Dockerfile
```

## Container Alternatives

While Docker is the most widely used container runtime, alternatives exist with different security models and compatibility profiles:

### Podman

[Podman](https://podman.io/) is a daemonless, rootless container engine that is CLI-compatible with Docker:

```bash
# Most Docker commands work with Podman by swapping the binary
podman build -t myapp .
podman run -p 3000:3000 myapp
podman compose up -d
```

**Key differences:**
- **Daemonless** — containers run as child processes of the user, not a persistent daemon
- **Rootless by default** — no root privileges required to run containers
- **Pod concept** — native support for Kubernetes-style pods (groups of containers sharing namespaces)
- **Docker Compose** — works via `podman-compose` or Docker compatibility mode

**When to consider Podman:**
- Security-focused environments where daemonless/rootless operation is preferred
- Development workflows that closely mirror Kubernetes pod semantics
- Environments where running the Docker daemon is restricted

> Podman is not a drop-in replacement for every Docker workflow (e.g., BuildKit advanced features, Docker Desktop extensions), but it covers the vast majority of container use cases.

## Security Checklist

- [ ] Base image is minimal and up-to-date
- [ ] Container runs as non-root user
- [ ] No secrets in image layers
- [ ] Image scanned for vulnerabilities
- [ ] Read-only root filesystem where possible
- [ ] Capabilities dropped to minimum
- [ ] Resource limits configured
- [ ] Health checks defined
- [ ] Proper signal handling (PID 1)

## Next Steps

Proceed to [16 - Resource Limits](./16-resource-limits.md).
