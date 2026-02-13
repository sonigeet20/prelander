import { notFound } from "next/navigation";
import { listCampaigns } from "@/lib/campaigns";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { PopunderButton } from "@/components/PopunderButton";
import { AutoTriggerLogic } from "@/components/AutoTriggerLogic";
import type { BrandFactPack } from "@/lib/ai-research";
import { createSpinner } from "@/lib/content-spin";

export const dynamic = "force-dynamic";

// Helper to find campaign from both JSON store and Prisma DB
async function findCampaignBySlug(offer: string) {
  // Try Prisma DB first (primary data source — has brandName, brandImageUrl)
  const dbCampaigns = await prisma.campaign.findMany();
  const dbMatch = dbCampaigns.find((item) => {
    const slug = slugify(item.offerName, 32);
    return slug === offer || item.subdomain === offer;
  });
  if (dbMatch) {
    return {
      ...dbMatch,
      metadata: dbMatch.metadata as any,
    };
  }

  // Fallback: Try JSON store (legacy)
  const jsonCampaigns = await listCampaigns();
  const jsonMatch = jsonCampaigns.find((item) => {
    const slug = slugify(item.offerName, 32);
    return slug === offer || item.subdomain === offer;
  });
  if (jsonMatch) return jsonMatch;

  return null;
}

interface OfferPageProps {
  params: Promise<{ offer: string; cluster: string }>;
}

