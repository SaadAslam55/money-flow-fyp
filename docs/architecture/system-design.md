# System Design Document

## Money Flow - Architecture Overview

---

## 1. Introduction

### 1.1 Purpose

This document describes the system architecture of Money Flow, a comprehensive financial management platform designed for small to medium businesses.

### 1.2 Scope

The system encompasses:

- Web-based frontend application
- RESTful API backend
- Multi-cloud infrastructure
- Real-time data synchronization

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    │
│    │   Web Browser    │    │   Mobile App     │    │   API Client     │    │
│    │   (React SPA)    │    │   (Future)       │    │   (Third Party)  │    │
│    └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘    │
│             │                       │                       │               │
└─────────────┼───────────────────────┼───────────────────────┼───────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                              EDGE LAYER                                      │
├─────────────────────────────────────┼───────────────────────────────────────┤
│                                     ▼                                        │
│              ┌──────────────────────────────────────────┐                   │
│              │         Cloudflare Workers (Edge)         │                   │
│              │  • CDN & Static Assets                    │                   │
│              │  • Rate Limiting                          │                   │
│              │  • Edge Caching                           │                   │
│              │  • DDoS Protection                        │                   │
│              └────────────────────┬─────────────────────┘                   │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────────────────┐
│                            APPLICATION LAYER                                  │
├───────────────────────────────────┼──────────────────────────────────────────┤
│                                   ▼                                          │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │                    NestJS API Server (Render)                     │     │
│    │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │     │
│    │  │   Auth     │  │  Invoices  │  │ Customers  │  │  Products  │ │     │
│    │  │  Module    │  │   Module   │  │   Module   │  │   Module   │ │     │
│    │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │     │
│    │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │     │
│    │  │  Reports   │  │ Inventory  │  │   Admin    │  │   Sync     │ │     │
│    │  │  Module    │  │   Module   │  │   Module   │  │   Module   │ │     │
│    │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │     │
│    └──────────────────────────────────────────────────────────────────┘     │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────────────────┐
│                              DATA LAYER                                       │
├───────────────────────────────────┼──────────────────────────────────────────┤
│                                   │                                          │
│    ┌──────────────┐    ┌──────────▼───────┐    ┌──────────────┐             │
│    │   Supabase   │    │    TiDB Cloud    │    │   Upstash    │             │
│    │    (Auth)    │    │   (Database)     │    │   (Redis)    │             │
│    │              │    │                  │    │              │             │
│    │  • Users     │    │  • Invoices      │    │  • Cache     │             │
│    │  • Sessions  │    │  • Customers     │    │  • Sessions  │             │
│    │  • JWT       │    │  • Products      │    │  • Rate Lim  │             │
│    └──────────────┘    │  • Transactions  │    └──────────────┘             │
│                        │  • Organizations │                                  │
│                        └──────────────────┘                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Descriptions

| Component | Technology         | Purpose           | Deployment     |
| --------- | ------------------ | ----------------- | -------------- |
| Frontend  | React 18 + Vite    | User interface    | Vercel/Netlify |
| Edge      | Cloudflare Workers | Caching, security | Cloudflare     |
| API       | NestJS             | Business logic    | Render         |
| Auth      | Supabase           | Authentication    | Supabase Cloud |
| Database  | TiDB               | Data persistence  | TiDB Cloud     |
| Cache     | Upstash Redis      | Performance       | Upstash        |

---

## 3. Frontend Architecture

### 3.1 Technology Stack

| Layer            | Technology      | Version |
| ---------------- | --------------- | ------- |
| Framework        | React           | 18.x    |
| Language         | TypeScript      | 5.x     |
| Build Tool       | Vite            | 5.x     |
| Styling          | TailwindCSS     | 3.x     |
| UI Components    | shadcn/ui       | Latest  |
| State Management | Zustand         | 4.x     |
| Data Fetching    | React Query     | 5.x     |
| Forms            | React Hook Form | 7.x     |
| Routing          | React Router    | 6.x     |

