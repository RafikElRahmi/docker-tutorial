# 12 - Databases in Docker

Running databases in containers is common for development and increasingly popular in production. This guide covers MongoDB, PostgreSQL, and Redis.

## PostgreSQL

### Basic Setup

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myuser -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

### Initialization Scripts

Place `.sql` or `.sh` files in a mounted `/docker-entrypoint-initdb.d/` directory:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
```

`init-scripts/01-schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Performance Tuning

```yaml
services:
  postgres:
    image: postgres:16-alpine
    shm_size: 256mb          # Shared memory for sorts/joins
    command:
      - postgres
      - -c
      - max_connections=200
      - -c
      - shared_buffers=256MB
    deploy:
      resources:
        limits:
          memory: 1G
```

## MongoDB

### Basic Setup

```yaml
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  mongo-express:
    image: mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password
      ME_CONFIG_MONGODB_URL: mongodb://admin:password@mongo:27017/
    depends_on:
      - mongo

volumes:
  mongo-data:
```

### Replica Set (Production)

```yaml
services:
  mongo-primary:
    image: mongo:7
    command: ["--replSet", "rs0", "--bind_ip_all"]
    volumes:
      - mongo-primary:/data/db

  mongo-secondary:
    image: mongo:7
    command: ["--replSet", "rs0", "--bind_ip_all"]
    volumes:
      - mongo-secondary:/data/db

  mongo-arbiter:
    image: mongo:7
    command: ["--replSet", "rs0", "--bind_ip_all"]

volumes:
  mongo-primary:
  mongo-secondary:
```

## Redis

### Basic Setup

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass mypassword --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"

volumes:
  redis-data:
```

### Redis with Persistence

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: >
      redis-server
      --requirepass mypassword
      --appendonly yes
      --appendfsync everysec
      --save 60 1000
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Redis Sentinel (High Availability)

```yaml
services:
  redis-master:
    image: redis:7-alpine
    command: redis-server --requirepass mypassword

  redis-replica:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379 --masterauth mypassword

  redis-sentinel:
    image: redis:7-alpine
    command: >
      sh -c "echo 'sentinel monitor mymaster redis-master 6379 2' > /etc/sentinel.conf &&
             echo 'sentinel auth-pass mymaster mypassword' >> /etc/sentinel.conf &&
             redis-sentinel /etc/sentinel.conf"
```

## Connection Strings in Applications

### PostgreSQL (TypeORM)
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [],
  synchronize: process.env.NODE_ENV === 'development',
});
```

### MongoDB (Mongoose)
```typescript
MongooseModule.forRoot(
  process.env.MONGO_URL || 'mongodb://user:pass@mongo:27017/mydb',
);
```

### Redis
```typescript
CacheModule.registerAsync({
  useFactory: async () => ({
    stores: [createKeyv(process.env.REDIS_URL || 'redis://redis:6379')],
  }),
});
```

## Database Backup and Restore

### PostgreSQL

```bash
# Backup
docker compose exec postgres pg_dump -U myuser mydb > backup.sql

# Restore
docker compose exec -T postgres psql -U myuser mydb < backup.sql
```

### MongoDB

```bash
# Backup
docker compose exec mongo mongodump --out /data/backup/
docker cp $(docker compose ps -q mongo):/data/backup ./backup

# Restore
docker cp ./backup $(docker compose ps -q mongo):/data/backup
docker compose exec mongo mongorestore /data/backup/
```

### Redis

```bash
# Backup (RDB snapshot is saved automatically if AOF is enabled)
docker compose exec redis redis-cli BGSAVE
docker cp $(docker compose ps -q redis):/data/dump.rdb ./backup.rdb
```

## Next Steps

Proceed to [13 - Caching Strategies](./13-caching-strategies.md).
