# MoneyFlow API

NestJS backend API for the MoneyFlow business management platform.

## Tech Stack

- **Framework**: NestJS 10
- **Database**: TiDB Cloud (MySQL-compatible)
- **ORM**: Prisma
- **Cache**: Upstash Redis
- **Auth**: JWT with Passport
- **Docs**: Swagger/OpenAPI

## Project Structure

```
apps/api/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── common/
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth guards
│   │   └── interceptors/      # Request/response interceptors
│   ├── config/                # Configuration modules
│   ├── database/
│   │   ├── prisma/            # Prisma service
│   │   └── redis/             # Redis service
│   ├── health/                # Health check endpoints
│   ├── modules/
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── organizations/     # Organization management
│   │   ├── invoices/          # Invoice CRUD
│   │   ├── customers/         # Customer CRUD
│   │   ├── products/          # Product/inventory
│   │   ├── transactions/      # Financial transactions
│   │   └── reports/           # Analytics & reports
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry
├── .env.example               # Environment template
├── nest-cli.json              # NestJS CLI config
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- TiDB Cloud account
- Upstash Redis account

### Installation

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run start:dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:

- `TIDB_DATABASE_URL` - TiDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `UPSTASH_REDIS_REST_URL` - Redis endpoint

## API Documentation

Once running, access Swagger docs at:

- Development: `http://localhost:3001/api/docs`

## Scripts

| Command                   | Description             |
| ------------------------- | ----------------------- |
| `npm run start:dev`       | Start in watch mode     |
| `npm run build`           | Build for production    |
| `npm run start:prod`      | Run production build    |
| `npm run lint`            | Run ESLint              |
| `npm run test`            | Run unit tests          |
| `npm run test:e2e`        | Run E2E tests           |
| `npm run prisma:generate` | Generate Prisma client  |
| `npm run prisma:push`     | Push schema to database |
| `npm run prisma:studio`   | Open Prisma Studio      |

## Deployment

This API is configured for deployment on **Render**.

### Render Configuration

1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm run start:prod`
4. Add environment variables from `.env.example`

## Health Checks

- `GET /api/v1/health` - Full health status
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

## License

Private - MoneyFlow
