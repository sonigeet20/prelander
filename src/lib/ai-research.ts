import "server-only";

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

export async function extractBrandInfo(url: string): Promise<BrandFactPack> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Prelander/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();

    const decodeHtml = (input: string) =>
      input
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

    // Extract text content from HTML
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? decodeHtml(titleMatch[1].trim()) : "";

    // Extract meta description
    const descMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
    );
    const description = descMatch ? decodeHtml(descMatch[1].trim()) : "";

    // Extract headings
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];

    const headings = [...h1Matches, ...h2Matches]
      .map((h) => h.replace(/<[^>]+>/g, "").trim())
      .filter((h) => h.length > 0 && h.length < 200);

    console.log(`Extracted ${headings.length} headings from ${url}`);

    // Extract clean brand name from URL or title
    const hostname = new URL(url).hostname.replace(/^www\./i, "");
    const hostBrand = hostname.split(".")[0] || "Brand";
    let brandName = title.split(/[-|]/)[0]?.trim() || hostBrand;
    const isGenericTitle =
      /flight ticket booking|cheap flights|air tickets|book flights|compare|search flights|hotel deals|travel deals/i.test(
        brandName,
      ) ||
      brandName.length > 40;
    // Remove common suffixes and clean up
    brandName = brandName
      .replace(/&amp;/g, "&")
      .replace(/(_CLD|_cld|\s+CLD|\s+cld)$/i, "")
      .replace(/[_-]+/g, " ")
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();

    if (isGenericTitle) {
      brandName = hostBrand
        .replace(/[_-]+/g, " ")
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
        .trim();
    }

    const brandColors = extractBrandColors(html, brandName, url);

    // Build fact pack with extracted data
    const factPack: BrandFactPack = {
      brandName: brandName,
      tagline: description.slice(0, 150),
      category: inferCategory(textContent),
      keyBenefits: extractBenefits(textContent, headings),
      features: extractFeatures(textContent, headings),
      targetAudience: inferAudience(textContent),
      pricingInfo: extractPricing(textContent),
      trustSignals: extractTrustSignals(textContent),
      useCases: extractUseCases(textContent, headings),
      faqItems: extractFAQs(textContent),
      tone: inferTone(textContent),
      pros: extractProsAndCons(textContent, headings).pros,
      cons: extractProsAndCons(textContent, headings).cons,
      editorialScore: generateEditorialScore(textContent),
      bestFor: inferBestFor(textContent),
      testimonials: extractTestimonials(textContent),
      brandColors,
    };

    console.log(`Extracted fact pack:`, {
      brandName: factPack.brandName,
      category: factPack.category,
      prosCount: factPack.pros.length,
      consCount: factPack.cons.length,
      score: factPack.editorialScore,
    });
    
    console.log(`Pros extracted:`, factPack.pros);
    console.log(`Cons extracted:`, factPack.cons);

    return factPack;
  } catch (error) {
    console.error("Brand research error:", error);
    
    // Derive a better brand name from the URL instead of "Brand"
    let fallbackBrandName = "Brand";
    try {
      const hostname = new URL(url).hostname.replace(/^www\./i, "");
      const hostPart = hostname.split(".")[0] || "Brand";
      fallbackBrandName = hostPart
        .replace(/[_-]+/g, " ")
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
        .trim();
    } catch {}
    
    // Return fallback fact pack with URL-derived brand name
    return {
      brandName: fallbackBrandName,
      category: "Service Provider",
      keyBenefits: [
        "Comprehensive service offering",
        "User-friendly experience",
        "Trusted platform",
      ],
      features: [
        "Easy to use interface",
        "Secure platform",
        "Customer support available",
        "Cross-device compatibility",
      ],
      trustSignals: ["Established service", "Secure platform"],
      useCases: [
        "Suitable for various needs",
        "Flexible usage options",
      ],
      faqItems: [
        {
          question: "How does this work?",
          answer: "Visit the official website to learn more about features and get started.",
        },
      ],
      tone: "professional",
      pros: [
        "Established service in the market",
        "Wide range of options available",
        "Transparent pricing",
      ],
      cons: [
        "May vary by region",
        "Additional terms may apply",
      ],
      editorialScore: 7.5,
      bestFor: "Users seeking reliable service",
    };
  }
}

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

