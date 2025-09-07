# 13 - Caching Strategies

Caching is essential for performance in modern applications. Docker makes it easy to add caching layers with Redis, and understanding Docker's own build cache is equally important.

## Application Caching with Redis

### Redis as a Cache Store

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [createKeyv('redis://default:password@redis:6379')],
      }),
    }),
  ],
})
export class AppModule {}
```

### Using the Cache

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {}

  async getUser(id: string) {
    const cached = await this.cacheManager.get(`user:${id}`);
    if (cached) return cached;

    const user = await this.findUserInDatabase(id);
    await this.cacheManager.set(`user:${id}`, user, 60000); // TTL: 60s
    return user;
  }

  async invalidateUser(id: string) {
    await this.cacheManager.del(`user:${id}`);
  }
}
```

### Cache Invalidation Strategies

| Strategy | When to Use |
|----------|-------------|
| **TTL (Time To Live)** | Data that can be stale for a short time |
| **Write-Through** | Update cache when database is updated |
| **Write-Behind** | High write throughput, accept eventual consistency |
| **Cache-Aside** | Most common; application manages cache |

### Multi-Layer Caching

```typescript
@Module({
  imports: [
    // In-memory cache (L1 - fastest)
    CacheModule.register({
      ttl: 5000,  // 5 seconds
      max: 100,
      name: 'IN_MEMORY_CACHE',
    }),
    // Redis cache (L2 - shared across instances)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [createKeyv('redis://redis:6379')],
      }),
    }),
  ],
})
export class AppModule {}
```

## Docker Build Cache

Docker caches each layer of your image. Understanding this is crucial for fast builds.

### How Layer Caching Works

```dockerfile
FROM node:22-alpine          # Layer 1 - pulled from cache
WORKDIR /app                 # Layer 2 - cached if same
COPY package.json ./         # Layer 3 - cached if package.json unchanged
RUN npm install              # Layer 4 - cached if package.json unchanged
COPY . .                     # Layer 5 - changes on every code change
RUN npm run build            # Layer 6 - rebuilds on every code change
```

### Optimizing for Cache

**Bad** - Cache invalidated on every code change:
```dockerfile
COPY . .
RUN npm install
```

**Good** - Dependencies cached separately from code:
```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
```

### BuildKit Cache Mounts

Modern Docker (BuildKit) allows cache mounts that persist across builds:

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

### Cache Mount Types

```dockerfile
# Mount a cache directory (persists across builds)
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Mount a secret (not stored in image layers)
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm install

# Mount an SSH key for private repos
RUN --mount=type=ssh \
    git clone git@github.com:org/private-repo.git
```

## Clearing the Build Cache

```bash
# Remove all build cache
docker builder prune

# Remove unused build cache
docker builder prune --filter unused-for=24h

# Show build cache usage
docker system df

# Full system cleanup (images, containers, volumes, networks)
docker system prune -a
```

## Redis Cache Configuration

### docker-compose.yml with Redis

```yaml
services:
  app:
    build: .
    environment:
      - REDIS_URL=redis://:password@redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: >
      redis-server
      --requirepass password
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    deploy:
      resources:
        limits:
          memory: 256M

volumes:
  redis-data:
```

### Redis Eviction Policies

| Policy | Description |
|--------|-------------|
| `noeviction` | Return errors when memory limit reached |
| `allkeys-lru` | Remove least recently used keys |
| `allkeys-lfu` | Remove least frequently used keys |
| `volatile-lru` | Remove LRU keys with an expire set |
| `allkeys-random` | Remove random keys |
| `volatile-ttl` | Remove keys with shortest TTL |

## Next Steps

Proceed to [14 - Debugging Containers](./14-debugging-containers.md).
