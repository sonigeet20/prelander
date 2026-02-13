import "server-only";
import OpenAI from "openai";

export interface BrandFactPack {
  brandName: string;
  tagline?: string;
  category: string;
  keyBenefits: string[];
  features: string[];
  targetAudience?: string;
  pricingInfo?: string;
  trustSignals: string[];
  useCases: string[];
  faqItems: Array<{ question: string; answer: string }>;
  tone: "professional" | "casual" | "premium" | "friendly";
  pros: string[];
  cons: string[];
  editorialScore?: number;
  bestFor?: string;
  testimonials?: Array<{ author: string; text: string; rating?: number }>;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
  };
}

// ─── OpenAI client (lazy init) ────────────────────────────────────
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ─── Main entry point ─────────────────────────────────────────────
export async function extractBrandInfo(url: string): Promise<BrandFactPack> {
  const hostname = (() => {
    try { return new URL(url).hostname.replace(/^www\./i, ""); }
    catch { return ""; }
  })();
  const hostBrand = hostname.split(".")[0] || "Brand";
  const niceHostBrand = hostBrand
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim();

  // Step 1 – scrape the page
  let pageText = "";
  let pageTitle = "";
  let metaDescription = "";
  let rawHtml = "";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (response.ok) {
      rawHtml = await response.text();

      const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
      pageTitle = titleMatch ? titleMatch[1].trim() : "";

      const descMatch = rawHtml.match(
        /<meta\s+(?:name=["']description["']\s+content=["']([^"']+)["']|content=["']([^"']+)["']\s+name=["']description["'])/i,
      );
      metaDescription = (descMatch?.[1] || descMatch?.[2] || "").trim();

      pageText = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  } catch (err) {
    console.warn(`[AI Research] Failed to fetch ${url}:`, err);
  }

  // Truncate to ~6000 chars so we stay within token limits
  const truncated = pageText.slice(0, 6000);

  // Step 2 – extract brand colors from HTML or hostname presets
  const brandColors = extractBrandColors(rawHtml, niceHostBrand, url);

  // Step 3 – call ChatGPT to build the fact pack
  const factPack = await callGPTForFactPack({
    url,
    hostname,
    niceHostBrand,
    pageTitle,
    metaDescription,
    pageText: truncated,
  });

  // Merge the extracted colors (CSS/meta extraction is more reliable than GPT guessing)
  factPack.brandColors = brandColors;

  console.log(`[AI Research] Completed for ${url}:`, {
    brandName: factPack.brandName,
    category: factPack.category,
    score: factPack.editorialScore,
    prosCount: factPack.pros.length,
    consCount: factPack.cons.length,
    hasColors: !!factPack.brandColors,
  });

  return factPack;
}

// ─── ChatGPT structured extraction ───────────────────────────────
async function callGPTForFactPack(ctx: {
  url: string;
  hostname: string;
  niceHostBrand: string;
  pageTitle: string;
  metaDescription: string;
  pageText: string;
}): Promise<BrandFactPack> {
  const systemPrompt = `You are a brand research analyst. Given a brand's website URL and page content, extract a comprehensive fact pack about the brand.

CRITICAL RULES:
1. The "brandName" MUST be the actual brand name (e.g. "McAfee", "Skyscanner", "NordVPN"). NEVER return "Brand" as the name.
2. If the page content is empty or unclear, infer the brand from the URL hostname. For example mcafee.com → "McAfee".
3. ALL pros, cons, features, benefits must be SPECIFIC to this actual brand — not generic placeholders. Reference the brand by name.
4. Editorial score should be realistic (6.0–9.5 range) based on the brand's market position.
5. The "category" should be specific (e.g. "Cybersecurity", "Travel & Tourism", "VPN Service", "Antivirus Software", "Flight Search Engine").
6. Testimonials should feel realistic with varied ratings (3–5) and diverse user types.
7. FAQ answers should be informative and specific to the brand's products/services.
8. Write pros/cons as complete sentences, 15–80 chars each.
9. Return ONLY valid JSON — no markdown, no code fences.`;

  const userPrompt = `Analyze this brand and return a JSON fact pack.

URL: ${ctx.url}
Hostname: ${ctx.hostname}
Page Title: ${ctx.pageTitle || "(not available)"}
Meta Description: ${ctx.metaDescription || "(not available)"}

Page Content (first 6000 chars):
${ctx.pageText || "(page content could not be fetched – use your knowledge of the brand based on the URL/hostname to generate the fact pack)"}

Return this exact JSON structure (all fields required):
{
  "brandName": "ActualBrandName",
  "tagline": "brand's tagline or value proposition (max 150 chars)",
  "category": "specific category",
  "keyBenefits": ["benefit1", "benefit2", "benefit3"],
  "features": ["feature1", "feature2", "feature3", "feature4"],
  "targetAudience": "who this brand serves",
  "pricingInfo": "pricing summary or null if unknown",
  "trustSignals": ["trust signal 1", "trust signal 2"],
  "useCases": ["use case 1", "use case 2"],
  "faqItems": [
    {"question": "Question about brand?", "answer": "Detailed answer"},
    {"question": "Another question?", "answer": "Detailed answer"},
    {"question": "Third question?", "answer": "Detailed answer"}
  ],
  "tone": "professional",
  "pros": ["Specific pro sentence 1", "Specific pro sentence 2", "Specific pro sentence 3", "Specific pro sentence 4"],
  "cons": ["Specific con sentence 1", "Specific con sentence 2", "Specific con sentence 3"],
  "editorialScore": 8.0,
  "bestFor": "specific audience description",
  "testimonials": [
    {"author": "User Type", "text": "Realistic review mentioning brand by name", "rating": 4},
    {"author": "User Type", "text": "Another realistic review", "rating": 5},
    {"author": "User Type", "text": "Critical but fair review", "rating": 3}
  ]
}`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(raw) as BrandFactPack;

    // Validate and patch critical fields
    if (!parsed.brandName || parsed.brandName === "Brand") {
      parsed.brandName = ctx.niceHostBrand;
    }
    if (!parsed.category) parsed.category = "Service Provider";
    if (!parsed.pros || parsed.pros.length === 0) {
      parsed.pros = [
        `${parsed.brandName} offers a reliable platform`,
        `${parsed.brandName} has an intuitive user interface`,
        `${parsed.brandName} provides good value`,
      ];
    }
    if (!parsed.cons || parsed.cons.length === 0) {
      parsed.cons = [
        `${parsed.brandName} pricing may not suit all budgets`,
        `Some features require a subscription`,
      ];
    }
    if (!parsed.keyBenefits || parsed.keyBenefits.length === 0) {
      parsed.keyBenefits = parsed.pros.slice(0, 3);
    }
    if (!parsed.features || parsed.features.length === 0) {
      parsed.features = [
        `${parsed.brandName} dashboard`,
        `${parsed.brandName} support`,
        `${parsed.brandName} integrations`,
      ];
    }
    if (!parsed.trustSignals || parsed.trustSignals.length === 0) {
      parsed.trustSignals = ["Established brand", "Secure platform"];
    }
    if (!parsed.useCases || parsed.useCases.length === 0) {
      parsed.useCases = [`Ideal for ${parsed.bestFor || "users seeking quality"}`];
    }
    if (!parsed.faqItems || parsed.faqItems.length === 0) {
      parsed.faqItems = [
        {
          question: `What is ${parsed.brandName}?`,
          answer: `${parsed.brandName} is a ${parsed.category.toLowerCase()} platform. Visit the official website to learn more.`,
        },
      ];
    }
    if (!parsed.tone) parsed.tone = "professional";
    if (!parsed.editorialScore) parsed.editorialScore = 7.5;
    if (!parsed.bestFor) parsed.bestFor = "Users seeking quality and reliability";
    if (!parsed.testimonials || parsed.testimonials.length === 0) {
      parsed.testimonials = [
        { author: "Verified user", text: `${parsed.brandName} works well for my needs`, rating: 4 },
        { author: "Power user", text: `Great features and reliable service from ${parsed.brandName}`, rating: 5 },
        { author: "New user", text: `Still exploring ${parsed.brandName} but initial impressions are positive`, rating: 3 },
      ];
    }

    return parsed;
  } catch (error) {
    console.error("[AI Research] GPT call failed:", error);
    // Final fallback – still use hostname brand name, never "Brand"
    return buildFallbackFactPack(
      ctx.niceHostBrand,
      ctx.url,
      ctx.pageTitle,
      ctx.metaDescription,
      ctx.pageText,
    );
  }
}

// ─── Fallback when GPT is unavailable ─────────────────────────────
function buildFallbackFactPack(
  brandName: string,
  url: string,
  pageTitle: string,
  metaDescription: string,
  pageText: string,
): BrandFactPack {
  const category = inferCategory(pageText || pageTitle || url);

  return {
    brandName,
    tagline: metaDescription?.slice(0, 150) || `${brandName} – ${category}`,
    category,
    keyBenefits: [
      `${brandName} comprehensive service offering`,
      `${brandName} user-friendly experience`,
      `${brandName} trusted platform`,
    ],
    features: [
      `${brandName} easy-to-use interface`,
      `${brandName} secure platform`,
      `${brandName} customer support`,
      `${brandName} cross-device compatibility`,
    ],
    trustSignals: [`${brandName} established service`, "Secure platform"],
    useCases: [`Suitable for ${brandName} users`, "Flexible usage options"],
    faqItems: [
      {
        question: `What is ${brandName}?`,
        answer: `${brandName} is a ${category.toLowerCase()} platform. Visit ${url} to learn more.`,
      },
    ],
    tone: "professional",
    pros: [
      `${brandName} is an established service in the market`,
      `${brandName} offers a wide range of options`,
      `${brandName} provides transparent pricing`,
    ],
    cons: [
      `${brandName} service may vary by region`,
      `Additional terms may apply`,
    ],
    editorialScore: 7.5,
    bestFor: "Users seeking reliable service",
    testimonials: [
      { author: "Regular user", text: `${brandName} works well for my needs`, rating: 4 },
      { author: "Power user", text: `${brandName} has good features overall`, rating: 4 },
      { author: "New user", text: `Still exploring ${brandName}`, rating: 3 },
    ],
  };
}

// ─── Category inference (used by fallback) ────────────────────────
function inferCategory(content: string): string {
  const categories = [
    { keywords: ["travel", "flight", "hotel", "booking", "airline", "trip"], name: "Travel & Tourism" },
    { keywords: ["antivirus", "security", "malware", "vpn", "firewall", "cyber", "threat", "protection", "mcafee", "norton", "kaspersky", "bitdefender"], name: "Cybersecurity" },
    { keywords: ["finance", "banking", "investment", "trading", "loan", "insurance"], name: "Financial Services" },
    { keywords: ["software", "app", "tool", "platform", "saas", "cloud"], name: "Software & Technology" },
    { keywords: ["education", "learning", "course", "training"], name: "Education" },
    { keywords: ["health", "fitness", "wellness", "medical"], name: "Health & Wellness" },
    { keywords: ["shop", "store", "buy", "product", "ecommerce"], name: "E-commerce" },
    { keywords: ["food", "restaurant", "recipe", "delivery", "meal"], name: "Food & Dining" },
    { keywords: ["hosting", "domain", "server", "website", "web hosting"], name: "Web Hosting" },
  ];

  for (const cat of categories) {
    if (cat.keywords.some((kw) => content.toLowerCase().includes(kw))) {
      return cat.name;
    }
  }

  return "Service Provider";
}

// ─── Brand color extraction ───────────────────────────────────────
function extractBrandColors(
  html: string,
  brandName: string,
  url: string,
): { primary: string; secondary: string; accent: string; soft: string } {
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  })();

  const hostnamePresets: Record<
    string,
    { primary: string; secondary: string; accent: string; soft: string }
  > = {
    "skyscanner.co.in": { primary: "#00A1DE", secondary: "#0B1F2A", accent: "#FF6B00", soft: "#E6F6FD" },
    "skyscanner.com": { primary: "#00A1DE", secondary: "#0B1F2A", accent: "#FF6B00", soft: "#E6F6FD" },
    "kayak.com": { primary: "#FF690F", secondary: "#1A1A1A", accent: "#00AEEF", soft: "#FFF1E8" },
    "booking.com": { primary: "#003580", secondary: "#001B3A", accent: "#FDBB02", soft: "#E6EEF9" },
    "mcafee.com": { primary: "#C01818", secondary: "#1A1A1A", accent: "#E8292E", soft: "#FDEAEA" },
    "norton.com": { primary: "#FFCC00", secondary: "#1A1A1A", accent: "#006B3F", soft: "#FFFDE6" },
    "nordvpn.com": { primary: "#4687FF", secondary: "#0D1117", accent: "#6BF178", soft: "#E8F0FF" },
    "surfshark.com": { primary: "#178DED", secondary: "#0B1929", accent: "#00D4AA", soft: "#E6F4FD" },
    "expressvpn.com": { primary: "#DA3940", secondary: "#1A1A1A", accent: "#4DBA6D", soft: "#FDEBEC" },
    "kaspersky.com": { primary: "#006D5C", secondary: "#003C30", accent: "#7BC143", soft: "#E6F5F2" },
    "bitdefender.com": { primary: "#ED1C24", secondary: "#1A1A1A", accent: "#00A1DE", soft: "#FDEAEA" },
    "avast.com": { primary: "#FF7800", secondary: "#1E1E1E", accent: "#6C2BD9", soft: "#FFF4E6" },
  };

  if (hostnamePresets[hostname]) {
    return hostnamePresets[hostname];
  }

  // Try to extract from HTML meta tags / CSS
  if (html) {
    const themeColorMatch = html.match(
      /<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i,
    );
    const tileColorMatch = html.match(
      /<meta[^>]+name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i,
    );
    const cssVarMatch = html.match(
      /--(?:brand|primary|color)-[a-z-]*:\s*(#[0-9a-fA-F]{3,6})/i,
    );
    const rawColor = themeColorMatch?.[1] || tileColorMatch?.[1] || "";
    const cssColor = cssVarMatch?.[1] ? normalizeColor(cssVarMatch[1]) : null;
    const primary =
      cssColor || normalizeColor(rawColor) || colorFromString(brandName || url);

    const { h, s, l } = hexToHsl(primary);
    const secondary = hslToHex(h, Math.max(20, s - 25), Math.max(18, l - 25));
    const accent = hslToHex(
      (h + 35) % 360,
      Math.min(85, s + 10),
      Math.min(55, l + 10),
    );
    const soft = hslToHex(h, Math.max(10, s - 35), Math.min(96, l + 40));

    return { primary, secondary, accent, soft };
  }

  // Derive from brand name string hash
  const primary = colorFromString(brandName || url);
  const { h, s, l } = hexToHsl(primary);
  const secondary = hslToHex(h, Math.max(20, s - 25), Math.max(18, l - 25));
  const accent = hslToHex(
    (h + 35) % 360,
    Math.min(85, s + 10),
    Math.min(55, l + 10),
  );
  const soft = hslToHex(h, Math.max(10, s - 35), Math.min(96, l + 40));
  return { primary, secondary, accent, soft };
}

// ─── Color utilities ──────────────────────────────────────────────

function normalizeColor(input: string): string | null {
  if (!input) return null;
  const value = input.trim();
  if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) {
    if (value.length === 4) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase();
    }
    return value.toUpperCase();
  }
  const rgbMatch = value.match(
    /rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i,
  );
  if (rgbMatch) {
    const [r, g, b] = rgbMatch
      .slice(1, 4)
      .map((v) => Math.min(255, Math.max(0, Number(v))));
    return rgbToHex(r, g, b);
  }
  return null;
}

function colorFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, 70, 45);
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((val) => val.toString(16).padStart(2, "0")).join("")
  ).toUpperCase();
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; }
  else if (h >= 60 && h < 120) { r = x; g = c; }
  else if (h >= 120 && h < 180) { g = c; b = x; }
  else if (h >= 180 && h < 240) { g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const rr = Math.round((r + m) * 255);
  const gg = Math.round((g + m) * 255);
  const bb = Math.round((b + m) * 255);
  return rgbToHex(rr, gg, bb);
}
