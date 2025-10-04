# 16 - Resource Limits

Without resource limits, a single container can consume all host resources, causing system instability. Docker provides mechanisms to constrain CPU, memory, and other resources.

## Memory Limits

### In docker-compose.yml

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          memory: 512M        # Hard limit - OOM if exceeded
        reservations:
          memory: 256M        # Soft limit - guaranteed minimum
```

### In docker run

```bash
# Set memory limit
docker run -m 512m myapp

# Set memory and swap limit
docker run -m 512m --memory-swap 512m myapp

# Disable swap
docker run -m 512m --memory-swap 512m myapp

# Memory reservation
docker run -m 512m --memory-reservation 256m myapp
```

### Memory Limit Behavior

When a container exceeds its memory limit:
1. Docker attempts to reclaim memory
2. If unsuccessful, the container is killed with OOM (Out Of Memory)
3. Docker logs the OOM event

```bash
# Check for OOM kills
docker inspect my-container --format='{{.State.OOMKilled}}'
docker events --filter event=oom
```

## CPU Limits

### In docker-compose.yml

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1.5'         # Can use up to 1.5 CPU cores
        reservations:
          cpus: '0.5'         # Guaranteed 0.5 CPU cores
```

### In docker run

```bash
# Limit to 1.5 CPUs
docker run --cpus="1.5" myapp

# Limit to specific CPU cores
docker run --cpuset-cpus="0,1" myapp

# CPU shares (relative weight)
docker run --cpu-shares=512 myapp
```

### CPU Limit vs Reservation

- **Limit**: Maximum CPU time the container can use
- **Reservation**: Minimum CPU time guaranteed when the system is under contention
- **Shares**: Relative priority when competing for CPU (default: 1024)

## Disk I/O Limits

```bash
# Limit read/write speed
docker run --device-read-bps /dev/sda:1mb myapp
docker run --device-write-bps /dev/sda:1mb myapp

# Limit IOPS
docker run --device-read-iops /dev/sda:100 myapp
docker run --device-write-iops /dev/sda:100 myapp
```

## Pid Limits

Prevent fork bombs:

```bash
docker run --pids-limit=200 myapp
```

## ulimits

Control system-level resource limits:

```yaml
services:
  app:
    image: myapp
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
      nproc:
        soft: 32768
        hard: 32768
```

```bash
docker run --ulimit nofile=65536:65536 myapp
```

## Common Resource Configurations

### Web Application

```yaml
services:
  api:
    image: myapi
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

### Database

```yaml
services:
  postgres:
    image: postgres:16-alpine
    shm_size: 256mb
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### Worker/Queue Processor

```yaml
services:
  worker:
    image: myworker
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    restart: unless-stopped
```

## Monitoring Resource Usage

```bash
# Live resource stats
docker stats

# Stats for specific containers
docker stats api postgres redis

# Format output
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Inspect resource limits
docker inspect api --format='{{.HostConfig.Memory}}'
docker inspect api --format='{{.HostConfig.CpuQuota}}'
```

## Handling OOM (Out of Memory)

### Prevention

1. Set appropriate memory limits
2. Monitor memory usage
3. Use swap as a safety net (but not for performance)
4. Implement graceful degradation

### Recovery

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          memory: 512M
    restart: unless-stopped
    # OOM will kill container, then restart policy brings it back
```

## Next Steps

Proceed to [17 - Docker Layer Caching](./17-docker-layer-caching.md).
