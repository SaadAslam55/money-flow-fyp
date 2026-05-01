# Developer Guide

## Money Flow - Development Documentation

---

## 1. Architecture Overview

### 1.1 Technology Stack

| Layer    | Technology                 | Purpose            |
| -------- | -------------------------- | ------------------ |
| Frontend | React 18, TypeScript, Vite | User Interface     |
| Backend  | NestJS, Prisma             | REST API           |
| Database | TiDB Cloud                 | Data Storage       |
| Auth     | Supabase                   | Authentication     |
| Cache    | Upstash Redis              | Performance        |
| Edge     | Cloudflare Workers         | CDN, Rate Limiting |

### 1.2 Project Structure

```
moneyflow/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/              # Route pages
│   ├── hooks/              # Custom hooks
│   ├── services/           # Business logic
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── apps/
│   └── api/                # NestJS backend
│       ├── src/
│       │   ├── modules/    # Feature modules
│       │   ├── common/     # Shared code
│       │   └── database/   # DB config
│       └── prisma/         # Prisma schema
├── workers/
│   └── moneyflow-edge/     # Cloudflare Worker
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

---

## 2. Development Setup

### 2.1 Prerequisites

```bash
# Required
node --version  # v20.x
npm --version   # v10.x

# Optional
docker --version  # For local services
```

### 2.2 Environment Setup

```bash
# Clone and install
git clone https://github.com/your-org/moneyflow.git
cd moneyflow
npm install

# Setup environment
cp .env.example .env.local
cp apps/api/.env.example apps/api/.env

# Install API dependencies
cd apps/api && npm install && cd ../..
```

### 2.3 Running Locally

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: API
cd apps/api && npm run start:dev

# Terminal 3: Workers (optional)
cd workers/moneyflow-edge && npm run dev
```

---

## 3. Frontend Development

### 3.1 Component Structure

```typescript
// src/components/invoices/InvoiceCard.tsx
import { Card } from '@/components/ui/card';
import { Invoice } from '@/types';

interface InvoiceCardProps {
  invoice: Invoice;
  onEdit?: (id: string) => void;
}

export function InvoiceCard({ invoice, onEdit }: InvoiceCardProps) {
  return (
    <Card className="p-4">
      <h3>{invoice.invoice_number}</h3>
      <p>{invoice.customer.name}</p>
      <span className="text-lg font-bold">
        ${invoice.total.toFixed(2)}
      </span>
    </Card>
  );
}
```

### 3.2 Custom Hooks

```typescript
// src/hooks/api/use-invoices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoice-service';

export function useInvoices(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceService.list(params),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
```

### 3.3 Service Layer

```typescript
// src/services/invoice-service.ts
import { api } from '@/lib/api';
import { Invoice, CreateInvoiceDto } from '@/types';

export const invoiceService = {
  async list(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    const { data } = await api.get('/invoices', { params });
    return data;
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const { data } = await api.post('/invoices', dto);
    return data;
  },

  async update(id: string, dto: Partial<Invoice>): Promise<Invoice> {
    const { data } = await api.patch(`/invoices/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },
};
```

### 3.4 State Management

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
```

---

## 4. Backend Development

### 4.1 Module Structure

```
apps/api/src/modules/invoices/
├── invoices.module.ts      # Module definition
├── invoices.controller.ts  # HTTP endpoints
├── invoices.service.ts     # Business logic
├── invoices.repository.ts  # Data access
├── dto/
│   ├── create-invoice.dto.ts
│   └── update-invoice.dto.ts
└── entities/
    └── invoice.entity.ts
```

### 4.2 Controller Example

```typescript
// apps/api/src/modules/invoices/invoices.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAll(user.organization_id, query);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() createDto: CreateInvoiceDto) {
    return this.invoicesService.create(user.organization_id, createDto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.invoicesService.findOne(user.organization_id, id);
  }
}
```

### 4.3 Service Example

