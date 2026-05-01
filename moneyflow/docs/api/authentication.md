# API Authentication Guide

## Money Flow - Authentication & Authorization

---

## 1. Overview

Money Flow uses JWT (JSON Web Token) based authentication via Supabase Auth.

### 1.1 Authentication Flow

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│    Client    │        │   Supabase   │        │   API        │
│   (Browser)  │        │    Auth      │        │  (NestJS)    │
└──────┬───────┘        └──────┬───────┘        └──────┬───────┘
       │                       │                       │
       │  1. Login Request     │                       │
       │──────────────────────▶│                       │
       │                       │                       │
       │  2. JWT Tokens        │                       │
       │◀──────────────────────│                       │
       │                       │                       │
       │  3. API Request + Bearer Token                │
       │──────────────────────────────────────────────▶│
       │                       │                       │
       │                       │  4. Verify Token      │
       │                       │◀──────────────────────│
       │                       │                       │
       │  5. Response          │                       │
       │◀──────────────────────────────────────────────│
       │                       │                       │
```

---

## 2. Getting Started

### 2.1 Login

**Endpoint:** `POST /api/v1/auth/login` (via Supabase)

```typescript
// Using Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Email/Password login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'your-password',
});

if (data.session) {
  const accessToken = data.session.access_token;
  // Use this token for API requests
}
```

### 2.2 Register

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'secure-password',
  options: {
    data: {
      name: 'John Doe',
      organization_name: 'Acme Corp',
    },
  },
});
```

### 2.3 Making Authenticated Requests

```typescript
// Include token in Authorization header
const response = await fetch('https://api.mtkcodex.site/api/v1/invoices', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

---

## 3. Token Management

### 3.1 Token Structure

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800,
  "refresh_token": "v1.MjAyMy0xMS0yNlQxMDowMDowMFo...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "name": "John Doe"
    }
  }
}
```

### 3.2 Token Expiration

| Token         | Expiry  | Use                  |
| ------------- | ------- | -------------------- |
| Access Token  | 7 days  | API requests         |
| Refresh Token | 30 days | Get new access token |

### 3.3 Refreshing Tokens

```typescript
// Automatically handled by Supabase client
const { data, error } = await supabase.auth.refreshSession();

// Or manually
const { data, error } = await supabase.auth.setSession({
  access_token: currentAccessToken,
  refresh_token: currentRefreshToken,
});
```

---

## 4. Authentication Headers

### 4.1 Required Headers

| Header              | Value              | Required                   |
| ------------------- | ------------------ | -------------------------- |
| `Authorization`     | `Bearer <token>`   | Yes                        |
| `Content-Type`      | `application/json` | For POST/PUT/PATCH         |
| `X-Organization-ID` | `<org-uuid>`       | Optional (auto from token) |

### 4.2 Example Request

```bash
curl -X GET 'https://api.mtkcodex.site/api/v1/invoices' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

---

## 5. OAuth Providers

### 5.1 Google OAuth

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://moneyflow.mtkcodex.site/auth/callback',
  },
});
```

### 5.2 GitHub OAuth

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://moneyflow.mtkcodex.site/auth/callback',
  },
});
```

### 5.3 OAuth Callback Handling

```typescript
// In your callback route
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // User signed in via OAuth
      router.push('/dashboard');
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
}, []);
```

---

## 6. Password Management

### 6.1 Reset Password

```typescript
// Request password reset
const { data, error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://moneyflow.mtkcodex.site/reset-password',
});
```

### 6.2 Update Password

```typescript
// After clicking reset link (user is authenticated)
const { data, error } = await supabase.auth.updateUser({
  password: 'new-secure-password',
});
```

### 6.3 Change Password (Authenticated)

```typescript
const { data, error } = await supabase.auth.updateUser({
  password: 'new-password',
});
```

---

## 7. Session Management

### 7.1 Get Current Session

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  console.log('User:', session.user.email);
  console.log('Token:', session.access_token);
}
```

### 7.2 Get Current User

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
  console.log('Metadata:', user.user_metadata);
}
```

### 7.3 Logout

```typescript
const { error } = await supabase.auth.signOut();
```

---

## 8. Error Handling

### 8.1 Authentication Errors

| Error Code            | Description           | Solution                     |
| --------------------- | --------------------- | ---------------------------- |
| `invalid_credentials` | Wrong email/password  | Check credentials            |
| `email_not_confirmed` | Email not verified    | Check email for verification |
| `user_not_found`      | User doesn't exist    | Register first               |
| `invalid_token`       | Token expired/invalid | Refresh token                |
| `session_expired`     | Session ended         | Re-authenticate              |

### 8.2 Error Response Format

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### 8.3 Handling Errors

```typescript
try {
  const response = await fetch('/api/v1/invoices', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    // Token expired - refresh
    const { data } = await supabase.auth.refreshSession();
    // Retry request with new token
  }

  if (response.status === 403) {
    // Forbidden - insufficient permissions
    console.error('You do not have permission');
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## 9. API Key Authentication

### 9.1 API Keys (for integrations)

For server-to-server integrations, use API keys:

```bash
curl -X GET 'https://api.mtkcodex.site/api/v1/invoices' \
  -H 'X-API-Key: your-api-key' \
  -H 'Content-Type: application/json'
```

### 9.2 Creating API Keys

```typescript
// Via API (admin only)
const response = await fetch('/api/v1/admin/api-keys', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Integration Key',
    permissions: ['invoices:read', 'customers:read'],
  }),
});
```

---

## 10. Security Best Practices

### 10.1 Token Storage

| Platform     | Recommendation            |
| ------------ | ------------------------- |
| Browser      | Memory (not localStorage) |
| React Native | SecureStore               |
| Node.js      | Environment variables     |

### 10.2 Security Checklist

- ✅ Never expose tokens in URLs
- ✅ Use HTTPS for all requests
- ✅ Implement token refresh logic
- ✅ Handle logout on token expiry
- ✅ Validate tokens server-side
- ✅ Use short-lived access tokens

---

## 11. Code Examples

### 11.1 React Hook

```typescript
// useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}
```

### 11.2 Axios Interceptor

```typescript
// api.ts
import axios from 'axios';
import { supabase } from '@/lib/supabase';

const api = axios.create({
  baseURL: 'https://api.mtkcodex.site/api/v1',
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const { data } = await supabase.auth.refreshSession();

      if (data.session) {
        // Retry original request
        error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api.request(error.config);
      }

      // Redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

**Document Version:** 1.0  
**Last Updated:** November 2024
