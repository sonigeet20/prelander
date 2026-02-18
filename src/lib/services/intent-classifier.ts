import { getOpenAI } from "@/lib/openai";
import type { IntentClassificationResult, IntentType } from "@/types";

/* ─── Rule-based keyword patterns ───────────────── */

const INTENT_PATTERNS: Array<{ pattern: RegExp; intent: IntentType; confidence: number }> = [
  // Comparison
  { pattern: /\bvs\.?\b|\bversus\b|\bcompare\b|\bcomparison\b|\balternatives?\b/i, intent: "comparison", confidence: 0.9 },

  // Pricing
  { pattern: /\bpric(?:e|ing|es)\b|\bcost\b|\bplan[s]?\b|\bfree\s+trial\b|\bhow\s+much\b/i, intent: "pricing", confidence: 0.9 },

  // Validation / Review
  { pattern: /\breview[s]?\b|\bworth\s+it\b|\blegit\b|\bscam\b|\breliable\b|\bsafe\b|\btrust\b/i, intent: "validation", confidence: 0.85 },

  // Route-specific (travel: "city to city")
  { pattern: /\bflights?\s+(?:from\s+)?[\w\s]+\bto\b\s+[\w\s]+/i, intent: "route_specific", confidence: 0.9 },
  { pattern: /[\w]+\s+to\s+[\w]+\s+(?:flights?|trains?|bus)/i, intent: "route_specific", confidence: 0.9 },

  // Destination-specific (travel) — only if a city is likely present
  { pattern: /\bflights?\s+to\s+\w+/i, intent: "destination_specific", confidence: 0.8 },
  { pattern: /\bbest\s+time\s+to\s+(?:visit|travel|fly)\s+\w+/i, intent: "destination_specific", confidence: 0.85 },
  // Generic travel patterns — NOT destination_specific without a city
  { pattern: /\bcheap\s+(?:flights?|hotels?|travel)\b/i, intent: "comparison", confidence: 0.75 },

  // Problem → Solution
  { pattern: /\bhow\s+to\b|\bfix\b|\bsolve\b|\btroubleshoot\b|\bsetup\b|\binstall\b/i, intent: "problem_solution", confidence: 0.85 },

  // Use case
  { pattern: /\bfor\s+(?:small\s+)?business\b|\bfor\s+(?:students?|teams?|enterprise|beginners?)\b/i, intent: "use_case", confidence: 0.85 },

  // Transactional
  { pattern: /\bbuy\b|\bsign\s+up\b|\bdownload\b|\bsubscribe\b|\bget\s+started\b|\bdiscount\b|\bcoupon\b|\bpromo\b|\bdeal[s]?\b/i, intent: "transactional", confidence: 0.85 },

  // Informational (catch-all for "what is", "guide", etc.)
  { pattern: /\bwhat\s+is\b|\bguide\b|\btutorial\b|\bexplain\b|\boverview\b|\bintroduction\b/i, intent: "informational", confidence: 0.8 },
];

/* ─── City name detection ────────────────────────── */

const MAJOR_CITIES = [
  "london", "paris", "new york", "tokyo", "dubai", "singapore", "bangkok",
  "amsterdam", "barcelona", "rome", "berlin", "istanbul", "hong kong",
  "los angeles", "chicago", "san francisco", "mumbai", "delhi", "sydney",
  "toronto", "miami", "seattle", "boston", "madrid", "lisbon", "prague",
  "vienna", "zurich", "athens", "cairo", "cape town", "nairobi",
  "manchester", "edinburgh", "dublin", "glasgow", "birmingham",
];

function detectCities(keyword: string): string[] {
  const kw = keyword.toLowerCase();
  return MAJOR_CITIES.filter((city) => kw.includes(city));
}

/**
 * Classify search intent for a keyword using rules + LLM fallback.
 */
