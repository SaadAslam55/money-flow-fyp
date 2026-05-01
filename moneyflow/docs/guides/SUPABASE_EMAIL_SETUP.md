# Supabase Email Authentication Setup

## Issue: 404 Error on Email Confirmation

When users sign up and click the email confirmation link, they receive a 404 error.

## Root Cause

The Supabase **Site URL** configuration doesn't match your application URL, causing email links to redirect to an incorrect URL.

## Solution

### 1. Configure Site URL in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ttriixtrwjhrbqpfkgra)
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following settings:

#### Development Environment

- **Site URL**: `http://localhost:5173`
- **Redirect URLs** (add these):
  ```
  http://localhost:5173/auth/callback
  http://localhost:5173/**
  ```

#### Production Environment

- **Site URL**: `https://your-production-domain.com`
- **Redirect URLs** (add these):
  ```
  https://your-production-domain.com/auth/callback
  https://your-production-domain.com/**
  ```

### 2. Email Template Configuration

Your email template is already correct:

```
Redirect URL: {{ .SiteURL }}/auth/callback
```

The `{{ .SiteURL }}` variable will automatically use the Site URL configured in step 1.

### 3. Application Routes

Your app already has the correct route configured:

- Route: `/auth/callback`
- Component: `AuthCallbackPage` (`src/pages/auth/AuthCallbackPage.tsx`)
- Handles: Email verification, password reset, and other auth callbacks
- **Updated**: Now correctly handles query parameters (`?token=...&type=...`) instead of hash fragments

### 4. Environment Variables

Ensure your `.env` file has the correct configuration:

```env
VITE_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=https://ttriixtrwjhrbqpfkgra.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Testing the Flow

1. **Sign Up**:
   - Go to `http://localhost:5173/auth/signup`
   - Enter email and password
   - Submit the form

2. **Check Email**:
   - Open the confirmation email
   - Verify the link format: `http://localhost:5173/auth/callback#access_token=...`

3. **Click Link**:
   - Should redirect to your app
   - `AuthCallbackPage` processes the tokens
   - User is redirected to dashboard
   - Success toast appears

4. **Verify User**:
   - Check Supabase Dashboard → Authentication → Users
   - User should appear with `email_confirmed_at` timestamp

## Common Issues

### Issue: Still Getting 404

- **Solution**: Clear browser cache and cookies
- **Solution**: Verify Site URL doesn't have trailing slash
- **Solution**: Check browser console for errors

### Issue: Invalid Callback Parameters

**Problem**: "Invalid callback parameters" error after clicking email confirmation link.

**Root Cause**: The `AuthCallbackPage` was looking for tokens in the URL hash (`#access_token=...`) but Supabase email confirmation uses query parameters (`?token=...&type=...`).

**Solution**: Updated `AuthCallbackPage.tsx` to:

- Parse query parameters instead of hash fragments
- Use `supabase.auth.verifyOtp()` method for email confirmation
- Handle `token` and `type` parameters correctly

**Code Changes**:

```typescript
// Before (incorrect)
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');

// After (correct)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const type = urlParams.get('type');

const { data, error } = await supabase.auth.verifyOtp({
  token,
  type: type as 'signup' | 'recovery' | 'email_change',
});
```

**Additional Steps**:

- Ensure email template hasn't been modified
- Check Supabase logs for authentication errors
- Verify the email link URL format: `http://localhost:5173/auth/callback?token=...&type=signup`

### Issue: User Not Redirected

- **Solution**: Check `AuthCallbackPage.tsx` for errors
- **Solution**: Verify React Router is properly configured

## Email Templates Location

In Supabase Dashboard:

1. **Authentication** → **Email Templates**
2. Templates available:
   - Confirm Signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Always use HTTPS in production
- Keep redirect URLs whitelist as specific as possible
- Regularly rotate API keys

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [URL Configuration](https://supabase.com/docs/guides/auth/redirect-urls)