### 3.2 Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (Button, Input, Card)
│   ├── forms/           # Form components
│   ├── tables/          # Data table components
│   └── layouts/         # Layout components
├── pages/               # Route page components
│   ├── Dashboard/
│   ├── Invoices/
│   ├── Customers/
│   ├── Products/
│   └── Settings/
├── hooks/               # Custom React hooks
│   ├── api/             # API query hooks
│   └── use-*.ts         # Utility hooks
├── services/            # Business logic services
├── lib/                 # Utilities and configurations
│   ├── api/             # API client setup
│   ├── utils/           # Helper functions
│   └── validations/     # Form validations
├── types/               # TypeScript type definitions
├── providers/           # React context providers
└── config/              # App configuration
```

### 3.3 State Management

```
┌─────────────────────────────────────────────────────────────┐
│                      STATE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │  Server State   │    │  Client State   │                 │
│  │  (React Query)  │    │   (Zustand)     │                 │
│  ├─────────────────┤    ├─────────────────┤                 │
│  │ • Invoices      │    │ • UI State      │                 │
│  │ • Customers     │    │ • Feature Flags │                 │
│  │ • Products      │    │ • User Prefs    │                 │
│  │ • Reports       │    │ • Filters       │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
│           │                      │                           │
│           └──────────┬───────────┘                          │
│                      │                                       │
│           ┌──────────▼──────────┐                           │
│           │   Component Tree     │                           │
│           └─────────────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture

### 4.1 NestJS Modules

```
apps/api/src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── modules/
│   ├── auth/                  # Authentication & authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   └── strategies/
│   ├── invoices/              # Invoice management
│   │   ├── invoices.module.ts
│   │   ├── invoices.controller.ts
│   │   ├── invoices.service.ts
│   │   ├── invoices.repository.ts
│   │   └── dto/
│   ├── customers/             # Customer management
│   ├── products/              # Product catalog
│   ├── inventory/             # Stock management
│   ├── reports/               # Analytics & reporting
│   └── admin/                 # Administration
├── common/
│   ├── decorators/            # Custom decorators
│   ├── filters/               # Exception filters
│   ├── guards/                # Auth guards
│   ├── interceptors/          # Request/response interceptors
│   ├── pipes/                 # Validation pipes
│   └── middleware/            # HTTP middleware
└── database/
    ├── prisma/                # Prisma ORM configuration
    └── redis/                 # Redis cache service
```

### 4.2 Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Guard   │────▶│Controller│────▶│  Service │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                         │
┌──────────┐     ┌──────────┐     ┌──────────┐          │
│ Response │◀────│Interceptor◀────│Repository│◀─────────┘
└──────────┘     └──────────┘     └──────────┘

1. Request arrives at controller
2. Guard validates JWT token
3. Pipe validates request body
4. Controller delegates to service
5. Service implements business logic
6. Repository handles data access
7. Interceptor transforms response
8. Response sent to client
```

### 4.3 Dependency Injection

```typescript
// Module registration
@Module({
  imports: [PrismaModule, CacheModule, AuthModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesRepository],
  exports: [InvoicesService],
})
export class InvoicesModule {}

// Service injection
@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheManagerService,
    private readonly repository: InvoicesRepository
  ) {}
}
```

---

## 5. Database Architecture

### 5.1 TiDB Configuration

| Setting      | Value        | Purpose                |
| ------------ | ------------ | ---------------------- |
| Cluster Type | Serverless   | Cost-effective scaling |
| Region       | us-west-2    | Low latency            |
| Storage      | Auto-scaling | Pay per use            |
| Replicas     | 3            | High availability      |

### 5.2 Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐         ┌───────────────┐                │
│  │ organizations │◄────────│     users     │                │
│  └───────┬───────┘         └───────────────┘                │
│          │                                                   │
│          │ 1:N                                               │
│          │                                                   │
│  ┌───────┴───────┬───────────────┬───────────────┐         │
│  │               │               │               │          │
│  ▼               ▼               ▼               ▼          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐        │
│ │customers│ │products │ │invoices │ │transactions │        │
│ └─────────┘ └─────────┘ └────┬────┘ └─────────────┘        │
│                              │                               │
│                              │ 1:N                           │
│                              ▼                               │
│                     ┌───────────────┐                       │
│                     │ invoice_items │                       │
│                     └───────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Caching Strategy

### 6.1 Cache Layers

| Layer       | Technology | TTL      | Use Case         |
| ----------- | ---------- | -------- | ---------------- |
| Browser     | HTTP Cache | 5 min    | Static assets    |
| Edge        | Cloudflare | 1 min    | API responses    |
| Application | Redis      | 5-60 min | Database queries |

### 6.2 Cache Invalidation

```typescript
// Tag-based invalidation
await cache.invalidateByTag('invoices');
await cache.invalidateByTag(`customer:${customerId}`);

