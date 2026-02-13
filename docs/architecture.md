# AI Landing + Ads Automation Platform

## Components
- Admin UI (Next.js App Router): offer onboarding, research status, keyword clusters, lander builder, publish, ads status, conversions.
- API layer (Next.js Route Handlers for MVP): offers, research, landers, tracking, conversions, ads integration.
- AI services: fact pack extraction, keyword clustering, landing page generation, compliance rewrite.
- Data: Postgres (Supabase) with RLS; object storage for snapshots; optional Redis queue.
- Delivery: Vercel hosting + Cloudflare wildcard DNS for subdomain routing.

## Data flow
1. Offer ingest → store offer + tracking links.
2. Research crawl → snapshots + Fact Pack.
3. Keyword miner → clusters.
4. Lander generator → blocks → publish.
5. Subdomain routing → offer_name.example.com/cluster.
6. Click endpoint → log + redirect, tracking hits on click.
7. Conversion webhook → offline conversion import (OCI).

## Security & compliance
- Rate limit /click and /api endpoints.
- Bot detection for abuse prevention.
- No tracking fired without explicit user click.
- Disclosure requirements on landers.
