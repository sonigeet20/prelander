# Getting Started - Next Steps

## 🎯 Your Next 5 Steps

### Step 1: Database Setup (5 minutes)
```bash
# Copy environment template
cp .env.local.example .env.local

# Generate secret
openssl rand -base64 32

# Edit .env.local and add:
# NEXTAUTH_SECRET=<generated-value-above>
# DATABASE_URL=postgresql://localhost/prelander
# (Or use Vercel Postgres connection string)
```

### Step 2: Create Database Schema (2 minutes)
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# This creates all tables
```

### Step 3: Create Admin User (1 minute)
```bash
# Create default admin account
npx ts-node scripts/create-admin.ts

# Email: admin@prelander.ai
# Password: ChangeMe123! (change in .env.local)
```

### Step 4: Start Development (30 seconds)
```bash
npm run dev
```

### Step 5: Access the System
- **Landing Page**: http://localhost:3000/offer/skyscanner-cld/default
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Login**: admin@prelander.ai / ChangeMe123!

---

## 📖 Documentation Quick Links

| Need | Document |
|------|-----------|
| **First-time setup** | [DEPLOYMENT.md](DEPLOYMENT.md) → Local Development |
| **Admin panel guide** | [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md) |
| **Project overview** | [README.md](README.md) |
| **Vercel deployment** | [DEPLOYMENT.md](DEPLOYMENT.md) → Vercel Production |
| **Technical details** | [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) |

---

## 🔧 Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # Check code style

# Database
npx db:studio                  # View database UI
npx db:migrate                 # Run migrations
npx db:seed                    # Create admin user

# Utilities
npx prisma generate          # Regenerate Prisma client
npx prisma migrate reset      # Reset DB (dev only!)
```

---

## ✅ Quick Checklist

- [ ] PostgreSQL installed or Vercel Postgres created
- [ ] `.env.local` file created with DATABASE_URL
- [ ] NEXTAUTH_SECRET generated and added to `.env.local`
- [ ] Migrations run: `npx prisma migrate dev --name init`
- [ ] Admin user created: `npx ts-node scripts/create-admin.ts`
- [ ] Dev server running: `npm run dev`
- [ ] Can login at http://localhost:3000/admin/dashboard
- [ ] Landing page loads at http://localhost:3000/offer/skyscanner-cld/default

---

## 🐛 Troubleshooting Quick Fixes

### "Cannot connect to database"
```bash
# Check database is running
psql -U postgres -c "SELECT 1"

# Update DATABASE_URL in .env.local
# For local: postgresql://localhost/prelander
```

### "Unauthorized" on login page
```bash
# Ensure database exists and migrations ran
npx prisma migrate status

# Create admin user
npx ts-node scripts/create-admin.ts

# Check .env.local has NEXTAUTH_SECRET set
cat .env.local | grep NEXTAUTH_SECRET
```

### "Popunder not showing"
1. Go to admin dashboard
2. Click "Edit" on campaign
3. Enable "auto-trigger on inaction"
4. Set "Trigger After" to 3000 (3 seconds)
5. Click "Save Changes"
6. Refresh landing page
7. Wait 3 seconds - popunder should appear

### Build fails
```bash
# Clean and rebuild
rm -rf .next node_modules/.prisma
npm install
npx prisma generate
npm run build
```

---

## 📊 What's Included

### Admin Features ✅
- Campaign dashboard with statistics
- Auto-trigger configuration per campaign
- Status management (active/paused/archived)
- Click and conversion tracking

### Landing Pages ✅
- Auto-trigger popunders (configurable)
- Brand color extraction
- SEO-optimized pages
- Silent click tracking
- Auto-redirect support

### Security ✅
- Email/password authentication
- JWT sessions (24 hours)
- Protected admin routes
- Password hashing (bcryptjs)

### Database ✅
- PostgreSQL with Prisma ORM
- 5 core tables (User, Campaign, ClickSession, Conversion, Lander)
- Automatic timestamps
- Referential integrity

---

## 🚀 Production Deployment

When ready to deploy to Vercel:

1. Push code to GitHub
2. Import repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (automatic on push)
5. Run migrations: `npx prisma migrate deploy`
6. Create admin user: `npx ts-node scripts/create-admin.ts`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps.

---

## 🎓 Learn More

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org
- **Vercel**: https://vercel.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs

---

## 💡 Pro Tips

1. **Use Prisma Studio**: `npx db:studio` to visually browse database
2. **Check Logs**: Terminal shows all errors clearly
3. **Keep Dependencies Updated**: `npm update` regularly
4. **Change Default Password**: Update ADMIN_PASSWORD in .env.local
5. **Generate Strong Secret**: Use `openssl rand -base64 32`

---

## 🆘 Need Help?

1. Check the **Troubleshooting section** in [DEPLOYMENT.md](DEPLOYMENT.md)
2. Read **ADMIN_SETUP.md** for feature questions
3. Review **IMPLEMENTATION_SUMMARY.md** for technical details
4. Check **README.md** for architecture overview

---

**You're all set! Follow the 5 steps above and you'll have a working system in 15 minutes.**

Questions? Check the documentation links above. Good luck! 🚀
