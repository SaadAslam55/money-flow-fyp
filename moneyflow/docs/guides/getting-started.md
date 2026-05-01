# Getting Started Guide

## Money Flow - Quick Start

---

## 1. Introduction

Welcome to Money Flow! This guide will help you set up and start using the application in minutes.

---

## 2. Prerequisites

### 2.1 System Requirements

| Requirement | Minimum    | Recommended           |
| ----------- | ---------- | --------------------- |
| Node.js     | 18.x       | 20.x LTS              |
| npm         | 9.x        | 10.x                  |
| Browser     | Chrome 90+ | Latest Chrome/Firefox |
| Memory      | 4GB RAM    | 8GB RAM               |

### 2.2 Accounts Needed

- **Supabase** - [supabase.com](https://supabase.com) (free tier available)
- **TiDB Cloud** - [tidbcloud.com](https://tidbcloud.com) (serverless free tier)
- **Upstash** - [upstash.com](https://upstash.com) (free tier available)

---

## 3. Installation

### 3.1 Clone Repository

```bash
git clone https://github.com/your-username/moneyflow.git
cd moneyflow
```

### 3.2 Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd apps/api
npm install
cd ../..

# Install worker dependencies (optional)
cd workers/moneyflow-edge
npm install
cd ../..
```

### 3.3 Setup Environment

```bash
# Run setup script (Windows)
.\scripts\setup-env.ps1

# Or manually copy example files
cp .env.example .env.local
cp apps/api/.env.example apps/api/.env
```

### 3.4 Configure Environment Variables

Edit `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Edit `apps/api/.env` with database credentials:

```env
DATABASE_URL="mysql://user:pass@host:4000/moneyflow"
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
```

---

## 4. Running the Application

### 4.1 Development Mode

```bash
# Start frontend (port 5173)
npm run dev

# In another terminal, start API (port 3001)
cd apps/api
npm run start:dev
```

### 4.2 Access the Application

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

---

## 5. First Steps

### 5.1 Create an Account

1. Open http://localhost:5173
2. Click "Sign Up"
3. Enter your email and password
4. Check email for verification link
5. Click the verification link
6. Complete organization setup

### 5.2 Setup Your Organization

1. Go to **Settings** → **Organization**
2. Enter your business name
3. Upload a logo (optional)
4. Set your default currency
5. Configure tax rate
6. Save settings

### 5.3 Add Your First Customer

1. Navigate to **Customers**
2. Click **Add Customer**
3. Enter customer details:
   - Name (required)
   - Email
   - Phone
   - Address
4. Click **Save**

### 5.4 Add Products/Services

1. Navigate to **Products**
2. Click **Add Product**
3. Enter product details:
   - Name
   - SKU (optional)
   - Price
   - Category
4. Click **Save**

### 5.5 Create Your First Invoice

1. Navigate to **Invoices**
2. Click **New Invoice**
3. Select a customer
4. Add line items (products/services)
5. Set due date
6. Click **Save Draft**
7. Review and **Send** to customer

---

## 6. Key Features Overview

### 6.1 Dashboard

View at-a-glance metrics:

- Total revenue
- Outstanding invoices
- Recent activity
- Revenue trends

### 6.2 Invoice Management

- Create professional invoices
- Send via email
- Track payment status
- Record payments
- Generate PDF

### 6.3 Customer Management

- Maintain customer database
- View transaction history
- Track balances
- Quick search

### 6.4 Inventory (Optional)

- Track product stock
- Low stock alerts
- Stock adjustments
- Movement history

### 6.5 Reports

- Sales reports
- Revenue analytics
- Customer insights
- Export data

---

## 7. Keyboard Shortcuts

| Shortcut   | Action       |
| ---------- | ------------ |
| `Ctrl + K` | Quick search |
| `Ctrl + N` | New invoice  |
| `Ctrl + S` | Save         |
| `Escape`   | Close modal  |

---

## 8. Next Steps

### 8.1 Explore Documentation

- [User Guide](../USER_GUIDE.md) - Detailed feature guide
- [API Reference](../api/endpoints.md) - API documentation
- [Deployment Guide](../DEPLOYMENT.md) - Production deployment

### 8.2 Customize Settings

- Organization branding
- Invoice templates
- Tax configuration
- Payment terms

### 8.3 Invite Team Members

1. Go to **Settings** → **Users**
2. Click **Invite User**
3. Enter email and select role
4. Send invitation

---

## 9. Troubleshooting

### 9.1 Common Issues

**"Cannot connect to Supabase"**

- Check VITE_SUPABASE_URL is correct
- Verify API key is valid
- Ensure project is not paused

**"Database connection failed"**

- Check DATABASE_URL format
- Verify TiDB cluster is running
- Check IP allowlist

**"Authentication failed"**

- Clear browser storage
- Re-login
- Check token expiration

### 9.2 Get Help

- Check [FAQ](../FAQ.md)
- Open GitHub issue
- Contact support

---

## 10. Quick Reference

### 10.1 Project Structure

```
moneyflow/
├── src/              # Frontend React code
├── apps/api/         # NestJS backend
├── workers/          # Cloudflare Workers
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

### 10.2 Useful Commands

```bash
# Frontend
npm run dev           # Start development
npm run build         # Production build
npm run test          # Run tests

# API
cd apps/api
npm run start:dev     # Development
npm run build         # Production build
npm run test          # Run tests

# Database
npx prisma db push    # Sync schema
npx prisma studio     # Database GUI
```

---

**Document Version:** 1.0  
**Last Updated:** November 2024
