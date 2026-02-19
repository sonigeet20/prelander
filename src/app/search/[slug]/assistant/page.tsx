import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { AIAssistant } from "@/components/micro-apps/AIAssistant";
import { TrackingPixels } from "@/components/TrackingPixels";

/**
 * Generic AI Assistant Landing Page
 *
 * /search/[offer-slug]/assistant
 *
 * Google Ads safe — NO brand keywords in page content.
 * Brand name appears ONLY in CTA buttons (via AIAssistant component).
 * Micro-app is the first element after the headline.
 */

// ─── Vertical display names ────────────────────────────────────────
const VERTICAL_LABELS: Record<
  string,
  { title: string; category: string; desc: string }
> = {
  travel: {
    title: "AI Travel Assistant",
    category: "Travel",
    desc: "travel planning, flight comparisons, destination tips, and trip budgeting",
  },
  finance: {
    title: "AI Finance Advisor",
    category: "Finance",
    desc: "loan comparisons, interest rates, financial planning, and mortgage calculations",
  },
  b2b_saas: {
    title: "AI Software Advisor",
    category: "Software",
    desc: "software comparisons, ROI analysis, feature evaluations, and implementation planning",
  },
  subscription: {
    title: "AI Subscription Advisor",
    category: "Subscriptions",
    desc: "subscription value analysis, plan comparisons, and cost optimization",
  },
  ecommerce: {
    title: "AI Shopping Assistant",
    category: "Shopping",
    desc: "product comparisons, deal analysis, and purchase decisions",
  },
  d2c: {
    title: "AI Product Expert",
    category: "Products",
    desc: "product recommendations, feature comparisons, and buying guides",
  },
  health: {
    title: "AI Health Guide",
    category: "Health & Wellness",
    desc: "plan comparisons, coverage analysis, and wellness recommendations",
  },
  other: {
    title: "AI Research Assistant",
    category: "Research",
    desc: "product research, comparisons, and expert-level advice",
  },
};

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

  const vertical = offer.brand.verticalType || "other";
  const verticalInfo = VERTICAL_LABELS[vertical] || VERTICAL_LABELS.other;

  return {
    title: `${verticalInfo.title} — Expert Advice Instantly | Savvy`,
    description: `Get instant, expert-level advice. Our AI assistant helps with ${verticalInfo.desc}. Powered by GPT-4o-mini — free, no signup required.`,
    openGraph: {
      title: `${verticalInfo.title} — Expert Advice Instantly | Savvy`,
      description: `Get instant, expert-level advice. Our AI assistant helps with ${verticalInfo.desc}.`,
    },
    robots: { index: true, follow: true },
  };
}