export async function generateMetadata({ params }: OfferPageProps) {
  const { offer, cluster } = await params;
  const campaign = await findCampaignBySlug(offer);

  if (!campaign) {
    return { title: "Not Found" };
  }

  const factPack = campaign.metadata?.brandFactPack as BrandFactPack | undefined;
  const campaignBrandName = (campaign as Record<string, any>).brandName as string | undefined;
  const hostBrand = (() => {
    try {
      const h = new URL(campaign.destinationUrl).hostname.replace(/^www\./i, "").split(".")[0];
      return h.charAt(0).toUpperCase() + h.slice(1);
    } catch { return ""; }
  })();
  const brandName = (campaignBrandName && campaignBrandName.trim())
    ? campaignBrandName.trim()
    : (factPack?.brandName && factPack.brandName !== "Brand")
      ? factPack.brandName
      : hostBrand || campaign.offerName;
  const clusterTitle = cluster.replace(/-/g, " ");
  const travelKeywords = ["travel", "tourism", "flight", "airline", "hotel", "booking", "trip", "vacation", "hostel"];
  const isTravel = travelKeywords.some(k => (factPack?.category || "").toLowerCase().includes(k));
  const title = isTravel
    ? `How to Find Cheap Flights on ${brandName} (${new Date().getFullYear()} Guide) — Tips, Deals & Timing`
    : `How to Get the Best Deal on ${brandName} (${new Date().getFullYear()} Guide) — Tips, Pricing & Comparison`;
  const description = isTravel
    ? `Step-by-step guide to finding cheap flights on ${brandName}. Learn when to book, how to set price alerts, compare fares, and save money on airline tickets in ${new Date().getFullYear()}.`
    : `Complete guide to getting the best value from ${brandName}. Money-saving tips, step-by-step setup, competitor comparison, and honest pros & cons.`;
  const keywords = isTravel
    ? [
        `${brandName} review`,
        `${brandName} cheap flights`,
        `${brandName} airline tickets`,
        `${brandName} flight search`,
        `${brandName} price alerts`,
        "cheap flights",
        "airline ticket deals",
      ]
    : [
        `${brandName} review`,
        `${brandName} pricing`,
        `${brandName} features`,
        `${brandName} pros and cons`,
      ];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const canonical = `${baseUrl}/offer/${offer}/${cluster}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      images: [
        {
          url: isTravel
            ? "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80"
            : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 630,
          alt: `${brandName} review hero image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        isTravel
          ? "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80"
          : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
      ],
    },
  };
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { offer, cluster } = await params;
  const campaign = await findCampaignBySlug(offer);

  if (!campaign) {
    notFound();
  }

  const clickHref = `/click/${offer}/${cluster}`;
  const popunderUrl = campaign.trackingUrls[0] ?? campaign.destinationUrl;
  const clusterTitle = cluster.replace(/-/g, " ");

  // Get brand fact pack from research
  const factPack = campaign.metadata?.brandFactPack as BrandFactPack | undefined;
  const campaignBrandName = (campaign as Record<string, any>).brandName as string | undefined;
  const hostBrand = (() => {
    try {
      const h = new URL(campaign.destinationUrl).hostname.replace(/^www\./i, "").split(".")[0];
      return h.charAt(0).toUpperCase() + h.slice(1);
    } catch { return ""; }
  })();
  // Priority: campaign.brandName > factPack.brandName (if not generic) > hostname > offerName
  const brandName = (campaignBrandName && campaignBrandName.trim())
    ? campaignBrandName.trim()
    : (factPack?.brandName && factPack.brandName !== "Brand")
      ? factPack.brandName
      : hostBrand || campaign.offerName;
  const tagline = factPack?.tagline || campaign.description;
  const category = factPack?.category || "Service Provider";
  const pros = factPack?.pros || ["Easy to use", "Reliable service", "Good value"];
  const cons = factPack?.cons || ["May require setup", "Limited support hours"];
  const editorialScore = factPack?.editorialScore || 8.0;
  const bestFor = factPack?.bestFor || "Users seeking quality service";
  const features = factPack?.features || [];
  const benefits = factPack?.keyBenefits || [];
  const faqs = factPack?.faqItems || [];
  const testimonials = factPack?.testimonials || [];
  const pricingInfo = factPack?.pricingInfo;
  const travelKw = ['travel','tourism','flight','airline','hotel','booking','trip','vacation','hostel'];
  const isTravel = travelKw.some(k => category.toLowerCase().includes(k));
  const keywordPhrases = isTravel
    ? [
        `${brandName} flights`,
        `${brandName} cheap flights`,
        `${brandName} flight search`,
        `${brandName} airline tickets`,
        `${brandName} price alerts`,
      ]
    : [
        `${brandName} review`,
        `${brandName} features`,
        `${brandName} pricing`,
        `${brandName} pros and cons`,
      ];
  const highlights = benefits.length > 0
    ? benefits
    : features.length > 0
      ? features
      : keywordPhrases;
  const normalizePhrase = (phrase: string) =>
    phrase.toLowerCase().includes(brandName.toLowerCase())
      ? phrase
      : `${brandName} ${phrase}`;
  const brandedHighlights = highlights.map(normalizePhrase);
  const brandedFeatures = features.map(normalizePhrase);
  const brandedBenefits = benefits.map(normalizePhrase);
  const brandedPros = pros.map(normalizePhrase);
  const brandedCons = cons.map(normalizePhrase);

  // Hostname-based color palettes for when research didn't return brandColors
  const hostnameColorPresets: Record<string, { primary: string; secondary: string; accent: string; soft: string }> = {
    "skyscanner.co.in": { primary: "#00A1DE", secondary: "#0B1F2A", accent: "#FF6B00", soft: "#E6F6FD" },
    "skyscanner.com": { primary: "#00A1DE", secondary: "#0B1F2A", accent: "#FF6B00", soft: "#E6F6FD" },
    "mcafee.com": { primary: "#C01818", secondary: "#1A1A1A", accent: "#E8292E", soft: "#FDEAEA" },
    "norton.com": { primary: "#FFCC00", secondary: "#1A1A1A", accent: "#006B3F", soft: "#FFFDE6" },
    "nordvpn.com": { primary: "#4687FF", secondary: "#0D1117", accent: "#6BF178", soft: "#E8F0FF" },
    "kaspersky.com": { primary: "#006D5C", secondary: "#003C30", accent: "#7BC143", soft: "#E6F5F2" },
    "bitdefender.com": { primary: "#ED1C24", secondary: "#1A1A1A", accent: "#00A1DE", soft: "#FDEAEA" },
    "expressvpn.com": { primary: "#DA3940", secondary: "#1A1A1A", accent: "#4DBA6D", soft: "#FDEBEC" },
    "kayak.com": { primary: "#FF690F", secondary: "#1A1A1A", accent: "#00AEEF", soft: "#FFF1E8" },
    "booking.com": { primary: "#003580", secondary: "#001B3A", accent: "#FDBB02", soft: "#E6EEF9" },
  };

  const destHost = (() => {
    try {
      return new URL(campaign.destinationUrl).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  })();

  const brandPalette = factPack?.brandColors || hostnameColorPresets[destHost] || {
    primary: "#4F46E5",
    secondary: "#0F172A",
    accent: "#10B981",
    soft: "#EEF2FF",
  };

  const brandHost = (() => {
    try {
      return new URL(popunderUrl).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  })();
  const faviconUrl = brandHost
    ? `https://www.google.com/s2/favicons?domain=${brandHost}&sz=128`
    : "";

  const currentDate = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  // Content spinning engine — produces unique wording per brand
  const spin = createSpinner({
    brandName,
    category,
    bestFor,
    tagline: tagline || "",
    cluster,
    isTravel,
    pricingInfo,
  });

  // Rich content from GPT (new fields)
  const detailedReview = factPack?.detailedReview || [];
  const historyBlurb = factPack?.historyBlurb || "";
  const comparisonNotes = factPack?.comparisonNotes || "";
  const featureDescriptions = factPack?.featureDescriptions || [];
  const savingTips = factPack?.savingTips || [];
  const gettingStartedSteps = factPack?.gettingStartedSteps || [];
  const alternativesComparison = factPack?.alternativesComparison || [];
  const seasonalAdvice = factPack?.seasonalAdvice || "";

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={
        {
          "--brand-primary": brandPalette.primary,
          "--brand-secondary": brandPalette.secondary,
          "--brand-accent": brandPalette.accent,
          "--brand-soft": brandPalette.soft,
        } as React.CSSProperties
      }
    >
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: {
              "@type": "Product",
              name: brandName,
              description: tagline,
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: editorialScore,
              bestRating: 10,
            },
            author: {
              "@type": "Organization",
              name: "Editorial Team",
            },
          }),
        }}
      />

      {/* Auto-trigger / auto-redirect logic (invisible – no UI) */}
      <AutoTriggerLogic
        campaignId={campaign.id}
        cluster={cluster}
        autoTriggerOnInaction={campaign.autoTriggerOnInaction ?? false}
        autoTriggerDelay={campaign.autoTriggerDelay ?? 3000}
        autoRedirectDelay={campaign.autoRedirectDelay ?? 0}
        destinationUrl={popunderUrl}
        popunderEnabled={campaign.popunderEnabled ?? false}
        silentFetchEnabled={campaign.silentFetchEnabled ?? false}
        trackingUrls={campaign.trackingUrls ?? []}
      />

      {/* Header */}
      <header style={{ backgroundColor: brandPalette.primary }}>
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-white/90 font-semibold">{category}</div>
            <div className="text-sm text-white/80">{currentDate}</div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Affiliate Disclosure */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-800">
          <strong>Disclosure:</strong> This page contains affiliate links. If you click through and make a purchase, we may earn a commission at no additional cost to you. Our opinions remain our own and are not influenced by advertisers. <a href="/about" className="underline">Learn more about how we review</a>.
        </div>

        {/* Title & Meta */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold">
              Editorial Review
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
              Updated {currentDate}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isTravel
              ? `How to Find Cheap Flights on ${brandName} (${new Date().getFullYear()} Guide)`
              : `How to Get the Best Deal on ${brandName} (${new Date().getFullYear()} Guide)`}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {isTravel
              ? `A practical guide to saving money on flights using ${brandName}. We cover booking strategies, timing tips, price alerts, and how ${brandName} compares to alternatives — so you can make an informed decision before you book.`
              : `Everything you need to know about ${brandName} before you buy. We break down the best strategies for getting value, how to get started, and how it stacks up against the competition.`}
          </p>

          {/* ─── Quick Answer Box ─── */}
          <div className="rounded-xl border-2 p-5 mb-6" style={{ borderColor: brandPalette.primary, backgroundColor: brandPalette.soft }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: brandPalette.primary }}>Quick Answer</div>
            <p className="text-gray-900 font-medium leading-relaxed">
              {isTravel
                ? `Yes, ${brandName} is a legitimate flight comparison tool used by millions of travelers. The best way to save money on ${brandName} is to use flexible date search, set up price alerts for your route, and book 6\u20138 weeks before domestic flights or 2\u20133 months before international trips. Always verify the final price on the airline\u2019s website before booking.`
                : `${brandName} offers ${pricingInfo || "competitive pricing"} in the ${category.toLowerCase()} market. To get the best deal, compare plans carefully, look for seasonal promotions, and take advantage of any free trial before committing. See our step-by-step guide and money-saving tips below.`}
            </p>
          </div>

          {/* ─── Table of Contents ─── */}
          <nav className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
            <div className="text-sm font-bold text-gray-900 mb-3">In This Guide</div>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 list-decimal list-inside">
              <li><a href="#saving-tips" className="hover:text-gray-900 hover:underline">{isTravel ? "How to Find the Cheapest Flights" : "Money-Saving Tips"}</a></li>
              <li><a href="#getting-started" className="hover:text-gray-900 hover:underline">Step-by-Step Setup Guide</a></li>
              <li><a href="#best-time" className="hover:text-gray-900 hover:underline">Best Time to {isTravel ? "Book" : "Buy"}</a></li>
              <li><a href="#comparison" className="hover:text-gray-900 hover:underline">{brandName} vs. Alternatives</a></li>
              <li><a href="#checklist" className="hover:text-gray-900 hover:underline">{isTravel ? "Booking" : "Buyer\u2019s"} Checklist</a></li>
              <li><a href="#pros-cons" className="hover:text-gray-900 hover:underline">Pros &amp; Cons</a></li>
              <li><a href="#features" className="hover:text-gray-900 hover:underline">Features Breakdown</a></li>
              <li><a href="#faq" className="hover:text-gray-900 hover:underline">FAQ</a></li>
            </ol>
          </nav>

          {/* Hero Visual */}
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt={`${brandName} logo`}
                    className="h-12 w-12 rounded-xl border border-gray-200 bg-white"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-xl"
                    style={{ background: brandPalette.primary }}
                  />
                )}
                <div>
                  <div className="text-sm uppercase tracking-wide text-gray-500">Brand Snapshot</div>
                  <div className="text-lg font-semibold text-gray-900">{brandName} overview</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-[color:var(--brand-soft)] p-4">
                  <div className="text-xs text-gray-500">Our assessment</div>
                  <div className="text-2xl font-bold text-[color:var(--brand-primary)]">{editorialScore}/10</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Best for</div>
                  <div className="text-sm font-semibold text-gray-900">{bestFor}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Category</div>
                  <div className="text-sm font-semibold text-gray-900">{category}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm aspect-[16/10]">
              <img
                src={(() => {
                  // Priority: campaign.brandImageUrl > factPack.heroImageUrl > category-specific stock
                  if ((campaign as any).brandImageUrl && (campaign as any).brandImageUrl.trim())
                    return (campaign as any).brandImageUrl.trim();
                  if (factPack?.heroImageUrl && factPack.heroImageUrl.startsWith('http'))
                    return factPack.heroImageUrl;
                  const cat = category.toLowerCase();
                  if (['travel','tourism','flight','airline','hotel','booking','trip','vacation','hostel'].some(k => cat.includes(k)))
                    return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('security') || cat.includes('cyber') || cat.includes('antivirus'))
                    return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('finance') || cat.includes('banking'))
                    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('software') || cat.includes('technology'))
                    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('education'))
                    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('health') || cat.includes('wellness'))
                    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('e-commerce') || cat.includes('shop'))
                    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('food') || cat.includes('dining'))
                    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
                  if (cat.includes('hosting') || cat.includes('web'))
                    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80';
                  return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80';
                })()}
                alt={`${brandName} - ${category}`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════
            USER-INTENT CONTENT (above fold — this is what Google wants)
            ═══════════════════════════════════════════════════════ */}

        {/* ─── #1: How to Save / Get the Best Deal ─── */}
        <section id="saving-tips" className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-2" style={{ color: brandPalette.secondary }}>
            {isTravel ? `How to Find the Cheapest Flights on ${brandName}` : `${savingTips.length} Ways to Save Money on ${brandName}`}
          </h2>
          <p className="text-gray-600 mb-6">{spin.dealIntroParagraph()}</p>

          {savingTips.length > 0 ? (
            <div className="space-y-4">
              {savingTips.map((tip, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 rounded-lg" style={{ backgroundColor: idx % 2 === 0 ? brandPalette.soft : "#f9fafb" }}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandPalette.primary }}>
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(isTravel ? [
                `Use ${brandName}\u2019s \u201cWhole Month\u201d or flexible date view to spot the cheapest travel days at a glance.`,
                `Set up price alerts for your desired route \u2014 ${brandName} will email you when fares drop significantly.`,
                `Search for nearby airports, not just your closest one. A short drive can save hundreds on airfare.`,
                `Book domestic flights 4\u20138 weeks in advance and international flights 2\u20133 months ahead for the best prices.`,
                `Avoid booking on weekends if possible. Tuesday and Wednesday flights tend to be cheaper on most routes.`,
              ] : [
                `Always check for a free trial before committing to a paid plan on ${brandName}.`,
                `Compare the feature lists across ${brandName}\u2019s pricing tiers \u2014 the mid-tier plan often offers the best value.`,
                `Look for bundle deals or annual subscriptions, which are typically 20\u201340% cheaper than monthly billing.`,
                `Check for student, military, or nonprofit discounts that ${brandName} may offer but not prominently advertise.`,
                `Time your purchase around major sale events (Black Friday, back-to-school) for the deepest discounts.`,
              ]).map((tip, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 rounded-lg" style={{ backgroundColor: idx % 2 === 0 ? brandPalette.soft : "#f9fafb" }}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandPalette.primary }}>
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── #2: Step-by-Step Getting Started Guide ─── */}
        <section id="getting-started" className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-2" style={{ color: brandPalette.secondary }}>
            How to Use {brandName}: Step-by-Step Guide
          </h2>
          <p className="text-gray-600 mb-6">{spin.guideIntroParagraph()}</p>

          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" style={{ marginLeft: "15px" }} />
            <div className="space-y-6">
              {(gettingStartedSteps.length > 0 ? gettingStartedSteps : (isTravel ? [
                `Go to ${brandName}\u2019s website or download the mobile app. You can search without creating an account.`,
                `Enter your departure city, destination, and travel dates. Use the \u201cFlexible dates\u201d option if your schedule allows.`,
                `Review the results page. ${brandName} shows prices from multiple airlines and booking sites side by side.`,
                `Use filters to narrow results by number of stops, departure time, airline, or price range.`,
                `Click on the fare you want. ${brandName} will redirect you to the airline or booking site to complete payment.`,
                `Set a price alert for your route if prices are higher than expected \u2014 fares often drop before your travel date.`,
              ] : [
                `Visit the official ${brandName} website and explore the available plans and pricing.`,
                `Sign up for a free account or trial to test the core features before buying.`,
                `Configure your preferences and complete the initial setup wizard.`,
                `Explore the dashboard and familiarize yourself with key features.`,
                `Upgrade to a paid plan once you are confident ${brandName} meets your needs.`,
              ])).map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start relative">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold z-10" style={{ backgroundColor: brandPalette.primary }}>
                    {idx + 1}
                  </div>
                  <div className="pt-1">
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── #3: Best Time to Book/Buy ─── */}
        <section id="best-time" className="rounded-lg p-6 mb-8 border-l-4" style={{ borderColor: brandPalette.accent, backgroundColor: brandPalette.soft }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: brandPalette.secondary }}>
            Best Time to {isTravel ? "Book Flights" : "Buy"} on {brandName}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            {spin.timingIntroParagraph()}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {seasonalAdvice || (isTravel
              ? `For domestic flights, the sweet spot is typically 4\u20136 weeks before departure. International flights tend to be cheapest 2\u20134 months out. January and September are generally the cheapest months to fly in most markets. Avoid booking during peak holiday periods (Christmas, Easter, summer school breaks) unless you use ${brandName}\u2019s price alert feature to catch flash sales.`
              : `The best time to purchase ${brandName} is during annual sales events like Black Friday or end-of-year promotions. If you are on a monthly plan, switching to annual billing often saves 20\u201330%. Watch for seasonal promotions announced on ${brandName}\u2019s website or social media channels.`)}
          </p>
        </section>

        {/* ─── #4: Alternatives Comparison Table ─── */}
        <section id="comparison" className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-2" style={{ color: brandPalette.secondary }}>
            {brandName} vs. Alternatives: Which Is Best for You?
          </h2>
          <p className="text-gray-600 mb-6">{spin.alternativesIntroParagraph()}</p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2" style={{ borderColor: brandPalette.primary }}>
                  <th className="text-left p-3 font-semibold text-gray-900">{isTravel ? "Platform" : "Service"}</th>
                  <th className="text-left p-3 font-semibold text-green-700">Their Strength</th>
                  <th className="text-left p-3 font-semibold" style={{ color: brandPalette.primary }}>Where {brandName} Wins</th>
                </tr>
              </thead>
              <tbody>
                {(alternativesComparison.length > 0 ? alternativesComparison : (isTravel ? [
                  { name: "Google Flights", advantage: "Deep integration with Google search and calendar", disadvantage: `${brandName} covers more booking sites and OTAs in a single search` },
                  { name: "Kayak", advantage: "Strong hotel and car rental bundling", disadvantage: `${brandName} has more flexible date search options` },
                  { name: "Momondo", advantage: "Good for finding hidden budget airlines", disadvantage: `${brandName} has a larger user base and more price alert features` },
                ] : [
                  { name: "Competitor A", advantage: "More features at higher price points", disadvantage: `${brandName} offers better value at entry-level tiers` },
                  { name: "Competitor B", advantage: "Stronger mobile experience", disadvantage: `${brandName} has more comprehensive desktop tooling` },
                  { name: "Competitor C", advantage: "Free tier available", disadvantage: `${brandName} offers better customer support and documentation` },
                ])).map((alt, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="p-3 font-semibold text-gray-900">{alt.name}</td>
                    <td className="p-3 text-gray-700">{alt.advantage}</td>
                    <td className="p-3 text-gray-700">{alt.disadvantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 italic mt-4">
            Comparison based on publicly available information. Features and pricing change frequently — verify directly with each provider.
          </p>
        </section>

        {/* ─── #5: Pre-Purchase Checklist ─── */}
        <section id="checklist" className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>
            {isTravel ? "Booking" : "Buyer\u2019s"} Checklist: Before You {isTravel ? "Book on " + brandName : "Buy " + brandName}
          </h2>
          <p className="text-gray-600 mb-4">
            Run through this checklist before committing. These steps can save you time, money, and potential headaches.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {(isTravel ? [
              { label: "Compare prices on at least 2\u20133 platforms", detail: "Cross-reference with Google Flights and direct airline sites before booking." },
              { label: "Try flexible date search", detail: `${brandName}\u2019s flexible dates view often reveals fares that are significantly cheaper just a day or two away.` },
              { label: "Read the fare terms carefully", detail: "Some of the cheapest fares are non-refundable or charge extra for changes and baggage." },
              { label: "Set up a price alert for your route", detail: `If your travel dates are not fixed, let ${brandName} notify you when fares drop.` },
              { label: "Verify the final price on the booking site", detail: "Aggregator prices can occasionally differ from the actual booking price after taxes and fees." },
              { label: "Factor in total cost (bags, seats, meals)", detail: "The headline fare may not include checked luggage or seat selection \u2014 add those costs to compare fairly." },
            ] : [
              { label: "Identify which features you actually need", detail: `Match your needs to the ${brandName} plan that fits best \u2014 don\u2019t overpay for features you won\u2019t use.` },
              { label: "Check for a free trial or money-back guarantee", detail: `Test ${brandName} hands-on before committing to a long-term plan.` },
              { label: "Compare at least 2\u20133 alternatives", detail: "See our comparison table above to weigh your options side by side." },
              { label: "Read the cancellation and refund policy", detail: "Know exactly what happens if you change your mind after purchasing." },
              { label: "Look for seasonal promotions or discount codes", detail: `${brandName} may offer deals during major sales events \u2014 check before you buy at full price.` },
              { label: "Verify current pricing on the official website", detail: "Prices shown in guides and reviews may not reflect the very latest offers." },
            ]).map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5" style={{ borderColor: brandPalette.primary }} />
                <div>
                  <div className="font-semibold text-sm text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            EDITORIAL CONTEXT (supporting content — below fold)
            ═══════════════════════════════════════════════════════ */}

        {/* At a Glance Box */}
        <div className="bg-gradient-to-br p-6 mb-8 rounded-r-lg" style={{ backgroundColor: brandPalette.soft, borderLeftColor: brandPalette.primary, borderLeftWidth: 4 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{brandName} at a Glance</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Our Assessment</div>
              <div className="text-3xl font-bold" style={{ color: brandPalette.primary }}>{editorialScore}/10</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Best For</div>
              <div className="text-gray-900">{bestFor}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            {pricingInfo && (
              <div>
                <span className="font-semibold text-gray-700">Price:</span>{" "}
                <span className="text-gray-900">{pricingInfo}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">Category:</span>{" "}
              <span className="text-gray-900">{category}</span>
            </div>
          </div>
        </div>

        {/* In a Nutshell */}
        <section className="bg-gradient-to-br from-white rounded-lg shadow-sm p-6 mb-8" style={{ backgroundColor: brandPalette.soft, borderColor: brandPalette.accent, borderWidth: 1 }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>In a Nutshell: What Is {brandName}?</h2>
          {/* Spun intro paragraphs — unique per brand */}
          {spin.introBlock().map((para, i) => (
            <p key={`intro-${i}`} className="text-gray-700 leading-relaxed mb-4">{para}</p>
          ))}
          <p className="text-gray-600 leading-relaxed text-sm">
            <em>Note: The information in this review is based on publicly available data and our editorial team&apos;s independent analysis. Individual results may vary. Please visit the official {brandName} website for the most up-to-date information.</em>
          </p>
        </section>

        {/* Detailed Review — GPT-generated long-form content */}
        {detailedReview.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>{brandName}: A Closer Look</h2>
            {detailedReview.map((para, i) => (
              <p key={`review-${i}`} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}
            {/* Spun comparison paragraph */}
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">How Does {brandName} Compare?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {comparisonNotes || spin.comparisonParagraph()}
            </p>
            {/* Spun pricing discussion */}
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Pricing and Value</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {spin.pricingParagraph()}
            </p>
            {/* Spun drawback transparency */}
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Where It Falls Short</h3>
            <p className="text-gray-700 leading-relaxed">
              {spin.drawbackParagraph()}
            </p>
          </section>
        )}

        {/* Brand Background / History */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>Background: The Story Behind {brandName}</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {historyBlurb || spin.historyParagraph()}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {spin.transition(0)}, {brandName} continues to iterate on its {category.toLowerCase()} {isTravel ? "platform" : "offering"}, responding to both user feedback and shifts in the competitive landscape. {spin.hedge(0)} this willingness to evolve is a positive signal for prospective users evaluating {brandName} as a long-term solution.
          </p>
        </section>

        {/* How We Review - Methodology */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>How We Evaluated {brandName}</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {spin.methodologyParagraph()}
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-2">Features &amp; Functionality</div>
              <p className="text-xs text-gray-600">We assess the core feature set, ease of use, and how well the product delivers on its promises compared to alternatives in the {category.toLowerCase()} market.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-2">Pricing &amp; Value</div>
              <p className="text-xs text-gray-600">We compare pricing against competitors and evaluate whether the features justify the cost for the target audience: {bestFor.toLowerCase()}.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-2">User Experience</div>
              <p className="text-xs text-gray-600">We consider the overall user experience, including setup complexity, interface design, documentation quality, and customer support availability.</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 italic">
            Our assessment scores reflect editorial opinion, not absolute rankings. We encourage readers to weigh multiple sources and try {brandName} for themselves before making a decision.
          </p>
        </section>

        {/* Pros & Cons */}
        <section id="pros-cons" className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{brandName} Pros & Cons{isTravel ? ' for Cheap Flights' : ''}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pros */}
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">✓</span> Pros
              </h3>
              <ul className="space-y-3">
                {brandedPros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">✗</span> Cons
              </h3>
              <ul className="space-y-3">
                {brandedCons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-red-600 mt-1">✗</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Features & Services — expanded with descriptions */}
        {features.length > 0 && (
          <section id="features" className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-2" style={{ color: brandPalette.secondary }}>
              What Services and Features Does {brandName} Offer?
            </h2>
            <p className="text-gray-600 mb-6">
              {spin.hedge(1)} {brandName} offers a range of tools and capabilities in the {category.toLowerCase()} space. Below is a breakdown of the key features {spin.weFound(0)} most relevant during our review.
            </p>
            
            <div className="space-y-6">
              {brandedFeatures.slice(0, 6).map((feature, idx) => (
                <div key={idx} className="border-l-4 pl-4" style={{ borderColor: idx % 2 === 0 ? brandPalette.primary : brandPalette.accent }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {featureDescriptions[idx]
                      ? featureDescriptions[idx]
                      : `${spin.hedge(idx + 2)} ${brandName} provides ${feature.toLowerCase()} capabilities designed for ${bestFor.toLowerCase()}. ${brandedBenefits[idx] ? `A key benefit here is that ${brandedBenefits[idx].toLowerCase()}.` : `This feature contributes to ${brandName}'s overall value in the ${category.toLowerCase()} market.`}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        {pricingInfo && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing and Value for Money</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <div className="text-lg font-semibold text-gray-900 mb-2">Current Pricing</div>
              <div className="text-3xl font-bold" style={{ color: brandPalette.primary }}>{pricingInfo}</div>
              <p className="text-gray-600 mt-4">
                {spin.pricingParagraph()}
              </p>
            </div>
            <p className="text-xs text-gray-500 italic">
              Pricing information shown here was accurate at the time of our review but may have changed. Visit the official {brandName} website for the most current pricing.
            </p>
          </section>
        )}


        {/* FAQ */}
        {faqs.length > 0 && (
          <section id="faq" className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <span>{faq.question}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-4 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Line */}
        <section className="text-white rounded-lg shadow-lg p-8 mb-8" style={{ background: `linear-gradient(135deg, ${brandPalette.primary}, ${brandPalette.secondary})` }}>
          <h2 className="text-3xl font-bold mb-4">Our Take</h2>
          <p className="text-lg leading-relaxed mb-4">
            {spin.bottomLineParagraph()}
          </p>
          <p className="leading-relaxed mb-4 opacity-90">
            {detailedReview[2] || `${spin.hedge(3)} ${brandName} has carved out a meaningful position in the ${category.toLowerCase()} space. It is not perfect — no product is — but for ${bestFor.toLowerCase()}, the balance of features, pricing, and user experience makes it a credible option that warrants serious consideration.`}
          </p>
          <p className="text-sm leading-relaxed mb-6 opacity-80">
            As with any product, we recommend visiting the official {brandName} website to verify current features and pricing before making a decision. Individual experience may vary.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <PopunderButton
              href={clickHref}
              popunderUrl={popunderUrl}
              className="px-8 py-4 bg-white font-bold rounded-lg hover:bg-gray-100 transition text-lg"
              style={{ color: brandPalette.primary }}
            >
              Visit {brandName} →
            </PopunderButton>
            <span className="text-sm opacity-80">Official website — see current offers</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-200 rounded-lg p-10 mt-10">
          <div className="grid lg:grid-cols-[1.4fr_1fr_1fr] gap-10">
            <div>
              <div className="text-white text-lg font-semibold mb-3">About This Review</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                This review was written by our editorial team based on publicly available information, feature analysis, and independent research. We are not affiliated with {brandName}. Our goal is to help consumers make informed decisions by providing honest, transparent reviews.
              </p>
              <div className="text-xs text-slate-400">Last updated: {currentDate}</div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Pages</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                <li><a href="/about#methodology" className="hover:text-white transition">How We Review</a></li>
                <li>Contact: support@prelander.ai</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Legal</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li><a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms of Use</a></li>
                <li><a href="/about#disclosure" className="hover:text-white transition">Affiliate Disclosure</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-400">
            <strong>Advertising Disclosure:</strong> This site may receive compensation through affiliate links.
            When you click a link and make a purchase, we may earn a commission at no extra cost to you. This does not
            affect our editorial opinions, which are based on independent research. All trademarks belong to their respective owners.
          </div>
          <div className="mt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} Prelander Editorial. All rights reserved. All product names, logos, and brands are property of their respective owners.
          </div>
        </footer>
      </div>
    </div>
  );
}
