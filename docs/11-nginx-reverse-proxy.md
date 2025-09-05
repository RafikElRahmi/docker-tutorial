# 11 - Nginx Reverse Proxy

An Nginx reverse proxy sits between clients and your application servers. It provides load balancing, SSL termination, caching, and a single entry point for your services.

## Why Use a Reverse Proxy?

1. **Single Entry Point**: One port (80/443) for all services
2. **Load Balancing**: Distribute traffic across multiple app instances
3. **SSL Termination**: Handle HTTPS at the edge
4. **Static File Serving**: Nginx serves static files much faster than Node.js
5. **Security**: Hide internal service architecture

## Basic Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://app:3000;
        proxy_redirect off;
    }
}
```

## Docker Compose Setup

```yaml
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
```

## Load Balancing Multiple Instances

```yaml
services:
  app-1:
    build: .
    environment:
      - PORT=3000

  app-2:
    build: .
    environment:
      - PORT=3000

  app-3:
    build: .
    environment:
      - PORT=3000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
```

```nginx
upstream app_servers {
    least_conn;
    server app-1:3000;
    server app-2:3000;
    server app-3:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Or use Docker Compose's built-in scaling:

```yaml
services:
  app:
    build: .
    deploy:
      replicas: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
```

```nginx
upstream app_servers {
    server app:3000;
}
```

## Serving Static Files

```nginx
server {
    listen 80;

    # Static files
    location /static/ {
        alias /usr/share/nginx/html/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API requests
    location /api/ {
        proxy_pass http://app:3000/;
        proxy_set_header Host $host;
    }

    # Everything else -> app
    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
    }
}
```

## SSL with Let's Encrypt

For production, use a proper SSL certificate. With Docker:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h; done'"
```

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://app:3000;
    }
}
```

## Gzip Compression

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

## Next Steps

Proceed to [12 - Databases in Docker](./12-databases-in-docker.md).
