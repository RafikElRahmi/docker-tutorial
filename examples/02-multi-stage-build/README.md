# Example: Multi-Stage Build Optimization

This example shows how multi-stage builds dramatically reduce image size by separating build dependencies from production artifacts.

## Comparison

| Approach | Image Size |
|----------|------------|
| Single Stage (with dev deps) | ~1.2 GB |
| Multi-Stage | ~180 MB |

## How to Run

```bash
cd examples/02-multi-stage-build

# Build single stage (for comparison)
docker build -f Dockerfile.single -t single-stage .
docker images single-stage

# Build multi-stage (recommended)
docker build -f Dockerfile.multi -t multi-stage .
docker images multi-stage

# Run the optimized image
docker run -p 3000:3000 multi-stage
```

## Key Concepts Demonstrated

- Multiple `FROM` instructions
- `COPY --from` to copy between stages
- Using `-alpine` base images
- Running as non-root user
- Smaller final image with only runtime essentials
