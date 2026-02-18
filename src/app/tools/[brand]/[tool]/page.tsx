import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { MicroAppSelector } from "@/components/micro-apps";

/**
 * Standalone Micro-App Pages
 *
 * /tools/[brand]/[tool]
 *
 * Full landing pages with header, footer, value proposition content blocks,
 * and an embedded micro-app. SEO-optimized for generic/branded long-tail keywords.
 *
 * Tool slugs:
 *   flight-search, loan-calculator, roi-calculator, ai-assistant
 *
 * These pages are designed to capture long-tail traffic like:
 *   "cheap flights to Dubai", "skyscanner flight search", "loan calculator",
 *   "saas roi calculator", etc.
 */

// ─── Tool definitions ──────────────────────────────────────────────
interface ToolConfig {
  name: string;
  headline: string;
  description: string;
  icon: string;
  gradient: string;
  verticalType: string;
  features: { icon: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  metaTitle: (brand: string) => string;
  metaDesc: (brand: string) => string;
}

const TOOLS: Record<string, ToolConfig> = {
  "flight-search": {
    name: "Flight Search",
    headline: "Find the Best Flights at Real Prices",
    description:
      "Search real-time flight prices across hundreds of airlines. Compare departure times, stops, durations, and prices — all in one place. Powered by the same data airlines use.",
    icon: "✈️",
    gradient: "from-indigo-600 to-violet-600",
    verticalType: "travel",
    features: [
      { icon: "🔍", title: "Real-Time Prices", desc: "Live pricing from Amadeus GDS — the same system travel agents use" },
      { icon: "✅", title: "All Airlines Compared", desc: "See options from full-service carriers, low-cost airlines, and alliance partners" },
      { icon: "📊", title: "Sort & Filter", desc: "Sort by cheapest, fastest, or fewest stops to find your ideal flight" },
      { icon: "🛡️", title: "No Hidden Fees", desc: "Prices shown include taxes. Book on the airline or OTA of your choice" },
    ],
    faqs: [
      { q: "Where do the flight prices come from?", a: "We use the Amadeus Global Distribution System (GDS), the same data source used by travel agents and booking platforms worldwide. Prices are fetched in real-time." },
      { q: "Can I book flights directly on this page?", a: "We show you the best available flights and let you compare options. When you're ready to book, you'll be directed to the airline or booking platform to complete your purchase." },
      { q: "Are the prices accurate?", a: "Prices are fetched live and are accurate at the time of search. Final prices may vary slightly based on currency conversion and the booking platform's fees." },
      { q: "How far in advance can I search?", a: "You can search flights up to 11 months in advance, which is the standard GDS booking window." },
    ],
    metaTitle: (b) => `${b} Flight Search — Compare Real Flight Prices | Savvy`,
    metaDesc: (b) => `Search and compare real-time flight prices on ${b}. Find the cheapest flights, compare airlines, stops, and durations. Powered by Amadeus GDS.`,
  },
  "loan-calculator": {
    name: "Loan & Mortgage Calculator",
    headline: "Calculate Your Real Monthly Payments",
    description:
      "Use our loan calculator to see exactly what you'll pay each month. Covers personal loans, auto loans, mortgages, and student loans with standard amortization formulas.",
    icon: "🧮",
    gradient: "from-emerald-600 to-teal-600",
    verticalType: "finance",
    features: [
      { icon: "📐", title: "Accurate Math", desc: "Standard amortization formulas used by banks and lenders worldwide" },
      { icon: "📋", title: "Amortization Table", desc: "See how your balance decreases year by year — principal vs interest breakdown" },
      { icon: "🎯", title: "Preset Scenarios", desc: "Quick-start with personal loan, auto, mortgage, or student loan presets" },
      { icon: "📊", title: "Visual Breakdown", desc: "See your principal-to-interest ratio at a glance with visual charts" },
    ],
    faqs: [
      { q: "How accurate is this calculator?", a: "Our calculator uses the standard amortization formula (M = P[r(1+r)^n]/[(1+r)^n-1]) — the same formula used by banks. Results are mathematically precise for fixed-rate loans." },
      { q: "Does this include taxes and insurance?", a: "This calculator shows principal and interest only. For mortgages, your actual payment will also include property taxes, homeowners insurance, and possibly PMI." },
      { q: "Can I use this for variable-rate loans?", a: "This calculator is for fixed-rate loans. Variable-rate loans change over time, so results would only be accurate for the initial rate period." },
      { q: "How do I know if a loan rate is good?", a: "Compare the rate shown by your lender to current market averages. We recommend checking multiple lenders to find the best rate for your credit profile." },
    ],
    metaTitle: (b) => `Loan Calculator — Monthly Payment & Amortization | ${b} | Savvy`,
    metaDesc: (b) => `Calculate your monthly loan payments with our free calculator. Compare personal loans, mortgages, auto loans. See real amortization schedules. Check rates on ${b}.`,
  },
  "roi-calculator": {
    name: "ROI Calculator",
    headline: "Calculate Your Software ROI Before You Buy",
    description:
      "Estimate the real return on investment for any SaaS tool. Input your team size, costs, and time savings to see if the investment makes sense — before you commit.",
    icon: "📊",
    gradient: "from-blue-600 to-cyan-600",
    verticalType: "b2b_saas",
    features: [
      { icon: "💰", title: "Net Savings", desc: "See your annual net savings after accounting for tool costs vs productivity gains" },
      { icon: "⏱️", title: "Payback Period", desc: "Know exactly how many months until the tool pays for itself" },
      { icon: "📈", title: "ROI Percentage", desc: "Get a clear ROI% that you can present to stakeholders or management" },
      { icon: "🔢", title: "Full Breakdown", desc: "Detailed line-by-line breakdown of time costs, savings, and tool expenses" },
    ],
    faqs: [
      { q: "How is the ROI calculated?", a: "ROI = (Net Savings / Annual Tool Cost) × 100. Net Savings = Time savings value + current tool costs saved - new tool cost. Time savings are estimated at 60% of wasted hours (industry conservative average)." },
      { q: "Is the 60% time savings estimate realistic?", a: "It's intentionally conservative. Most SaaS tools report 40-80% time savings in their categories. We use 60% as a middle ground, but your actual results may vary based on implementation and adoption." },
      { q: "Can I use this for any type of software?", a: "Yes — this calculator works for any subscription-based tool where the primary value is saving your team time. Adjust the 'hours wasted per week' to match your specific workflow." },
      { q: "What if the ROI is negative?", a: "A negative ROI means the tool costs more than it saves at your current team size. Consider whether the tool has other benefits (quality, compliance, etc.) not captured in time savings alone." },
    ],
    metaTitle: (b) => `SaaS ROI Calculator — Is ${b} Worth It? | Savvy`,
    metaDesc: (b) => `Calculate the ROI of ${b} for your team. Free ROI calculator shows net savings, payback period, and annual return. Make data-driven software decisions.`,
  },
  "ai-assistant": {
    name: "AI Assistant",
    headline: "Get Expert Advice Powered by AI",
    description:
      "Ask our AI assistant anything about your research topic. Get personalized, expert-level advice instantly — from travel planning to financial decisions to software selection.",
    icon: "🤖",
    gradient: "from-purple-600 to-pink-600",
    verticalType: "other",
    features: [
      { icon: "⚡", title: "Instant Answers", desc: "Get detailed, expert-level responses in seconds — no waiting, no appointments" },
      { icon: "🧠", title: "Context-Aware", desc: "Our AI understands the brand and category you're researching" },
      { icon: "🔍", title: "Flight Search (Travel)", desc: "For travel brands, our AI can search real flights and show actual prices" },
      { icon: "💬", title: "Follow-Up Questions", desc: "Have a real conversation — ask follow-ups to dig deeper into any topic" },
    ],
    faqs: [
      { q: "Is this a real AI?", a: "Yes — our assistant is powered by OpenAI's GPT-4o-mini model. It provides real, thoughtful responses (not canned answers). For travel queries, it can even search real flight prices." },
      { q: "Can the AI search for flights?", a: "Yes! On travel brand pages, ask the AI to find flights between any two cities and it will search real-time prices via the Amadeus GDS and show you actual flight options with prices." },
      { q: "Is the advice trustworthy?", a: "Our AI provides helpful guidance based on its training data and real-time tools. However, we always recommend verifying important details (prices, policies) directly with the brand before making decisions." },
      { q: "Is my conversation private?", a: "Your messages are sent to our AI API and are not stored. No conversation history is saved after you close the page." },
    ],
    metaTitle: (b) => `AI ${b} Assistant — Get Expert Advice Instantly | Savvy`,
    metaDesc: (b) => `Ask our AI assistant anything about ${b}. Get instant, expert-level advice on travel, finance, software, and more. Powered by GPT-4o-mini.`,
  },
};

// ─── Metadata ──────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; tool: string }>;
}): Promise<Metadata> {
  const { brand, tool } = await params;
  const toolConfig = TOOLS[tool];
  if (!toolConfig) return { title: "Tool Not Found" };

  const brandData = await prisma.brand.findFirst({
    where: { name: { contains: brand, mode: "insensitive" } },
  });
  const brandName = brandData ? brandData.name : titleCase(brand);

  return {
    title: toolConfig.metaTitle(brandName),
    description: toolConfig.metaDesc(brandName),
    openGraph: {
      title: toolConfig.metaTitle(brandName),
      description: toolConfig.metaDesc(brandName),
    },
  };
}

