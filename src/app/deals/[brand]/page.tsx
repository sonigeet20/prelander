import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { BrandFactPack } from "@/lib/ai-research";
import { DealCardGrid } from "@/components/deals/DealCardGrid";
import { DealSearch } from "@/components/deals/DealSearch";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface DealsPageProps {
  params: Promise<{ brand: string }>;
}

async function findCampaignByBrand(brand: string) {
  const campaigns = await prisma.campaign.findMany();
  return campaigns.find((c) => {
    const slug = slugify(c.offerName, 32);
    return (
      slug === brand ||
      c.subdomain === brand ||
      c.brandName?.toLowerCase().replace(/\s+/g, "-") === brand
    );
  });
}

export async function generateMetadata({ params }: DealsPageProps): Promise<Metadata> {
  const { brand } = await params;
  const campaign = await findCampaignByBrand(brand);
  if (!campaign) return { title: "Deals Not Found" };

  const factPack = (campaign.metadata as Record<string, unknown>)?.brandFactPack as BrandFactPack | undefined;
  const brandName = campaign.brandName || factPack?.brandName || campaign.offerName;
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return {
    title: `${brandName} Coupons, Promo Codes & Deals — ${month}`,
    description: `Find the latest ${brandName} coupons, discount codes, and exclusive deals for ${month}. Save money with verified promo codes and special offers updated daily.`,
    robots: "index, follow",
    openGraph: {
      title: `${brandName} Coupons & Deals — ${month}`,
      description: `Verified ${brandName} coupons and promo codes. Updated daily.`,
    },
  };
}

