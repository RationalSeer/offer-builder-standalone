# Quick Start Guide

Get up and running in 5 minutes!

## 1. Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Create new project
2. In Supabase dashboard → **SQL Editor** → New query
3. Copy/paste contents of `supabase/migrations/001_create_offer_system.sql`
4. Click **Run**
5. Go to **Settings** → **API** → Copy your URL and anon key

## 2. Configure Environment (30 seconds)

```bash
cd /Users/thesource/FunnelX_io/offer-builder-standalone
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Start Development (30 seconds)

```bash
npm run dev
```

Open http://localhost:5173

## 4. Create Your First Offer

1. Click **"Create Offer"** button
2. Choose your creation mode:
   - **Wizard**: Step-by-step guided creation
   - **Builder**: Advanced visual builder
   - **Template**: Start from a template
3. Follow the prompts to create your offer

## That's It! 🎉

You now have a fully independent Offer Builder project running.

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run typecheck        # Check TypeScript types
npm run lint             # Run linter
```

## Project Location

```
/Users/thesource/FunnelX_io/offer-builder-standalone
```

## Need Help?

- See `SETUP_GUIDE.md` for detailed instructions
- See `README.md` for feature documentation
- See `EXTRACTION_SUMMARY.md` for technical details

## Making It Independent

**It's already independent!** The project:
- ✅ Has no dependencies on Xena Platform
- ✅ Has its own database schema
- ✅ Can be deployed anywhere
- ✅ Has its own package.json

To make it a separate Git repo:
```bash
cd /Users/thesource/FunnelX_io/offer-builder-standalone
git init
git add .
git commit -m "Initial commit"
```

Then push to GitHub/GitLab if desired.

