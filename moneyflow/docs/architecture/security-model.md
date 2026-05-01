# Security Model Documentation

## Money Flow - Security Architecture

---

## 1. Overview

### 1.1 Security Principles

| Principle         | Implementation               |
| ----------------- | ---------------------------- |
| Defense in Depth  | Multiple security layers     |
| Least Privilege   | Minimal required permissions |
| Zero Trust        | Verify every request         |
| Secure by Default | Security enabled out-of-box  |

### 1.2 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Layer 1: EDGE SECURITY (Cloudflare)                    │   │
│  │  • DDoS Protection        • Bot Detection               │   │
│  │  • WAF Rules              • Rate Limiting               │   │
│  │  • SSL/TLS Termination    • IP Blocking                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Layer 2: TRANSPORT SECURITY                            │   │
│  │  • TLS 1.3 Encryption     • Certificate Validation      │   │
│  │  • HSTS Headers           • Perfect Forward Secrecy     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Layer 3: APPLICATION SECURITY                          │   │
│  │  • JWT Authentication     • Input Validation            │   │
│  │  • RBAC Authorization     • Output Sanitization         │   │
│  │  • CSRF Protection        • Security Headers            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Layer 4: DATA SECURITY                                 │   │
│  │  • Row-Level Security     • Encryption at Rest          │   │
│  │  • Field-Level Encryption • Audit Logging               │   │
│  │  • Data Masking           • Secure Backups              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication

### 2.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │ Supabase │     │   API    │     │   TiDB   │
│  (React) │     │  (Auth)  │     │ (NestJS) │     │  (Data)  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  1. Login      │                │                │
     │  (email/pass)  │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │  2. Validate   │                │                │
     │  credentials   │                │                │
     │                │                │                │
     │  3. JWT Token  │                │                │
     │  (access +     │                │                │
     │   refresh)     │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │  4. API Request               │                │
     │  Authorization: Bearer <jwt>   │                │
     │───────────────────────────────▶│                │
     │                │                │                │
     │                │  5. Verify    │                │
     │                │  JWT Token    │                │
     │                │◀──────────────│                │
     │                │                │                │
     │                │  6. Valid +   │                │
     │                │  User Claims  │                │
     │                │──────────────▶│                │
     │                │                │                │
     │                │                │  7. Query     │
     │                │                │  (with org_id)│
     │                │                │──────────────▶│
     │                │                │                │
     │                │                │  8. Data      │
     │                │                │◀──────────────│
     │                │                │                │
     │  9. Response                   │                │
     │◀───────────────────────────────│                │
     │                │                │                │
```

### 2.2 JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "admin",
    "organization_id": "org-uuid",
    "iat": 1699900000,
    "exp": 1700504800
  }
}
```

### 2.3 Token Configuration

| Token Type    | Expiry  | Storage         | Refresh   |
| ------------- | ------- | --------------- | --------- |
| Access Token  | 7 days  | Memory          | On expiry |
| Refresh Token | 30 days | HttpOnly Cookie | Manual    |

### 2.4 Authentication Methods

| Method         | Support    | Notes           |
| -------------- | ---------- | --------------- |
| Email/Password | ✅ Yes     | Primary method  |
| Magic Link     | ✅ Yes     | Passwordless    |
| Google OAuth   | ✅ Yes     | Social login    |
| GitHub OAuth   | ✅ Yes     | Developer login |
| SAML/SSO       | 🔜 Planned | Enterprise      |

---

## 3. Authorization

### 3.1 Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROLE HIERARCHY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      ┌─────────────────┐                        │
│                      │   SUPER_ADMIN   │                        │
│                      │  (Org Owner)    │                        │
│                      └────────┬────────┘                        │
│                               │                                  │
│                      ┌────────▼────────┐                        │
│                      │      ADMIN      │                        │
│                      │ (Full Access)   │                        │
│                      └────────┬────────┘                        │
│                               │                                  │
│                      ┌────────▼────────┐                        │
│                      │     MANAGER     │                        │
│                      │ (Dept Access)   │                        │
│                      └────────┬────────┘                        │
│                               │                                  │
│                      ┌────────▼────────┐                        │
│                      │      STAFF      │                        │
│                      │ (Basic Access)  │                        │
│                      └─────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Permission Matrix