export default async function BrandDealsPage({ params }: DealsPageProps) {
  const { brand } = await params;
  const campaign = await findCampaignByBrand(brand);
  if (!campaign) notFound();

  const factPack = (campaign.metadata as Record<string, unknown>)?.brandFactPack as BrandFactPack | undefined;
  const brandName = campaign.brandName || factPack?.brandName || campaign.offerName;
  const category = factPack?.category || "Service Provider";
  const tagline = factPack?.tagline || campaign.description;
  const travelKw = ["travel", "flight", "airline", "hotel", "booking", "trip", "vacation"];
  const isTravel = travelKw.some((k) => category.toLowerCase().includes(k));

  // Brand colors
  const brandColors = factPack?.brandColors || { primary: "#6366f1", secondary: "#1e1b4b", accent: "#f59e0b", soft: "#eef2ff" };

  // Fetch all active deals for this campaign
  const deals = await prisma.deal.findMany({
    where: { campaignId: campaign.id, active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(deals.map((d) => d.category)))];

  // Brand favicon
  const brandHost = (() => {
    try { return new URL(campaign.destinationUrl).hostname.replace(/^www\./i, ""); } catch { return ""; }
  })();
  const faviconUrl = brandHost ? `https://www.google.com/s2/favicons?domain=${brandHost}&sz=128` : "";

  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const clickHref = `/click/${slugify(campaign.offerName, 32)}/${isTravel ? "travel" : "deals"}`;

  // Stats
  const totalDeals = deals.length;
  const codesCount = deals.filter((d) => d.code).length;
  const featuredCount = deals.filter((d) => d.featured).length;
  const bestDiscount = Math.max(...deals.map((d) => d.discountPercent || 0), 0);

  // Serialize deals for client component
  const serializedDeals = deals.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    code: d.code,
    discountLabel: d.discountLabel,
    discountPercent: d.discountPercent,
    category: d.category,
    destinationUrl: d.destinationUrl || campaign.destinationUrl,
    verified: d.verified,
    featured: d.featured,
    expiresAt: d.expiresAt?.toISOString() || null,
    usedCount: d.usedCount,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brandColors.primary }}>
              D
            </div>
            <span className="font-bold text-gray-900">DealFinder</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="/deals" className="hover:text-gray-900 transition">All Brands</a>
            <a href="/about" className="hover:text-gray-900 transition">How It Works</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            {faviconUrl && (
              <img src={faviconUrl} alt={brandName} width={48} height={48} className="rounded-lg bg-white p-1" />
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {brandName} Coupons & Deals
            </h1>
          </div>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-6">
            {tagline || `Find the best ${brandName} coupons, promo codes, and exclusive deals for ${month}.`}
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{totalDeals}</div>
              <div className="text-xs opacity-80">Active Deals</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{codesCount}</div>
              <div className="text-xs opacity-80">Promo Codes</div>
            </div>
            {bestDiscount > 0 && (
              <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">Up to {bestDiscount}%</div>
                <div className="text-xs opacity-80">Max Savings</div>
              </div>
            )}
            <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">✓</div>
              <div className="text-xs opacity-80">Verified Today</div>
            </div>
          </div>

          {/* Search */}
          <DealSearch brandName={brandName} />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Deals Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {totalDeals} {brandName} {isTravel ? "Travel Deals" : "Deals & Coupons"}
              </h2>
              <span className="text-sm text-gray-500">Updated {month}</span>
            </div>

            {totalDeals === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No deals available yet</h3>
                <p className="text-gray-600 mb-6">We&apos;re currently sourcing the best {brandName} deals. Check back soon!</p>
                <a
                  href={campaign.destinationUrl}
                  className="inline-block px-6 py-3 text-white font-semibold rounded-lg transition hover:opacity-90"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Visit {brandName} Directly →
                </a>
              </div>
            ) : (
              <DealCardGrid
                deals={serializedDeals}
                categories={categories}
                brandColors={brandColors}
                clickHref={clickHref}
                brandName={brandName}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Brand Info Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                {faviconUrl && <img src={faviconUrl} alt={brandName} width={40} height={40} className="rounded-lg" />}
                <div>
                  <h3 className="font-bold text-gray-900">{brandName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: brandColors.primary }}>
                    {category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{tagline}</p>
              <a
                href={clickHref}
                className="block w-full text-center px-4 py-2.5 text-white font-semibold rounded-lg transition hover:opacity-90 text-sm"
                style={{ backgroundColor: brandColors.primary }}
              >
                Visit {brandName} →
              </a>
            </div>

            {/* Deal Tips */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-3">💡 Saving Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>Check for new codes before every purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>Combine promo codes with {isTravel ? "off-peak travel dates" : "seasonal sales"} for max savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>{isTravel ? "Book 2-3 months in advance for the best fares" : "Sign up for the newsletter to get exclusive discounts"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>Featured deals often have the highest savings</span>
                </li>
              </ul>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-3">🔍 How It Works</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Browse available {brandName} deals and coupons</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Click to reveal the promo code or activate the deal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Apply at checkout on {brandName}&apos;s website</span>
                </li>
              </ol>
            </div>

            {/* Popular Categories */}
            {categories.length > 2 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-3">📂 Deal Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.filter((c) => c !== "All").map((cat) => (
                    <span key={cat} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-xl shadow-sm border p-5 group" open>
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                How do I use a {brandName} coupon code?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Find a deal you like, click &quot;Get Deal&quot; to reveal the code, then copy it. Visit {brandName}&apos;s website, add items to your cart, and paste the code at checkout. The discount will be applied automatically.
              </p>
            </details>
            <details className="bg-white rounded-xl shadow-sm border p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                Are these {brandName} coupons verified?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Yes. Our team verifies all coupon codes and deals regularly. We mark each deal as verified and remove expired offers to ensure you always find working codes.
              </p>
            </details>
            <details className="bg-white rounded-xl shadow-sm border p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                How often are new {brandName} deals added?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                We update our {brandName} deals page daily. New promotions, seasonal offers, and exclusive codes are added as they become available. Bookmark this page to stay up to date.
              </p>
            </details>
            <details className="bg-white rounded-xl shadow-sm border p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                Can I combine multiple {brandName} coupons?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Most retailers allow only one promo code per order. However, you can often combine a coupon code with an ongoing site-wide sale for additional savings. Check each deal&apos;s terms for details.
              </p>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-white font-bold text-lg mb-3">DealFinder</div>
              <p className="text-sm leading-relaxed">
                Helping you save money with verified coupons, promo codes, and exclusive deals from top brands. Updated daily.
              </p>
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
            © {new Date().getFullYear()} DealFinder. All rights reserved. Not affiliated with {brandName}.
          </div>
        </div>
      </footer>
    </div>
  );
}
