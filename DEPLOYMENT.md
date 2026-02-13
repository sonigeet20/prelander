# Deployment Guide

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example env file:
```bash
cp .env.local.example .env.local
```

Generate a NextAuth secret:
```bash
openssl rand -base64 32
```

Add it to `.env.local`:
```
NEXTAUTH_SECRET=<generated-value>
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup (PostgreSQL)

#### Option A: Local PostgreSQL
Install PostgreSQL locally, then create a database:
```bash
createdb prelander
```

Set in `.env.local`:
```
DATABASE_URL=postgresql://localhost/prelander
```

#### Option B: Vercel Postgres (Recommended for Production)
Create a Vercel Postgres database through Vercel dashboard, then copy the connection string to `.env.local`.

### 4. Initialize Database
Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

This creates all required tables.

### 5. Create Admin User
```bash
npx ts-node scripts/create-admin.ts
```

This creates an admin user with:
- Email: `admin@prelander.ai`
- Password: `ChangeMe123!` (change in .env.local)

### 6. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Vercel Production Deployment

### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Create Vercel Project
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Framework: Next.js (auto-detected)

### 3. Configure Environment Variables in Vercel
In Vercel dashboard:
- Add all variables from `.env.local`
- For `DATABASE_URL`: Use Vercel Postgres connection string
- For `NEXTAUTH_SECRET`: Use the same value as local, or generate new: `openssl rand -base64 32`
- For `NEXTAUTH_URL`: Set to your production domain (e.g., https://prelander.ai)

### 4. Create Database
Two options:

**Option A: Vercel Postgres** (Easiest)
1. In Vercel dashboard, go to "Storage" tab
2. Click "Create Database"
3. Choose "Postgres"
4. Copy the connection string to environment variables

**Option B: External PostgreSQL**
1. Use services like:
   - AWS RDS
   - DigitalOcean Managed Databases
   - Supabase
2. Copy connection string to `DATABASE_URL`

### 5. Deploy & Initialize Database
After first deployment:
```bash
# Run migrations on production
vercel env pull # Download env vars
npx prisma migrate deploy

# Create admin user on production
npx ts-node scripts/create-admin.ts
```

Or use Vercel's "Run command" feature to execute:
```bash
npx prisma migrate deploy && npx ts-node scripts/create-admin.ts
```

### 6. Configure Custom Domain
In Vercel dashboard:
1. Go to "Domains" tab
2. Add your custom domain (e.g., prelander.ai)
3. Update DNS settings as directed

### 7. Subdomain Setup (for per-campaign subdomains)
To support subdomain routing (e.g., skyscanner-cld.prelander.ai):

1. Add wildcard domain in Vercel: `*.prelander.ai`
2. Create middleware in your app (already done in [middleware.ts](middleware.ts))
3. Subdomain routing is handled by [src/middleware.ts](src/middleware.ts)

## Admin Dashboard Access

After deployment:
1. Go to https://prelander.ai/auth/login (or your domain)
2. Log in with:
   - Email: admin@prelander.ai
   - Password: (the one you set in ADMIN_PASSWORD env)
3. Access dashboard at: https://prelander.ai/admin/dashboard

## Features Configuration

### Auto-Trigger Settings
1. Go to Admin Dashboard
2. Click "Edit" on a campaign
3. Configure:
   - **Enable auto-trigger on inaction**: Toggle to enable
   - **Trigger After (ms)**: Milliseconds before popunder/silent fetch (default: 3000)
   - **Redirect After (ms)**: Auto-redirect delay (0 = disabled)

### Campaign Settings
From the admin dashboard, you can:
- Create new campaigns
- Edit existing offers
- Configure popunder/silent fetch behavior
- Set auto-trigger timers
- View click statistics and conversions
- Change campaign status (active/paused/archived)

## Monitoring & Debugging

### View Logs
```bash
# Local development
npm run dev

# Vercel production
vercel logs
```

### Check Database
```bash
# Local
npx prisma studio

# This opens a web UI at http://localhost:5555
```

### Test the Landing Pages
- Development: http://localhost:3000/offer/CAMPAIGN_SLUG/CLUSTER
- Production: https://prelander.ai/offer/CAMPAIGN_SLUG/CLUSTER

### Test Admin Panel
- Development: http://localhost:3000/admin/dashboard
- Production: https://prelander.ai/admin/dashboard

## Troubleshooting

### Login not working
- Check `NEXTAUTH_SECRET` is set
- Check `DATABASE_URL` is correct and database is accessible
- Check admin user exists: `npx prisma studio` → Users table

### Popunder not showing
- Check browser console for errors
- Verify `autoTriggerOnInaction` is enabled for campaign
- Check `autoTriggerDelay` (default 3000ms)
- Check popup blocker isn't preventing it

### Database connection issues
```bash
# Test connection
npx prisma db execute --stdin < test.sql

# Or use prisma studio
npx prisma studio
```

### Metrics not showing in admin
- Check clicks are being tracked: `/api/clicks` endpoint
- Verify ClickSession records in database
- Check campaign ID matches in clicks

## Performance Optimization

### For Production:
1. Enable image optimization in next.config.js
2. Use Vercel's Image Optimization API
3. Configure caching headers
4. Enable gzip compression
5. Monitor Web Vitals

### Database:
1. Add indexes for frequently queried fields
2. Enable connection pooling (included with Vercel Postgres)
3. Monitor query performance
4. Archive old click data periodically

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure CORS if needed
- [ ] Set up rate limiting for API endpoints
- [ ] Monitor for suspicious click patterns
- [ ] Regularly backup database
- [ ] Keep dependencies updated: `npm audit fix`

## Next Steps

1. **Email Notifications**: Set up email alerts for conversions
2. **Analytics Dashboard**: Build charts for click trends
3. **A/B Testing**: Implement testing framework for landing page variants
4. **Auto-Redirect**: Configure per-offer redirect URLs
5. **Subdomain Branding**: Customize each subdomain with unique landers
