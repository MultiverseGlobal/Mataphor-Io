# Metaphor IO - Setup Guide

## Prerequisites Checklist

- [ ] Node.js 18 or higher installed
- [ ] Supabase account created (free tier is fine)
- [ ] Chrome browser installed
- [ ] Git installed (optional, for version control)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New project"
   - **Name**: metaphor-io
   - **Database Password**: (create a strong password and save it)
   - **Region**: Choose closest to you
5. Wait for project to initialize (~2 minutes)

### 1.2 Get API Credentials

1. In your Supabase dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

### 1.3 Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended for beginners)**

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Repeat for `supabase/migrations/002_rls_policies.sql`

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

---

## Step 2: Application Setup

### 2.1 Install Dependencies

```bash
cd "c:\Users\LENOVO\Documents\Metaphor io"
npm install
```

This will install:
- Next.js and React
- Supabase client libraries
- TailwindCSS
- Zod for validation
- Date-fns and Lucide React

### 2.2 Configure Environment Variables

1. Copy the example file:
   ```bash
   copy .env.local.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 2.3 Start Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

You should see the Metaphor IO landing page!

---

## Step 3: Test Authentication

### 3.1 Enable Email Auth in Supabase

1. Go to Supabase dashboard → **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Scroll to **Email Templates** and verify confirmation email is configured

### 3.2 (Optional) Enable OAuth Providers

**For Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add to Supabase: Authentication → Providers → Google
4. Enter Client ID and Secret

**For GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Add to Supabase: Authentication → Providers → GitHub
4. Enter Client ID and Secret

### 3.3 Test Sign Up

1. Navigate to [http://localhost:3000/auth](http://localhost:3000/auth)
2. Create an account with email + password
3. Check your email for confirmation (development mode may auto-confirm)
4. After sign-in, you should be redirected to `/dashboard`

---

## Step 4: Chrome Extension Setup

### 4.1 Load Extension in Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Toggle **Developer mode** ON (top right)
4. Click **Load unpacked**
5. Navigate to: `c:\Users\LENOVO\Documents\Metaphor io\extension`
6. Select the folder and click **Select Folder**

You should see "Metaphor IO" appear in your extensions list!

### 4.2 Pin Extension

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Metaphor IO"
3. Click the pin icon to keep it visible

### 4.3 Test Export/Import

**Export from ChatGPT:**
1. Go to [chat.openai.com](https://chat.openai.com)
2. Start a conversation
3. Look for the "Export to Metaphor IO" button (should appear in header)
4. Click it and verify "Context exported successfully!" notification

**View in Dashboard:**
1. Go to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. You should see your exported context in the "Recent Contexts" table

**Import to Claude:**
1. Go to [claude.ai](https://claude.ai)
2. Click the Metaphor IO extension icon in Chrome toolbar
3. Click "Import to Current Tab"
4. Verify the formatted context appears in Claude's input field
5. Press Enter to continue the conversation!

---

## Step 5: Verify Everything Works

### Frontend Checklist

- [ ] Landing page loads with gradients and animations
- [ ] Sign up creates account
- [ ] Sign in works
- [ ] Dashboard shows stats cards (will be 0 initially)
- [ ] "New Transfer" button navigates to transfer page
- [ ] Transfer page allows platform selection

### Chrome Extension Checklist

- [ ] Extension icon appears in Chrome toolbar
- [ ] Export button appears on ChatGPT conversation pages
- [ ] Export button appears on Claude conversation pages
- [ ] Clicking export shows success notification
- [ ] Extension popup shows last exported context
- [ ] Import button pastes context into target AI

### Database Checklist

- [ ] `users` table has your account
- [ ] `contexts` table has exported contexts
- [ ] `transfers` table records transfer events

Check in Supabase: **Table Editor** → Select table → View rows

---

## Troubleshooting

### "Unauthorized" errors in Dashboard

**Solution**: Make sure you're signed in. Check browser console for auth errors. Verify Supabase credentials in `.env.local`.

### Extension buttons don't appear

**Solution**:
1. Check Chrome DevTools → Console for errors
2. Ensure content scripts are loaded (you should see "Metaphor IO: ... content script loaded")
3. Refresh the ChatGPT/Claude page
4. Verify extension has permissions for those domains

### Database migration errors

**Solution**:
1. Check SQL syntax in migration files
2. Ensure you're using PostgreSQL-compatible SQL
3. Try running migrations individually in Supabase SQL Editor
4. Check for existing tables (may need to drop and recreate)

### npm install fails

**Solution**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm cache clean --force`
3. Run `npm install` again
4. If still failing, check Node.js version: `node --version` (should be 18+)

---

## Production Deployment

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy

# Follow prompts and add environment variables when asked
```

### Update Extension API URLs

Edit `extension/background/background.js` and `extension/popup/popup.js`:

```javascript
const API_BASE_URL = 'https://your-app.vercel.app/api';
const DASHBOARD_URL = 'https://your-app.vercel.app/dashboard';
```

Reload extension in Chrome after changes.

### Publish Extension (Optional)

1. Zip the extension folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay $5 one-time fee (if first time)
4. Upload zip and fill in listing info
5. Submit for review

---

## Next Steps

1. **Test the full flow**: Export from ChatGPT → View in Dashboard → Import to Claude
2. **Customize**: Update branding, colors, copy to match your preference
3. **Add analytics**: Track usage metrics (optional)
4. **Gather feedback**: Share with 5-10 users and measure success metrics

---

## Support

- **Documentation**: See [README.md](file:///c:/Users/LENOVO/Documents/Metaphor%20io/README.md)
- **Walkthrough**: See [walkthrough.md](file:///C:/Users/LENOVO/.gemini/antigravity/brain/9b13c931-c10f-4048-b784-0628b9daa2ba/walkthrough.md)
- **Implementation Plan**: See [implementation_plan.md](file:///C:/Users/LENOVO/.gemini/antigravity/brain/9b13c931-c10f-4048-b784-0628b9daa2ba/implementation_plan.md)

Happy context bridging! 🚀
