# Example: Volume Backup and Restore

This example demonstrates how to back up and restore a named Docker volume using a temporary Alpine container.

## Files

- `docker-compose.yml` - Simple app with a named volume (`app-data`)

## How to Run

```bash
cd examples/11-volume-backup

# Start the app to create the volume
docker compose up --build -d

# Write some data into the volume
docker compose exec app sh -c "echo 'hello world' > /app/data/hello.txt"
docker compose exec app sh -c "mkdir -p /app/data/subdir && echo 'nested file' > /app/data/subdir/nested.txt"
```

## Backup

```bash
# Create a tar archive of the volume on the host
docker run --rm \
  -v docker-tutorial_app-data:/source:ro \
  -v $(pwd):/backup \
  alpine \
  tar cvf /backup/app-data-backup.tar -C /source .

# Verify the backup exists
ls -lh app-data-backup.tar
```

> **Note:** The volume name prefix `docker-tutorial_` comes from the project directory name. If your directory is named differently, use `docker volume ls` to find the exact name.

## Restore

```bash
# Stop the app first
docker compose down

# Remove the old volume (optional — creates a fresh restore target)
docker volume rm docker-tutorial_app-data

# Recreate an empty volume
docker volume create docker-tutorial_app-data

# Restore from the tar archive
docker run --rm \
  -v docker-tutorial_app-data:/target \
  -v $(pwd):/backup \
  alpine \
  tar xvf /backup/app-data-backup.tar -C /target

# Start the app again
docker compose up -d

# Verify restored data
docker compose exec app cat /app/data/hello.txt
docker compose exec app cat /app/data/subdir/nested.txt
```

## Key Concepts Demonstrated

- **Named volumes** - Data survives container removal
- **Volume backup** - Using `docker run --rm` with `tar cvf` to snapshot volume contents
- **Volume restore** - Using `tar xvf` to populate a fresh or existing volume
- **Read-only mount** - The `:ro` flag ensures the backup process cannot modify the source volume

## Cleanup

```bash
docker compose down -v
rm -f app-data-backup.tar
```
