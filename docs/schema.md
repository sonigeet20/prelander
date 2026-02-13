# Database Schema (Supabase/Postgres)

## Tables
- tenants(id, name, created_at)
- users(id, tenant_id, email, role)
- offers(id, tenant_id, offer_name, brand_urls[], destination_url, tracking_urls[], geos[], languages[], status, subdomain_slug, created_at)
- research_snapshots(id, offer_id, url, html, created_at)
- brand_fact_packs(id, offer_id, data_json, version, created_at)
- keyword_clusters(id, offer_id, name, intent, keywords[], score, geo, language)
- landing_pages(id, offer_id, cluster_id, title, body, cta, status, published_at)
- tracking_links(id, offer_id, url, type, enabled)
- click_sessions(id, offer_id, cluster_id, gclid, gbraid, wbraid, ip, user_agent, created_at)
- conversions(id, offer_id, click_session_id, value, currency, order_id, status, created_at)
- ads_campaigns(id, offer_id, external_id, status)
- ads_adgroups(id, campaign_id, external_id, status)
- ads_ads(id, adgroup_id, external_id, status)
- subdomains(id, offer_id, subdomain_slug, status)

## RLS
- All tenant-scoped tables enforce tenant_id = auth.uid().
