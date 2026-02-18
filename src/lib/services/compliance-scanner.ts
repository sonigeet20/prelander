import type { GeneratedPageContent, ComplianceScanResult, ComplianceViolation, PageSection } from "@/types";

/* ─── Banned Phrases ─────────────────────────────── */

const BANNED_PHRASES: Array<{ pattern: RegExp; rule: string; severity: "critical" | "warning"; suggestion: string }> = [
  { pattern: /\bofficial\s+(?:website|site|page|partner)\b/gi, rule: "no_official_claim", severity: "critical", suggestion: "Remove 'official' — use the brand name directly" },
  { pattern: /\b(?:the\s+)?best\b/gi, rule: "no_superlative", severity: "warning", suggestion: "Replace with 'a strong option' or 'well-regarded'" },
  { pattern: /\bguarantee[ds]?\b/gi, rule: "no_guarantee", severity: "critical", suggestion: "Replace with 'aims to' or 'designed to'" },
  { pattern: /\btop[\s-]?rated\b/gi, rule: "no_top_rated", severity: "critical", suggestion: "Replace with 'well-reviewed' or 'popular'" },
  { pattern: /\b#1\b|\bnumber\s+one\b/gi, rule: "no_number_one", severity: "critical", suggestion: "Remove ranking claim entirely" },
  { pattern: /\bmost\s+secure\b/gi, rule: "no_security_claim", severity: "critical", suggestion: "Replace with 'offers robust security features'" },
  { pattern: /\binstant\s+approval\b/gi, rule: "no_instant_approval", severity: "critical", suggestion: "Replace with 'quick application process'" },
  { pattern: /\bcheapest\b/gi, rule: "no_cheapest", severity: "warning", suggestion: "Replace with 'competitively priced' or 'affordable options'" },
  { pattern: /\bfastest\b/gi, rule: "no_fastest", severity: "warning", suggestion: "Replace with 'quick' or 'efficient'" },
  { pattern: /\brisk[\s-]?free\b/gi, rule: "no_risk_free", severity: "critical", suggestion: "Remove or rephrase — no financial product is risk-free" },
  { pattern: /\b100%\b/gi, rule: "no_absolute_claim", severity: "warning", suggestion: "Avoid absolute percentages in claims" },
  { pattern: /\bexclusive\s+(?:deal|offer|discount)\b/gi, rule: "no_exclusive_claim", severity: "warning", suggestion: "Replace with 'current deal' or 'available offer'" },
  { pattern: /\blimited\s+time\s+(?:only|offer)\b/gi, rule: "no_urgency", severity: "warning", suggestion: "Remove artificial urgency" },
  { pattern: /\bact\s+now\b/gi, rule: "no_urgency", severity: "warning", suggestion: "Remove pressure language" },
  { pattern: /\bmiracle\b|\bsecret\b|\bhack[s]?\b|\btrick[s]?\b/gi, rule: "no_clickbait", severity: "critical", suggestion: "Use factual, professional language" },
];

/* ─── Structural Checks ──────────────────────────── */

const NUMERIC_RATING = /\b\d+(?:\.\d+)?\s*\/\s*(?:5|10)\b/g;
const FABRICATED_STAT = /\b(?:studies?\s+show|research\s+(?:shows|proves|confirms)|according\s+to\s+(?:a\s+)?(?:recent\s+)?(?:study|survey|report))\b/gi;

/**
 * Scan generated page content for compliance violations.
 */
export function scanCompliance(content: GeneratedPageContent): ComplianceScanResult {
  const violations: ComplianceViolation[] = [];

  // Scan all text fields
  const textFields: Array<{ location: string; text: string }> = [
    { location: "title", text: content.title },
    { location: "metaDescription", text: content.metaDescription },
    { location: "h1", text: content.h1 },
  ];

  // Extract text from all sections
  content.sections.forEach((section, idx) => {
    const loc = `sections[${idx}].${section.type}`;
    if (section.heading) textFields.push({ location: `${loc}.heading`, text: section.heading });
    if (section.content) textFields.push({ location: `${loc}.content`, text: section.content });
    if (section.ctaText) textFields.push({ location: `${loc}.ctaText`, text: section.ctaText });
    if (section.items) {
      section.items.forEach((item, iIdx) => {
        Object.values(item).forEach((val) => {
          if (typeof val === "string") textFields.push({ location: `${loc}.items[${iIdx}]`, text: val });
        });
      });
    }
    if (section.highlights) {
      section.highlights.forEach((h, hIdx) => {
        textFields.push({ location: `${loc}.highlights[${hIdx}]`, text: `${h.label} ${h.value}` });
      });
    }
  });

  // Check banned phrases
  for (const field of textFields) {
    for (const banned of BANNED_PHRASES) {
      const match = field.text.match(banned.pattern);
      if (match) {
        violations.push({
          rule: banned.rule,
          severity: banned.severity,
          location: field.location,
          original: match[0],
          suggestion: banned.suggestion,
        });
      }
    }

    // Check numeric ratings
    const ratingMatch = field.text.match(NUMERIC_RATING);
    if (ratingMatch) {
      violations.push({
        rule: "no_numeric_rating",
        severity: "critical",
        location: field.location,
        original: ratingMatch[0],
        suggestion: "Remove numeric rating — use qualitative descriptions instead",
      });
    }

    // Check fabricated statistics
    const statMatch = field.text.match(FABRICATED_STAT);
    if (statMatch) {
      violations.push({
        rule: "no_unverifiable_stats",
        severity: "warning",
        location: field.location,
        original: statMatch[0],
        suggestion: "Remove unattributed study references — state facts directly or cite specific sources",
      });
    }
  }

  // Structural checks
  const hasDisclosure = content.sections.some((s) => s.type === "disclosure");
  if (!hasDisclosure) {
    violations.push({
      rule: "missing_disclosure",
      severity: "critical",
      location: "sections",
      original: "(missing)",
      suggestion: "Add disclosure section about affiliate links",
    });
  }

  const hasFaq = content.sections.some((s) => s.type === "faq");
  if (!hasFaq) {
    violations.push({
      rule: "missing_faq",
      severity: "warning",
      location: "sections",
      original: "(missing)",
      suggestion: "Add FAQ section for comprehensive content",
    });
  }

  // Title length check
  if (content.title.length > 65) {
    violations.push({
      rule: "title_too_long",
      severity: "warning",
      location: "title",
      original: content.title,
      suggestion: "Shorten title to under 65 characters",
    });
  }

  // Meta description length
  if (content.metaDescription.length > 165) {
    violations.push({
      rule: "meta_too_long",
      severity: "warning",
      location: "metaDescription",
      original: content.metaDescription,
      suggestion: "Shorten meta description to under 165 characters",
    });
  }

  // ─── Content Depth Checks ─────────────────────────
  // Count total word count across all content sections
  const totalWords = textFields.reduce((sum, f) => sum + f.text.split(/\s+/).length, 0);

  if (totalWords < 1500) {
    violations.push({
      rule: "content_too_thin",
      severity: "critical",
      location: "sections",
      original: `Total word count: ${totalWords}`,
      suggestion: "Content must be at least 1500 words. Current content is too thin to provide real user value.",
    });
  } else if (totalWords < 2500) {
    violations.push({
      rule: "content_below_target",
      severity: "warning",
      location: "sections",
      original: `Total word count: ${totalWords}`,
      suggestion: "Target at least 3000 words for comprehensive coverage.",
    });
  }

  // Check section diversity — pages should have variety
  const sectionTypes = new Set(content.sections.map(s => s.type));
  if (sectionTypes.size < 5) {
    violations.push({
      rule: "low_section_diversity",
      severity: "warning",
      location: "sections",
      original: `Only ${sectionTypes.size} unique section types`,
      suggestion: "Include more varied sections (tables, tips, FAQ, checklists) for richer content.",
    });
  }

  // Check FAQ depth
  const faqSection = content.sections.find(s => s.type === "faq");
  if (faqSection?.items) {
    if (faqSection.items.length < 5) {
      violations.push({
        rule: "faq_too_few",
        severity: "warning",
        location: "sections.faq",
        original: `Only ${faqSection.items.length} FAQ items`,
        suggestion: "Include at least 5 FAQ items for comprehensive coverage.",
      });
    }
  }

  // Check that content_blocks have subsections
  const contentBlocks = content.sections.filter(s => s.type === "content_block" && s.content);
  for (let i = 0; i < contentBlocks.length; i++) {
    const block = contentBlocks[i];
    const wordCount = (block.content || "").split(/\s+/).length;
    if (wordCount < 200) {
      violations.push({
        rule: "thin_content_block",
        severity: "warning",
        location: `sections.content_block[${i}]`,
        original: `${wordCount} words in "${block.heading || "untitled"}"`,
        suggestion: "Each content block should be at least 300 words with subsections.",
      });
    }
  }

  const criticalCount = violations.filter((v) => v.severity === "critical").length;
  const warningCount = violations.filter((v) => v.severity === "warning").length;

  // Score: start at 100, deduct for violations, BONUS for depth
  let score = 100 - criticalCount * 20 - warningCount * 5;

  // Depth bonuses (can bring score above 100, capped at 100)
  if (totalWords >= 3000) score += 5;
  if (totalWords >= 4000) score += 5;
  if (sectionTypes.size >= 7) score += 5;
  if (sectionTypes.size >= 9) score += 5;
  if (faqSection?.items && faqSection.items.length >= 6) score += 3;
  if (contentBlocks.length >= 3) score += 3;

  score = Math.max(0, Math.min(100, score));

  return {
    passed: criticalCount === 0,
    score,
    violations,
  };
}

/**
 * Auto-fix compliance violations by applying text replacements.
 */
export function autoFixContent(
  content: GeneratedPageContent,
  violations: ComplianceViolation[]
): GeneratedPageContent {
  // Deep clone
  const fixed = JSON.parse(JSON.stringify(content)) as GeneratedPageContent;

  const REPLACEMENTS: Record<string, string> = {
    "official website": "website",
    "official site": "website",
    "official partner": "partner",
    "official page": "website",
    "the best": "a strong choice for",
    "best": "well-regarded",
    "guaranteed": "designed to provide",
    "guarantees": "aims to provide",
    "guarantee": "commitment to quality",
    "top-rated": "well-reviewed",
    "top rated": "well-reviewed",
    "#1": "a leading",
    "number one": "a leading",
    "most secure": "offers robust security features",
    "instant approval": "streamlined application process",
    "cheapest": "competitively priced",
    "fastest": "quick and efficient",
    "risk-free": "with consumer protections",
    "risk free": "with consumer protections",
    "100%": "high degree of",
    "exclusive deal": "current deal",
    "exclusive offer": "available offer",
    "exclusive discount": "available discount",
    "limited time only": "currently available",
    "limited time offer": "current promotion",
    "act now": "learn more",
    "miracle": "effective",
    "secret": "useful",
    "hacks": "strategies",
    "hack": "strategy",
    "tricks": "methods",
    "trick": "method",
  };

  function fixText(text: string): string {
    let result = text;
    for (const [from, to] of Object.entries(REPLACEMENTS)) {
      const regex = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      result = result.replace(regex, to);
    }
    // Remove numeric ratings
    result = result.replace(/\b\d+(?:\.\d+)?\s*\/\s*(?:5|10)\b/g, "highly regarded");
    return result;
  }

  fixed.title = fixText(fixed.title);
  fixed.metaDescription = fixText(fixed.metaDescription);
  fixed.h1 = fixText(fixed.h1);

  fixed.sections = fixed.sections.map((section) => ({
    ...section,
    heading: section.heading ? fixText(section.heading) : section.heading,
    content: section.content ? fixText(section.content) : section.content,
    ctaText: section.ctaText ? fixText(section.ctaText) : section.ctaText,
    items: section.items?.map((item) => {
      const fixedItem: Record<string, string> = {};
      for (const [k, v] of Object.entries(item)) {
        fixedItem[k] = typeof v === "string" ? fixText(v) : v;
      }
      return fixedItem;
    }),
  }));

  // Ensure disclosure
  if (!fixed.sections.some((s) => s.type === "disclosure")) {
    fixed.sections.push({
      type: "disclosure",
      heading: "Disclosure",
      content:
        "This page contains links to third-party websites. We may earn a commission if you make a purchase through these links, at no additional cost to you. This does not influence our editorial content.",
    });
  }

  // Truncate title if needed
  if (fixed.title.length > 65) {
    fixed.title = fixed.title.slice(0, 62) + "...";
  }
  if (fixed.metaDescription.length > 165) {
    fixed.metaDescription = fixed.metaDescription.slice(0, 162) + "...";
  }

  return fixed;
}