```typescript
// apps/api/src/modules/invoices/invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CacheService } from '@/database/redis/cache.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  async findAll(organizationId: string, query: InvoiceQueryDto) {
    const cacheKey = `invoices:${organizationId}:${JSON.stringify(query)}`;

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await Promise.all([
          this.prisma.invoice.findMany({
            where: {
              organization_id: organizationId,
              status: query.status,
            },
            include: { customer: true },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            orderBy: { created_at: 'desc' },
          }),
          this.prisma.invoice.count({
            where: { organization_id: organizationId },
          }),
        ]);

        return { data, meta: { total, page: query.page, limit: query.limit } };
      },
      300
    ); // 5 min cache
  }

  async create(organizationId: string, dto: CreateInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber(organizationId);

    const invoice = await this.prisma.invoice.create({
      data: {
        organization_id: organizationId,
        invoice_number: invoiceNumber,
        customer_id: dto.customer_id,
        due_date: dto.due_date,
        items: {
          create: dto.items.map((item) => ({
            product_id: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.quantity * item.unit_price,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    // Invalidate cache
    await this.cache.invalidatePattern(`invoices:${organizationId}:*`);

    return invoice;
  }
}
```

### 4.4 DTO Validation

```typescript
// apps/api/src/modules/invoices/dto/create-invoice.dto.ts
import {
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateInvoiceItemDto {
  @IsUUID()
  product_id?: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  customer_id: string;

  @IsDateString()
  due_date: string;

  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
```

---

## 5. Database

### 5.1 Prisma Schema

```prisma
// apps/api/prisma/schema.prisma
model Invoice {
  id              String        @id @default(uuid())
  organization_id String
  customer_id     String
  invoice_number  String
  status          InvoiceStatus @default(draft)
  due_date        DateTime
  subtotal        Decimal       @db.Decimal(15, 2)
  tax_amount      Decimal       @db.Decimal(15, 2)
  total           Decimal       @db.Decimal(15, 2)
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id])
  customer     Customer     @relation(fields: [customer_id], references: [id])
  items        InvoiceItem[]

  @@unique([organization_id, invoice_number])
  @@index([organization_id])
  @@index([customer_id])
  @@map("invoices")
}
```

### 5.2 Migrations

```bash
# Create migration
npx prisma migrate dev --name add_invoice_status

# Apply to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### 5.3 Prisma Client

```typescript
// apps/api/src/database/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

---

## 6. Testing

### 6.1 Unit Tests

```typescript
// src/services/__tests__/invoice-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { invoiceService } from '../invoice-service';

describe('invoiceService', () => {
  it('should list invoices', async () => {
    const mockData = [{ id: '1', invoice_number: 'INV-001' }];
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });

    const result = await invoiceService.list();

    expect(result).toEqual(mockData);
    expect(api.get).toHaveBeenCalledWith('/invoices', { params: undefined });
  });
});
```

### 6.2 Integration Tests

```typescript
// apps/api/src/modules/invoices/__tests__/invoices.controller.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('InvoicesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/invoices (GET)', () => {
    return request(app.getHttpServer())
      .get('/invoices')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
      });
  });
});
```

### 6.3 Running Tests

```bash
# Frontend tests
npm run test
npm run test:coverage

# API tests
cd apps/api
npm run test
npm run test:e2e
```

---

## 7. Code Style

### 7.1 ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### 7.2 Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 7.3 Git Hooks

```bash
# Pre-commit (via Husky)
npm run lint
npm run typecheck
npm run test:staged
```

---

## 8. Deployment

### 8.1 Build Commands

```bash
# Frontend
npm run build  # Output: dist/

# API
cd apps/api
npm run build  # Output: dist/
```

### 8.2 Environment Variables

See [Environment Setup Guide](../ENV_COMPLETE_GUIDE.md)

### 8.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 9. Debugging

### 9.1 VS Code Launch Config

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/apps/api"
    }
  ]
}
```

### 9.2 Logging

```typescript
// API logging
import { Logger } from '@nestjs/common';

const logger = new Logger('InvoicesService');
logger.log('Creating invoice');
logger.error('Failed to create', error.stack);
```

---

## 10. Contributing

### 10.1 Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code improvements
- `docs/description` - Documentation

### 10.2 Commit Messages

```
type(scope): description

feat(invoices): add PDF export
fix(auth): resolve token refresh issue
docs(api): update endpoint documentation
```

### 10.3 Pull Request Process

1. Create feature branch
2. Make changes
3. Run tests
4. Submit PR
5. Code review
6. Merge to main

---

**Document Version:** 1.0  
**Last Updated:** November 2024
