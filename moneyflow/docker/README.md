# Docker Configuration for Money Flow

Complete Docker setup for developing and deploying the Money Flow application.

## 📋 Contents

- **`Dockerfile.dev`** - Development image with hot reload support
- **`Dockerfile.prod`** - Optimized production image with multi-stage build
- **`docker-compose.yml`** - Complete stack with frontend, database, cache, and reverse proxy
- **`nginx.conf`** - Production Nginx configuration with security headers and optimizations
- **`.dockerignore`** - Ignore unnecessary files during build
- **`.env.example`** - Environment variables template
- **`init.sql`** - Database initialization script

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd docker
cp .env.example .env
# Edit .env with your configuration
```

### 2. Development Environment

```bash
# Build and start development server
docker-compose -f docker-compose.yml up app-dev

# Or with volumes for hot reload
docker-compose -f docker-compose.yml up app-dev --build
```

Access at: `http://localhost:5173`

### 3. Production Environment

```bash
# Build production image
docker build -f Dockerfile.prod -t moneyflow:latest ..

# Start with all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f app-prod
```

Access at: `https://localhost`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client Browser                     │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│              Nginx Reverse Proxy                     │
│  • SSL/TLS Termination                              │
│  • Rate Limiting                                     │
│  • Security Headers                                 │
│  • Gzip Compression                                 │
└────────────────┬──────────────────┬──────────────────┘
                 │                  │
        ┌────────▼──────┐    ┌──────▼────────┐
        │   React App   │    │   Supabase    │
        │  (Vite Build) │    │  (PostgreSQL) │
        │   Port: 80    │    │  Port: 5432   │
        └───────────────┘    └───────────────┘
                                      │
                                      │
        ┌─────────────────────────────▼──────┐
        │          Redis Cache               │
        │         Port: 6379                 │
        └───────────────────────────────────┘
```

## 📝 Environment Configuration

### Essential Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Database
POSTGRES_PASSWORD=secure-password

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars

# Redis
REDIS_PASSWORD=your-redis-password

# Stripe (optional)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email (optional)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

See `.env.example` for all available options.

## 🐳 Docker Commands

### Build Images

```bash
# Development image
docker build -f docker/Dockerfile.dev -t moneyflow:dev .

# Production image
docker build -f docker/Dockerfile.prod -t moneyflow:prod .
```

### Run Services

```bash
# Start specific service
docker-compose up app-dev
docker-compose up app-prod
docker-compose up supabase

# Start all services
docker-compose up -d

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app-dev
docker-compose logs -f supabase

# Last 100 lines
docker-compose logs -f --tail=100
```

### Database Operations

```bash
# Access PostgreSQL
docker-compose exec supabase psql -U postgres

# Run migrations
docker-compose exec app-prod npm run db:push

# Seed database
docker-compose exec app-prod npm run db:seed

# Backup database
docker-compose exec supabase pg_dump -U postgres > backup.sql
```

## 🔒 Security Best Practices

### 1. SSL/TLS Certificates

Generate self-signed certificates for development:

```bash
mkdir -p docker/ssl
openssl req -x509 -newkey rsa:4096 -nodes -out docker/ssl/cert.pem -keyout docker/ssl/key.pem -days 365
```

For production, use Let's Encrypt:

```bash
# Using Certbot with Docker
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -p 80:80 -p 443:443 \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com
```

### 2. Secure Environment Variables

- Never commit `.env` files
- Use strong passwords (min 32 characters)
- Rotate secrets regularly
- Use different values for dev/prod

### 3. Network Isolation

All services communicate over private network `moneyflow-network`.

```bash
# List networks
docker network ls

# Inspect network
docker network inspect moneyflow_moneyflow-network
```

## 📊 Monitoring & Health Checks

Each service includes health checks:

```bash
# Check service health
docker-compose ps

# Detailed health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

View logs for issues:

```bash
docker-compose logs -f --tail=50
```

## 🔄 Scaling & Performance

### Development

- Hot module reload via volumes
- Source maps enabled
- Fast refresh for React components

### Production

- Multi-stage build for optimized images
- Gzip compression enabled
- Static assets cached with CDN-friendly headers
- Database connection pooling via Supabase
- Redis caching layer

### Optimization Tips

```bash
# Reduce image size
docker image prune

# Monitor resource usage
docker stats

# Inspect image layers
docker history moneyflow:prod
```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5173
# or on Windows
netstat -ano | findstr :5173

# Kill process (Linux/Mac)
kill -9 <PID>
# Windows
taskkill /PID <PID> /F
```

### Database Connection Issues

```bash
# Test connection
docker-compose exec supabase psql -U postgres -c "SELECT version();"

# Check database logs
docker-compose logs supabase
```

### Out of Memory

```bash
# Increase Docker memory allocation
# Docker Desktop: Preferences → Resources → Memory

# Or manually limit container:
docker-compose up -d --limit-cpus 1 --memory 512m
```

### Nginx Configuration Issues

```bash
# Test Nginx configuration
docker-compose exec nginx nginx -t

# Reload configuration
docker-compose exec nginx nginx -s reload
```

## 📚 References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Supabase Docker Guide](https://supabase.com/docs/guides/local-development)

## 🤝 Contributing

Issues and improvements welcome! Please open an issue or submit a pull request.

## 📄 License

See LICENSE file in project root.