function extractBenefits(content: string, headings: string[]): string[] {
  const benefits: string[] = [];
  const benefitKeywords = ["benefit", "advantage", "why", "best", "save", "fast", "easy"];

  for (const heading of headings) {
    if (benefitKeywords.some((kw) => heading.toLowerCase().includes(kw))) {
      benefits.push(heading);
    }
  }

  // Extract sentences with benefit indicators
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  for (const sentence of sentences.slice(0, 50)) {
    if (
      sentence.toLowerCase().includes("you can") ||
      sentence.toLowerCase().includes("helps you") ||
      sentence.toLowerCase().includes("allows you")
    ) {
      benefits.push(sentence.trim().slice(0, 120));
    }
  }

  return benefits.slice(0, 6).map((b) => b.trim());
}

function extractFeatures(content: string, headings: string[]): string[] {
  const features: string[] = [];
  const featureKeywords = ["feature", "include", "offer", "provide"];

  for (const heading of headings) {
    if (featureKeywords.some((kw) => heading.toLowerCase().includes(kw))) {
      features.push(heading);
    }
  }

  return features.length > 0
    ? features.slice(0, 6)
    : [
        "Comprehensive functionality",
        "User-friendly interface",
        "Reliable performance",
        "Secure platform",
      ];
}

function inferAudience(content: string): string {
  if (content.toLowerCase().includes("business")) return "Businesses and professionals";
  if (content.toLowerCase().includes("student")) return "Students and learners";
  if (content.toLowerCase().includes("family")) return "Families";
  return "Individuals and organizations";
}

function extractPricing(content: string): string | undefined {
  const pricingMatch = content.match(/\$\d+(?:\.\d{2})?(?:\s*(?:per|\/)\s*\w+)?/);
  if (pricingMatch) {
    return pricingMatch[0];
  }

  if (content.toLowerCase().includes("free")) return "Free plan available";
  if (content.toLowerCase().includes("subscription")) return "Subscription-based pricing";

  return undefined;
}

function extractTrustSignals(content: string): string[] {
  const signals: string[] = [];

  if (/\d+[km]?\+?\s*(?:users|customers|members)/i.test(content)) {
    const match = content.match(/(\d+[km]?\+?\s*(?:users|customers|members))/i);
    if (match) signals.push(`Trusted by ${match[1]}`);
  }

  if (content.toLowerCase().includes("secure") || content.toLowerCase().includes("ssl")) {
    signals.push("Secure & encrypted");
  }

  if (content.toLowerCase().includes("24/7") || content.toLowerCase().includes("support")) {
    signals.push("24/7 support available");
  }

  if (content.toLowerCase().includes("verified")) {
    signals.push("Verified service");
  }

  return signals;
}

function extractUseCases(content: string, headings: string[]): string[] {
  const useCases: string[] = [];

  for (const heading of headings) {
    if (
      heading.toLowerCase().includes("for") ||
      heading.toLowerCase().includes("use case") ||
      heading.toLowerCase().includes("perfect")
    ) {
      useCases.push(heading);
    }
  }

  return useCases.length > 0
    ? useCases.slice(0, 4)
    : ["Ideal for everyday use", "Perfect for professionals"];
}

function extractFAQs(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  // Look for question patterns
  const sentences = content.split(/[.!?]+/);
  for (let i = 0; i < sentences.length - 1; i++) {
    const sentence = sentences[i]?.trim();
    if (
      sentence &&
      (sentence.endsWith("?") ||
        sentence.toLowerCase().startsWith("how") ||
        sentence.toLowerCase().startsWith("what") ||
        sentence.toLowerCase().startsWith("why"))
    ) {
      const answer = sentences[i + 1]?.trim();
      if (answer && answer.length > 20 && answer.length < 300) {
        faqs.push({
          question: sentence.endsWith("?") ? sentence : sentence + "?",
          answer: answer,
        });
      }
    }
  }

  return faqs.slice(0, 5);
}

