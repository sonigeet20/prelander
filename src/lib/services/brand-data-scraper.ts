import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

/**
 * Brand data types we collect and inject into page generation prompts.
 */
export interface BrandPricingData {
  plans: Array<{
    name: string;
    price: string;
    billingCycle?: string;
    features: string[];
    bestFor?: string;
  }>;
  currency?: string;
  freeTrialAvailable?: boolean;
  lastVerified?: string;
}

export interface BrandFeaturesData {
  coreFeatures: Array<{
    name: string;
    description: string;
    category?: string;
  }>;
  platforms?: string[];
  integrations?: string[];
  lastVerified?: string;
}

export interface BrandProsConsData {
  pros: string[];
  cons: string[];
  bestFor: string[];
  notIdealFor: string[];
  lastVerified?: string;
}

export interface BrandCompanyInfo {
  founded?: string;
  headquarters?: string;
  employees?: string;
  funding?: string;
  ceo?: string;
  description: string;
  markets?: string[];
  lastVerified?: string;
}

export interface BrandCompetitorsData {
  competitors: Array<{
    name: string;
    domain: string;
    differentiator: string;
  }>;
  lastVerified?: string;
}

export type BrandDataPayload =
  | BrandPricingData
  | BrandFeaturesData
  | BrandProsConsData
  | BrandCompanyInfo
  | BrandCompetitorsData;

/**
 * Scrape / research brand data using AI and store in DB.
 * Uses GPT to research publicly available information about a brand.
 */
export async function scrapeBrandData(
  brandId: string,
  brandName: string,
  brandDomain: string,
  dataTypes: string[] = ["pricing", "features", "pros_cons", "company_info", "competitors"]
): Promise<Record<string, BrandDataPayload>> {
  const openai = getOpenAI();
  const results: Record<string, BrandDataPayload> = {};

  for (const dataType of dataTypes) {
    const prompt = buildScraperPrompt(dataType, brandName, brandDomain);

    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3, // low temp for factual data
        max_tokens: 3000,
      });

      const data = JSON.parse(res.choices[0]?.message?.content || "{}");

      // Store in DB
      await prisma.brandData.upsert({
        where: { brandId_dataType: { brandId, dataType } },
        update: {
          data: data as any,
          source: `ai-research-${brandDomain}`,
          scrapedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        create: {
          brandId,
          dataType,
          data: data as any,
          source: `ai-research-${brandDomain}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      results[dataType] = data as BrandDataPayload;
    } catch (err) {
      console.error(`Failed to scrape ${dataType} for ${brandName}:`, err);
    }
  }

  return results;
}

/**
 * Retrieve stored brand data for a brand. Returns all available data types.
 */
export async function getBrandData(brandId: string): Promise<Record<string, BrandDataPayload>> {
  const records = await prisma.brandData.findMany({
    where: { brandId },
  });

  const result: Record<string, BrandDataPayload> = {};
  for (const record of records) {
    result[record.dataType] = record.data as unknown as BrandDataPayload;
  }
  return result;
}

/**
 * Check if brand data exists and is fresh (not expired).
 */
export async function isBrandDataFresh(brandId: string): Promise<boolean> {
  const records = await prisma.brandData.findMany({
    where: { brandId },
    select: { dataType: true, expiresAt: true },
  });

  if (records.length === 0) return false;

  const now = new Date();
  return records.every((r) => r.expiresAt && r.expiresAt > now);
}

function buildScraperPrompt(dataType: string, brandName: string, brandDomain: string): string {
  const base = `You are a research analyst. Provide ONLY factual, publicly verifiable information about ${brandName} (${brandDomain}). If you are not confident about specific data points, use "Not publicly disclosed" or approximate ranges. Do NOT fabricate specific numbers.`;

  switch (dataType) {
    case "pricing":
      return `${base}

Research the current pricing structure for ${brandName}.

Return JSON:
{
  "plans": [
    {
      "name": "Plan name",
      "price": "Price (e.g. '$9.99/mo' or 'Free' or 'Contact sales')",
      "billingCycle": "monthly|annual|one-time",
      "features": ["Feature 1", "Feature 2", ...],
      "bestFor": "Who this plan is ideal for"
    }
  ],
  "currency": "USD",
  "freeTrialAvailable": true/false,
  "lastVerified": "February 2026"
}

If pricing is not publicly available, return plans with "Contact for pricing" and list known feature tiers.`;

    case "features":
      return `${base}

Research the core features and capabilities of ${brandName}.

Return JSON:
{
  "coreFeatures": [
    {
      "name": "Feature name",
      "description": "What it does and why it matters (1-2 sentences)",
      "category": "Category (e.g. Search, Booking, Analytics, Security)"
    }
  ],
  "platforms": ["Web", "iOS", "Android", etc.],
  "integrations": ["Notable integrations"],
  "lastVerified": "February 2026"
}

List 8-15 core features. Focus on what differentiates ${brandName} from competitors.`;

    case "pros_cons":
      return `${base}

Research the commonly cited advantages and disadvantages of ${brandName} based on public reviews and expert analysis.

Return JSON:
{
  "pros": ["Advantage 1", "Advantage 2", ...],
  "cons": ["Disadvantage 1", "Disadvantage 2", ...],
  "bestFor": ["User type 1 who benefits most", ...],
  "notIdealFor": ["User type who might want alternatives", ...],
  "lastVerified": "February 2026"
}

List 5-8 pros and 4-6 cons. Be balanced and honest. Base these on commonly reported user experiences.`;

    case "company_info":
      return `${base}

Research basic company information about ${brandName}.

Return JSON:
{
  "founded": "Year founded",
  "headquarters": "City, Country",
  "employees": "Approximate employee count or range",
  "funding": "Funding status (e.g. 'Series C, $200M raised' or 'Publicly traded' or 'Bootstrapped')",
  "ceo": "CEO/Founder name",
  "description": "2-3 sentence company description",
  "markets": ["Primary markets served"],
  "lastVerified": "February 2026"
}

Use only publicly known information. Use "Not publicly disclosed" for unknown fields.`;

    case "competitors":
      return `${base}

Research the main competitors of ${brandName} in the same market.

Return JSON:
{
  "competitors": [
    {
      "name": "Competitor name",
      "domain": "competitor.com",
      "differentiator": "How they differ from ${brandName} (1 sentence)"
    }
  ],
  "lastVerified": "February 2026"
}

List 4-6 direct competitors. Focus on well-known alternatives users commonly compare.`;

    default:
      return `${base}\n\nResearch general information about ${brandName}. Return as JSON.`;
  }
}
