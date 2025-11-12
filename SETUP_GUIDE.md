# Setup Guide - Offer Builder Standalone

This guide will help you set up the Offer Builder as a completely independent project.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- Git (optional, for version control)

## Step 1: Navigate to Project

```bash
cd /Users/thesource/FunnelX_io/offer-builder-standalone
```

## Step 2: Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

## Step 3: Set Up Supabase

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `offer-builder` (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" (takes 1-2 minutes)

### 3.2 Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file: `supabase/migrations/001_create_offer_system.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" (or press Cmd+Enter)
7. You should see "Success. No rows returned"

### 3.3 Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

   Replace with your actual values from Step 3.3.

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Verify It Works

1. Open http://localhost:5173 in your browser
2. You should see the Offer Manager interface
3. Click "Create Offer" to test

## Troubleshooting

### "Supabase is not configured" Error

- Check that `.env` file exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env`

### Database Connection Errors

- Verify the migration ran successfully in Supabase SQL Editor
- Check that your Supabase project is active (not paused)
- Verify your API credentials are correct

### Build Errors

Run type checking:
```bash
npm run typecheck
```

This will show TypeScript errors that need fixing.

## Next Steps

### For Development

1. **Create your first offer**:
   - Click "Create Offer" in the UI
   - Choose Wizard, Builder, or Template mode
   - Follow the prompts

2. **View your offer**:
   - After creating, you'll see it in the list
   - Click "View" to see the public renderer
   - URL format: `/offer/:slug`

### For Production

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - The `dist/` folder contains your production build
   - Deploy to Vercel, Netlify, or any static host
   - Make sure to set environment variables in your hosting platform

## Project Structure

```
offer-builder-standalone/
├── src/
│   ├── components/     # React components
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── lib/            # Utilities
├── supabase/
│   └── migrations/     # Database schema
├── .env                # Your environment variables (not in git)
└── package.json        # Dependencies
```

## Making It Independent

The project is **already independent**! It:
- ✅ Has its own `package.json`
- ✅ Has its own database schema
- ✅ Has no dependencies on Xena Platform
- ✅ Can be deployed separately
- ✅ Has its own Git history (if you initialize it)

### Initialize Git (Optional)

```bash
git init
git add .
git commit -m "Initial commit: Offer Builder standalone"
```

### Create GitHub Repo (Optional)

1. Create a new repo on GitHub
2. Add remote:
   ```bash
   git remote add origin https://github.com/yourusername/offer-builder.git
   git push -u origin main
   ```

## Support

If you encounter issues:
1. Check the `EXTRACTION_SUMMARY.md` for known limitations
2. Review the `README.md` for feature documentation
3. Check browser console for errors
4. Verify Supabase connection in Supabase dashboard

---

**You're all set!** The project is independent and ready for development. 🚀

