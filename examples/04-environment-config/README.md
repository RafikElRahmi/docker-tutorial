# Example: Environment Variables and Configuration

This example shows multiple ways to manage configuration in Docker, from `.env` files to build arguments.

## How to Run

```bash
cd examples/04-environment-config

# Copy example env file
cp .env.example .env

# Edit .env with your values

# Run with env file
docker compose up --build -d

# Test different endpoints
curl http://localhost:3000
curl http://localhost:3000/config
```

## Key Concepts Demonstrated

- `.env` files with `env_file` directive
- Variable substitution in Compose (`${VAR:-default}`)
- `ARG` vs `ENV` in Dockerfile
- Build-time arguments
- Runtime environment variables
- Secret management patterns