function inferTone(content: string): "professional" | "casual" | "premium" | "friendly" {
  const lowerContent = content.toLowerCase();

  if (
    lowerContent.includes("luxury") ||
    lowerContent.includes("premium") ||
    lowerContent.includes("exclusive")
  ) {
    return "premium";
  }

  if (
    lowerContent.includes("hey") ||
    lowerContent.includes("awesome") ||
    lowerContent.includes("cool")
  ) {
    return "casual";
  }

  if (
    lowerContent.includes("welcome") ||
    lowerContent.includes("easy") ||
    lowerContent.includes("simple")
  ) {
    return "friendly";
  }

  return "professional";
}

function extractBrandColors(html: string, brandName: string, url: string): {
  primary: string;
  secondary: string;
  accent: string;
  soft: string;
} {
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  })();

  const hostnamePresets: Record<string, { primary: string; secondary: string; accent: string; soft: string }> = {
    "skyscanner.co.in": {
      primary: "#00A1DE",
      secondary: "#0B1F2A",
      accent: "#FF6B00",
      soft: "#E6F6FD",
    },
    "skyscanner.com": {
      primary: "#00A1DE",
      secondary: "#0B1F2A",
      accent: "#FF6B00",
      soft: "#E6F6FD",
    },
    "kayak.com": {
      primary: "#FF690F",
      secondary: "#1A1A1A",
      accent: "#00AEEF",
      soft: "#FFF1E8",
    },
    "booking.com": {
      primary: "#003580",
      secondary: "#001B3A",
      accent: "#FDBB02",
      soft: "#E6EEF9",
    },
    "mcafee.com": {
      primary: "#C01818",
      secondary: "#1A1A1A",
      accent: "#E8292E",
      soft: "#FDEAEA",
    },
    "norton.com": {
      primary: "#FFCC00",
      secondary: "#1A1A1A",
      accent: "#006B3F",
      soft: "#FFFDE6",
    },
    "nordvpn.com": {
      primary: "#4687FF",
      secondary: "#0D1117",
      accent: "#6BF178",
      soft: "#E8F0FF",
    },
    "surfshark.com": {
      primary: "#178DED",
      secondary: "#0B1929",
      accent: "#00D4AA",
      soft: "#E6F4FD",
    },
    "expressvpn.com": {
      primary: "#DA3940",
      secondary: "#1A1A1A",
      accent: "#4DBA6D",
      soft: "#FDEBEC",
    },
    "kaspersky.com": {
      primary: "#006D5C",
      secondary: "#003C30",
      accent: "#7BC143",
      soft: "#E6F5F2",
    },
    "bitdefender.com": {
      primary: "#ED1C24",
      secondary: "#1A1A1A",
      accent: "#00A1DE",
      soft: "#FDEAEA",
    },
    "avast.com": {
      primary: "#FF7800",
      secondary: "#1E1E1E",
      accent: "#6C2BD9",
      soft: "#FFF4E6",
    },
  };

  if (hostnamePresets[hostname]) {
    return hostnamePresets[hostname];
  }

  const themeColorMatch = html.match(
    /<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i,
  );
  const tileColorMatch = html.match(
    /<meta[^>]+name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i,
  );
  const cssVarMatch = html.match(/--(?:brand|primary|color)-[a-z-]*:\s*(#[0-9a-fA-F]{3,6})/i);
  const rawColor = themeColorMatch?.[1] || tileColorMatch?.[1] || "";
  const cssColor = cssVarMatch?.[1] ? normalizeColor(cssVarMatch[1]) : null;
  const primary = cssColor || normalizeColor(rawColor) || colorFromString(brandName || url);

  const { h, s, l } = hexToHsl(primary);
  const secondary = hslToHex(h, Math.max(20, s - 25), Math.max(18, l - 25));
  const accent = hslToHex((h + 35) % 360, Math.min(85, s + 10), Math.min(55, l + 10));
  const soft = hslToHex(h, Math.max(10, s - 35), Math.min(96, l + 40));

  return { primary, secondary, accent, soft };
}

function normalizeColor(input: string): string | null {
  if (!input) return null;
  const value = input.trim();
  if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) {
    if (value.length === 4) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase();
    }
    return value.toUpperCase();
  }
  const rgbMatch = value.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch.slice(1, 4).map((v) => Math.min(255, Math.max(0, Number(v))));
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
    [r, g, b]
      .map((val) => val.toString(16).padStart(2, "0"))
      .join("")
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

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
  } else if (h >= 120 && h < 180) {
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const rr = Math.round((r + m) * 255);
  const gg = Math.round((g + m) * 255);
  const bb = Math.round((b + m) * 255);
  return rgbToHex(rr, gg, bb);
}

