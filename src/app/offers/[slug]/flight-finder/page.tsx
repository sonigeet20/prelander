import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { FlightSearch } from "@/components/micro-apps/FlightSearch";
import { TrackingPixels } from "@/components/TrackingPixels";

/**
 * Offer-Specific Flight Finder Landing Page
 *
 * /offers/[offer-slug]/flight-finder
 *
 * Google Ads landing page optimized for Quality Score:
 *   - Brand name woven into headings, copy, and meta tags
 *   - Real FlightSearch micro-app showing live prices
 *   - All CTAs → /go/[slug] tracking redirect
 *   - Keyword-rich content below the tool for ad relevancy
 */

// ─── Metadata ──────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const offer = await prisma.offer.findUnique({
    where: { slug },
    include: { brand: true },
  });

  if (!offer) return { title: "Offer Not Found" };

  const brandName = offer.brand.name;

  return {
    title: `Compare Cheap Flights on ${brandName} — Real-Time Prices | Savvy`,
    description: `Search and compare real-time flight prices on ${brandName}. Find the cheapest flights across hundreds of airlines, compare stops, durations, and book on ${brandName}.`,
    openGraph: {
      title: `Compare Cheap Flights on ${brandName} — Real-Time Prices | Savvy`,
      description: `Search and compare real-time flight prices on ${brandName}. Find the cheapest flights across hundreds of airlines.`,
    },
    robots: { index: true, follow: true },
  };
}

