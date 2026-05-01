# ⚙️ Settings Module Documentation

> **URL:** `/settings` or `/settings?tab={tab_name}`  
> **Permission Required:** `business:settings`  
> **Last Updated:** November 2025

---

## 📌 Overview

The Settings module provides a centralized location for managing all aspects of your Money Flow account, organization, and integrations. It uses a tabbed interface with 8 main sections.

### Quick Access URLs

| Tab          | URL                          | Permission                |
| ------------ | ---------------------------- | ------------------------- |
| Profile      | `/settings?tab=profile`      | `business:settings`       |
| Business     | `/settings?tab=business`     | `business:update_profile` |
| Tax          | `/settings?tab=tax`          | `business:settings`       |
| Team         | `/settings?tab=team`         | `business:manage_team`    |
| Invoice      | `/settings?tab=invoice`      | `business:settings`       |
| Integrations | `/settings?tab=integrations` | `business:settings`       |
| API          | `/settings?tab=api`          | `business:settings`       |
| Preferences  | `/settings?tab=preferences`  | `business:settings`       |

---

## 👤 1. Profile Settings

Manage your personal account information.

### Fields

| Field         | Description             | Validation             |
| ------------- | ----------------------- | ---------------------- |
| **Full Name** | Your display name       | Required, 2-100 chars  |
| **Email**     | Login email (read-only) | Valid email format     |
| **Phone**     | Contact number          | Optional, phone format |
| **Avatar**    | Profile picture         | Image upload (max 2MB) |

### Actions

- Update profile information
- Change avatar
- View account creation date

---

## 🏢 2. Business Settings

Configure your organization's business information.

### Fields

| Field                 | Description                | Validation                        |
| --------------------- | -------------------------- | --------------------------------- |
| **Business Name**     | Organization name          | Required, 2-255 chars             |
| **Email**             | Business email             | Required, valid email             |
| **Phone**             | Business phone             | Optional, phone format            |
| **Address**           | Street address             | Optional, max 500 chars           |
| **City**              | City/Town                  | Optional, max 100 chars           |
| **Country**           | Country                    | Optional, max 100 chars           |
| **Tax ID**            | Tax registration number    | Optional, max 100 chars           |
| **Logo**              | Business logo              | Image upload (max 2MB)            |
| **Currency**          | Default currency           | PKR, USD, EUR, GBP, INR, AED, SAR |
| **Timezone**          | Business timezone          | Asia/Karachi (default)            |
| **Fiscal Year Start** | Financial year start month | Required (e.g., January)          |

### Supported Currencies

```
PKR - Pakistani Rupee (default)
USD - US Dollar
EUR - Euro
GBP - British Pound
INR - Indian Rupee
AED - UAE Dirham
SAR - Saudi Riyal
```

---

## 📋 3. Tax Settings

Configure tax rates and compliance settings.

### Features

- Default tax rate percentage
- Tax registration number
- Multiple tax categories
- Tax-inclusive/exclusive pricing options

---

## 👥 4. Team Management

Manage team members and their access levels.

### User Roles

| Role            | Level | Permissions                     |
| --------------- | ----- | ------------------------------- |
| **Super Admin** | 100   | Full platform access            |
| **Admin**       | 90    | Full organization access        |
| **Manager**     | 70    | Manage team, reports, full CRUD |
| **Accountant**  | 60    | Financial data, reports         |
| **Cashier**     | 40    | Sales, basic operations         |
| **Customer**    | 10    | Self-service portal             |

### Actions

| Action            | Description                        |
| ----------------- | ---------------------------------- |
| **Invite Member** | Send email invitation to join team |
| **Change Role**   | Update user's permission level     |
| **Remove Member** | Deactivate or delete user          |
| **View Activity** | See user's last login and actions  |

### Invitation Flow

1. Click "Invite Member" button
2. Enter email address
3. Select role from dropdown
4. Enter full name (optional)
5. Toggle "Send invitation email"
6. Click "Send Invitation"