// Pattern invalidation
await cache.invalidateByPattern('invoices:*');

// Automatic invalidation on mutation
@CacheInvalidate(['invoices', 'dashboard'])
async createInvoice(data: CreateInvoiceDto) {
  // ...
}
```

---

## 7. Security Architecture

See [Security Model](security-model.md) for detailed security documentation.

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Edge Security (Cloudflare)                        │
│  ├── DDoS Protection                                        │
│  ├── WAF Rules                                              │
│  ├── Rate Limiting                                          │
│  └── Bot Detection                                          │
│                                                              │
│  Layer 2: Transport Security                                │
│  ├── TLS 1.3 Encryption                                     │
│  ├── HSTS Headers                                           │
│  └── Certificate Pinning                                    │
│                                                              │
│  Layer 3: Application Security                              │
│  ├── JWT Authentication                                     │
│  ├── RBAC Authorization                                     │
│  ├── Input Validation                                       │
│  └── CSRF Protection                                        │
│                                                              │
│  Layer 4: Data Security                                     │
│  ├── Row-Level Security                                     │
│  ├── Encryption at Rest                                     │
│  └── Audit Logging                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Scalability Design

### 8.1 Horizontal Scaling

| Component    | Scaling Method     | Trigger      |
| ------------ | ------------------ | ------------ |
| Frontend     | CDN replication    | Automatic    |
| Edge Workers | Global deployment  | Automatic    |
| API Servers  | Container replicas | CPU > 70%    |
| Database     | TiDB auto-scaling  | Storage/QPS  |
| Cache        | Redis clusters     | Memory > 80% |

### 8.2 Performance Targets

| Metric               | Target  | Current |
| -------------------- | ------- | ------- |
| API Response (p95)   | < 500ms | 120ms   |
| Page Load Time       | < 3s    | 1.8s    |
| Time to Interactive  | < 5s    | 2.5s    |
| Database Query (avg) | < 100ms | 45ms    |
| Cache Hit Rate       | > 80%   | 85%     |

---

## 9. Deployment Architecture

### 9.1 Environments

| Environment | Purpose           | URL                     |
| ----------- | ----------------- | ----------------------- |
| Development | Local development | localhost               |
| Staging     | Testing & QA      | staging.mtkcodex.site   |
| Production  | Live users        | moneyflow.mtkcodex.site |

### 9.2 CI/CD Pipeline

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Push   │───▶│  Build  │───▶│  Test   │───▶│ Deploy  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
     │              │              │              │
     ▼              ▼              ▼              ▼
  GitHub        TypeScript      Jest/         Vercel/
  Actions       Compile         Playwright    Render
```

---

## 10. Monitoring & Observability

### 10.1 Metrics Collection

| Type        | Tool           | Metrics                |
| ----------- | -------------- | ---------------------- |
| APM         | Built-in       | Response times, errors |
| Logs        | Console/Sentry | Application logs       |
| Uptime      | UptimeRobot    | Availability           |
| Performance | Lighthouse     | Web vitals             |

### 10.2 Alerting

| Alert         | Threshold | Action         |
| ------------- | --------- | -------------- |
| Error Rate    | > 5%      | Notify on-call |
| Response Time | > 2s      | Scale up       |
| CPU Usage     | > 80%     | Add instances  |
| Disk Usage    | > 90%     | Expand storage |

---

**Document Version:** 1.0  
**Last Updated:** November 2024
