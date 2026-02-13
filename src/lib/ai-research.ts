import "server-only";
import OpenAI from "openai";

export interface BrandFactPack {
  brandName: string;
  tagline?: string;
  category: string;
  keyBenefits: string[];
  features: string[];
  /** A longer description per feature (same order as features[]) */
  featureDescriptions?: string[];
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
  heroImageUrl?: string;
  /** 2–3 paragraph detailed editorial review of the brand */
  detailedReview?: string[];
  /** 1 paragraph about the brand's history / background */
  historyBlurb?: string;
  /** 1 paragraph comparing the brand to alternatives */
  comparisonNotes?: string;
  /** 5 actionable money-saving or deal-finding tips specific to this brand */
  savingTips?: string[];
  /** Step-by-step getting started guide (4-6 steps, each a sentence) */
  gettingStartedSteps?: string[];
  /** 2-3 named competitors with one-line pros/cons each */
  alternativesComparison?: Array<{ name: string; advantage: string; disadvantage: string }>;
  /** Seasonal / timing advice — best time to buy or use the service */
  seasonalAdvice?: string;
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
// brandName = the display name set by the admin (e.g. "McAfee", "Skyscanner")
// brandUrl  = the brand's website URL for context (e.g. "https://www.mcafee.com")
export async function extractBrandInfo(
  brandUrl: string,
  brandName?: string,
): Promise<BrandFactPack> {
  const hostname = (() => {
    try { return new URL(brandUrl).hostname.replace(/^www\./i, ""); }
    catch { return ""; }
  })();

  // Derive a nice name from hostname if none provided
  const resolvedBrandName = (brandName && brandName.trim())
    ? brandName.trim()
    : hostname.split(".")[0]
        ?.replace(/[_-]+/g, " ")
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
        .trim() || "Brand";

  // Step 1 – get brand colors from hostname presets (no scraping needed)
  const brandColors = extractBrandColors("", resolvedBrandName, brandUrl);

  // Step 2 – call ChatGPT with brand name + URL (GPT uses its own knowledge)
  const factPack = await callGPTForFactPack({
    brandName: resolvedBrandName,
    brandUrl,
    hostname,
  });

  // Merge the preset colors
  factPack.brandColors = brandColors;

  console.log(`[AI Research] Completed for "${resolvedBrandName}" (${brandUrl}):`, {
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
  brandName: string;
  brandUrl: string;
  hostname: string;
}): Promise<BrandFactPack> {
  const systemPrompt = `You are a senior brand research analyst. You will be given a brand name and its website URL.
Using your knowledge of the brand, produce a comprehensive, accurate research fact pack.

CRITICAL RULES:
1. "brandName" MUST be exactly "${ctx.brandName}". Never return "Brand" or a placeholder.
2. Every field must be SPECIFIC to ${ctx.brandName} — no generic text. Always mention the brand by name.
3. "category" must be precise (e.g. "Antivirus Software", "Flight Search Engine", "VPN Service", "Password Manager").
4. "editorialScore" should be realistic (6.0–9.5) based on ${ctx.brandName}'s actual market reputation.
5. "pros" and "cons" must be factual statements about ${ctx.brandName} as a product/service. 4–6 pros, 2–4 cons. Each 20–100 chars.
6. "features" should list 4–6 real ${ctx.brandName} product features (short labels). Provide a matching "featureDescriptions" array with a 2-3 sentence explanation of each feature.
7. "testimonials" should sound like real user reviews of ${ctx.brandName} with varied ratings (3–5) and distinct reviewer personas.
8. "faqItems" should contain 5–7 questions a real user would ask about ${ctx.brandName}. Each answer MUST be 3–5 sentences long with specific, useful detail — not one-liners.
9. "tagline" should be the brand's actual tagline or a short value proposition (max 150 chars).
10. "bestFor" should describe the ideal user of ${ctx.brandName} in one sentence.
11. "detailedReview" must be an array of 3 paragraphs (each 60-100 words) giving an original, substantive editorial review of ${ctx.brandName}. Cover: what it does well, where it falls short, and who benefits most. Write in a natural editorial voice — vary sentence length, use concrete details, avoid generic filler.
12. "historyBlurb" must be one paragraph (50-80 words) about ${ctx.brandName}'s background, founding story, or market evolution.
13. "comparisonNotes" must be one paragraph (50-80 words) comparing ${ctx.brandName} to 2-3 named competitors. Mention specific differentiators.
14. "savingTips" must be an array of 5 specific, actionable tips for saving money or getting the best deal when using ${ctx.brandName}. Each tip should be 1-2 sentences. For travel: booking timing, fare alerts, flexible dates, etc. For security: bundle deals, renewal discounts, free trials, etc. Be specific to ${ctx.brandName}.
15. "gettingStartedSteps" must be an array of 5-6 step-by-step instructions for a new user to get started with ${ctx.brandName}. Each step should be 1-2 sentences explaining exactly what to do. E.g. "Visit ${ctx.brandName}'s website and create a free account" → "Set up your preferences" → etc.
16. "alternativesComparison" must be an array of 3 objects, each with: "name" (real competitor name), "advantage" (one thing this competitor does better than ${ctx.brandName}), "disadvantage" (one thing ${ctx.brandName} does better). Use real competitor names.
17. "seasonalAdvice" must be 2-3 sentences about the best time of year or timing strategy for using ${ctx.brandName}. For travel: booking windows, seasonal pricing. For security: renewal periods, sale events. Be specific.
18. "heroImageUrl" must be a real, publicly accessible landscape-oriented image URL that visually represents ${ctx.brandName} or its category. Use a high-quality Unsplash URL in the format https://images.unsplash.com/photo-XXXXX?auto=format&fit=crop&w=1200&h=750&q=80. Category-specific guidance: for travel/flights/airlines/booking use an airplane or airport terminal photo; for cybersecurity/antivirus use a digital shield or lock; for VPN use a network or privacy visual; for finance use charts or currency. Pick a real Unsplash photo ID you know exists. Must be landscape/wide, never portrait or sunset/nature.
19. Return ONLY valid JSON — no markdown fences, no extra text.`;

  const userPrompt = `Research the brand "${ctx.brandName}" (website: ${ctx.brandUrl}).

Return this exact JSON structure with ALL fields filled in specifically for ${ctx.brandName}:
{
  "brandName": "${ctx.brandName}",
  "tagline": "${ctx.brandName}'s actual tagline or value proposition",
  "category": "specific product category",
  "keyBenefits": ["3-5 specific benefits of using ${ctx.brandName}"],
  "features": ["4-6 actual ${ctx.brandName} product features"],
  "featureDescriptions": ["2-3 sentence explanation for each feature above"],
  "targetAudience": "who ${ctx.brandName} is built for",
  "pricingInfo": "${ctx.brandName} pricing overview or null",
  "trustSignals": ["2-3 trust/credibility signals for ${ctx.brandName}"],
  "useCases": ["2-3 real use cases for ${ctx.brandName}"],
  "faqItems": [
    {"question": "What is ${ctx.brandName}?", "answer": "detailed answer"},
    {"question": "How much does ${ctx.brandName} cost?", "answer": "detailed answer"},
    {"question": "Is ${ctx.brandName} safe/reliable?", "answer": "detailed answer"}
  ],
  "tone": "professional",
  "pros": ["4-6 factual pros about ${ctx.brandName}"],
  "cons": ["2-4 honest cons about ${ctx.brandName}"],
  "editorialScore": 8.0,
  "bestFor": "the ideal ${ctx.brandName} user",
  "testimonials": [
    {"author": "Persona", "text": "Review of ${ctx.brandName}", "rating": 4},
    {"author": "Persona", "text": "Review of ${ctx.brandName}", "rating": 5},
    {"author": "Persona", "text": "Review of ${ctx.brandName}", "rating": 3}
  ],
  "detailedReview": ["paragraph 1 (60-100 words)", "paragraph 2 (60-100 words)", "paragraph 3 (60-100 words)"],
  "historyBlurb": "50-80 word paragraph about ${ctx.brandName} background",
  "comparisonNotes": "50-80 word paragraph comparing ${ctx.brandName} to named competitors",
  "savingTips": ["5 specific money-saving tips for using ${ctx.brandName}"],
  "gettingStartedSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ...", "Step 5: ..."],
  "alternativesComparison": [
    {"name": "Competitor 1", "advantage": "what they do better", "disadvantage": "what ${ctx.brandName} does better"},
    {"name": "Competitor 2", "advantage": "what they do better", "disadvantage": "what ${ctx.brandName} does better"},
    {"name": "Competitor 3", "advantage": "what they do better", "disadvantage": "what ${ctx.brandName} does better"}
  ],
  "seasonalAdvice": "2-3 sentences about best timing for using ${ctx.brandName}",
  "heroImageUrl": "https://images.unsplash.com/photo-XXXXX?auto=format&fit=crop&w=900&q=80"
}`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.65,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(raw) as BrandFactPack;

    // Validate and patch critical fields
    if (!parsed.brandName || parsed.brandName === "Brand") {
      parsed.brandName = ctx.brandName;
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
    // Final fallback – still use actual brand name, never "Brand"
    return buildFallbackFactPack(ctx.brandName, ctx.brandUrl);
  }
}

// ─── Fallback when GPT is unavailable ─────────────────────────────
function buildFallbackFactPack(
  brandName: string,
  url: string,
): BrandFactPack {
  const category = inferCategory(brandName + " " + url);

  return {
    brandName,
    tagline: `${brandName} – ${category}`,
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
