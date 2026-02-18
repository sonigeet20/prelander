import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { HelpfulFeedback } from "@/components/HelpfulFeedback";
import { SortableTable } from "@/components/SortableTable";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { InteractiveChecklist } from "@/components/InteractiveChecklist";
import { ScoreCard } from "@/components/ScoreCard";
import { ProConAnalysis } from "@/components/ProConAnalysis";

/* ─── Types for GeneratedPage content JSON ─── */
interface PageSection {
  type: string;
  heading?: string;
  subheading?: string;
  content?: string;
  highlights?: Array<{ label: string; value: string }>;
  items?: Array<Record<string, string> | string>;
  rows?: Array<Record<string, string>>;
  ctaText?: string;
  ctaUrl?: string;
  // Calculator fields
  config?: {
    type?: "flight" | "subscription" | "general";
    baselineLabel?: string;
    baselineAmount?: number;
    savingsPercentMin?: number;
    savingsPercentMax?: number;
    tips?: Array<{ threshold: number; tip: string }>;
  };
  // Checklist fields
  checklistItems?: Array<{ task: string; detail?: string; priority?: "high" | "medium" | "low" }>;
  // Scorecard fields
  overallScore?: number;
  overallLabel?: string;
  categories?: Array<{ name: string; score: number; maxScore?: number; detail?: string }>;
  verdict?: string;
  // Pros & Cons fields
  pros?: Array<{ text: string; detail?: string; weight?: "major" | "minor" }>;
  cons?: Array<{ text: string; detail?: string; weight?: "major" | "minor" }>;
  bottomLine?: string;
}
interface PageContent {
  sections: PageSection[];
}

/* ─── Dynamic variable extraction ─── */
const EXTRACT_PATTERNS: Array<{ regex: RegExp; vars: string[] }> = [
  // "flights from london to paris" → origin=london, destination=paris
  { regex: /flights?\s+from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/i, vars: ["origin", "destination"] },
  // "london to paris flights" → origin=london, destination=paris
  { regex: /^([a-z\s]+?)\s+to\s+([a-z\s]+?)\s+flights?/i, vars: ["origin", "destination"] },
  // "cheap flights to delhi" → destination=delhi
  { regex: /flights?\s+to\s+([a-z\s]+)/i, vars: ["destination"] },
  // "flights from london" → origin=london
  { regex: /flights?\s+from\s+([a-z\s]+)/i, vars: ["origin"] },
  // "skyscanner paris" or "hotels in bali" → destination
  { regex: /(?:hotels?|stays?|travel)\s+(?:in|to|for)\s+([a-z\s]+)/i, vars: ["destination"] },
  // "X vs Y" → brand_a, brand_b
  { regex: /^([a-z0-9\s]+?)\s+vs\.?\s+([a-z0-9\s]+)/i, vars: ["brand_a", "brand_b"] },
];

function extractVarsFromText(text: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const { regex, vars: varNames } of EXTRACT_PATTERNS) {
    const m = text.match(regex);
    if (m) {
      varNames.forEach((name, i) => {
        const val = m[i + 1]?.trim();
        if (val) vars[name] = titleCase(val);
      });
      break; // first match wins
    }
  }
  return vars;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build a variable replacement map from:
 *  1. URL search params (?destination=Delhi&origin=London)
 *  2. Auto-extracted from keyword text
 *  3. Auto-extracted from slug
 *  4. Brand name as fallback
 */
function buildVarMap(
  searchParams: Record<string, string | string[] | undefined>,
  keyword: string | null | undefined,
  slug: string,
  brandName: string,
): Record<string, string> {
  // Start with auto-extracted vars from keyword + slug
  const fromKeyword = keyword ? extractVarsFromText(keyword) : {};
  const fromSlug = extractVarsFromText(slug.replace(/-/g, " "));

  const vars: Record<string, string> = {
    ...fromSlug,
    ...fromKeyword,
    brand: titleCase(brandName),
    year: String(new Date().getFullYear()),
  };

  // URL params override everything (highest priority)
  for (const [key, val] of Object.entries(searchParams)) {
    if (typeof val === "string" && val.trim()) {
      vars[key] = titleCase(val.trim());
    } else if (Array.isArray(val) && val[0]?.trim()) {
      vars[key] = titleCase(val[0].trim());
    }
  }

  return vars;
}

