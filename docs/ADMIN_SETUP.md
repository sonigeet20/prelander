# Admin Panel Setup & Configuration

## Overview

The Prelander admin panel provides a complete management interface for campaigns, including:
- Campaign creation and configuration
- Auto-trigger settings (popunder/silent fetch timing)
- Auto-redirect configuration
- Click and conversion analytics
- Campaign status management

## Getting Started

### 1. Database Setup (Required)

Before using the admin panel, you must set up a PostgreSQL database:

#### Local Development:
```bash
# Create database
createdb prelander

# Set environment variable
echo "DATABASE_URL=postgresql://localhost/prelander" >> .env.local

# Run migrations
npx prisma migrate dev --name init

# Create admin user
npx ts-node scripts/create-admin.ts
```

#### Production (Vercel Postgres):
1. Create a Vercel Postgres database via Vercel dashboard
2. Copy connection string to `DATABASE_URL` environment variable
3. Deploy to Vercel
4. Run migration:
   ```bash
   npx prisma migrate deploy
   npx ts-node scripts/create-admin.ts
   ```

### 2. Default Credentials

After creating the admin user:
- **Email**: `admin@prelander.ai` (set via `ADMIN_EMAIL` env)
- **Password**: `ChangeMe123!` (set via `ADMIN_PASSWORD` env)

**Change the password immediately in production!**

### 3. Accessing the Admin Panel

Once database is initialized:

**Development:**
```bash
npm run dev
# Visit: http://localhost:3000/admin/dashboard
```

**Production:**
- URL: `https://yourdomai.com/admin/dashboard`
- Login with your admin credentials

## Admin Dashboard Features

### Dashboard Overview
- **Total Campaigns**: Count of all campaigns
- **Total Clicks**: Aggregate click events across all campaigns
- **Total Conversions**: Aggregate conversions across all campaigns
- **Campaign List**: Table view with stats and edit links

### Campaign Management

#### View Campaigns
- Lists all campaigns with:
  - Offer name
  - Status (Active/Paused/Archived)
  - Click count
  - Conversion count
  - Auto-trigger delay (if enabled)
  - Edit button

#### Edit Campaign Settings

Click "Edit" on any campaign to configure:

**Campaign Status**
- `draft`: Development only, not live
- `active`: Live and tracking
- `paused`: Temporarily disabled
- `archived`: Hidden from active list

**Auto-Trigger Settings**

Enable on-page popunder + silent fetch without user interaction:

1. **Enable auto-trigger on inaction**: Toggle checkbox
   - When enabled: Popunder opens automatically if user doesn't interact

2. **Trigger After (milliseconds)**: 
   - Default: 3000ms (3 seconds)
   - Set the delay before popunder shows
   - Common values: 3000 (3s), 5000 (5s), 10000 (10s)
   - Interaction (click, scroll, mousemove) triggers immediately

3. **Auto-Redirect Settings**
   - Delay before auto-redirecting page
   - 0 = disabled (no auto-redirect)
   - Common values: 5000 (5s), 10000 (10s)
   - Happens after popunder is triggered

### How Auto-Trigger Works

**Timeline:**
```
User lands on page (t=0ms)
    ↓
No interaction for N milliseconds (e.g., 3000ms)
    ↓
Popunder opens + Silent fetch sent (triggered)
    ↓
Wait Y milliseconds (e.g., 5000ms)
    ↓
Auto-redirect to destination URL
```

**Interaction Priority:**
- If user clicks/scrolls/moves mouse BEFORE N ms:
  - Popunder + silent fetch trigger immediately
  - Auto-redirect timer still counts from that point
  - Example: User interacts at 1000ms → popunder shows → redirect at 1000+Y ms

## Configuration Examples

### Example 1: Aggressive Pop-Under (3 second wait)
- **Auto-trigger enabled**: Yes
- **Trigger After**: 3000ms
- **Redirect After**: 5000ms

Result: Popunder shows after 3 seconds of inactivity, redirect after 5 seconds total

### Example 2: Conservative Approach (10 second wait)
- **Auto-trigger enabled**: Yes
- **Trigger After**: 10000ms
- **Redirect After**: 0ms (disabled)

Result: Popunder shows after 10 seconds, no auto-redirect

### Example 3: Interaction-Only (Manual)
- **Auto-trigger enabled**: No
- **Trigger After**: N/A
- **Redirect After**: 0ms

Result: Only popunder on user click (PopunderButton), no auto-trigger

## Database Schema