| Resource           | Staff | Manager | Admin | Super Admin |
| ------------------ | ----- | ------- | ----- | ----------- |
| **Invoices**       |
| View Own           | ✅    | ✅      | ✅    | ✅          |
| View All           | ❌    | ✅      | ✅    | ✅          |
| Create             | ✅    | ✅      | ✅    | ✅          |
| Edit Own           | ✅    | ✅      | ✅    | ✅          |
| Edit All           | ❌    | ✅      | ✅    | ✅          |
| Delete             | ❌    | ✅      | ✅    | ✅          |
| **Customers**      |
| View               | ✅    | ✅      | ✅    | ✅          |
| Create             | ✅    | ✅      | ✅    | ✅          |
| Edit               | ✅    | ✅      | ✅    | ✅          |
| Delete             | ❌    | ✅      | ✅    | ✅          |
| **Products**       |
| View               | ✅    | ✅      | ✅    | ✅          |
| Create             | ❌    | ✅      | ✅    | ✅          |
| Edit               | ❌    | ✅      | ✅    | ✅          |
| Delete             | ❌    | ❌      | ✅    | ✅          |
| **Reports**        |
| Basic              | ✅    | ✅      | ✅    | ✅          |
| Advanced           | ❌    | ✅      | ✅    | ✅          |
| Export             | ❌    | ✅      | ✅    | ✅          |
| **Administration** |
| Users              | ❌    | ❌      | ✅    | ✅          |
| Settings           | ❌    | ❌      | ✅    | ✅          |
| Billing            | ❌    | ❌      | ❌    | ✅          |
| Delete Org         | ❌    | ❌      | ❌    | ✅          |

### 3.3 Implementation

```typescript
// Guard implementation
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => this.roleHierarchy[user.role] >= this.roleHierarchy[role]);
  }

  private roleHierarchy = {
    staff: 1,
    manager: 2,
    admin: 3,
    super_admin: 4,
  };
}

// Usage in controller
@Controller('invoices')
export class InvoicesController {
  @Delete(':id')
  @Roles('manager', 'admin')
  async delete(@Param('id') id: string) {
    // Only managers and above can delete
  }
}
```

---

## 4. Data Security

### 4.1 Row-Level Security (RLS)

All data is isolated by organization:

```typescript
// Prisma middleware for organization isolation
prisma.$use(async (params, next) => {
  const organizationId = getOrganizationFromContext();

  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      organization_id: organizationId,
    };
  }

  if (params.action === 'create') {
    params.args.data.organization_id = organizationId;
  }

  return next(params);
});
```

### 4.2 Encryption

| Data Type | At Rest     | In Transit |
| --------- | ----------- | ---------- |
| Passwords | Bcrypt hash | TLS 1.3    |
| API Keys  | AES-256     | TLS 1.3    |
| PII Data  | AES-256     | TLS 1.3    |
| Database  | TiDB native | TLS 1.3    |
| Backups   | AES-256     | TLS 1.3    |

### 4.3 Sensitive Data Handling

```typescript
// Field-level encryption for sensitive data
@Entity()
class Customer {
  @Column()
  name: string;

  @Column({ transformer: encryptTransformer })
  tax_id: string; // Encrypted at rest

  @Column({ transformer: encryptTransformer })
  bank_account: string; // Encrypted at rest
}
```

---

## 5. Input Validation

### 5.1 Validation Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │───▶│  DTO Class  │───▶│  Validator  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Controller │◀───│  Sanitizer  │
                   └─────────────┘    └─────────────┘
```

### 5.2 DTO Validation Example

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitize } from 'class-sanitizer';

export class CreateInvoiceDto {
  @IsUUID()
  customer_id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Transform(({ value }) => sanitize(value))
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
```

### 5.3 Protection Against Common Attacks