---

## 📄 5. Invoice Settings

Configure invoice appearance and defaults.

### Settings

| Setting                   | Description                  |
| ------------------------- | ---------------------------- |
| **Invoice Prefix**        | Custom prefix (e.g., "INV-") |
| **Invoice Number Format** | Numbering pattern            |
| **Default Due Days**      | Days until payment is due    |
| **Default Notes**         | Standard invoice notes       |
| **Default Terms**         | Payment terms and conditions |
| **Logo on Invoice**       | Show business logo           |
| **Color Theme**           | Invoice accent color         |

---

## 🔌 6. Integration Settings

Connect external services to Money Flow.

### Available Integrations

#### 📧 Email Service

Send invoices and notifications via email.

| Provider     | Description                    | API Key Required     |
| ------------ | ------------------------------ | -------------------- |
| **SendGrid** | Popular email delivery service | Yes                  |
| **Resend**   | Modern email API               | Yes                  |
| **SMTP**     | Custom SMTP server             | Yes (server details) |

**Configuration:**

1. Select email service provider
2. Enter API key
3. Test connection
4. Save changes

**Use Cases:**

- Sending invoice emails to customers
- Payment reminder notifications
- Welcome emails to new users

---

#### 📱 SMS Service

Send SMS notifications to customers.

| Provider   | Description         | API Key Required |
| ---------- | ------------------- | ---------------- |
| **Twilio** | Global SMS platform | Yes              |
| **Other**  | Custom SMS gateway  | Yes              |

**Configuration:**

1. Select SMS provider
2. Enter API credentials
3. Configure sender ID
4. Save changes

**Use Cases:**

- Payment received notifications
- Invoice due reminders
- Low stock alerts

---

#### 📊 Accounting Software

Sync financial data with accounting platforms.

| Provider       | Description         | Sync Direction |
| -------------- | ------------------- | -------------- |
| **QuickBooks** | Intuit accounting   | Two-way        |
| **Xero**       | Cloud accounting    | Two-way        |
| **Sage**       | Business management | Two-way        |

**Data Synced:**

- Invoices
- Customers
- Products
- Transactions
- Chart of accounts

**Configuration:**

1. Select accounting software
2. Click "Connect" to authorize
3. Map accounts and categories
4. Enable auto-sync (optional)
5. Save changes

---

#### 👥 CRM Integration

Sync customer data with CRM platforms.

| Provider       | Description           | Sync Direction |
| -------------- | --------------------- | -------------- |
| **Salesforce** | Enterprise CRM        | Two-way        |
| **HubSpot**    | Marketing & sales CRM | Two-way        |

**Data Synced:**

- Customer profiles
- Contact information
- Invoice history
- Payment status

---

## 🔑 7. API Settings

Manage programmatic access to Money Flow.

### API Keys

API keys allow external applications to access your Money Flow data securely.

#### Generating an API Key

1. Click "Generate Key" button
2. Enter a descriptive name (e.g., "Mobile App", "Zapier Integration")
3. Select permissions:

**Available Permissions:**

| Permission           | Description                |
| -------------------- | -------------------------- |
| `invoices:read`      | View invoices              |
| `invoices:write`     | Create/update invoices     |
| `customers:read`     | View customers             |
| `customers:write`    | Create/update customers    |
| `products:read`      | View products              |
| `products:write`     | Create/update products     |
| `transactions:read`  | View transactions          |
| `transactions:write` | Create/update transactions |

4. Click "Generate Key"
5. **⚠️ IMPORTANT:** Copy and save the key immediately - it won't be shown again!

#### API Key Format

```
mf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Using the API Key

Include the API key in your request headers:

```bash
curl -X GET "https://api.mtkcodex.site/v1/invoices" \
  -H "Authorization: Bearer mf_live_xxxxxxxxxxxx" \
  -H "Content-Type: application/json"