function titleCase(s: string) {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Page ──────────────────────────────────────────────────────────
export default async function ToolPage({
  params,
}: {
  params: Promise<{ brand: string; tool: string }>;
}) {
  const { brand, tool } = await params;
  const toolConfig = TOOLS[tool];
  if (!toolConfig) notFound();

  // Find brand + offer for tracking
  const brandData = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { contains: brand, mode: "insensitive" } },
        { domain: { contains: brand, mode: "insensitive" } },
      ],
    },
    include: {
      offers: {
        where: { status: { in: ["active", "draft"] } },
        take: 1,
      },
    },
  });

  if (!brandData || brandData.offers.length === 0) notFound();

  const offer = brandData.offers[0];
  const brandName = brandData.name;
  const brandDomain = brandData.domain;
  const trackingHref = `/go/${offer.slug}`;
  const verticalType = brandData.verticalType || toolConfig.verticalType;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${toolConfig.name} — ${brandName}`,
    description: toolConfig.metaDesc(brandName),
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@type": "Organization", name: "Savvy" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: toolConfig.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900">
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
            <a href={`/guides/${brand}`} className="hover:text-indigo-600 transition-colors">{titleCase(brandName)} Guides</a>
            <a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${toolConfig.gradient} opacity-95`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-20 md:pb-24">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={`https://www.google.com/s2/favicons?domain=${brandDomain}&sz=64`}
              alt=""
              width={28}
              height={28}
              className="rounded-md shadow-sm"
            />
            <span className="text-white/70 text-sm font-medium">{titleCase(brandName)} Tool</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{toolConfig.icon}</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {toolConfig.headline}
            </h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">{toolConfig.description}</p>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none">
          <path
            d="M0 60L48 53.3C96 46.7 192 33.3 288 30C384 26.7 480 33.3 576 36.7C672 40 768 40 864 36.7C960 33.3 1056 26.7 1152 25C1248 23.3 1344 26.7 1392 28.3L1440 30V60H0Z"
            fill="rgb(248 250 252)"
          />
        </svg>
      </div>

      {/* ─── Disclosure ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 mb-8">
        <div className="bg-amber-50/80 backdrop-blur rounded-xl px-5 py-3 text-xs text-amber-700 border border-amber-200/60 shadow-sm">
          <strong>Disclosure:</strong> This page may contain affiliate links. We may earn a commission at no extra cost to you.
          We are <strong>not affiliated with {titleCase(brandName)}</strong>. All opinions and tools are independent.{" "}
          <a href="/about" className="underline hover:text-amber-900">Learn more</a>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {toolConfig.features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Embedded Micro-App ─── */}
        <div className="mb-12">
          <MicroAppSelector
            verticalType={verticalType}
            brandName={titleCase(brandName)}
            trackingHref={trackingHref}
            brandDomain={brandDomain}
          />
        </div>

        {/* ─── How It Works ─── */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Use the Tool</h3>
              <p className="text-sm text-gray-500">Enter your details above and get real results instantly — no signup required.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-violet-600">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Compare Options</h3>
              <p className="text-sm text-gray-500">Review the results and compare different options to find what works best for you.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Take Action</h3>
              <p className="text-sm text-gray-500">
                When you&apos;re ready, visit {titleCase(brandName)} to complete your booking or purchase.
              </p>
            </div>
          </div>
        </div>

        {/* ─── FAQ ─── */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {toolConfig.faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-gray-200/70 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between px-5 py-4 font-medium text-gray-800 cursor-pointer select-none">
                  <span className="text-[15px] pr-4">{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ─── Bottom CTA ─── */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${toolConfig.gradient}`} />
          <div className="relative px-8 py-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Take Action?</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              You&apos;ve done the research. Now visit {titleCase(brandName)} to get started.
            </p>
            <a
              href={trackingHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
              rel="nofollow sponsored"
            >
              Visit {titleCase(brandName)}
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
                Independent research tools to help you make smarter decisions.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tools</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href={`/tools/${brand}/flight-search`} className="hover:text-indigo-600 transition-colors">Flight Search</a></li>
                <li><a href={`/tools/${brand}/loan-calculator`} className="hover:text-indigo-600 transition-colors">Loan Calculator</a></li>
                <li><a href={`/tools/${brand}/roi-calculator`} className="hover:text-indigo-600 transition-colors">ROI Calculator</a></li>
                <li><a href={`/tools/${brand}/ai-assistant`} className="hover:text-indigo-600 transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Research</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href={`/guides/${brand}`} className="hover:text-indigo-600 transition-colors">{titleCase(brandName)} Guides</a></li>
                <li><a href="/about" className="hover:text-indigo-600 transition-colors">Our Methodology</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Use</a></li>
                <li><a href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Savvy. Independent research — not affiliated with {titleCase(brandName)}.
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
