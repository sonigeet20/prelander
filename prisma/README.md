# Prelander Database Setup

## PostgreSQL Connection

Set your `DATABASE_URL` in `.env.local`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/prelander"
```

## Initialize Database

```bash
npx prisma migrate dev --name init
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Admin Credentials

Default admin user will be created on first auth setup. Create via:

```bash
npx ts-node scripts/create-admin.ts
```
