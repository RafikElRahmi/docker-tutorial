# 01 - Introduction to Docker

## What is Docker?

Docker is a platform that allows you to package, distribute, and run applications inside lightweight, portable containers. A container includes everything an application needs to run: code, runtime, system tools, libraries, and settings.

## Why Use Docker?

1. **Consistency**: Your app runs the same on your laptop, a test server, and in production.
2. **Isolation**: Each container runs independently without interfering with others.
3. **Efficiency**: Containers share the host OS kernel, making them lighter than VMs.
4. **Scalability**: Easy to spin up multiple instances of your application.
5. **Portability**: Build once, run anywhere Docker is installed.

## Core Concepts

### Images
A Docker image is a read-only template containing instructions for creating a container. Think of it as a blueprint or a snapshot of a container.

### Containers
A container is a runnable instance of an image. It is isolated from other containers and the host system, except where explicitly configured.

### Dockerfile
A text file containing instructions to build a Docker image. Each instruction creates a new layer in the image.

### Docker Compose
A tool for defining and running multi-container applications. You describe your stack in a `docker-compose.yml` file and start everything with a single command.

### Registry (Docker Hub)
A service for storing and distributing Docker images. Docker Hub is the default public registry.

## Key Terminology

| Term | Description |
|------|-------------|
| **Image** | Read-only template used to create containers |
| **Container** | Running instance of an image |
| **Layer** | Each instruction in a Dockerfile creates a cached layer |
| **Volume** | Persistent storage independent of the container lifecycle |
| **Network** | Communication channel between containers |
| **Compose** | Tool to run multi-container apps |

## Quick Start Commands

```bash
# Check Docker version
docker --version

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# List images
docker images

# Pull an image from Docker Hub
docker pull nginx:latest

# Run a container
docker run -d -p 8080:80 nginx

# Stop a container
docker stop <container_id>

# Remove a container
docker rm <container_id>

# Remove an image
docker rmi <image_id>
```

## Architecture Overview

```
┌─────────────────────────────────────┐
│           Docker Client             │
│         (docker CLI)                │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│           Docker Daemon             │
│     (dockerd - manages everything)  │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
┌─────────┐       ┌─────────────┐
│ Images  │       │ Containers  │
└─────────┘       └─────────────┘
    │                    │
    ▼                    ▼
┌─────────┐       ┌─────────────┐
│ Volumes │       │  Networks   │
└─────────┘       └─────────────┘
```

## Next Steps

Proceed to [02 - Dockerfile Fundamentals](./02-dockerfile-fundamentals.md) to learn how to build your own images.
