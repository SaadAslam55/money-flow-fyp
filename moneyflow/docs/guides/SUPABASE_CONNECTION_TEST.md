# Supabase Connection Test Guide

> How to check if your Supabase backend is connected successfully

## 🚀 Quick Test Methods

### Method 1: Browser-Based Test (Recommended)

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open Connection Test Page**
   - Navigate to: `http://localhost:5173/test-connection`
   - The page will automatically run connection tests
   - View detailed results for each test

3. **Review Results**
   - ✅ Green = Test passed
   - ❌ Red = Test failed (needs fixing)
   - ⚠️ Yellow = Warning (may still work)

### Method 2: Command Line Test

```bash
# Run connection test script
npm run db:test
```

**Note:** Requires `tsx` package. Install if needed:
```bash
npm install -D tsx dotenv
```

### Method 3: Browser Console Test

1. **Open Browser Console** (F12)
2. **Run this code:**

```javascript
// Test Supabase connection
(async () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔍 Checking Configuration...');
  console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables!');
    return;
  }
  
  // Test connection
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test database
  const { data, error } = await supabase.from('organizations').select('count').limit(1);
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('✅ Database connected (RLS may restrict access)');
    } else {
      console.error('❌ Database error:', error.message);
    }
  } else {
    console.log('✅ Database connected successfully!');
  }
  
  // Test auth
  const { data: session } = await supabase.auth.getSession();
  console.log('✅ Auth endpoint accessible');
  
  console.log('🎉 Connection test complete!');
})();
```

---

## ✅ What Gets Tested

### 1. Configuration Check
- Verifies `VITE_SUPABASE_URL` is set
- Verifies `VITE_SUPABASE_ANON_KEY` is set
- Validates URL format

### 2. Network Connectivity
- Tests if Supabase server is reachable
- Checks HTTP response status

### 3. Database Connection
- Tests querying database tables
- Checks for table existence
- Verifies RLS policies

### 4. Authentication Endpoint
- Tests auth API accessibility
- Checks session management

### 5. Storage Endpoint
- Tests storage API accessibility
- Lists available buckets

---

## 🔧 Troubleshooting

### ❌ "Missing Environment Variables"

**Problem:** `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` not found

**Solution:**
1. Create `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
2. Get credentials from Supabase Dashboard:
   - Go to Project Settings → API
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`
3. Restart dev server: `npm run dev`

### ❌ "Table does not exist"

**Problem:** Database tables haven't been created

**Solution:**
```bash
# Run migrations
npm run db:push

# Or reset database (includes seed data)
npm run db:reset
```

### ❌ "Network connection failed"

**Problem:** Can't reach Supabase server

**Solutions:**
1. Check internet connection
2. Verify Supabase URL is correct
3. Check if Supabase project is active
4. Verify no firewall blocking requests
5. Check Supabase project status in dashboard

### ❌ "Permission denied" (RLS)

**Problem:** Row-Level Security policies blocking access

**Solution:**
- This is **normal** and **expected** for security
- Connection is working, but RLS policies prevent unauthorized access
- Log in with a user account to access data
- Or temporarily disable RLS for testing (not recommended for production)

### ❌ "Invalid URL format"

**Problem:** `VITE_SUPABASE_URL` is malformed

**Solution:**
- Ensure URL starts with `https://`
- Format: `https://xxxxx.supabase.co`
- No trailing slashes
- Example: `https://abcdefghijklmnop.supabase.co`

---

## 📋 Pre-Flight Checklist

Before testing, ensure:

- [ ] `.env` file exists in project root
- [ ] `VITE_SUPABASE_URL` is set and valid
- [ ] `VITE_SUPABASE_ANON_KEY` is set and valid
- [ ] Supabase project is active (check dashboard)
- [ ] Internet connection is working
- [ ] Dev server is running (`npm run dev`)
- [ ] Migrations have been run (`npm run db:push`)

---

## 🔍 Manual Verification

### Check Environment Variables

```bash
# Check if .env exists
ls -la .env

# View Supabase config (without exposing keys)
grep VITE_SUPABASE .env | sed 's/=.*/=***/'
```

### Check Supabase Dashboard

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Check project status (should be "Active")
4. Go to Settings → API
5. Verify URL and keys match your `.env` file

### Test Direct API Call

```bash
# Test REST API endpoint
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://YOUR_PROJECT.supabase.co/rest/v1/
```

---

## 📊 Expected Results

### ✅ Successful Connection

```
✅ Configuration: PASS
✅ Network Connectivity: PASS
✅ Database Connection: PASS
✅ Authentication: PASS
✅ Storage: PASS

🎉 All tests passed! Supabase is connected successfully.
```

### ⚠️ Partial Connection

```
✅ Configuration: PASS
✅ Network Connectivity: PASS
⚠️  Database Connection: WARNING (RLS policies active)
✅ Authentication: PASS
✅ Storage: PASS

⚠️ Some warnings detected. Connection may work but check details.
```

### ❌ Failed Connection

```
✅ Configuration: PASS
❌ Network Connectivity: FAIL
❌ Database Connection: FAIL
❌ Authentication: FAIL
❌ Storage: FAIL

❌ Some tests failed. Please check the errors above.
```

---

## 🆘 Still Having Issues?

1. **Check Supabase Project Status**
   - Go to Supabase Dashboard
   - Verify project is not paused
   - Check for any service alerts

2. **Verify Credentials**
   - Double-check URL and key in `.env`
   - Ensure no extra spaces or quotes
   - Copy directly from Supabase dashboard

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for network errors
   - Check for CORS issues

4. **Test from Different Network**
   - Try from different WiFi/network
   - Check if corporate firewall is blocking

5. **Contact Support**
   - Check Supabase status page
   - Review Supabase documentation
   - Contact Supabase support if needed

---

## 🔗 Related Documentation

- [Setup Guide](SETUP_GUIDE.md) - Initial setup instructions
- [User Guide](USER_GUIDE.md) - User access and features
- [Supabase Docs](https://supabase.com/docs) - Official Supabase documentation

---

**Last Updated:** December 2024