export async function classifyIntent(
  keyword: string,
  verticalType?: string
): Promise<IntentClassificationResult> {
  const cities = detectCities(keyword);

  // Step 1: Rule-based matching (first match wins)
  for (const { pattern, intent, confidence } of INTENT_PATTERNS) {
    if (pattern.test(keyword)) {
      // Override: if cities detected + travel vertical, prefer route/destination
      if (cities.length >= 2 && verticalType === "travel") {
        return {
          intentType: "route_specific",
          confidence: 0.95,
          reasoning: `Detected route between ${cities[0]} and ${cities[1]}`,
          detectedEntities: { cities },
        };
      }
      if (cities.length === 1 && verticalType === "travel") {
        return {
          intentType: "destination_specific",
          confidence: 0.9,
          reasoning: `Detected destination: ${cities[0]}`,
          detectedEntities: { cities },
        };
      }
      // Guard: if matched destination_specific or route_specific but no cities detected, downgrade
      let finalIntent = intent;
      if (intent === "destination_specific" && cities.length === 0) {
        finalIntent = "comparison" as IntentType;
      }
      if (intent === "route_specific" && cities.length < 2) {
        finalIntent = cities.length === 1 ? "destination_specific" as IntentType : "comparison" as IntentType;
      }
      return {
        intentType: finalIntent,
        confidence,
        reasoning: `Matched pattern: ${pattern.source}${finalIntent !== intent ? ` (downgraded from ${intent}: no cities in keyword)` : ""}`,
        detectedEntities: { cities: cities.length > 0 ? cities : undefined },
      };
    }
  }

  // Step 2: LLM fallback
  const openai = getOpenAI();
  const prompt = `Classify the search intent of this keyword.

Keyword: "${keyword}"
${verticalType ? `Brand vertical: ${verticalType}` : ""}

Intent categories (pick ONE):
- transactional: User wants to buy, sign up, or take action
- comparison: User wants to compare products/services
- validation: User wants reviews, trust signals, or legitimacy check
- pricing: User wants pricing info, plans, costs
- route_specific: User searching for travel between two specific named locations (both origin and destination MUST be explicitly mentioned)
- destination_specific: User searching about traveling to a specific named place (the place name MUST appear in the keyword)
- use_case: User looking for a solution for a specific use case
- problem_solution: User has a problem and wants to solve it
- informational: User wants general information or education

CRITICAL RULES:
- Only use "route_specific" if TWO specific city/location names are explicitly mentioned in the keyword.
- Only use "destination_specific" if a specific city/location name is explicitly mentioned in the keyword.
- NEVER invent, assume, or hallucinate city names that are NOT literally present in the keyword text.
- If the keyword is generic (e.g. "best flight comparison site", "cheap flights"), classify as "comparison" or "informational", NOT "destination_specific".
- detectedEntities.cities should ONLY contain city names that literally appear in the keyword text.

Also extract any entities: city names, brand names, product names, dates/months.

Respond in JSON: {"intentType": "...", "confidence": 0.0-1.0, "reasoning": "...", "detectedEntities": {"cities": [], "brands": [], "products": [], "dates": []}}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 300,
  });

  try {
    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
    let intentType: IntentType = parsed.intentType || "informational";
    const detectedEntities = parsed.detectedEntities || {};

    // CRITICAL: Validate detected cities actually appear in the keyword text
    if (detectedEntities.cities && Array.isArray(detectedEntities.cities)) {
      const kwLower = keyword.toLowerCase();
      detectedEntities.cities = detectedEntities.cities.filter(
        (city: string) => kwLower.includes(city.toLowerCase())
      );
    }

    // If LLM said destination_specific or route_specific but no valid cities found, downgrade
    if (intentType === "destination_specific" && (!detectedEntities.cities || detectedEntities.cities.length === 0)) {
      intentType = "comparison";
      parsed.reasoning = `Downgraded from destination_specific: no city names found in keyword "${keyword}"`;
    }
    if (intentType === "route_specific" && (!detectedEntities.cities || detectedEntities.cities.length < 2)) {
      intentType = detectedEntities.cities?.length === 1 ? "destination_specific" : "comparison";
      parsed.reasoning = `Downgraded from route_specific: insufficient city names in keyword "${keyword}"`;
    }

    return {
      intentType,
      confidence: parsed.confidence || 0.6,
      reasoning: parsed.reasoning || "LLM classification",
      detectedEntities,
    };
  } catch {
    return {
      intentType: "informational",
      confidence: 0.5,
      reasoning: "Failed to parse LLM response",
      detectedEntities: {},
    };
  }
}

/**
 * Batch classify multiple keywords.
 */
export async function classifyKeywords(
  keywords: string[],
  verticalType?: string
): Promise<IntentClassificationResult[]> {
  return Promise.all(keywords.map((kw) => classifyIntent(kw, verticalType)));
}