// ─── Helpers ───────────────────────────────────────────────────────
function titleCase(s: string) {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Page ──────────────────────────────────────────────────────────
export default async function FlightFinderOfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const offer = await prisma.offer.findUnique({
    where: { slug },
    include: { brand: true },
  });

  if (!offer || !offer.brand) notFound();

  const brandName = offer.brand.name;
  const brandDomain = offer.brand.domain;
  const trackingHref = `/go/${offer.slug}`;
  const verticalType = offer.brand.verticalType || "travel";

  // ─── JSON-LD Structured Data ─────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `Flight Search — ${brandName}`,
    description: `Compare real-time flight prices across hundreds of airlines on ${brandName}. Find the cheapest flights, sort by price, duration, or stops.`,
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@type": "Organization", name: "Savvy", url: "https://rightprice.site" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How does the ${brandName} flight search work?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Our flight search tool fetches real-time prices across hundreds of airlines. You can compare flights by price, duration, and number of stops. When you find the right flight, click through to ${brandName} to complete your booking.`,
        },
      },
      {
        "@type": "Question",
        name: `Are the flight prices on ${brandName} accurate?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes — prices are fetched live and reflect current availability. Final prices may vary slightly based on the exact time of booking and ${brandName}'s fees. We recommend booking quickly as flight prices change frequently.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I book flights directly through ${brandName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `We show you real flight options with live prices. When you're ready to book, you'll be directed to ${brandName} where you can complete your purchase securely.`,
        },
      },
      {
        "@type": "Question",
        name: "How far in advance can I search for flights?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can search flights up to 11 months in advance, covering all major airlines and routes worldwide.",
        },
      },
      {
        "@type": "Question",
        name: `Why use Savvy to compare flights on ${brandName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Savvy gives you a quick overview of available flights with real prices before you visit ${brandName}. Compare options side-by-side, sort by what matters to you, and then book with confidence.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900">
      {/* Tracking pixels */}
      <TrackingPixels 
        offerId={offer.id}
        impressionPixelUrl={offer.impressionPixelUrl}
        clickPixelUrl={offer.clickPixelUrl}
        conversionPixelUrl={offer.conversionPixelUrl}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">
              Savvy
            </span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <a href="/about" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-20 md:pb-24">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={`https://www.google.com/s2/favicons?domain=${brandDomain}&sz=64`}
              alt={`${brandName} logo`}
              width={28}
              height={28}
              className="rounded-md shadow-sm"
            />
            <span className="text-white/70 text-sm font-medium">{brandName} Flight Search</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">✈️</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Compare Cheap Flights on {brandName}
            </h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            Search real-time flight prices across hundreds of airlines. Compare departures, stops, and durations — then book on {brandName} with confidence.
          </p>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none">
          <path d="M0 60L48 53.3C96 46.7 192 33.3 288 30C384 26.7 480 33.3 576 36.7C672 40 768 40 864 36.7C960 33.3 1056 26.7 1152 25C1248 23.3 1344 26.7 1392 28.3L1440 30V60H0Z" fill="rgb(248 250 252)" />
        </svg>
      </div>

      {/* ─── Disclosure ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 mb-8">
        <div className="bg-amber-50/80 backdrop-blur rounded-xl px-5 py-3 text-xs text-amber-700 border border-amber-200/60 shadow-sm">
          <strong>Disclosure:</strong> This page may contain affiliate links. We may earn a commission at no extra cost to you.
          We are <strong>not affiliated with {brandName}</strong>. All tools and opinions are independent.{" "}
          <a href="/about" className="underline hover:text-amber-900">Learn more</a>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

        {/* ─── Flight Search Micro-App (FIRST after headline) ─── */}
        <div className="mb-12">
          <FlightSearch
            brandName={brandName}
            trackingHref={trackingHref}
            brandDomain={brandDomain}
          />
        </div>
        {/* ─── Feature Highlights ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "🔍", title: "Real-Time Prices", desc: `Live flight prices updated every search — see what ${brandName} travelers actually pay` },
            { icon: "✅", title: "All Airlines Compared", desc: `Compare full-service, low-cost, and alliance carriers available on ${brandName}` },
            { icon: "📊", title: "Sort & Filter", desc: "Sort by cheapest, fastest, or fewest stops to find your ideal flight instantly" },
            { icon: "🛡️", title: "Transparent Pricing", desc: `Prices include taxes and fees. Book directly on ${brandName} — no hidden charges` },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        {/* ═══════════════════════════════════════════════════════════
            BRAND-KEYWORD SEO CONTENT BELOW THE TOOL
            - Increases Google Ads Quality Score
            - Brand name naturally woven into headings & copy
            ═══════════════════════════════════════════════════════════ */}

        {/* ─── Why Compare Flights on {Brand} ─── */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Compare Flights on {brandName}?
            </h2>
            <div className="prose prose-sm prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Finding the best flight deal shouldn&apos;t be complicated. {brandName} makes it easy to compare
                hundreds of airlines in seconds, but with so many options it helps to have a clear overview first.
                That&apos;s where Savvy&apos;s flight search comes in — we show you real-time {brandName} prices
                side-by-side so you can spot the cheapest flights, shortest routes, and best value options
                before heading to {brandName} to book.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Whether you&apos;re looking for cheap flights to Europe, last-minute domestic deals, or
                international business class fares, our search tool pulls live pricing data so you always
                see what&apos;s actually available. No bait-and-switch pricing, no outdated fares — just
                real {brandName} flight prices you can book right now.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every flight result links directly to {brandName}, so you complete your booking on the
                platform you trust. We never handle payments or personal data — Savvy is purely a
                comparison and research tool.
              </p>
            </div>
          </div>
        </section>

        {/* ─── How to Find Cheap Flights ─── */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How to Find the Cheapest Flights on {brandName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Search & Compare</h3>
                <p className="text-sm text-gray-500">
                  Enter your origin, destination, and dates above. Our tool searches live {brandName}
                  pricing across all available airlines and routes.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-violet-600">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Sort by What Matters</h3>
                <p className="text-sm text-gray-500">
                  Sort by cheapest price, shortest duration, or fewest stops. Compare airlines,
                  layover times, and total travel time at a glance.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Book on {brandName}</h3>
                <p className="text-sm text-gray-500">
                  Found your flight? Click through to {brandName} to complete your booking securely.
                  {brandName} handles all payments and customer service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Travel Tips with Brand Keywords ─── */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Flight Booking Tips for {brandName} Travelers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "📅",
                title: "Book Early for the Best Prices",
                text: `Most ${brandName} flights are cheapest when booked 6–8 weeks before departure for domestic routes and 2–3 months ahead for international travel. Use our search tool to check prices across multiple dates.`,
              },
              {
                icon: "🔔",
                title: "Be Flexible with Dates",
                text: `Flying mid-week (Tuesday or Wednesday) is often 20–30% cheaper than weekends. Try different dates in our flight search to find the best ${brandName} deals.`,
              },
              {
                icon: "🌍",
                title: "Consider Nearby Airports",
                text: `Sometimes flying into a nearby airport saves hundreds. For example, if you're flying to London, compare Heathrow, Gatwick, and Stansted prices on ${brandName}.`,
              },
              {
                icon: "💡",
                title: "Compare Direct vs. Connecting",
                text: `Direct flights save time but connecting flights on ${brandName} can be significantly cheaper. Our tool shows both options — compare total travel time against savings.`,
              },
            ].map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200/70 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{tip.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions About {brandName} Flights
          </h2>
          <div className="space-y-3">
            {[
              {
                q: `How does the ${brandName} flight search work?`,
                a: `Our flight search tool fetches real-time prices across hundreds of airlines. Results show actual fares available on ${brandName} including taxes and fees. When you find the right flight, click through to ${brandName} to complete your booking.`,
              },
              {
                q: `Are the flight prices on ${brandName} accurate?`,
                a: `Yes — prices are fetched live and reflect current availability on ${brandName}. Final prices may vary slightly based on the exact time of booking. We recommend booking quickly as flight prices on ${brandName} change frequently.`,
              },
              {
                q: `Can I book flights directly through ${brandName}?`,
                a: `We show you real flight options with live prices. When you're ready to book, you'll be directed to ${brandName} where you can complete your purchase securely. ${brandName} handles all payments, tickets, and customer service.`,
              },
              {
                q: "How far in advance can I search for flights?",
                a: `You can search flights up to 11 months in advance, covering all major airlines and routes available on ${brandName}.`,
              },
              {
                q: `Why use Savvy instead of going directly to ${brandName}?`,
                a: `Savvy gives you a quick, clean overview of available flights before visiting ${brandName}. Compare options side-by-side, sort by what matters most, and then book on ${brandName} with confidence. We're a free research tool — no signup required.`,
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-gray-200/70 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between px-5 py-4 font-medium text-gray-800 cursor-pointer select-none">
                  <span className="text-[15px] pr-4">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div className="relative px-8 py-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Book Your Flight on {brandName}?
            </h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              You&apos;ve compared the options. Now visit {brandName} to secure the best price before it changes.
            </p>
            <a
              href={trackingHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
              rel="nofollow sponsored"
            >
              Search Flights on {brandName}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-200/60 bg-gray-50/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="font-bold text-gray-900">Savvy</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Independent flight search and comparison tools to help you find the best deals.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tools</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href={`/offers/${slug}/flight-finder`} className="hover:text-indigo-600 transition-colors">Flight Finder</a></li>
                <li><a href={`/offers/${slug}/ai-assistant`} className="hover:text-indigo-600 transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Company</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/about" className="hover:text-indigo-600 transition-colors">About Savvy</a></li>
                <li><a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Use</a></li>
                <li><a href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Savvy. Independent research — not affiliated with {brandName}.
            </p>
            <p className="text-[10px] text-gray-300">
              This page may contain affiliate links. See our <a href="/terms" className="underline">terms</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
