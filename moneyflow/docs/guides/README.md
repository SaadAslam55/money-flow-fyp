# Money Flow Documentation

> Complete documentation for Money Flow Business Management Platform

---

## 📚 Documentation Index

### 🚀 Getting Started

| Guide                                        | Description                       |
| -------------------------------------------- | --------------------------------- |
| [Quick Start](QUICK_START.md)                | 5-minute setup guide              |
| [Getting Started](guides/getting-started.md) | Complete installation walkthrough |
| [User Guide](USER_GUIDE.md)                  | End-user feature guide            |
| [Setup Guide](SETUP_GUIDE.md)                | Detailed configuration            |
| [Environment Setup](ENV_COMPLETE_GUIDE.md)   | Environment variables             |

### 🏗️ Architecture

| Document                                           | Description             |
| -------------------------------------------------- | ----------------------- |
| [System Design](architecture/system-design.md)     | Architecture overview   |
| [Database Schema](architecture/database-schema.md) | Database design & ERD   |
| [Security Model](architecture/security-model.md)   | Security implementation |

### 📡 API Documentation

| Document                                | Description                 |
| --------------------------------------- | --------------------------- |
| [API Endpoints](api/endpoints.md)       | Complete REST API reference |
| [Authentication](api/authentication.md) | Auth flow & JWT tokens      |
| [Webhooks](api/webhooks.md)             | Event webhooks              |

### 📖 Guides

| Guide                                        | Audience       |
| -------------------------------------------- | -------------- |
| [Getting Started](guides/getting-started.md) | New users      |
| [Admin Guide](guides/admin-guide.md)         | Administrators |
| [Developer Guide](guides/developer-guide.md) | Developers     |

### ⚙️ Module Documentation

| Document                | Description                         |
| ----------------------- | ----------------------------------- |
| [Settings](settings.md) | Settings module (API, Integrations) |

### 🎓 FYP Documentation

| Document                             | Description                |
| ------------------------------------ | -------------------------- |
| [FYP Mid Report](fyp/FYP1-Report.md) | Complete FYP Mid Report    |
| [Functional Requirements](fyp/FR.md) | 71 Functional Requirements |
| [Use Cases](fyp/usecases.md)         | Use case specifications    |

### 🎯 User Role Guides

#### Super Admin

- **Access:** `/admin` panel
- **How to get:** See [Setup Guide - Creating Super Admin](SETUP_GUIDE.md#creating-super-admin)
- **Capabilities:** Full system access, manage all businesses, platform settings

#### Admin

- **Access:** Full business management
- **How to get:** Sign up at `/auth/signup` (automatic)
- **Capabilities:** Manage team, settings, all business data

#### Regular Users

- **Access:** Based on role (Manager, Accountant, Cashier)
- **How to get:** Invited by Admin
- **Capabilities:** See [User Guide - Regular User Access](USER_GUIDE.md#regular-user-access)

## 🔗 Quick Links

### For Users

- [How to Get Super Admin Access](SETUP_GUIDE.md#creating-super-admin)
- [How to Get Admin Access](USER_GUIDE.md#admin-access)
- [How to Create Regular Users](USER_GUIDE.md#regular-user-access)
- [Feature Usage Guide](USER_GUIDE.md#feature-usage-guide)

### For Developers

- [Setup Instructions](SETUP_GUIDE.md)
- [Database Seeding](SETUP_GUIDE.md#database-seeding)
- [API Documentation](api/endpoints.md)
- [Architecture Overview](architecture/system-design.md)

## 📝 Documentation Structure

```
docs/
├── README.md              # This file
├── QUICK_START.md         # Quick reference guide
├── USER_GUIDE.md          # Complete user guide
├── SETUP_GUIDE.md         # Setup and configuration
├── settings.md            # Settings module documentation
├── api/                   # API documentation
│   ├── endpoints.md
│   ├── authentication.md
│   └── webhooks.md
├── architecture/          # Architecture docs
│   ├── database-schema.md
│   ├── system-design.md
│   └── security-model.md
├── guides/                # User guides
│   ├── getting-started.md
│   ├── admin-guide.md
│   └── developer-guide.md
└── fyp/                   # FYP documentation
    ├── FYP1-Report.md
    ├── FR.md
    └── usecases.md
```

## 🆘 Need Help?

- **User Issues:** See [User Guide - Troubleshooting](USER_GUIDE.md#troubleshooting)
- **Setup Issues:** See [Setup Guide - Troubleshooting](SETUP_GUIDE.md#troubleshooting)
- **General Support:** support@moneyflow.app

---

**Last Updated:** November 2025  
**Version:** 1.1.0