// ─── Page ──────────────────────────────────────────────────────────
export default async function GenericAIAssistantPage({
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
  const vertical = offer.brand.verticalType || "other";
  const verticalInfo = VERTICAL_LABELS[vertical] || VERTICAL_LABELS.other;

  // ─── JSON-LD Structured Data ─────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `Savvy ${verticalInfo.title}`,
    description: `AI-powered ${verticalInfo.category.toLowerCase()} assistant. Get expert advice on ${verticalInfo.desc}.`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: {
      "@type": "Organization",
      name: "Savvy",
      url: "https://rightprice.site",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What can the AI assistant help with?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Our AI assistant can help with ${verticalInfo.desc}. Ask any question and get instant, expert-level answers.`,
        },
      },
      {
        "@type": "Question",
        name: "Is this a real AI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes — our assistant is powered by OpenAI's GPT-4o-mini model. It provides real, thoughtful responses based on your specific questions.`,
        },
      },
      {
        "@type": "Question",
        name: "Is the AI assistant free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No signup, no account, no credit card required. Just ask your question and get an answer.",
        },
      },
      {
        "@type": "Question",
        name: "Is my conversation private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your messages are sent to our AI API for processing and are not stored. No conversation history is saved after you close the page.",
        },
      },
    ],
  };

  // ─── Generic use-case content ────────────────────────────────────
  const useCases = getGenericUseCases(vertical, verticalInfo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900">
      {/* Tracking pixels */}
      <TrackingPixels 
        offerId={offer.id}
        impressionPixelUrl={offer.impressionPixelUrl}
        clickPixelUrl={offer.clickPixelUrl}
        conversionPixelUrl={offer.conversionPixelUrl}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              Savvy
            </span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <a
              href="/about"
              className="hover:text-purple-600 transition-colors"
            >
              About
            </a>
            <a
              href="/privacy-policy"
              className="hover:text-purple-600 transition-colors"
            >
              Privacy
            </a>
            <a
              href="/contact"
              className="hover:text-purple-600 transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-16 md:pt-16 md:pb-20">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">🤖</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {verticalInfo.title} — Instant Expert Advice
            </h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            Ask our AI assistant anything about {verticalInfo.desc}. Get
            instant, expert-level answers — no signup, completely free.
          </p>
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 60"
          fill="none"
        >
          <path
            d="M0 60L48 53.3C96 46.7 192 33.3 288 30C384 26.7 480 33.3 576 36.7C672 40 768 40 864 36.7C960 33.3 1056 26.7 1152 25C1248 23.3 1344 26.7 1392 28.3L1440 30V60H0Z"
            fill="rgb(248 250 252)"
          />
        </svg>
      </div>

      {/* ─── Disclosure ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 mb-6">
        <div className="bg-amber-50/80 backdrop-blur rounded-xl px-5 py-3 text-xs text-amber-700 border border-amber-200/60 shadow-sm">
          <strong>Disclosure:</strong> This page may contain affiliate links.
          We may earn a commission at no extra cost to you. All tools and
          opinions are independent.{" "}
          <a href="/about" className="underline hover:text-amber-900">
            Learn more
          </a>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* ─── AI Assistant Micro-App (FIRST after headline) ─── */}
        <div className="mb-12">
          <AIAssistant
            brandName={brandName}
            trackingHref={trackingHref}
            brandDomain={brandDomain}
            vertical={vertical}
          />
        </div>

        {/* ─── Feature Highlights ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: "⚡",
              title: "Instant Expert Answers",
              desc: "Get detailed, expert-level responses in seconds — no waiting, no appointments needed",
            },
            {
              icon: "🧠",
              title: "Industry-Aware AI",
              desc: `Our AI understands the ${verticalInfo.category.toLowerCase()} industry to give you relevant, actionable advice`,
            },
            {
              icon: "🔍",
              title: `${verticalInfo.category} Insights`,
              desc: `Deep knowledge of ${verticalInfo.desc} to help you make informed decisions`,
            },
            {
              icon: "💬",
              title: "Real Conversations",
              desc: "Ask follow-up questions, dig deeper, and explore topics naturally with our AI",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── What Can the AI Help With ─── */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What Can the AI Assistant Help With?
            </h2>
            <div className="prose prose-sm prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Our AI assistant is designed to help you make smarter decisions
                in the {verticalInfo.category.toLowerCase()} space. Whether
                you&apos;re comparing options, researching features, or trying
                to understand pricing, the AI provides instant, expert-level
                answers tailored to your specific questions.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Unlike generic chatbots, our assistant understands the{" "}
                {verticalInfo.category.toLowerCase()} industry and can provide
                nuanced advice about {verticalInfo.desc}. It&apos;s powered by
                OpenAI&apos;s GPT-4o-mini model — the same technology behind
                leading AI products.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Think of it as having a knowledgeable{" "}
                {verticalInfo.category.toLowerCase()} expert available 24/7.
                Ask anything, compare alternatives, or get advice on how to get
                the best value — all for free, with no signup required.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Use Cases ─── */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular Questions to Ask
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200/70 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{uc.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {uc.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {uc.text}
                    </p>
                    <p className="text-xs text-purple-600 font-medium">
                      Try asking: &ldquo;{uc.example}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How the AI Assistant Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Ask Your Question
                </h3>
                <p className="text-sm text-gray-500">
                  Type any question about{" "}
                  {verticalInfo.category.toLowerCase()} topics. Our AI
                  understands natural language — just ask like you&apos;d ask
                  a friend.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-pink-600">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Get Expert Answers
                </h3>
                <p className="text-sm text-gray-500">
                  The AI processes your question and provides detailed,
                  expert-level guidance.
                  {vertical === "travel"
                    ? " It can even search real flight prices for you."
                    : ""}{" "}
                  Ask follow-ups to dig deeper.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-fuchsia-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-fuchsia-600">
                    3
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Take Action</h3>
                <p className="text-sm text-gray-500">
                  When you&apos;re ready, click through to act on the advice.
                  Whether it&apos;s booking, purchasing, or signing up —
                  everything is handled securely on the partner platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "What can the AI assistant help with?",
                a: `Our AI assistant can help with ${verticalInfo.desc}. Ask any question and get instant, expert-level answers. It's like having a knowledgeable ${verticalInfo.category.toLowerCase()} advisor available 24/7.`,
              },
              {
                q: "Is this a real AI or canned responses?",
                a: "This is a real AI powered by OpenAI's GPT-4o-mini model. Every response is generated uniquely based on your specific question. No canned answers — just real, thoughtful guidance.",
              },
              {
                q: "Is the AI assistant free?",
                a: "Yes, completely free. No signup, no account, no credit card required. Just type your question and get an instant answer.",
              },
              {
                q: "How accurate is the advice?",
                a: `Our AI provides helpful guidance based on its training data${vertical === "travel" ? " and real-time flight search tools" : ""}. For important decisions, we always recommend verifying details before committing.`,
              },
              {
                q: "Is my conversation private?",
                a: "Your messages are processed by our AI API and are not stored. No conversation history is saved after you close the page. We take your privacy seriously.",
              },
            ].map((faq, i) => (
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ─── Bottom CTA (only place brand name appears) ─── */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
          <div className="relative px-8 py-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              You&apos;ve done the research. Take the next step.
            </p>
            <a
              href={trackingHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
              rel="nofollow sponsored"
            >
              Visit {brandName}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
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
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="font-bold text-gray-900">Savvy</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                AI-powered research tools to help you make smarter decisions.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Tools
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a
                    href={`/search/${slug}/flights`}
                    className="hover:text-purple-600 transition-colors"
                  >
                    Flight Search
                  </a>
                </li>
                <li>
                  <a
                    href={`/search/${slug}/assistant`}
                    className="hover:text-purple-600 transition-colors"
                  >
                    AI Assistant
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Company
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a
                    href="/about"
                    className="hover:text-purple-600 transition-colors"
                  >
                    About Savvy
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Legal
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a
                    href="/terms"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy-policy"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Savvy. Independent research tool.
            </p>
            <p className="text-[10px] text-gray-300">
              This page may contain affiliate links. See our{" "}
              <a href="/terms" className="underline">
                terms
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Generic use-case content (NO brand names) ─────────────────────
function getGenericUseCases(
  vertical: string,
  verticalInfo: { title: string; category: string; desc: string }
) {
  const travel = [
    {
      icon: "✈️",
      title: "Compare Flight Prices",
      text: "Ask the AI to search real-time flight prices between any two cities. It pulls live data and shows actual prices with airlines, stops, and durations.",
      example: "Find me cheap flights from New York to London next month",
    },
    {
      icon: "💰",
      title: "Find the Best Travel Deals",
      text: "Get tips on when to book, which days are cheapest, and how to find hidden deals. The AI knows pricing patterns across seasons and routes.",
      example: "When is the cheapest time to fly to Europe?",
    },
    {
      icon: "🗺️",
      title: "Destination Research",
      text: "Planning a trip? Ask about visa requirements, best times to visit, local tips, and budget estimates for any destination worldwide.",
      example: "What should I know before traveling to Japan for 2 weeks?",
    },
    {
      icon: "🧳",
      title: "Travel Tips & Advice",
      text: "From packing lists to airport hacks, the AI shares practical travel wisdom. Ask about luggage policies, transit tips, or how to maximize your trip.",
      example: "How do I find the best connecting flights for long-haul travel?",
    },
  ];

  const finance = [
    {
      icon: "🏦",
      title: "Loan & Mortgage Advice",
      text: "Ask about interest rates, loan types, repayment strategies, and how to get the best deal. The AI understands financial products and can help you compare.",
      example: "What's the difference between fixed and variable mortgage rates?",
    },
    {
      icon: "📊",
      title: "Financial Planning",
      text: "Get advice on budgeting, savings strategies, and financial goals. The AI can help you understand how different products fit your financial plan.",
      example: "How much should I put down on a mortgage?",
    },
    {
      icon: "💳",
      title: "Credit & Debt Management",
      text: "Understand credit scores, debt consolidation, and how to improve your financial health before applying for loans or credit.",
      example: "What credit score do I need for the best loan rates?",
    },
    {
      icon: "🔍",
      title: "Product Comparisons",
      text: "Compare financial products and services. The AI gives you an unbiased breakdown of features, fees, and value across providers.",
      example: "How do I compare personal loan offers from different lenders?",
    },
  ];

  const generic = [
    {
      icon: "🔍",
      title: "Research & Compare",
      text: "Ask anything about products and services in this category — features, pricing, pros and cons. The AI provides detailed, balanced information.",
      example: "What are the most important features to look for?",
    },
    {
      icon: "⚖️",
      title: "Compare Alternatives",
      text: "Not sure which option is best? Ask the AI to compare alternatives on features, pricing, and value so you can make an informed decision.",
      example: "How do the top options compare to each other?",
    },
    {
      icon: "💡",
      title: "Getting Started Guide",
      text: "New to this space? Ask the AI for a step-by-step guide on how to get started, what to expect, and tips for getting the most value.",
      example: "What's the best way to get started as a beginner?",
    },
    {
      icon: "💰",
      title: "Pricing & Value Analysis",
      text: "Understand pricing models, hidden fees, and whether different options offer good value for your specific needs and budget.",
      example: "Is this worth the price? What's typically included?",
    },
  ];

  switch (vertical) {
    case "travel":
      return travel;
    case "finance":
      return finance;
    default:
      return generic;
  }
}