function extractProsAndCons(content: string, headings: string[]): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  // Split into sentences for better extraction
  const sentences = content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 150);

  // Positive patterns - things the service DOES or HAS
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    
    // Numbers + positive things ("1200+ airlines", "free to use")
    if (/\d+[km+,]*\s*(?:\+|plus|or more)?\s+(?:airlines|hotels|options|users|deals|providers)/i.test(sentence)) {
      pros.push(sentence);
      continue;
    }
    
    // Free/No cost mentions
    if (/(?:free|no (?:cost|fee|charge|booking fee)|zero (?:cost|fee))/i.test(lower)) {
      pros.push(sentence);
      continue;
    }
    
    // Compare/Search capabilities
    if (/(?:compare|search|find|scan)\s+(?:all|hundreds|thousands|millions|over)/i.test(lower)) {
      pros.push(sentence);
      continue;
    }
    
    // Alert/notification features
    if (/(?:price alert|notifications?|track price|monitor)/i.test(lower)) {
      pros.push(sentence);
      continue;
    }
    
    // Speed/convenience
    if (/(?:instant|quick|fast|easy|simple)(?:ly)?\s+(?:search|compare|book|find)/i.test(lower)) {
      pros.push(sentence);
      continue;
    }
    
    // Mobile/app availability
    if (/(?:mobile app|ios|android|download|smartphone)/i.test(lower)) {
      pros.push(sentence);
      continue;
    }
  }

  // Negative patterns - limitations or things they DON'T do
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    
    // Doesn't/don't do something
    if (/(?:doesn't|don't|does not|do not)\s+(?:book|operate|provide|offer|include)/i.test(lower)) {
      cons.push(sentence);
      continue;
    }
    
    // Redirects/third-party
    if (/(?:redirect|third[\s-]party|partner site|external site|will take you)/i.test(lower)) {
      cons.push(sentence);
      continue;
    }
    
    // Price changes/variability
    if (/(?:prices? (?:may|can|might) (?:change|vary|differ)|not guaranteed)/i.test(lower)) {
      cons.push(sentence);
      continue;
    }
    
    // Limited options
    if (/(?:limited|only available|not available|restricted to)/i.test(lower)) {
      cons.push(sentence);
      continue;
    }
    
    // Requirements
    if (/(?:must|required to|need to|have to)\s+(?:create|register|sign up|provide)/i.test(lower)) {
      cons.push(sentence);
      continue;
    }
  }

  // If we didn't find any pros/cons, generate category-specific ones
  if (pros.length === 0 && cons.length === 0) {
    // Check category-specific defaults based on content/headings
    const contentLower = content.toLowerCase();
    const allText = (content + ' ' + headings.join(' ')).toLowerCase();
    
    // Travel/Flight booking sites
    if (/(?:flight|airline|travel|booking|ticket|hotel)/i.test(allText)) {
      pros.push(
        'Compare prices across multiple airlines and travel providers',
        'Free to use - no booking fees',
        'Search and compare thousands of flight options',
        'Price alerts help you find the best deals'
      );
      cons.push(
        "Doesn't book flights directly - redirects to airline or partner sites",
        'Prices may change when you reach the booking site',
        'Some filters may require sign-up'
      );
    }
    // E-commerce/Shopping
    else if (/(?:shop|store|product|buy|purchase|cart)/i.test(allText)) {
      pros.push(
        'Wide selection of products',
        'Secure checkout process',
        'Multiple payment options',
        'Customer reviews available'
      );
      cons.push(
        'Shipping costs may apply',
        'Return policy varies by seller',
        'Some items may have limited stock'
      );
    }
    // SaaS/Software
    else if (/(?:software|platform|dashboard|api|integration)/i.test(allText)) {
      pros.push(
        'User-friendly interface',
        'Regular updates and improvements',
        'Good customer support',
        'Flexible pricing plans'
      );
      cons.push(
        'Learning curve for advanced features',
        'Requires subscription',
        'Some features only in higher tiers'
      );
    }
    // Generic fallback
    else {
      pros.push(
        'Established service in the market',
        'Wide range of options available',
        'User-friendly platform'
      );
      cons.push(
        'May vary by region',
        'Additional terms may apply'
      );
    }
  }

  // Clean and deduplicate
  const cleanedPros = [...new Set(pros)]
    .filter(p => {
      const lower = p.toLowerCase();
      return p.length >= 20 && 
             p.length <= 120 && 
             !lower.includes('http') &&
             !lower.includes('click here') &&
             !lower.includes('learn more');
    })
    .slice(0, 6);
    
  const cleanedCons = [...new Set(cons)]
    .filter(c => {
      const lower = c.toLowerCase();
      return c.length >= 20 && 
             c.length <= 120 && 
             !lower.includes('http');
    })
    .slice(0, 5);

  console.log(`Extracted ${cleanedPros.length} pros and ${cleanedCons.length} cons`);

  return {
    pros: cleanedPros,
    cons: cleanedCons,
  };
}