```

#### Managing Keys

| Action     | Description                                        |
| ---------- | -------------------------------------------------- |
| **View**   | See key name, permissions, created date, last used |
| **Revoke** | Disable key (can be re-enabled)                    |
| **Delete** | Permanently remove key                             |

#### Best Practices

- ✅ Use descriptive names for each key
- ✅ Grant minimum required permissions
- ✅ Rotate keys periodically (every 90 days)
- ✅ Store keys securely (environment variables, secrets manager)
- ❌ Never commit keys to version control
- ❌ Never share keys in public channels
- ❌ Never use production keys in development

---

### Webhooks

Receive real-time notifications when events occur.

#### Creating a Webhook

1. Click "Add Webhook" button
2. Enter your webhook URL (must be HTTPS)
3. Select events to subscribe to
4. Click "Create Webhook"
5. Save the webhook secret for signature verification

#### Available Events

| Event              | Trigger                  |
| ------------------ | ------------------------ |
| `invoice.created`  | New invoice created      |
| `invoice.updated`  | Invoice details changed  |
| `invoice.paid`     | Invoice marked as paid   |
| `customer.created` | New customer added       |
| `customer.updated` | Customer details changed |
| `payment.received` | Payment recorded         |

#### Webhook Payload Format

```json
{
  "id": "evt_xxxxxxxxxx",
  "type": "invoice.created",
  "created_at": "2025-11-29T12:00:00Z",
  "data": {
    "id": "inv_xxxxxxxxxx",
    "invoice_number": "INV-202511-0001",
    "customer_id": "cus_xxxxxxxxxx",
    "total_amount": 15000.0,
    "status": "draft"
  }
}
```

#### Verifying Webhook Signatures

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

#### Webhook Status

| Status       | Description                |
| ------------ | -------------------------- |
| **Active**   | Receiving events           |
| **Inactive** | Paused/disabled            |
| **Failed**   | Multiple delivery failures |

---

## ⚙️ 8. Preferences

Personal application preferences.

### Settings

| Setting           | Options                | Description             |
| ----------------- | ---------------------- | ----------------------- |
| **Theme**         | Light / Dark / System  | Color scheme preference |
| **Language**      | English                | Interface language      |
| **Date Format**   | DD/MM/YYYY, MM/DD/YYYY | Date display format     |
| **Number Format** | 1,234.56 / 1.234,56    | Number formatting       |
| **Notifications** | On/Off                 | In-app notifications    |
| **Email Alerts**  | On/Off                 | Email notifications     |

---

## 🔐 Security Recommendations

### For API Keys

1. Never expose API keys in client-side code
2. Use environment variables to store keys
3. Implement key rotation every 90 days
4. Monitor API key usage in logs
5. Revoke unused keys immediately

### For Webhooks

1. Always verify webhook signatures
2. Respond with 2xx status quickly
3. Process events asynchronously
4. Implement idempotency for retries
5. Log all webhook events for debugging

### For Integrations

1. Use OAuth where available (QuickBooks, Xero)
2. Store credentials securely (encrypted at rest)
3. Regularly audit connected services
4. Disconnect unused integrations

---

## 🛠️ Troubleshooting

### API Key Not Working

1. Verify key is not revoked
2. Check permissions match required scope
3. Ensure correct Authorization header format
4. Check for trailing whitespace in key

### Webhook Not Receiving Events

1. Verify URL is accessible (HTTPS required)
2. Check firewall/security group settings
3. Ensure endpoint returns 2xx status
4. Verify event subscription is active

### Integration Connection Failed

1. Regenerate API key from provider
2. Check for expired OAuth tokens
3. Verify required scopes are granted
4. Contact integration support

---

## 📞 Support

Need help with settings? Contact us:

- **Email:** support@mtkcodex.site
- **Documentation:** https://docs.mtkcodex.site
- **Live URL:** https://mtkcodex.site
