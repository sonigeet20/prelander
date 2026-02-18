import { getOpenAI } from "@/lib/openai";
import type { VerticalClassificationResult, VerticalType } from "@/types";

const DOMAIN_RULES: Record<string, VerticalType> = {
  "skyscanner": "travel",
  "booking.com": "travel",
  "expedia": "travel",
  "kayak": "travel",
  "tripadvisor": "travel",
  "airbnb": "travel",
  "hotels.com": "travel",
  "mcafee": "b2b_saas",
  "norton": "b2b_saas",
  "shopify": "b2b_saas",
  "salesforce": "b2b_saas",
  "hubspot": "b2b_saas",
  "stripe": "finance",
  "paypal": "finance",
  "robinhood": "finance",
  "netflix": "subscription",
  "spotify": "subscription",
  "amazon": "ecommerce",
  "ebay": "ecommerce",
};

/**
 * Classify a brand's vertical using rules + LLM fallback.
 */
export async function classifyVertical(
  domain: string,
  name: string,
  description?: string
): Promise<VerticalClassificationResult> {
  // Step 1: Rule-based matching
  const domainLower = domain.toLowerCase();
  for (const [pattern, vertical] of Object.entries(DOMAIN_RULES)) {
    if (domainLower.includes(pattern)) {
      return { verticalType: vertical, confidence: 0.95, reasoning: `Domain matches known ${vertical} brand: ${pattern}` };
    }
  }

  // Step 2: LLM classification
  const openai = getOpenAI();
  const prompt = `Classify this brand into exactly one vertical category.

Brand: ${name}
Domain: ${domain}
${description ? `Description: ${description}` : ""}

Vertical categories (pick ONE):
- travel: Airlines, hotels, booking platforms, vacation services
- ecommerce: Online retail, marketplaces, D2C brands
- b2b_saas: Business software, SaaS tools, developer tools, security software
- finance: Banking, investing, insurance, payments, lending
- subscription: Streaming, media, recurring subscription services
- other: Anything that doesn't fit the above

Respond in JSON: {"verticalType": "...", "confidence": 0.0-1.0, "reasoning": "..."}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 200,
  });

  try {
    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
    return {
      verticalType: parsed.verticalType || "other",
      confidence: parsed.confidence || 0.7,
      reasoning: parsed.reasoning || "LLM classification",
    };
  } catch {
    return { verticalType: "other", confidence: 0.5, reasoning: "Failed to parse LLM response" };
  }
}
