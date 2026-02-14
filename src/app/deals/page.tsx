import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { BrandFactPack } from "@/lib/ai-research";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DealFinder — Coupons, Promo Codes & Exclusive Deals from Top Brands",
  description: "Find verified coupons, discount codes, and exclusive deals from top brands. Save money on flights, shopping, software, and more. Updated daily.",
  robots: "index, follow",
};

export default async function DealsHomePage() {
  // Get all campaigns with active deals
  const campaigns = await prisma.campaign.findMany({
    where: { status: "active" },
    include: {
      deals: { where: { active: true }, orderBy: { featured: "desc" } },
      _count: { select: { deals: { where: { active: true } } } },
    },
  });

  const brandsWithDeals = campaigns
    .filter((c) => c._count.deals > 0)
    .map((c) => {
      const factPack = (c.metadata as Record<string, unknown>)?.brandFactPack as BrandFactPack | undefined;
      const brandName = c.brandName || factPack?.brandName || c.offerName;
      const category = factPack?.category || "General";
      const tagline = factPack?.tagline || c.description;
      const brandColors = factPack?.brandColors || { primary: "#6366f1", secondary: "#1e1b4b", accent: "#f59e0b", soft: "#eef2ff" };
      const slug = slugify(c.offerName, 32);
      const brandHost = (() => {
        try { return new URL(c.destinationUrl).hostname.replace(/^www\./i, ""); } catch { return ""; }
      })();
      const faviconUrl = brandHost ? `https://www.google.com/s2/favicons?domain=${brandHost}&sz=128` : "";
      const bestDiscount = Math.max(...c.deals.map((d) => d.discountPercent || 0), 0);
      const featuredDeal = c.deals.find((d) => d.featured);

      return {
        id: c.id,
        brandName,
        category,
        tagline,
        brandColors,
        slug,
        faviconUrl,
        dealCount: c._count.deals,
        bestDiscount,
        featuredDeal: featuredDeal ? { title: featuredDeal.title, discountLabel: featuredDeal.discountLabel } : null,
      };
    });

  // All campaigns (even without deals) for a "browse all" section
  const allBrands = campaigns.map((c) => {
    const factPack = (c.metadata as Record<string, unknown>)?.brandFactPack as BrandFactPack | undefined;
    const brandName = c.brandName || factPack?.brandName || c.offerName;
    const category = factPack?.category || "General";
    const brandColors = factPack?.brandColors || { primary: "#6366f1", secondary: "#1e1b4b", accent: "#f59e0b", soft: "#eef2ff" };
    const slug = slugify(c.offerName, 32);
    const brandHost = (() => {
      try { return new URL(c.destinationUrl).hostname.replace(/^www\./i, ""); } catch { return ""; }
    })();
    const faviconUrl = brandHost ? `https://www.google.com/s2/favicons?domain=${brandHost}&sz=128` : "";
    return { brandName, category, brandColors, slug, faviconUrl, dealCount: c._count.deals };
  });

  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">D</div>
            <span className="font-bold text-gray-900">DealFinder</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="/deals" className="text-indigo-600 font-medium">All Brands</a>
            <a href="/about" className="hover:text-gray-900 transition">How It Works</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Find the Best Deals & Coupons
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Discover verified promo codes, exclusive discounts, and money-saving deals from top brands. Updated daily for {month}.
          </p>
          <div className="max-w-xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search brands, deals, categories..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 text-base"
              readOnly
            />
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-sm">
              <span>🔍</span> AI-Powered Search
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-sm">
              <span>✓</span> Verified Daily
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-sm">
              <span>📍</span> Location-Based Deals
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-sm">
              <span>⚡</span> Real-Time Updates
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Brands with Deals */}
        {brandsWithDeals.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔥 Brands with Active Deals</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandsWithDeals.map((b) => (
                <a
                  key={b.id}
                  href={`/deals/${b.slug}`}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all group overflow-hidden"
                >
                  <div className="h-2" style={{ backgroundColor: b.brandColors.primary }} />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {b.faviconUrl && <img src={b.faviconUrl} alt={b.brandName} width={36} height={36} className="rounded-lg" />}
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">{b.brandName}</h3>
                        <span className="text-xs text-gray-500">{b.category}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{b.tagline}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: b.brandColors.primary }}>
                          {b.dealCount} deal{b.dealCount !== 1 ? "s" : ""}
                        </span>
                        {b.bestDiscount > 0 && (
                          <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Up to {b.bestDiscount}% off
                          </span>
                        )}
                      </div>
                      <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        View →
                      </span>
                    </div>
                    {b.featuredDeal && (
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        ⭐ {b.featuredDeal.title} — <span className="font-semibold text-gray-700">{b.featuredDeal.discountLabel}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Browse All Brands */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse All Brands</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBrands.map((b) => (
              <a
                key={b.slug}
                href={`/deals/${b.slug}`}
                className="flex items-center gap-3 bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition group"
              >
                {b.faviconUrl && <img src={b.faviconUrl} alt={b.brandName} width={32} height={32} className="rounded-lg" />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition truncate">{b.brandName}</div>
                  <div className="text-xs text-gray-500">{b.dealCount} deal{b.dealCount !== 1 ? "s" : ""}</div>
                </div>
                <span className="text-gray-400 group-hover:text-indigo-600 transition">→</span>
              </a>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white rounded-2xl shadow-sm border p-8 md:p-12 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How DealFinder Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
              <h3 className="font-bold text-gray-900 mb-2">Search & Browse</h3>
              <p className="text-sm text-gray-600">Find your favorite brands or browse by category to discover the latest deals and coupons.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📋</div>
              <h3 className="font-bold text-gray-900 mb-2">Get Your Code</h3>
              <p className="text-sm text-gray-600">Click on any deal to reveal the promo code. Copy it with one click — it&apos;s that easy.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Save Money</h3>
              <p className="text-sm text-gray-600">Apply the code at checkout on the brand&apos;s website and enjoy instant savings on your purchase.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to Start Saving?</h2>
          <p className="text-lg opacity-90 mb-6">Browse deals from top brands and discover exclusive coupons updated daily.</p>
          <a href="#" className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition shadow-lg">
            Browse All Deals
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-white font-bold text-lg mb-3">DealFinder</div>
              <p className="text-sm leading-relaxed">Helping you save money with verified coupons, promo codes, and exclusive deals from top brands. Updated daily.</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Quick Links</div>
              <ul className="space-y-2 text-sm">
                <li><a href="/deals" className="hover:text-white transition">All Brands</a></li>
                <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Disclosure</div>
              <p className="text-xs leading-relaxed opacity-75">
                DealFinder may earn a commission when you use our links to shop. This does not affect which deals we list or how they are ranked. We are committed to providing accurate, up-to-date coupon information.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs opacity-60">
            © {new Date().getFullYear()} DealFinder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
