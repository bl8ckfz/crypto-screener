# 🚨 IMMEDIATE FIX FOR PRODUCTION AUTH ISSUE

## The Problem
1. ❌ Users not appearing in Supabase database
2. ❌ Email confirmations redirect to `localhost:3000` instead of your Vercel domain

## The Root Cause
Your Supabase **Site URL** is set to `http://localhost:3000`, so all email confirmation links point there, even in production!

## Quick Fix (5 minutes)

### Step 1: Update Supabase Site URL
1. Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/auth/url-configuration
2. Find **"Site URL"** field
3. Change from: `http://localhost:3000`
4. Change to: `https://your-vercel-app.vercel.app` (your actual Vercel URL)
5. **SAVE**

### Step 2: Add Redirect URLs
In the same page, scroll to **"Redirect URLs"** section and add:
```
http://localhost:5173/**
http://localhost:3000/**
https://your-vercel-app.vercel.app/**
https://*.vercel.app/**
```

Click **"Add URL"** for each one, then **SAVE**.

### Step 3: Verify Email Auth is Enabled
1. Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/auth/providers
2. Find **"Email"** provider
3. Ensure the toggle is **ON** (green)

### Step 4: (Optional) Disable Email Confirmation for Testing
For faster testing, you can temporarily disable email confirmation:
1. Same page as Step 3
2. Find **"Confirm email"** toggle under Email provider
3. Turn it **OFF** for now
4. Users can sign up without confirming email

### Step 5: Redeploy Vercel (if needed)
The code changes I just pushed fix the redirect URL format. Vercel should auto-deploy, but you can trigger manually:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots on latest deployment → Redeploy

## Testing

After the changes above:

1. **Clear your browser cache** (or use incognito)
2. Go to your Vercel URL
3. Click "Sign In" → "Sign up"
4. Enter email/password
5. If email confirmation is **OFF**: You should be logged in immediately
6. If email confirmation is **ON**: Check your email, the link should point to your Vercel domain

## Verify Users in Database

Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/auth/users

You should now see users appearing in the list after signup!

## Need More Help?

Read the full guide: `docs/SUPABASE_SETUP.md`

Common issues:
- **"Invalid redirect URL"** → Add your domain to Redirect URLs (Step 2)
- **"Email not confirmed"** → Disable email confirmation (Step 4) OR manually confirm user in Supabase dashboard
- **Still redirecting to localhost** → Wait 1-2 minutes after changing Site URL, then clear browser cache

---

**Your Supabase Project URL**: Check your Vercel environment variables for `VITE_SUPABASE_URL`  
The project ID is the subdomain: `https://[PROJECT_ID].supabase.co`