/** Replace all {placeholder} tokens in a string */
function fillTemplate(text: string | undefined | null, vars: Record<string, string>): string {
  if (!text) return "";
  return text.replace(/\{(\w+)\}/g, (match, key) => vars[key] || match);
}

/** Deep-replace all {placeholder} tokens in a section */
function fillSection(section: PageSection, vars: Record<string, string>): PageSection {
  const filled = { ...section };
  if (filled.heading) filled.heading = fillTemplate(filled.heading, vars);
  if (filled.subheading) filled.subheading = fillTemplate(filled.subheading, vars);
  if (filled.content) filled.content = fillTemplate(filled.content, vars);
  if (filled.ctaText) filled.ctaText = fillTemplate(filled.ctaText, vars);
  if (filled.ctaUrl) filled.ctaUrl = fillTemplate(filled.ctaUrl, vars);
  if (filled.highlights) {
    filled.highlights = filled.highlights.map((h) => ({
      label: fillTemplate(h.label, vars),
      value: fillTemplate(h.value, vars),
    }));
  }
  if (filled.items) {
    filled.items = filled.items.map((item) => {
      if (typeof item === "string") return fillTemplate(item, vars);
      // Handle any object shape generically
      const obj: Record<string, string> = {};
      for (const [k, v] of Object.entries(item as Record<string, string>)) {
        obj[k] = typeof v === "string" ? fillTemplate(v, vars) : v;
      }
      return obj;
    }) as typeof filled.items;
  }
  if (filled.rows) {
    filled.rows = filled.rows.map((row) => {
      const newRow: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        newRow[fillTemplate(k, vars)] = fillTemplate(v, vars);
      }
      return newRow;
    });
  }
  // Fill new interactive section fields
  if (filled.verdict) filled.verdict = fillTemplate(filled.verdict, vars);
  if (filled.bottomLine) filled.bottomLine = fillTemplate(filled.bottomLine, vars);
  if (filled.overallLabel) filled.overallLabel = fillTemplate(filled.overallLabel, vars);
  if (filled.checklistItems) {
    filled.checklistItems = filled.checklistItems.map((item) => ({
      ...item,
      task: fillTemplate(item.task, vars),
      detail: item.detail ? fillTemplate(item.detail, vars) : item.detail,
    }));
  }
  if (filled.categories) {
    filled.categories = filled.categories.map((cat) => ({
      ...cat,
      name: fillTemplate(cat.name, vars),
      detail: cat.detail ? fillTemplate(cat.detail, vars) : cat.detail,
    }));
  }
  if (filled.pros) {
    filled.pros = filled.pros.map((p) => ({
      ...p,
      text: fillTemplate(p.text, vars),
      detail: p.detail ? fillTemplate(p.detail, vars) : p.detail,
    }));
  }
  if (filled.cons) {
    filled.cons = filled.cons.map((c) => ({
      ...c,
      text: fillTemplate(c.text, vars),
      detail: c.detail ? fillTemplate(c.detail, vars) : c.detail,
    }));
  }
  return filled;
}

/* ─── Metadata ─── */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { brand, slug } = await params;
  const sp = await searchParams;
  const page = await findPage(brand, slug);
  if (!page) return { title: "Not Found" };

  const vars = buildVarMap(sp, page.keyword?.keyword, slug, page.offer.brand.name);
  return {
    title: fillTemplate(page.title, vars),
    description: fillTemplate(page.metaDescription, vars),
    robots: { index: true, follow: true },
  };
}

/* ─── Lookup helper ─── */
function toBrandSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function findPage(brandSlug: string, slug: string) {
  // Find all published/compliant pages with this slug
  const pages = await prisma.generatedPage.findMany({
    where: { slug, status: { in: ["published", "compliant"] } },
    include: { offer: { include: { brand: true } }, keyword: true },
  });
  if (pages.length === 0) return null;

  // Match by brand name slug OR domain slug
  for (const page of pages) {
    const nameSlug = toBrandSlug(page.offer.brand.name);
    const domainSlug = toBrandSlug(page.offer.brand.domain);
    if (nameSlug === brandSlug || domainSlug === brandSlug) return page;
  }

  // Partial match (e.g. "www-skyscanner" contains "skyscanner")
  for (const page of pages) {
    const nameSlug = toBrandSlug(page.offer.brand.name);
    if (brandSlug.includes(nameSlug) || nameSlug.includes(brandSlug)) return page;
  }

  return null;
}