function generateEditorialScore(content: string): number {
  let score = 7.0; // Base score

  // Increase for positive signals
  if (content.toLowerCase().includes("best")) score += 0.5;
  if (content.toLowerCase().includes("award")) score += 0.5;
  if (content.toLowerCase().includes("trusted")) score += 0.3;
  if (content.toLowerCase().includes("secure")) score += 0.2;
  if (/\d+[km]?\+?\s*(?:users|customers)/i.test(content)) score += 0.5;

  return Math.min(score, 9.5);
}

function inferBestFor(content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes("budget") || lower.includes("affordable") || lower.includes("cheap")) {
    return "Budget-conscious users looking for affordability";
  }
  if (lower.includes("business") || lower.includes("enterprise") || lower.includes("professional")) {
    return "Businesses and professionals";
  }
  if (lower.includes("beginner") || lower.includes("easy") || lower.includes("simple")) {
    return "Beginners and those seeking simplicity";
  }
  if (lower.includes("advanced") || lower.includes("power")) {
    return "Advanced users and power users";
  }
  if (lower.includes("family")) {
    return "Families and households";
  }

  return "Users seeking quality and reliability";
}

function extractTestimonials(content: string): Array<{ author: string; text: string; rating?: number }> {
  const testimonials: Array<{ author: string; text: string; rating?: number }> = [];

  // Look for quoted text (often testimonials)
  const quoteMatches = content.match(/[""']([^""']{30,200})[""']/g);
  if (quoteMatches) {
    for (const quote of quoteMatches.slice(0, 3)) {
      const text = quote.replace(/[""']/g, "").trim();
      if (text.length > 30) {
        testimonials.push({
          author: "Verified User",
          text: text,
          rating: 5,
        });
      }
    }
  }

  return testimonials;
}
