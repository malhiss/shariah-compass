# Dalil Shariah Screening Platform

A comprehensive Shariah compliance screening platform for Islamic investment analysis.

## Features

- **Shariah Screening Dashboard**: View and filter stocks by compliance status
- **Ticker Screening**: Individual stock screening with detailed analysis
- **Portfolio Screening**: Bulk screening for portfolio compliance
- **AI Chat**: Ask questions about Shariah compliance
- **Staff Portal**: Admin tools for user management and access control

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State**: TanStack Query
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Lovable Cloud project (provides Supabase backend automatically)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials (auto-populated by Lovable Cloud):
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`

3. Optional: Set `VITE_SITE_URL` for canonical URL generation

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run typecheck

# Run tests
npm run test

# Build for production
npm run build
```

## Project Structure

```
├── public/
│   ├── data/              # CSV screening data files
│   └── _headers           # Security headers (CSP, etc.)
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and data loaders
│   ├── pages/             # Route pages
│   └── integrations/      # Supabase client (auto-generated)
└── supabase/
    └── functions/         # Edge functions (Deno)
```

## Edge Functions

The following edge functions handle backend logic:

- `auto-login` - One-click login via secure tokens
- `manage-users` - Staff user management operations
- `shariah-dashboard` - Dashboard data API
- `ticker-screening` - Individual ticker analysis
- `portfolio-screening` - Bulk portfolio analysis
- `ai-chat` - AI-powered Q&A

### Local Development

Edge functions are automatically deployed when code changes. To test locally:

```bash
# Functions deploy automatically via Lovable
# Test via the preview URL
```

## Security Notes

- **CSP**: Content Security Policy is enforced via `public/_headers`
- **RLS**: Row-Level Security policies protect all database tables
- **Rate Limiting**: Auto-login endpoint has IP-based rate limiting
- **Secrets**: Never commit `.env` files. Use `.env.example` as a template.
- **Token Storage**: Sessions use localStorage (XSS mitigated via CSP)

> ⚠️ If any secrets were ever committed to this repository, rotate them immediately.

## Data Updates

Screening data is loaded from CSV files in `public/data/`:
- `shariah-screening.csv` - Global screening data
- `gcc-screening.csv` - GCC region data

To update data:
1. Replace the CSV file with updated data
2. The new data will be cached for 1 hour (see `_headers`)
3. Users can hard-refresh to get latest data immediately

## Deployment

Deploy via Lovable:
1. Push changes to the repository
2. Lovable automatically builds and deploys
3. Edge functions are deployed automatically

## License

Proprietary - Dalil