/* ─── Image helpers ─── */
function heroImage(keyword: string | null | undefined, brandName: string) {
  const q = encodeURIComponent(keyword || brandName);
  return `https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1200&h=500&fit=crop&q=80`; // travel fallback
}
function topicImage(heading: string | undefined, index: number) {
  const STOCK: Record<string, string> = {
    flight: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&h=400&fit=crop&q=80",
    travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&q=80",
    price: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop&q=80",
    compar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&q=80",
    book: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&q=80",
    save: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=400&fit=crop&q=80",
    hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop&q=80",
    secur: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=400&fit=crop&q=80",
    soft: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop&q=80",
    deal: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&q=80",
  };
  const text = (heading || "").toLowerCase();
  for (const [key, url] of Object.entries(STOCK)) {
    if (text.includes(key)) return url;
  }
  const FALLBACK = [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=400&fit=crop&q=80",
  ];
  return FALLBACK[index % FALLBACK.length];
}

/* ─── Page Component ─── */
export default async function GuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { brand, slug } = await params;
  const sp = await searchParams;
  const page = await findPage(brand, slug);
  if (!page) notFound();

  const brandName = page.offer.brand.name;
  const brandDomain = page.offer.brand.domain;
  const vars = buildVarMap(sp, page.keyword?.keyword, slug, brandName);



  // Fetch other published guides for the sidebar (real links, not placeholders)
  const relatedPages = await prisma.generatedPage.findMany({
    where: { status: "published", id: { not: page.id } },
    include: { offer: { include: { brand: true } } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const rawContent = page.content as unknown as PageContent;
  const content: PageContent = {
    sections: (rawContent?.sections || []).map((s) => fillSection(s, vars)),
  };

  // Pre-extract quick_answer highlights for sidebar (safe reference)
  const quickAnswerHighlights = content.sections.find((s) => s.type === "quick_answer")?.highlights || null;

  const filledH1 = fillTemplate(page.h1, vars);
  const year = new Date().getFullYear();
  const readTime = Math.max(3, Math.ceil(JSON.stringify(content).length / 1200));

  // Build JSON-LD structured data
  const faqSection = content.sections.find((s) => s.type === "faq");
  const faqJsonLd = faqSection?.items?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSection.items
      .filter((item): item is Record<string, string> => typeof item !== "string" && !!(item as Record<string, string>).question)
      .map((item) => ({
        "@type": "Question",
        name: (item as Record<string, string>).question,
        acceptedAnswer: {
          "@type": "Answer",
          text: (item as Record<string, string>).answer,
        },
      })),
  } : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: filledH1,
    description: fillTemplate(page.metaDescription, vars),
    author: { "@type": "Organization", name: "Savvy", url: "https://rightprice.site/about" },
    publisher: { "@type": "Organization", name: "Savvy", url: "https://rightprice.site" },
    datePublished: page.publishedAt?.toISOString(),
    dateModified: page.updatedAt?.toISOString(),
    mainEntityOfPage: `https://rightprice.site/guides/${brand}/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://rightprice.site" },
      { "@type": "ListItem", position: 2, name: `${titleCase(brandName)} Guides`, item: `https://rightprice.site/guides/${brand}` },
      { "@type": "ListItem", position: 3, name: filledH1 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900">
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">Savvy</span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <a href="/about" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a>
            <a href="/terms" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy</a>
          </nav>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${heroImage(page.keyword?.keyword, brandName)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-20 md:pb-28">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <img src={`https://www.google.com/s2/favicons?domain=${brandDomain}&sz=64`} alt="" width={28} height={28} className="rounded-md shadow-sm" />
              <span className="text-indigo-200 text-sm font-medium">{titleCase(brandName)} Guide</span>
              <span className="text-indigo-300/60">•</span>
              <span className="text-indigo-200/70 text-sm">{readTime} min read</span>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-3xl tracking-tight">
              {filledH1}
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="flex items-center gap-4 mt-6 text-sm text-indigo-200/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/50 flex items-center justify-center text-xs font-bold text-white">S</div>
                <span>Savvy Research</span>
              </div>
              <span className="w-1 h-1 bg-indigo-400/60 rounded-full" />
              <time dateTime={page.publishedAt?.toISOString()}>
                {page.publishedAt
                  ? page.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                  : "Recently updated"}
              </time>
            </div>
          </FadeIn>
        </div>
        {/* Wave divider */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none"><path d="M0 60L48 53.3C96 46.7 192 33.3 288 30C384 26.7 480 33.3 576 36.7C672 40 768 40 864 36.7C960 33.3 1056 26.7 1152 25C1248 23.3 1344 26.7 1392 28.3L1440 30V60H0Z" fill="rgb(248 250 252)"/></svg>
      </div>

      {/* ─── Disclosure ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 mb-8">
        <div className="bg-amber-50/80 backdrop-blur rounded-xl px-5 py-3 text-xs text-amber-700 border border-amber-200/60 shadow-sm">
          <strong>Disclosure:</strong> This page may contain affiliate links. We may earn a commission at no extra cost to you. We are <strong>not affiliated with {titleCase(brandName)}</strong>. All opinions are our own. <a href="/about" className="underline hover:text-amber-900">Learn more</a>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* Article */}
          <article className="min-w-0">
            {/* Table of Contents — inline */}
            {content.sections.filter((s) => s.heading).length > 2 && (
              <FadeIn>
                <nav className="bg-white rounded-2xl p-6 mb-10 border border-gray-200/70 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📑</span>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">In This Guide</p>
                  </div>
                  <ul className="space-y-2">
                    {content.sections.filter((s) => s.heading).map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <a href={`#section-${i}`} className="text-sm text-gray-600 hover:text-indigo-600 transition-colors leading-snug">
                          {s.heading}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </FadeIn>
            )}

            {/* Sections */}
            {content.sections.map((section, i) => (
              <FadeIn key={i} delay={i < 3 ? i * 80 : 0}>
                <SectionRenderer section={section} index={i} brandDomain={brandDomain} />
              </FadeIn>
            ))}

            {/* Helpful feedback widget */}
            <FadeIn>
              <HelpfulFeedback pageSlug={slug} />
            </FadeIn>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              {/* Brand card */}
              <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <img src={`https://www.google.com/s2/favicons?domain=${brandDomain}&sz=64`} alt="" width={36} height={36} className="rounded-lg shadow-sm" />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{titleCase(brandName)}</div>
                    <div className="text-xs text-gray-400">{brandDomain}</div>
                  </div>
                </div>
                <a href={`https://${brandDomain}`} className="block w-full text-center py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all" rel="nofollow sponsored" target="_blank">
                  Visit {titleCase(brandName)} →
                </a>
              </div>

              {/* Quick stats */}
              {quickAnswerHighlights && quickAnswerHighlights.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100/60 p-5">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Key Facts</p>
                  <div className="space-y-3">
                    {quickAnswerHighlights.slice(0, 4).map((h, j) => (
                      <div key={j} className="grid grid-cols-[110px_1fr] gap-3 items-start">
                        <span className="text-xs text-gray-500 leading-snug">{h.label}</span>
                        <span className="text-sm font-bold text-indigo-700 leading-snug">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related guides */}
              {relatedPages.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">More Guides</p>
                  <div className="space-y-3 text-sm">
                    {relatedPages.map((rp) => {
                      const rpBrandSlug = rp.offer.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      return (
                        <a key={rp.id} href={`/guides/${rpBrandSlug}/${rp.slug}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                          <img src={`https://www.google.com/s2/favicons?domain=${rp.offer.brand.domain}&sz=32`} alt="" width={14} height={14} className="rounded" />
                          <span className="line-clamp-1">{rp.title}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="font-bold text-gray-900">Savvy</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">Independent research guides to help you compare products, services, and pricing. We are not affiliated with any brand.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Legal</p>
              <div className="space-y-2 text-sm">
                <a href="/about" className="block text-gray-500 hover:text-indigo-600 transition-colors">About Us</a>
                <a href="/contact" className="block text-gray-500 hover:text-indigo-600 transition-colors">Contact</a>
                <a href="/terms" className="block text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</a>
                <a href="/privacy-policy" className="block text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Disclaimer</p>
              <p className="text-xs text-gray-400 leading-relaxed">We are an independent research platform. We are not affiliated with, endorsed by, or sponsored by {titleCase(brandName)} or any brand on this page.</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-400">© {year} Savvy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Markdown Content Renderer ─── */
function renderMarkdown(text: string) {
  const blocks = text.split(/\n\n+/);
  const elements: React.ReactNode[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  function flushList() {
    if (!listBuffer) return;
    const ListTag = listBuffer.type === "ol" ? "ol" : "ul";
    const className = listBuffer.type === "ol"
      ? "list-decimal list-inside space-y-2 my-3 text-gray-600 text-[15px]"
      : "list-disc list-inside space-y-2 my-3 text-gray-600 text-[15px]";
    elements.push(
      <ListTag key={`list-${elements.length}`} className={className}>
        {listBuffer.items.map((li, k) => (
          <li key={k}>{inlineMarkdown(li)}</li>
        ))}
      </ListTag>
    );
    listBuffer = null;
  }

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // --- Subheading patterns ---
    // ### Heading
    if (/^###\s+/.test(trimmed)) {
      flushList();
      const headingText = trimmed.replace(/^###\s+/, "").replace(/\*\*/g, "");
      elements.push(<h3 key={`h-${elements.length}`} className="text-lg font-bold text-gray-900 mt-6 mb-2">{headingText}</h3>);
      continue;
    }
    // **Subheading: Something** or **Something**  (standalone bold line = subheading)
    const subheadingMatch = trimmed.match(/^\*\*(?:Subheading:\s*)?(.+?)\*\*$/);
    if (subheadingMatch && trimmed.split("\n").length === 1) {
      flushList();
      elements.push(<h3 key={`h-${elements.length}`} className="text-lg font-bold text-gray-900 mt-6 mb-2">{subheadingMatch[1]}</h3>);
      continue;
    }

    // --- Lists ---
    const lines = trimmed.split("\n");
    const isBulletList = lines.every(l => /^[-•*]\s/.test(l.trim()));
    const isNumberedList = lines.every(l => /^\d+[.)\-]\s/.test(l.trim()));

    if (isBulletList) {
      if (listBuffer?.type !== "ul") { flushList(); listBuffer = { type: "ul", items: [] }; }
      for (const l of lines) listBuffer!.items.push(l.replace(/^[-•*]\s+/, ""));
      continue;
    }
    if (isNumberedList) {
      if (listBuffer?.type !== "ol") { flushList(); listBuffer = { type: "ol", items: [] }; }
      for (const l of lines) listBuffer!.items.push(l.replace(/^\d+[.)\-]\s+/, ""));
      continue;
    }

    // --- Regular paragraph ---
    flushList();
    // Split multi-line paragraphs into single block
    elements.push(<p key={`p-${elements.length}`} className="text-[15px] text-gray-600">{inlineMarkdown(trimmed.replace(/\n/g, " "))}</p>);
  }
  flushList();
  return elements;
}

/** Parse inline markdown: **bold**, *italic* */
function inlineMarkdown(text: string): React.ReactNode {
  // Split on **bold** and *italic* patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Find the next bold or italic marker
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<![*])\*(?![*])(.+?)(?<![*])\*(?![*])/);

    let nextMatch: { index: number; length: number; node: React.ReactNode } | null = null;

    if (boldMatch?.index !== undefined) {
      nextMatch = {
        index: boldMatch.index,
        length: boldMatch[0].length,
        node: <strong key={`b-${key++}`} className="font-semibold text-gray-800">{boldMatch[1]}</strong>,
      };
    }
    if (italicMatch?.index !== undefined) {
      if (!nextMatch || italicMatch.index < nextMatch.index) {
        nextMatch = {
          index: italicMatch.index,
          length: italicMatch[0].length,
          node: <em key={`i-${key++}`}>{italicMatch[1]}</em>,
        };
      }
    }

    if (nextMatch) {
      if (nextMatch.index > 0) {
        parts.push(remaining.slice(0, nextMatch.index));
      }
      parts.push(nextMatch.node);
      remaining = remaining.slice(nextMatch.index + nextMatch.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

/* ─── Section Renderer ─── */
function SectionRenderer({ section, index, brandDomain }: { section: PageSection; index: number; brandDomain: string }) {
  const id = `section-${index}`;

  switch (section.type) {
    case "hero":
      return (
        <section id={id} className="relative rounded-2xl overflow-hidden mb-10 not-prose">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 opacity-95" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${topicImage(section.heading, index)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative px-8 py-10">
            {section.heading && <h2 className="text-2xl font-bold text-white mb-3">{section.heading}</h2>}
            {section.subheading && <p className="text-indigo-100 mb-6 max-w-lg">{section.subheading}</p>}
            {section.ctaText && (
              <a href={section.ctaUrl || `https://${brandDomain}`} className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" rel="nofollow sponsored" target="_blank">
                {section.ctaText}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            )}
          </div>
        </section>
      );

    case "quick_answer":
      return (
        <section id={id} className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 mb-10 not-prose border border-blue-100/60 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚡</span>
            {section.heading && <h2 className="text-xl font-bold text-gray-900">{section.heading}</h2>}
          </div>
          {section.content && <p className="text-gray-600 mb-6 leading-relaxed">{section.content}</p>}
          {section.highlights && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {section.highlights.map((h, j) => (
                <div key={j} className="bg-white/80 backdrop-blur rounded-xl p-4 text-center shadow-sm border border-white hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{h.value}</div>
                  <div className="text-[11px] text-gray-400 font-medium mt-1">{h.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      );

    case "content_block":
    case "methodology":
    case "analysis":
      return (
        <section id={id} className="mb-10 not-prose">
          {section.heading && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.heading}</h2>
            </div>
          )}

          <div className="text-gray-600 leading-relaxed space-y-4">
            {section.content && renderMarkdown(section.content)}
          </div>
        </section>
      );

    case "pricing_table":
    case "comparison_table":
      return (
        <section id={id} className="mb-10 not-prose">
          {section.heading && (
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.heading}</h2>
            </div>
          )}
          {section.rows && section.rows.length > 0 && (
            <SortableTable rows={section.rows} />
          )}
        </section>
      );

    case "tips":
    case "pros_cons":
      return (
        <section id={id} className="mb-10 not-prose">
          {section.heading && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">{section.type === "tips" ? "💡" : "⚖️"}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.heading}</h2>
            </div>
          )}
          {section.content && <p className="text-gray-600 mb-4 text-[15px] leading-relaxed">{section.content}</p>}
          {section.items && Array.isArray(section.items) && (
            <div className="grid gap-2.5">
              {section.items.map((item, j) => {
                // Support string items, {tip,detail}, {question,answer}, or any object
                const text = typeof item === "string"
                  ? item
                  : (item as Record<string, string>).tip || (item as Record<string, string>).question || (item as Record<string, string>).title || Object.values(item as Record<string, string>)[0] || "";
                const detail = typeof item !== "string"
                  ? (item as Record<string, string>).detail || (item as Record<string, string>).answer || (item as Record<string, string>).description || ""
                  : "";
                return (
                  <div key={j} className="flex items-start gap-3 bg-white rounded-xl px-5 py-3.5 border border-gray-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <div>
                      <span className="text-gray-700 text-[15px] font-medium">{text}</span>
                      {detail && <p className="text-gray-500 text-sm mt-1">{detail}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      );

    case "steps":
      return (
        <section id={id} className="mb-10 not-prose">
          {section.heading && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📋</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.heading}</h2>
            </div>
          )}
          {section.content && <p className="text-gray-600 mb-5 text-[15px] leading-relaxed">{section.content}</p>}
          {section.items && Array.isArray(section.items) && (
            <div className="relative">
              {/* Vertical line connector */}
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-300 via-violet-300 to-indigo-100 rounded-full" />
              <div className="space-y-4">
                {section.items.map((item, j) => {
                  const stepNum = typeof item !== "string" ? (item as Record<string, string>).step || String(j + 1) : String(j + 1);
                  const title = typeof item === "string"
                    ? item
                    : (item as Record<string, string>).title || Object.values(item as Record<string, string>)[0] || "";
                  const detail = typeof item !== "string"
                    ? (item as Record<string, string>).detail || (item as Record<string, string>).description || ""
                    : "";
                  return (
                    <div key={j} className="relative flex items-start gap-4 pl-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md z-10">
                        {stepNum}
                      </div>
                      <div className="bg-white rounded-xl px-5 py-4 border border-gray-200/60 shadow-sm flex-1 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-900 text-[15px]">{title}</h3>
                        {detail && <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{detail}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      );

    case "faq":
      return (
        <section id={id} className="mb-10 not-prose">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xl">❓</span>
            {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.heading}</h2>}
          </div>
          <div className="space-y-3">
            {section.items?.map((item, j) => {
              if (typeof item === "string") return null;
              const q = (item as Record<string, string>).question;
              const a = (item as Record<string, string>).answer;
              if (!q || !a) return null;
              return (
                <details key={j} className="group bg-white rounded-xl border border-gray-200/70 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <summary className="flex items-center justify-between px-5 py-4 font-medium text-gray-800 cursor-pointer select-none">
                    <span className="text-[15px] pr-4">{q}</span>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/50">
                    {a}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      );

    case "cta":
      return (
        <section id={id} className="relative rounded-2xl overflow-hidden mb-10 not-prose">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&q=80)", backgroundSize: "cover" }} />
          <div className="relative px-8 py-10 text-center">
            {section.heading && <h2 className="text-2xl font-bold text-white mb-3">{section.heading}</h2>}
            {section.content && <p className="text-indigo-100 mb-6 max-w-md mx-auto">{section.content}</p>}
            {section.ctaText && (
              <a href={section.ctaUrl || `https://${brandDomain}`} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg" rel="nofollow sponsored" target="_blank">
                {section.ctaText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            )}
          </div>
        </section>
      );

    case "disclosure":
      return (
        <section id={id} className="mb-10 not-prose">
          <div className="bg-gray-50 rounded-xl px-6 py-5 text-xs text-gray-400 border border-gray-200/60 leading-relaxed">
            {section.content && <p>{section.content}</p>}
          </div>
        </section>
      );

    case "calculator":
      return (
        <section id={id} className="mb-10 not-prose">
          <SavingsCalculator
            heading={section.heading}
            config={{
              type: section.config?.type || "general",
              baselineLabel: section.config?.baselineLabel,
              baselineAmount: section.config?.baselineAmount || 500,
              savingsPercentMin: section.config?.savingsPercentMin || 10,
              savingsPercentMax: section.config?.savingsPercentMax || 35,
              tips: section.config?.tips || [],
            }}
          />
        </section>
      );

    case "checklist":
      return (
        <section id={id} className="mb-10 not-prose">
          <InteractiveChecklist
            heading={section.heading}
            description={section.content}
            items={section.checklistItems || []}
          />
        </section>
      );

    case "scorecard":
      return (
        <section id={id} className="mb-10 not-prose">
          <ScoreCard
            heading={section.heading}
            overallScore={section.overallScore}
            overallLabel={section.overallLabel}
            categories={section.categories || []}
            verdict={section.verdict}
          />
        </section>
      );

    case "pros_cons":
      return (
        <section id={id} className="mb-10 not-prose">
          <ProConAnalysis
            heading={section.heading}
            pros={section.pros || []}
            cons={section.cons || []}
            bottomLine={section.bottomLine}
          />
        </section>
      );

    default:
      return (
        <section id={id} className="mb-10 not-prose">
          {section.heading && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.heading}</h2>
            </div>
          )}
          <div className="text-gray-600 leading-relaxed space-y-4">
            {section.content && renderMarkdown(section.content)}
          </div>
        </section>
      );
  }
}
