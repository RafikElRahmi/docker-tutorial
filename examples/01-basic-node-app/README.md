# Example: Basic Node.js App with Docker

This example demonstrates the simplest possible Docker setup for a Node.js application.

## Files

- `Dockerfile` - Basic image build
- `docker-compose.yml` - Single service orchestration
- `package.json` - Simple Express server
- `server.js` - Hello World server

## How to Run

```bash
cd examples/01-basic-node-app

# Build and run with Docker
docker build -t basic-node-app .
docker run -p 3000:3000 basic-node-app

# Or use Docker Compose
docker compose up --build

# Visit http://localhost:3000
```

## Key Concepts Demonstrated

- `FROM` - Choosing a base image
- `WORKDIR` - Setting working directory
- `COPY` - Copying files into the image
- `RUN` - Installing dependencies
- `CMD` - Defining the startup command
- `EXPOSE` - Documenting the listening port
