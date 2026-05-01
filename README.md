# Money Flow 💰

> A comprehensive Business Management Platform for small to medium businesses to manage finances, inventory, customers, and operations from a single dashboard.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](CHANGELOG.md)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e.svg)](https://supabase.com/)
[![Security](https://img.shields.io/badge/security-A+-green.svg)](SECURITY.md)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)
[![Live](https://img.shields.io/badge/Live-mtkcodex.site-success.svg)](https://mtkcodex.site)

## 🌟 Features

### Core Functionality

- **📊 Dashboard Analytics** - Real-time business metrics and insights
- **🧾 Invoice Management** - Create, send, and track invoices with PDF generation
- **👥 Customer Management** - Complete customer profiles with payment history
- **📦 Inventory Tracking** - Real-time stock management with low-stock alerts
- **💳 Expense Tracking** - Record and categorize all business expenses
- **📈 Financial Reports** - Profit & Loss, Balance Sheet, Cash Flow statements
- **🔄 Recurring Invoices** - Automated billing for subscriptions
- **💰 Multi-Payment Methods** - Cash, bank transfer, cards, Upaisa

### Advanced Features (v2.0)

- **� Enhanced Authentication** - Email confirmation, automatic token refresh, password strength
- **🏢 Multi-Tenant Architecture** - Complete data isolation, organization management, super admin
- **� Granular RBAC** - Permission-based access control with custom roles
- **🛡️ Enterprise Security** - CSRF protection, rate limiting, XSS/SQL injection prevention
- **� Mobile-First Design** - Responsive components, touch-optimized UI, PWA support
- **⚡ Optimistic UI** - Instant feedback with automatic rollback on errors
- **♿ Accessibility First** - ARIA labels, keyboard navigation, screen reader support
- **� Offline Support** - Automatic offline detection with reconnection handling
- **� Comprehensive Audit** - Security event tracking, audit logging, compliance ready
- **🧪 Testing Infrastructure** - Mock data, test utilities, E2E testing support
- **🎨 Dark Mode** - System-aware theme with smooth transitions
- **⌨️ Keyboard Shortcuts** - Power user features with customizable shortcuts

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm** or **yarn**
- **Supabase** account (free tier available)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/moneyflow.git
cd moneyflow
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (for payments)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GA_TRACKING_ID=your-ga-id
```

4. **Setup Supabase database**

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize and start local Supabase (optional)
supabase init
supabase start

# Or link to your cloud project
supabase link --project-ref your-project-ref

# Run migrations
supabase db reset
```

5. **Start development server**

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
moneyflow/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components (Navbar, Sidebar)
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── invoices/       # Invoice components
│   │   ├── customers/      # Customer management
│   │   ├── products/       # Product/inventory components
│   │   └── reports/        # Report components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand stores
│   ├── lib/                # Utilities and configurations
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main app component
├── supabase/
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions
├── public/                 # Static assets
├── tests/                  # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example            # Environment variables template
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🏗️ Tech Stack

### Frontend

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand + React Query
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts
- **PWA:** Vite PWA Plugin

### Backend

- **BaaS:** Supabase (PostgreSQL + Auth + Storage)
- **Edge Functions:** Deno (TypeScript)
- **Real-time:** WebSockets via Supabase
- **File Storage:** Supabase Storage

### External Services

- **Payments:** jazzcash ,easy paisa ,raast id
- **Email:** Resend
- **SMS/WhatsApp:** Twilio
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics 4

## 🔒 User Roles & Access

Money Flow supports multiple user roles with granular permissions:

| Role            | Level | Permissions           | Use Case         |
| --------------- | ----- | --------------------- | ---------------- |
| **Super Admin** | 100   | Full system access    | Platform owner   |
| **Admin**       | 90    | Full business access  | Business owner   |
| **Manager**     | 70    | Operations management | Store manager    |
| **Accountant**  | 60    | Financial data        | Bookkeeper       |
| **Cashier**     | 40    | Sales only            | POS operator     |
| **Customer**    | 10    | Self-service portal   | Business clients |

### Getting Access

- **Super Admin:** See [Setup Guide](docs/SETUP_GUIDE.md#creating-super-admin) for database setup instructions
- **Admin:** Automatically assigned when you [sign up](http://localhost:5173/auth/signup) for a new business
- **Regular Users:** Invited by Admin via Settings → Team Management

📖 **Full User Guide:** [docs/USER_GUIDE.md](docs/USER_GUIDE.md)  
🔧 **Setup Instructions:** [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

## 📊 Database Schema

### Core Tables

- `organizations` - Business/tenant data
- `users` - Team members
- `customers` - Business clients
- `products` - Products and services
- `invoices` - Sales invoices
- `invoice_items` - Invoice line items
- `transactions` - All money movements
- `bank_accounts` - Business bank accounts
- `expense_categories` - Expense categorization
- `audit_logs` - Activity tracking

[View complete schema →](docs/database-schema.md)

## 🔐 Security Features

- **Row-Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **Two-Factor Authentication** - TOTP for admin accounts
- **Data Encryption** - At rest and in transit (TLS 1.3)
- **Audit Logging** - Complete activity tracking
- **Rate Limiting** - API abuse prevention
- **GDPR Compliant** - Data export and deletion

## 📱 Progressive Web App

Money Flow can be installed as a native app on any device:

### iOS/iPadOS

1. Open Safari
2. Tap Share → "Add to Home Screen"

### Android

1. Open Chrome
2. Tap Menu → "Install app"

### Desktop

1. Open Chrome/Edge
2. Click install icon in address bar

### Offline Support

- View recent data
- Create draft invoices
- Auto-sync when online

## 🎨 Customization

### Branding (Enterprise)

```typescript
// src/config/branding.ts
export const branding = {
  logo: '/your-logo.png',
  primaryColor: '#3b82f6',
  companyName: 'Your Company',
  domain: 'yourdomain.com',
};
```

### Email Templates

```typescript
// supabase/functions/send-invoice/templates/invoice.html
<html>
  <body style="background: {{primaryColor}}">
    <h1>Invoice from {{companyName}}</h1>
    <!-- Custom template -->
  </body>
</html>
```

## 🧪 Testing

### Run Unit Tests

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## 📦 Deployment

### Frontend (Vercel)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Configure:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add environment variables**
5. **Deploy!**

### Edge Functions (Supabase)

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-invoice
```

### Database Migrations

```bash
# Apply pending migrations
supabase db push

# Create new migration
supabase migration new add_payment_methods
```

[View detailed deployment guide →](docs/deployment.md)

## 📈 Subscription Plans

| Feature         | Free      | Pro ($15/mo) | Enterprise ($49/mo) |
| --------------- | --------- | ------------ | ------------------- |
| Users           | 1         | 5            | Unlimited           |
| Invoices/month  | 50        | Unlimited    | Unlimited           |
| Customers       | 100       | Unlimited    | Unlimited           |
| Inventory       | ❌        | ✅           | ✅                  |
| Multi-branch    | ❌        | ❌           | ✅                  |
| API Access      | ❌        | ❌           | ✅                  |
| Custom Branding | ❌        | ❌           | ✅                  |
| Support         | Community | Email        | Priority + Phone    |

## 🔌 API Reference

### Authentication

```bash
curl -X POST https://api.moneyflow.app/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"***"}'
```

### Create Invoice

```bash
curl -X POST https://api.moneyflow.app/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "uuid",
    "items": [{"product_id":"uuid","quantity":2,"price":100}]
  }'
```

[View complete API documentation →](docs/api-reference.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

## 🐛 Bug Reports

Found a bug? [Open an issue](https://github.com/yourusername/moneyflow/issues/new?template=bug_report.md)

## 💡 Feature Requests

Have an idea? [Open a feature request](https://github.com/yourusername/moneyflow/issues/new?template=feature_request.md)

## 📚 Documentation

### Getting Started

- **[User Guide](docs/USER_GUIDE.md)** - Complete guide for all user roles (Super Admin, Admin, Regular Users)
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Step-by-step setup and user creation instructions

### Technical Documentation

- [API Reference](docs/api-reference.md) - API endpoints and usage
- [Database Schema](docs/database-schema.md) - Database structure and relationships
- [Deployment Guide](docs/deployment.md) - Production deployment instructions
- [Security Best Practices](docs/security.md) - Security guidelines
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## 🎓 Learning Resources

- [Video Tutorials](https://youtube.com/@moneyflow)
- [Blog Posts](https://moneyflow.app/blog)
- [Community Forum](https://community.moneyflow.app)
- [API Playground](https://api.moneyflow.app/playground)

## 📞 Support

- **Email:** support@moneyflow.app
- **Documentation:** docs.moneyflow.app
- **Community:** community.moneyflow.app
- **Twitter:** [@moneyflow_app](https://twitter.com/moneyflow_app)

## 🗺️ Roadmap

### Q1 2025 ✅

- [x] Complete accounting system
- [x] Invoice generation
- [x] Customer management
- [x] Basic reports
- [x] Role-based access

### Q2 2025 🚀

- [ ] Inventory management
- [ ] Recurring invoices
- [ ] Payment reminders
- [ ] WhatsApp integration

### Q3 2025 📋

- [ ] Payroll processing
- [ ] Multi-branch support
- [ ] Advanced analytics
- [ ] Custom reports

### Q4 2025 🎯

- [ ] Mobile apps (React Native)
- [ ] AI-powered insights
- [ ] Blockchain receipts
- [ ] Global payments

[View detailed roadmap →](docs/roadmap.md)

## 🚢 Deployment

### Production Deployment (Vercel)

**Live URL**: [https://mtkcodex.site](https://mtkcodex.site)

The project is automatically deployed to Vercel when changes are pushed to the `main` branch.

#### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kaashmalik/moneyflow)

#### Manual Deployment Steps

1. **Connect Repository to Vercel**
   - Login to [Vercel Dashboard](https://vercel.com)
   - Import GitHub repository: `Kaashmalik/moneyflow`
   - Framework will auto-detect as Vite

2. **Configure Environment Variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for full list

3. **Add Custom Domain**
   - Go to Settings → Domains
   - Add your custom domain (e.g., mtkcodex.site)
   - Update DNS settings with your registrar

4. **Deploy**
   - Push to `main` branch triggers automatic deployment
   - Or use Vercel CLI: `vercel --prod`

**📖 Full Deployment Guide**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

## 📄 License

© 2024 Money Flow. All rights reserved.

This is proprietary software. For licensing inquiries: licensing@moneyflow.app

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [Vercel](https://vercel.com/) - Hosting platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [React](https://reactjs.org/) - Frontend library

## ⭐ Star History

If you find this project useful, please consider giving it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/moneyflow&type=Date)](https://star-history.com/#yourusername/moneyflow&Date)

---

**Made with ❤️ by the Money Flow Team**

[Website](https://moneyflow.app) • [Documentation](https://docs.moneyflow.app) • [Twitter](https://twitter.com/moneyflow_app) • [Discord](https://discord.gg/moneyflow)
