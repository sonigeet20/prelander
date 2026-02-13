# Prelander - AI-Powered Landing Page Automation

Professional landing page creation with auto-triggering popunders, silent tracking, brand colors, and admin dashboard.

## Features

- ✅ Review-style landing pages (Top10 format)
- ✅ Brand color extraction & auto-apply
- ✅ Auto-trigger popunders (configurable delay)
- ✅ Admin dashboard with analytics
- ✅ Click & conversion tracking
- ✅ JWT authentication
- ✅ PostgreSQL persistence via Prisma

## Quick Start

```bash
# 1. Install & setup
npm install
cp .env.local.example .env.local
openssl rand -base64 32  # Add to NEXTAUTH_SECRET

# 2. Initialize database
npx prisma migrate dev --name init
npx ts-node scripts/create-admin.ts

# 3. Run dev server
npm run dev
```

**Access:**
- Landing: http://localhost:3000/offer/[slug]/default
- Admin: http://localhost:3000/admin/dashboard
- Login: admin@prelander.ai / ChangeMe123!

## Documentation

- [Admin Setup Guide](docs/ADMIN_SETUP.md) - Dashboard & configuration
- [Deployment Guide](DEPLOYMENT.md) - Vercel deployment

## Auto-Trigger Configuration

Enable automatic popunders in admin dashboard:

1. **Enable**: Turn on auto-trigger for campaign
2. **Delay**: Set milliseconds before popunder (default 3000ms)
3. **Redirect**: Optional auto-redirect after X seconds

Timeline:
```
User lands (t=0)
  ↓
No interaction for N ms → Popunder opens
  ↓
Wait Y ms → Auto-redirect
```

## Tech Stack

- **Framework**: Next.js 16 (TypeScript)
- **Auth**: NextAuth.js with JWT
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel (recommended)

## Database Schema

- **User**: Admin accounts (email, password, role)
- **Campaign**: Offer config (name, status, triggers, metadata)
- **ClickSession**: Click tracking (IP, agent, tracking IDs)
- **Conversion**: Revenue tracking (status, amount)

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/offer/:offer/:cluster` | GET | Landing page |
| `/admin/dashboard` | GET | Admin panel |
| `/api/clicks` | POST | Track clicks |
| `/api/campaigns/:id` | GET/PATCH | Campaign crud |
| `/auth/login` | GET/POST | Authentication |

## Deployment

```bash
# Push to GitHub and connect to Vercel
# Set env vars: NEXTAUTH_SECRET, DATABASE_URL, NEXTAUTH_URL
# Deploy and run migrations:
npx prisma migrate deploy
npx ts-node scripts/create-admin.ts
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

**Login not working**: Check `NEXTAUTH_SECRET`, database connection, and admin user exists
**Popunder not showing**: Enable in admin, check delay value, disable popup blocker  
**Database error**: Verify `DATABASE_URL`, run migrations, check PostgreSQL is running

See [ADMIN_SETUP.md](docs/ADMIN_SETUP.md) for more help.

## Version

**0.1.0** - MVP with landing pages, admin panel, auto-triggers, and tracking

---

For full documentation, see `/docs` folder.
