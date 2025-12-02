# Supabase Setup Guide

## Critical Configuration for Vercel Deployment

### 1. Email Authentication Settings

Go to Supabase Dashboard → Authentication → Settings → Auth Providers

#### Email Auth Configuration

1. **Enable Email Provider**: ✅ ON
2. **Confirm Email**: 
   - For Development: ❌ OFF (faster testing)
   - For Production: ✅ ON (recommended for security)
3. **Secure Email Change**: ✅ ON
4. **Secure Password Change**: ✅ ON

### 2. Site URL Configuration

**CRITICAL**: This is why your confirmation emails redirect to localhost!

Go to Supabase Dashboard → Authentication → URL Configuration

#### Site URL
```
https://your-app.vercel.app
```
**Replace with your actual Vercel domain!**

Example:
- `https://crypto-screener.vercel.app`
- `https://crypto-screener-bl8ckfz.vercel.app`
- Or your custom domain

#### Redirect URLs (Add ALL of these)
```
http://localhost:3000/**
http://localhost:5173/**
https://your-app.vercel.app/**
https://*.vercel.app/**
```

**Why**: Supabase uses Site URL for email confirmation links. If set to `localhost:3000`, all confirmation emails will redirect there, even in production!

### 3. Email Templates (Optional but Recommended)

Go to Supabase Dashboard → Authentication → Email Templates

Update the confirmation email template to use:
```html
<a href="{{ .ConfirmationURL }}">Confirm your email</a>
```

The `{{ .ConfirmationURL }}` will automatically use your Site URL.

### 4. Database Migrations

Run the migration to create all required tables:

```bash
# Option 1: Via Supabase CLI (recommended)
supabase db push

# Option 2: Via SQL Editor in Dashboard
# Copy contents of supabase/migrations/001_initial_schema.sql
# Run in Supabase Dashboard → SQL Editor
```

### 5. Row Level Security (RLS) Policies

The migration file includes RLS policies that ensure:
- Users can only read/write their own data
- Anonymous users cannot access any data
- Email confirmation required for data access

To verify policies are active:
```sql
-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All `rowsecurity` values should be `true`.

### 6. Testing User Creation

After configuration, test user creation:

1. **Sign Up** with a test email
2. **Check Supabase Dashboard** → Authentication → Users
   - User should appear in the list
   - Status: `CONFIRMED` (if email confirmation disabled) or `WAITING_FOR_CONFIRMATION`
3. **Check Email** (if confirmation enabled)
   - Email should arrive within 60 seconds
   - Confirmation link should point to your Vercel domain, NOT localhost

### 7. Common Issues & Fixes

#### Issue: Users not appearing in database
**Cause**: Email auth not enabled or blocked by email provider  
**Fix**: 
- Enable Email Provider in Supabase Dashboard
- Check Supabase logs: Dashboard → Database → Logs
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel

#### Issue: Confirmation emails redirect to localhost
**Cause**: Site URL set to `http://localhost:3000`  
**Fix**: Update Site URL to your Vercel domain (see step 2)

#### Issue: "Email not confirmed" error
**Cause**: Email confirmation is required but user hasn't clicked link  
**Fix Options**:
- Disable "Confirm Email" in Supabase (for development)
- Manually confirm user: Dashboard → Auth → Users → Click user → Confirm email
- Wait for user to click confirmation email

#### Issue: "Invalid redirect URL" error
**Cause**: Redirect URL not whitelisted in Supabase  
**Fix**: Add your Vercel domain to Redirect URLs (see step 2)

### 8. Environment Variables Checklist

Verify these are set in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

After adding/updating variables, **redeploy** the app for changes to take effect.

### 9. Deployment Checklist

Before going live:

- [ ] Site URL set to production domain (NOT localhost)
- [ ] Redirect URLs include all deployment domains
- [ ] Email confirmation enabled (or explicitly disabled for MVP)
- [ ] Database migrations applied
- [ ] RLS policies active and tested
- [ ] Environment variables set in Vercel
- [ ] Test user signup from production URL
- [ ] Test email confirmation flow (if enabled)
- [ ] Test login after confirmation
- [ ] Test data sync (create watchlist, refresh page)

### 10. Development vs Production

**Development (localhost)**:
- Email confirmation: OFF (faster iteration)
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

**Production (Vercel)**:
- Email confirmation: ON (security)
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

**Both** can use the same Supabase project, but ensure ALL redirect URLs are whitelisted.

## Quick Fix for Current Issue

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/auth/url-configuration
2. Change "Site URL" from `http://localhost:3000` to `https://your-vercel-domain.vercel.app`
3. Add to "Redirect URLs":
   ```
   https://your-vercel-domain.vercel.app/**
   ```
4. **Save** and wait 1-2 minutes for changes to propagate
5. Test signup again - confirmation emails should now work!

## Support

For Supabase-specific issues:
- Docs: https://supabase.com/docs/guides/auth
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase
