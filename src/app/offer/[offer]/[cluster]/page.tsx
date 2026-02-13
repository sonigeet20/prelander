import { notFound } from "next/navigation";
import { listCampaigns } from "@/lib/campaigns";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { PopunderButton } from "@/components/PopunderButton";
import { AutoTriggerLogic } from "@/components/AutoTriggerLogic";
import type { BrandFactPack } from "@/lib/ai-research";

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
    ? `${brandName} Cheap Flights & Airline Tickets Review (2026) - ${clusterTitle}`
    : `${brandName} Review (2026) - ${clusterTitle}`;
  const description = factPack?.tagline 
    ? `${factPack.tagline} Read our expert ${brandName} review covering ${factPack.pros?.length || 3} pros, pricing, features, and user testimonials.`
    : isTravel
      ? `Complete ${brandName} review. Compare ${brandName} cheap flights, airline ticket deals, features, pricing, pros and cons.`
      : `Complete ${brandName} review. Expert analysis of features, pricing, pros and cons.`;
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
      : `${brandName} ${phrase.charAt(0).toLowerCase()}${phrase.slice(1)}`;
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

  const reviewCards = testimonials.length > 0
    ? testimonials.slice(0, 3).map((testimonial) => ({
        author: testimonial.author,
        text: testimonial.text,
        rating: testimonial.rating ?? Math.max(3, Math.round(editorialScore / 2)),
      }))
    : [
        {
          author: "Traveler insight",
          text: brandedPros[0] || `${brandName} is easy to compare and search for deals`,
          rating: Math.max(3, Math.round(editorialScore / 2)),
        },
        {
          author: "Frequent flyer",
          text: brandedPros[1] || `${brandName} offers useful price alerts and deal tracking`,
          rating: Math.max(3, Math.round(editorialScore / 2)),
        },
        {
          author: "Budget trip planner",
          text: brandedCons[0] || `${brandName} may redirect you to booking partners`,
          rating: Math.max(3, Math.round(editorialScore / 2) - 1),
        },
      ];

  const currentDate = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

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
        {/* Title & Meta */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold">
              Editor’s Pick
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
              Updated {currentDate}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isTravel
              ? `${brandName} Cheap Flights & Airline Tickets Review (2026)`
              : `${brandName} Review (2026)`}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {tagline}
            {isTravel && (
              <> Compare {brandName} flight search, airline ticket deals, and travel booking options.</>
            )}
          </p>

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
                  <div className="text-xs text-gray-500">Editorial score</div>
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

          <div className="flex items-center gap-4 mb-6">
            <PopunderButton
              href={clickHref}
              popunderUrl={popunderUrl}
              className="px-6 py-3 text-white font-semibold rounded-lg transition"
              style={{ backgroundColor: brandPalette.primary }}
            >
              Visit Site
            </PopunderButton>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(editorialScore / 2) ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">({editorialScore}/10)</span>
            </div>
          </div>
        </div>

        {/* At a Glance Box */}
        <div className="bg-gradient-to-br p-6 mb-8 rounded-r-lg" style={{ backgroundColor: brandPalette.soft, borderLeftColor: brandPalette.primary, borderLeftWidth: 4 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{brandName} at a Glance</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Editorial Score</div>
              <div className="text-3xl font-bold" style={{ color: brandPalette.primary }}>{editorialScore}</div>
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
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>In a Nutshell: {brandName} {isTravel ? 'Flight Search' : ''}</h2>
          <p className="text-gray-700 leading-relaxed">
            {tagline} {benefits[0] && `With ${benefits[0].toLowerCase()}, `}
            {brandName} is a strong option for {bestFor.toLowerCase()}. We took a closer look at 
            {brandName} features, pricing, and user feedback to bring you this comprehensive review.
          </p>
        </section>

        {/* User Reviews */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold" style={{ color: brandPalette.secondary }}>{brandName} User Reviews</h2>
            <div className="text-sm text-gray-500">Summary of common feedback themes</div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {reviewCards.map((review, index) => (
              <div key={`${review.author}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.rating}/5</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{review.text}</p>
                <div className="text-xs font-semibold text-gray-600">{review.author}</div>
              </div>
            ))}
          </div>
          {testimonials.length === 0 && (
            <p className="text-xs text-gray-500 mt-4">
              Note: These summaries reflect common themes derived from available information and on-page signals.
            </p>
          )}
        </section>

        {/* Highlights */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>
            Why Choose {brandName} for {isTravel ? "Cheap Flights" : category}
          </h2>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
            {brandedHighlights.slice(0, 6).map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-2">
                <span style={{ color: brandPalette.primary }} className="mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Popular Search Terms */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandPalette.secondary }}>Popular {brandName} Search Terms</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-gray-700">
            {keywordPhrases.map((phrase) => (
              <li key={phrase} className="flex items-center gap-2">
                <span style={{ color: brandPalette.primary }}>•</span>
                <span>{phrase}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pros & Cons */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
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

          <div className="mt-8 pt-6 border-t text-center">
            <PopunderButton
              href={clickHref}
              popunderUrl={popunderUrl}
              className="px-8 py-3 text-white font-semibold rounded-lg transition inline-block"
              style={{ backgroundColor: brandPalette.primary }}
            >
              Visit {brandName}
            </PopunderButton>
          </div>
        </section>

        {/* Features & Services */}
        {features.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6" style={{ color: brandPalette.secondary }}>
              What Services and Features Does {brandName} Offer?
            </h2>
            
            <div className="space-y-6">
              {brandedFeatures.slice(0, 4).map((feature, idx) => (
                <div key={idx}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {brandedBenefits[idx] || `${brandName} provides comprehensive ${feature.toLowerCase()} capabilities designed for ${bestFor.toLowerCase()}.`}
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
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 mb-2">Pricing</div>
              <div className="text-3xl font-bold text-blue-600">{pricingInfo}</div>
              <p className="text-gray-600 mt-4">
                {brandName} offers competitive pricing in the {category.toLowerCase()} market, 
                providing excellent value for the features included.
              </p>
            </div>
          </section>
        )}

        {/* User Testimonials */}
        {testimonials.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What People Say About {brandName}</h2>
            
            <div className="space-y-4">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    {testimonial.rating && (
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 italic mb-2">"{testimonial.text}"</p>
                  <p className="text-sm text-gray-600">— {testimonial.author}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
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
          <h2 className="text-3xl font-bold mb-4">Bottom Line</h2>
          <p className="text-lg leading-relaxed mb-6">
            {brandName} stands out as a solid choice for {bestFor.toLowerCase()}. 
            With {pros[0]?.toLowerCase() || "strong features"} and {pros[1]?.toLowerCase() || "competitive pricing"}, 
            it delivers excellent value in the {category.toLowerCase()} space. 
            {editorialScore >= 8.0 
              ? " We highly recommend giving it a try." 
              : " It's worth considering for your needs."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <PopunderButton
              href={clickHref}
              popunderUrl={popunderUrl}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition text-lg"
            >
              Try {brandName} Now →
            </PopunderButton>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="text-2xl font-bold">{editorialScore}/10</span>
              <span>Editorial Score</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-200 rounded-lg p-10 mt-10">
          <div className="grid lg:grid-cols-[1.4fr_1fr_1fr] gap-10">
            <div>
              <div className="text-white text-lg font-semibold mb-3">Prelander Editorial</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Independent reviews and comparisons to help travelers make smarter decisions. We analyze
                features, pricing, and user feedback so you can choose the right option with confidence.
              </p>
              <div className="text-xs text-slate-400">Review date: {currentDate}</div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Resources</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>How we review</li>
                <li>Editorial standards</li>
                <li>Contact: support@prelander.ai</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Legal</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>
                  <a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a>
                </li>
                <li>Cookie preferences</li>
                <li>Affiliate disclosure</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-400">
            <strong>Advertising Disclosure:</strong> This is an independent review. We may earn a commission when
            you click links to {brandName}, which helps support our research. Our editorial content is not
            influenced by advertisers or affiliate partnerships.
          </div>
          <div className="mt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} Prelander Editorial. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