| Attack            | Protection                      |
| ----------------- | ------------------------------- |
| SQL Injection     | Prisma parameterized queries    |
| XSS               | Output encoding, CSP headers    |
| CSRF              | Same-site cookies, CSRF tokens  |
| NoSQL Injection   | Input validation, type checking |
| Path Traversal    | Input sanitization              |
| Command Injection | No shell execution              |

---

## 6. Security Headers

### 6.1 HTTP Headers

```typescript
// NestJS helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.mtkcodex.site'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  })
);
```

### 6.2 CORS Configuration

```typescript
app.enableCors({
  origin: ['https://moneyflow.mtkcodex.site', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
});
```

---

## 7. Rate Limiting

### 7.1 Rate Limit Configuration

| Endpoint            | Limit | Window | Scope |
| ------------------- | ----- | ------ | ----- |
| Auth (login)        | 5     | 15 min | IP    |
| Auth (register)     | 3     | 1 hour | IP    |
| API (general)       | 100   | 1 min  | User  |
| API (authenticated) | 1000  | 1 min  | User  |
| Webhooks            | 1000  | 1 min  | IP    |

### 7.2 Implementation

```typescript
// Redis-based rate limiting
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = `rate:${request.user?.id || request.ip}`;

    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, 60);
    }

    if (current > 100) {
      throw new TooManyRequestsException('Rate limit exceeded');
    }

    return true;
  }
}
```

---

## 8. Audit Logging

### 8.1 Logged Events

| Category       | Events                                             |
| -------------- | -------------------------------------------------- |
| Authentication | Login, Logout, Failed login, Password reset        |
| Authorization  | Permission denied, Role change                     |
| Data Access    | Create, Read, Update, Delete                       |
| Admin Actions  | User management, Settings change                   |
| Security       | Rate limit hit, Invalid token, Suspicious activity |

### 8.2 Audit Log Structure

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  user_id: string;
  organization_id: string;
  action: string;
  resource: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  old_values?: object;
  new_values?: object;
  status: 'success' | 'failure';
  error_message?: string;
}
```

### 8.3 Implementation

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        await this.auditService.log({
          user_id: request.user?.id,
          organization_id: request.user?.organization_id,
          action: request.method,
          resource: request.path,
          ip_address: request.ip,
          user_agent: request.headers['user-agent'],
          duration: Date.now() - startTime,
          status: 'success',
        });
      }),
      catchError(async (error) => {
        await this.auditService.log({
          // ... log failure
          status: 'failure',
          error_message: error.message,
        });
        throw error;
      })
    );
  }
}
```

---

## 9. Security Checklist

### 9.1 Development

- [ ] Dependencies scanned for vulnerabilities
- [ ] Secrets not in source code
- [ ] Input validation on all endpoints
- [ ] Output encoding implemented
- [ ] Error messages don't leak info
- [ ] Logging doesn't include sensitive data

### 9.2 Deployment

- [ ] TLS enabled and configured
- [ ] Security headers set
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Firewall rules configured
- [ ] Secrets in environment variables

### 9.3 Monitoring

- [ ] Failed login alerts
- [ ] Rate limit breach alerts
- [ ] Error spike alerts
- [ ] Audit logs retained
- [ ] Regular security scans

---

## 10. Incident Response

### 10.1 Security Incident Levels

| Level    | Description                      | Response Time |
| -------- | -------------------------------- | ------------- |
| Critical | Data breach, system compromise   | Immediate     |
| High     | Auth bypass, injection attack    | 1 hour        |
| Medium   | Rate limit abuse, scraping       | 4 hours       |
| Low      | Failed logins, policy violations | 24 hours      |

### 10.2 Response Procedure

1. **Detect** - Monitoring alerts
2. **Assess** - Determine severity
3. **Contain** - Stop ongoing attack
4. **Eradicate** - Remove threat
5. **Recover** - Restore services
6. **Learn** - Post-mortem, improvements

---

**Document Version:** 1.0  
**Last Updated:** November 2024