### Campaigns Table
```typescript
id: string              // Unique campaign ID
offerName: string      // Name of the offer
status: string         // draft | active | paused | archived
autoTriggerOnInaction: boolean  // Enable auto-trigger
autoTriggerDelay: int  // Milliseconds before popunder
autoRedirectDelay: int // Milliseconds before redirect
destinationUrl: string // Where popunder/redirect goes
metadata: JSON         // Brand colors, research data, etc.
```

### Click Sessions Table
Tracks individual clicks with:
- campaignId
- clusterId
- IP address
- User agent
- Referrer
- Google/Facebook tracking IDs (gclid, gbraid, wbraid)

### Conversions Table
Tracks conversions with:
- campaignId
- clusterId
- Revenue (if applicable)
- Status (pending/completed/failed)

## API Endpoints (Protected - Auth Required)

### GET /api/campaigns
- Returns list of all campaigns
- Protected: Auth required

### GET /api/campaigns/:id
- Returns campaign details + recent clicks/conversions
- Protected: Auth required

### PATCH /api/campaigns/:id
- Update campaign settings
- Payload:
  ```json
  {
    "status": "active",
    "autoTriggerOnInaction": true,
    "autoTriggerDelay": 3000,
    "autoRedirectDelay": 5000
  }
  ```
- Protected: Auth required

### POST /api/clicks
- Log a click event
- Payload:
  ```json
  {
    "campaignId": "uuid",
    "cluster": "default",
    "source": "auto-trigger|manual",
    "userAgent": "...",
    "referrer": "..."
  }
  ```
- No auth required (public tracking)

## Troubleshooting

### "Campaign Not Found" on Edit Page
- Campaign ID doesn't exist
- Verify campaign was created successfully
- Check database with: `npx prisma studio`

### Login Page Shows "Unauthorized"
Possible causes:
1. **Database not initialized**: Run `npx prisma migrate dev --name init`
2. **Admin user not created**: Run `npx ts-node scripts/create-admin.ts`
3. **Wrong credentials**: Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`
4. **Missing NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`

### Popunder Not Showing
1. Check if auto-trigger is enabled in campaign settings
2. Check `autoTriggerDelay` value (should be reasonable, e.g., 3000-10000ms)
3. Verify browser allows popups/popunders
4. Check browser console for JavaScript errors
5. Verify campaign `destinationUrl` is valid

### Changes Not Saving
1. Check browser network tab for 401/403 errors
2. Verify session is active (not expired)
3. Check server logs for validation errors
4. Ensure database is accessible

## Security Considerations

1. **Change Default Password**: 
   ```bash
   # Delete default user and create new one
   npx ts-node scripts/create-admin.ts
   ```

2. **NEXTAUTH_SECRET**: 
   - Generate random: `openssl rand -base64 32`
   - Store in environment variables only
   - Never commit to git

3. **Database URL**: 
   - Use environment variables only
   - Never expose in client-side code
   - For Vercel: Use Vercel Postgres with connection pooling

4. **Session Management**:
   - Sessions expire after 24 hours
   - Use sign-out button when done
   - Clear browser cache if switching accounts

## Development

### Viewing Database
```bash
npx prisma studio
# Opens web UI at http://localhost:5555
```

### Creating Test Campaign
Via admin UI or directly:
```bash
npx prisma db execute --stdin < test.sql
```

### Debugging Auth
Enable logs in `src/lib/auth.ts`:
```typescript
// Add to authorize() function
console.log("Auth attempt:", { email, user: user?.email });
```

### Testing Auto-Trigger Logic
The component is in `src/components/AutoTriggerLogic.tsx`:
- Tracks page entry time
- Sets up inactivity timer
- Listens for user interactions
- Executes popunder on trigger

Test with browser DevTools:
```javascript
// In console
// Simulate inactivity timeout (3 seconds)
setTimeout(() => console.log("Trigger!"), 3000);
```

## Next Steps

1. **Multi-user Admin**: Add role-based access control (RBAC)
2. **Audit Logging**: Track all admin actions
3. **Email Notifications**: Alert on conversions
4. **Advanced Analytics**: Charts, trends, heatmaps
5. **A/B Testing**: Compare campaign variants
6. **Team Collaboration**: Invite team members

## Support

For issues:
1. Check [DEPLOYMENT.md](../DEPLOYMENT.md) for general setup
2. View database state: `npx prisma studio`
3. Check server logs: `vercel logs` (production)
4. Enable debug mode in `.env.local`: `DEBUG=next-auth:*`
