# Offer Builder - Standalone Project

A standalone multi-step offer builder extracted from Xena Platform. Create, manage, and deploy lead generation offers with a powerful visual builder.

## Features

- **Multi-Step Offer Builder** - Create complex lead generation funnels
- **Visual Step Designer** - Drag-and-drop step configuration
- **Theme Editor** - Customize colors, fonts, and styling
- **Template Gallery** - Start from pre-built templates
- **Real-Time Preview** - See changes as you build
- **Analytics** - Track performance and conversions
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Database & backend
- **Lucide React** - Icons

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration file:
   ```bash
   # In Supabase SQL Editor, run:
   supabase/migrations/001_create_offer_system.sql
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your Supabase credentials to `.env`

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── manager/          # Offer management interface
│   ├── builder/           # Builder components (21 files)
│   ├── wizard/            # Creation wizard
│   ├── renderer/          # Public offer renderer
│   └── ui/                # Reusable UI components
├── services/              # Business logic
│   ├── offerService.ts
│   ├── offerTemplateService.ts
│   └── wizardTemplateService.ts
├── types/                 # TypeScript definitions
│   ├── inhouseOffer.ts
│   └── dynamicContent.ts
└── lib/                   # Utilities
    ├── supabase.ts
    └── retry-utils.ts
```

## Database Schema

The system uses 6 main tables:

1. **inhouse_offers** - Main offer configuration
2. **offer_steps** - Multi-step form steps
3. **offer_sessions** - User session tracking
4. **offer_responses** - User responses
5. **offer_analytics** - Performance metrics
6. **email_subscribers** - Email list building

See `supabase/migrations/001_create_offer_system.sql` for full schema.

## Usage

### Creating an Offer

1. Navigate to `/` (admin interface)
2. Click "Create Offer"
3. Choose:
   - **Wizard Mode**: Step-by-step guided creation
   - **Builder Mode**: Advanced visual builder
   - **Template**: Start from a template
4. Configure your offer settings
5. Add steps using the step designer
6. Customize theme and styling
7. Publish your offer

### Accessing Public Offers

Public offers are accessible at:
- `/offer/:slug` - Main offer URL
- `/o/:slug` - Short URL format

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## Environment Variables

Required:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Migration from Xena Platform

This project was extracted from Xena Platform. Key changes:

- Removed Xena-specific dependencies
- Simplified authentication (uses Supabase auth directly)
- Removed campaign/ad platform integrations
- Standalone database schema
- Updated import paths

## License

[Add your license here]

## Support

For issues and questions, please [create an issue](https://github.com/your-repo/issues)
