import { getOpenAI } from "@/lib/openai";
import type { BlueprintDefinition, GeneratedPageContent, PageSection } from "@/types";
import { scanCompliance, autoFixContent } from "./compliance-scanner";
import { getBrandData, type BrandDataPayload } from "./brand-data-scraper";

interface GeneratePageInput {
  keyword: string;
  brandName: string;
  brandDomain: string;
  brandId: string;
  verticalType: string;
  intentType: string;
  blueprint: BlueprintDefinition;
  destinationUrl: string;
  entities?: { cities?: string[]; brands?: string[]; products?: string[] };
}

/**
 * Build a BRAND DATA CONTEXT block from stored brand data for prompt injection.
 */
function buildBrandDataContext(brandData: Record<string, BrandDataPayload>): string {
  const parts: string[] = [];

  if (brandData.company_info) {
    const info = brandData.company_info as any;
    parts.push(`COMPANY INFO:
- Description: ${info.description || "N/A"}
- Founded: ${info.founded || "N/A"}
- Headquarters: ${info.headquarters || "N/A"}
- Employees: ${info.employees || "N/A"}
- Markets: ${info.markets?.join(", ") || "N/A"}`);
  }

  if (brandData.pricing) {
    const pricing = brandData.pricing as any;
    if (pricing.plans?.length) {
      const planLines = pricing.plans.map((p: any) =>
        `  • ${p.name}: ${p.price}${p.billingCycle ? ` (${p.billingCycle})` : ""} — ${p.bestFor || "General use"}. Features: ${p.features?.slice(0, 5).join(", ") || "N/A"}`
      ).join("\n");
      parts.push(`PRICING DATA (${pricing.lastVerified || "recently verified"}):\n${planLines}\n- Free trial: ${pricing.freeTrialAvailable ? "Yes" : "No/Unknown"}`);
    }
  }

  if (brandData.features) {
    const features = brandData.features as any;
    if (features.coreFeatures?.length) {
      const featureLines = features.coreFeatures.slice(0, 12).map((f: any) =>
        `  • ${f.name}: ${f.description}`
      ).join("\n");
      parts.push(`CORE FEATURES:\n${featureLines}\n- Platforms: ${features.platforms?.join(", ") || "N/A"}`);
    }
  }

  if (brandData.pros_cons) {
    const pc = brandData.pros_cons as any;
    parts.push(`PROS & CONS:
Pros: ${pc.pros?.join("; ") || "N/A"}
Cons: ${pc.cons?.join("; ") || "N/A"}
Best for: ${pc.bestFor?.join("; ") || "N/A"}
Not ideal for: ${pc.notIdealFor?.join("; ") || "N/A"}`);
  }

  if (brandData.competitors) {
    const comp = brandData.competitors as any;
    if (comp.competitors?.length) {
      const compLines = comp.competitors.map((c: any) =>
        `  • ${c.name} (${c.domain}): ${c.differentiator}`
      ).join("\n");
      parts.push(`COMPETITORS:\n${compLines}`);
    }
  }

  if (parts.length === 0) return "";

  return `\n\n═══ VERIFIED BRAND DATA (use this as ground truth) ═══\n${parts.join("\n\n")}\n═══ END BRAND DATA ═══\n\nIMPORTANT: Use the above data in your content. Reference specific pricing tiers, features, and pros/cons. When the data says something specific, cite it. This data has been verified — you can make direct factual statements about it instead of hedging.\n`;
}

/**
 * Generate a full page using AI, then run compliance scanning + auto-fix.
 */
export async function generatePage(input: GeneratePageInput): Promise<GeneratedPageContent> {
  const openai = getOpenAI();

  // Fetch stored brand data for injection
  let brandData: Record<string, BrandDataPayload> = {};
  try {
    brandData = await getBrandData(input.brandId);
  } catch {
    // No brand data available — proceed without
  }
  const brandDataContext = buildBrandDataContext(brandData);
  const hasBrandData = Object.keys(brandData).length > 0;

  const sectionInstructions = input.blueprint.sectionOrder
    .map((s, i) => `${i + 1}. Section type: "${s}" — ${describeSectionType(s, input, input.blueprint.name, hasBrandData)}`)
    .join("\n");

  const prompt = `You are an expert editorial writer creating an authoritative, comprehensive, in-depth informational guide — similar in quality and depth to NerdWallet, Wirecutter, The Points Guy, or Consumer Reports.

CONTEXT:
- Brand: ${input.brandName} (${input.brandDomain})
- Vertical: ${input.verticalType}
- Search keyword: "${input.keyword}"
- User intent: ${input.intentType}
${input.entities?.cities?.length ? `- Detected cities: ${input.entities.cities.join(", ")}` : ""}
${brandDataContext}
PAGE BLUEPRINT: ${input.blueprint.name}
H1 Template: ${input.blueprint.h1Template}

GENERATE these sections in order:
${sectionInstructions}

CRITICAL LOCATION/DESTINATION RULE:
- The search keyword is: "${input.keyword}"
- Detected cities from keyword: ${input.entities?.cities?.length ? input.entities.cities.join(", ") : "NONE"}
- If NO cities are listed above, you MUST NOT mention, reference, or focus on ANY specific city, destination, or location. Keep the content general and applicable to any destination.
- NEVER invent or assume a destination.
- Only mention specific cities/destinations if they are listed in the detected cities above.

CONTENT DEPTH REQUIREMENTS (CRITICAL — pages will be rejected if too thin):
1. The TOTAL page content must be 4000-6000 words. This is non-negotiable.
2. Each content_block MUST be 400-700 words with 3-5 subsections using ### headings.
3. Every paragraph must contain specific, actionable information — NO filler, NO generic platitudes.
4. Write with the authority and depth of a journalist who has spent weeks researching this topic.
5. Include specific numbers, timeframes, tool names, strategies, and concrete examples throughout.
6. Every section should teach the reader something they didn't know before.
7. Use ### for subheadings within content_blocks. NEVER use **Subheading:** prefix — just use ### directly.
8. Comparison tables MUST have 5-8 rows with 4+ meaningful columns.
9. FAQ must have 6-8 questions with detailed answers (5-8 sentences each). Cover pricing, features, comparisons, how-to, and edge cases.
10. Tips must include 6-8 items, each with specific "do this" advice including tool names, timeframes, or strategies.
11. Include transition sentences between major points for narrative flow.
12. Write as if the reader will make a purchasing decision based solely on your content.

INTERACTIVE SECTION FORMATS:

For "calculator" sections, respond with:
{
  "type": "calculator",
  "heading": "Your Savings Estimate",
  "config": {
    "type": "flight|subscription|general",
    "baselineLabel": "Average spend",
    "baselineAmount": 500,
    "savingsPercentMin": 10,
    "savingsPercentMax": 35,
    "tips": [
      {"threshold": 1000, "tip": "For budgets over $1000, consider..."},
      {"threshold": 500, "tip": "At this budget level..."},
      {"threshold": 0, "tip": "Even for smaller budgets..."}
    ]
  }
}

For "checklist" sections, respond with:
{
  "type": "checklist",
  "heading": "Your Pre-Booking Checklist",
  "content": "Brief description",
  "checklistItems": [
    {"task": "Compare prices across 3+ platforms", "detail": "Use Skyscanner, Google Flights, and Kayak to cross-reference", "priority": "high"},
    {"task": "Check baggage policies", "detail": "Budget carriers often charge extra", "priority": "medium"}
  ]
}

For "scorecard" sections, respond with:
{
  "type": "scorecard",
  "heading": "Platform Evaluation Scorecard",
  "overallScore": 8,
  "overallLabel": "Strong choice for most travelers",
  "categories": [
    {"name": "Ease of Use", "score": 9, "maxScore": 10, "detail": "Intuitive interface with powerful filters"},
    {"name": "Price Accuracy", "score": 7, "maxScore": 10, "detail": "Generally accurate, occasional discrepancies"},
    {"name": "Coverage", "score": 8, "maxScore": 10, "detail": "Covers 1200+ airlines worldwide"}
  ],
  "verdict": "Editorial verdict paragraph here..."
}

For "pros_cons" sections, respond with:
{
  "type": "pros_cons",
  "heading": "Advantages & Limitations",
  "pros": [
    {"text": "Major advantage here", "detail": "Extra context", "weight": "major"},
    {"text": "Minor advantage", "weight": "minor"}
  ],
  "cons": [
    {"text": "Notable limitation", "detail": "Context", "weight": "major"},
    {"text": "Minor drawback", "weight": "minor"}
  ],
  "bottomLine": "Overall assessment paragraph..."
}

STRICT CONTENT RULES — MUST FOLLOW:
1. NEVER use: "official", "guaranteed", "top rated", "#1", "most secure", "instant approval"
2. NEVER include numeric ratings (e.g., "4.5/5", "9/10") in text content — only in scorecard sections
3. NEVER fabricate statistics or data points not provided in the BRAND DATA section
4. NEVER use unqualified superlatives ("cheapest", "fastest", "most popular")
5. Use hedging language for unverified claims: "may", "can", "typically", "often", "many users find"
6. ${hasBrandData ? "You CAN make direct factual statements about data from the VERIFIED BRAND DATA section above." : "All claims must be verifiable or clearly qualified."}
7. Content must genuinely and thoroughly solve the user's search intent
8. Write in a professional, authoritative editorial tone
9. Include transition sentences between sections for narrative coherence
10. Every content_block needs at minimum 3 subsections with ### headings

CTA RULES:
- CTA text: "${input.blueprint.ctaTemplate.text}" (replace placeholders with actual values)
- CTA URL: "${input.destinationUrl}"
- CTA must be clearly labeled as an outbound link
- No deceptive button text

DISCLOSURE SECTION (REQUIRED):
- Must include: "This page contains links to third-party websites. We may earn a commission if you make a purchase through these links, at no additional cost to you. This does not influence our editorial content."

Respond in JSON matching this structure:
{
  "title": "SEO title tag (50-60 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "h1": "Main heading",
  "sections": [
    {
      "type": "hero|quick_answer|content_block|comparison_table|pricing_table|tips|steps|faq|cta|disclosure|calculator|checklist|scorecard|pros_cons",
      "heading": "Section heading",
      "subheading": "Optional subheading (for hero)",
      "content": "Section body text (for content_block, disclosure, quick_answer)",
      "items": [{"key": "value"}],
      "highlights": [{"label": "...", "value": "..."}],
      "rows": [{"col1": "...", "col2": "..."}],
      "ctaText": "Button text",
      "ctaUrl": "URL",
      "config": {},
      "checklistItems": [],
      "overallScore": 8,
      "overallLabel": "",
      "categories": [],
      "verdict": "",
      "pros": [],
      "cons": [],
      "bottomLine": ""
    }
  ]
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 16000,
  });

  let content: GeneratedPageContent;
  try {
    content = JSON.parse(res.choices[0]?.message?.content || "{}") as GeneratedPageContent;
  } catch {
    throw new Error("Failed to parse AI-generated content");
  }

  // Ensure required sections exist
  ensureRequiredSections(content, input);

  // Run compliance scanner
  const scanResult = scanCompliance(content);

  // Auto-fix violations if any
  if (!scanResult.passed) {
    content = autoFixContent(content, scanResult.violations);
  }

  return content;
}

/**
 * Describe what each section type should contain — now blueprint-aware and specific.
 */
function describeSectionType(type: string, input: GeneratePageInput, blueprintName: string, hasBrandData: boolean): string {
  const brand = input.brandName;
  const kw = input.keyword;
  const cities = input.entities?.cities || [];
  const origin = cities[0] || "";
  const destination = cities[1] || cities[0] || "";

  switch (type) {
    case "hero":
      return `Hero banner with a compelling headline and subheadline that directly addresses the user's search for "${kw}". Include ctaText and ctaUrl="${input.destinationUrl}". The subheadline should summarize the key value proposition in 1-2 sentences.`;

    case "quick_answer":
      switch (blueprintName) {
        case "travel_route":
          return `Quick answer box with 4-6 key highlights as label/value pairs. Include: typical flight duration, price range, number of airlines on route, best booking window, popular airports. Give the user an instant snapshot.`;
        case "travel_pricing":
          return `Quick answer with 4-6 highlights: average price range, cheapest month, peak season months, advance booking discount estimate, available fare classes.`;
        case "travel_destination":
          return `Quick answer with 4-6 highlights: best time to visit, average flight cost, visa requirements (if applicable), local currency, typical trip duration.`;
        case "saas_pricing":
          return `Quick answer with 4-6 highlights: starting price, number of plans, free tier availability, enterprise option, billing options. ${hasBrandData ? "Use the VERIFIED pricing data." : ""}`;
        case "saas_comparison":
          return `Quick answer with 4-6 highlights comparing the key differences: pricing ranges, target audience, standout feature of each, integration ecosystems.`;
        case "saas_validation":
          return `Quick answer with 4-6 highlights: what ${brand} does, who it's for, starting price, standout features, notable limitation. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "ecommerce_comparison":
          return `Quick answer with 4-6 highlights comparing the key products/options: price ranges, top-rated features, value-for-money pick, and who each option suits best.`;
        case "ecommerce_pricing":
          return `Quick answer with 4-6 highlights: price range, typical sales/discount frequency, best time to buy, price match availability, shipping costs.`;
        case "ecommerce_validation":
          return `Quick answer with 4-6 highlights: product quality rating, shipping speed, return policy, customer satisfaction summary, and value assessment. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "d2c_comparison":
          return `Quick answer with 4-6 highlights comparing the D2C brands: price ranges, product categories, shipping/returns policies, and standout differentiator for each.`;
        case "d2c_validation":
          return `Quick answer with 4-6 highlights: brand founding story, product range, price range, shipping speed, return window, and overall customer sentiment. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "d2c_pricing":
          return `Quick answer with 4-6 highlights: starting price, subscription discount, bundle savings, shipping threshold, referral/first-order discounts, annual spend estimate. ${hasBrandData ? "Use VERIFIED pricing data." : ""}`;
        case "d2c_transactional":
          return `Quick answer with 4-6 highlights: what you'll receive, starting price, delivery timeframe, satisfaction guarantee, and any first-order perks.`;
        case "subscription_comparison":
          return `Quick answer with 4-6 highlights comparing subscription services: monthly cost range, content/product library size, family plan availability, free trial length.`;
        case "subscription_pricing":
          return `Quick answer with 4-6 highlights: plan tiers and prices, annual vs monthly savings, free trial availability, cancellation policy, student/family discounts. ${hasBrandData ? "Use VERIFIED pricing data." : ""}`;
        case "subscription_validation":
          return `Quick answer with 4-6 highlights: what ${brand} offers, starting price, free trial length, cancellation flexibility, content/product quality rating. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "subscription_transactional":
          return `Quick answer with 4-6 highlights: sign-up time, free trial details, first-month price, payment methods, and what you get immediately after subscribing.`;
        case "finance_comparison":
          return `Quick answer with 4-6 highlights comparing financial products: APR/rate ranges, fee structures, minimum requirements, approval timeframes, and standout benefits of each.`;
        case "finance_pricing":
          return `Quick answer with 4-6 highlights: rate range, annual fee, introductory offers, penalty fees, and how rates compare to industry average.`;
        case "finance_transactional":
          return `Quick answer with 4-6 highlights: application time, approval speed, minimum requirements, documents needed, and sign-up bonus/introductory offer.`;
        case "health_informational":
          return `Quick answer with 4-6 highlights: what it is, scientific evidence level, who benefits most, typical cost range, time to see results, and safety considerations.`;
        case "health_comparison":
          return `Quick answer with 4-6 highlights comparing the health products/options: effectiveness ratings, price per serving/dose, ingredient quality, third-party testing, and target user.`;
        case "health_validation":
          return `Quick answer with 4-6 highlights: product type, key active ingredients, scientific evidence level, safety rating, price range, and recommended usage. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        default:
          return `Quick answer box with 4-6 key highlights (label + value pairs). Give the user an instant overview of the most important facts about "${kw}".`;
      }

    case "content_block":
      // Determine context based on where this content_block appears in the section order
      const sectionOrder = input.blueprint.sectionOrder;
      const contentBlockIndex = sectionOrder.slice(0, sectionOrder.indexOf(type) + 1)
        .filter(s => s === "content_block").length;

      switch (blueprintName) {
        case "travel_route":
          if (contentBlockIndex <= 1) {
            return `ROUTE OVERVIEW (400-700 words, 3+ subsections with ### headings): Comprehensive coverage of travel options between ${origin || "the origin"} and ${destination || "the destination"}. Cover: airlines operating this route (with fleet types), direct vs connecting flight options with journey times, airport-specific tips (terminals, lounges, transit connections), ground transport alternatives (trains, buses, driving), and seasonal route changes. Include specific airline names and flight numbers where possible.`;
          } else if (contentBlockIndex === 2) {
            return `BOOKING STRATEGY DEEP DIVE (400-700 words, 3+ subsections): Advanced booking tactics for this route. Cover: optimal advance purchase windows by season, fare class differences and what you get, error fare monitoring techniques, airline loyalty program sweet spots, credit card travel portals, and bundling strategies. Give specific tool names and step-by-step approaches.`;
          } else if (contentBlockIndex === 3) {
            return `SEASONAL ANALYSIS (400-700 words, 3+ subsections): Month-by-month analysis of this route. Cover: peak vs off-peak pricing with approximate ranges, holiday surcharge periods, shoulder season opportunities, weather patterns at both ends, day-of-week pricing differences, and how school holidays affect demand. Include a general pricing calendar overview.`;
          }
          return `AIRPORT & TRANSIT GUIDE (400-700 words, 3+ subsections): Detailed airport guide for both ends of this route. Cover: terminal maps and key facilities, immigration/customs tips, transport from airport to city center (costs, times, options), lounge access options, duty-free highlights, layover tips if connecting, and mobile apps that help navigate these airports.`;

        case "travel_destination":
          if (contentBlockIndex <= 1) {
            return `DESTINATION OVERVIEW (400-700 words, 3+ subsections with ### headings): Comprehensive overview of ${destination || "the destination"} — what makes it appealing, key neighborhoods/areas with descriptions, general cost of living for tourists (meals, transport, attractions), safety considerations with specific advice, cultural norms, language tips, and overall vibe. Write as a knowledgeable local would brief a first-time visitor.`;
          } else if (contentBlockIndex === 2) {
            return `HOW TO GET THERE (400-700 words, 3+ subsections): Cover all ways to reach ${destination || "the destination"} — flights (which airports, airlines, typical costs), trains (routes, booking platforms), buses, and driving options. Include comparison of travel times and costs. Mention visa/entry requirements for major nationalities. Cover airport transfer options to city center.`;
          } else if (contentBlockIndex === 3) {
            return `ACCOMMODATION & TRANSPORT (400-700 words, 3+ subsections): Detailed accommodation guide covering budget hostels/guesthouses, mid-range hotels, luxury options, and alternative stays (Airbnb, boutique). Cover neighborhoods and which are best for different traveler types. Then cover local transport: public transit systems, ride-hailing, bike rentals, walking routes, and approximate costs for each.`;
          }
          return `BEST TIME TO VISIT (400-700 words, 3+ subsections): Month-by-month breakdown of weather, tourist crowds, and pricing. Identify shoulder-season sweet spots. Cover major events/festivals, their dates, and how they affect availability and pricing. Include what to pack for each season and which attractions are seasonal.`;

        case "travel_pricing":
          if (contentBlockIndex <= 1) {
            return `PRICING FACTORS EXPLAINED (400-700 words, 3+ subsections with ### headings): Detailed analysis of what drives pricing for "${kw}". Cover: demand-supply dynamics, fuel surcharge mechanics, route competition effects, booking class hierarchy (Y/B/M/H/Q fare classes), time-of-purchase pricing algorithms, day-of-week patterns, and how these factors compound. Include specific examples showing how the same route can vary 300%+ in price.`;
          } else if (contentBlockIndex === 2) {
            return `SEASONAL PRICING ANALYSIS (400-700 words, 3+ subsections): Month-by-month pricing trends for "${kw}". Cover: cheapest months with approximate price ranges, peak season dates and premium percentages, school holiday impacts, conference/event season effects, holiday blackout dates, and how weather patterns affect pricing. Provide a general seasonal pricing calendar.`;
          }
          return `ADVANCED BOOKING STRATEGIES (400-700 words, 3+ subsections): Expert-level strategies for getting the most favorable prices on "${kw}". Cover: the 21-day advance purchase sweet spot, hidden city ticketing (and its risks), fuel dump techniques, positioning flights, airline mistake fares, credit card travel portals, points/miles valuation, and cashback stacking. Include specific tool names for each strategy.`;

        case "saas_pricing":
          if (contentBlockIndex <= 1) {
            return `PLAN-BY-PLAN DEEP DIVE (400-700 words, 3+ subsections with ### headings): Go beyond the table — explain the practical differences between each pricing tier. What features actually matter at each level? Where are the hidden limitations (user caps, API rate limits, storage quotas, feature gating)? What's the real cost including add-ons? Which plan offers the most value per dollar? Include upgrade triggers. ${hasBrandData ? "Reference the VERIFIED pricing data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `HIDDEN COSTS & GOTCHAS (400-700 words, 3+ subsections): What the pricing page doesn't tell you. Cover: overage charges, implementation/onboarding fees, data migration costs, training requirements, add-on pricing for premium features, API/integration costs, per-seat vs per-user distinctions, and contract lock-in implications. Include negotiation tips for enterprise buyers.`;
          }
          return `WHO EACH PLAN IS FOR (400-700 words, 3+ subsections): Match each pricing tier to a specific user profile with detailed scenarios. Cover: solo freelancers, growing startups (5-20 employees), mid-market teams (20-200), and enterprise (200+). For each, describe typical usage patterns, which features they actually need, and the break-even point for upgrading. Include real-world workflow examples.`;

        case "saas_comparison":
          if (contentBlockIndex <= 1) {
            return `DETAILED STRENGTHS & WEAKNESSES (400-700 words, 3+ subsections with ### headings): For each product being compared, detail their specific strengths and where they fall short. Go beyond surface-level features — discuss UX quality and learning curve, customer support reputation (response times, channels), API/integration ecosystem maturity, documentation quality, and real-world reliability (uptime, performance). ${hasBrandData ? "Reference the VERIFIED pros/cons data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `REAL-WORLD USE CASE ANALYSIS (400-700 words, 3+ subsections): For 5+ specific user scenarios, recommend which product is the stronger choice and explain why with detailed reasoning. Cover: solo creators, small teams (5-15), mid-market companies, enterprise orgs, budget-constrained startups, and power users with advanced needs. Include specific workflow examples for each.`;
          } else if (contentBlockIndex === 3) {
            return `MIGRATION & SWITCHING COSTS (400-700 words, 3+ subsections): Practical analysis of what it takes to switch between these products. Cover: data export/import capabilities, API migration effort, team retraining time, contract/billing transition, integration rewiring, and potential downtime. Include tips for smooth migration and red flags to watch for.`;
          }
          return `EXPERT RECOMMENDATIONS BY USE CASE (400-700 words, 3+ subsections): Definitive recommendations for different buyer personas. For each persona, explain which product wins and why, what they'll love about it, what they'll miss, and how to get the most value. End with a general recommendation matrix.`;

        case "saas_validation":
          if (contentBlockIndex <= 1) {
            return `WHAT ${brand.toUpperCase()} DOES & HOW IT WORKS (400-700 words, 3+ subsections with ### headings): Detailed explanation of ${brand}'s core product, its primary workflow, and how users actually interact with it day-to-day. Cover the onboarding experience, main dashboard, key capabilities, and the specific problems it solves. Write for someone evaluating ${brand} who needs to understand it before committing. ${hasBrandData ? "Reference VERIFIED features data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `KEY FEATURES DEEP DIVE (400-700 words, 3+ subsections): Pick the 5-6 most important features of ${brand} and explain each in depth — what it does, the specific problem it solves, how it compares to how competitors handle the same thing, and who benefits most from it. Include practical usage examples. ${hasBrandData ? "Reference VERIFIED features data." : ""}`;
          } else if (contentBlockIndex === 3) {
            return `REAL USER SCENARIOS (400-700 words, 3+ subsections): Walk through 3-4 realistic user scenarios showing how ${brand} fits into actual workflows. Example: a marketing team using it for campaign management, a developer using the API, a manager tracking team performance. For each scenario, explain the setup, daily workflow, and outcomes.`;
          }
          return `WHO IT'S FOR (AND WHO IT ISN'T) (400-700 words, 3+ subsections): Honest, detailed assessment of ${brand}'s ideal customer profile. Cover: company size sweet spots, technical skill requirements, budget expectations by tier, integration needs, use cases where ${brand} excels, and 3+ scenarios where users should look elsewhere (with alternative recommendations). ${hasBrandData ? "Use the VERIFIED pros/cons and competitor data." : ""}`;

        case "ecommerce_buying_guide":
          if (contentBlockIndex <= 1) {
            return `WHAT TO LOOK FOR (400-700 words, 3+ subsections with ### headings): Detailed buying criteria for "${kw}". Cover the 6-8 most important evaluation factors, explain why each matters with specific examples, describe what "good" vs "bad" looks like for each criterion, and include realistic price range expectations for each quality tier.`;
          }
          return `BUDGET BREAKDOWN BY TIER (400-700 words, 3+ subsections): Detailed analysis of what you get at each price point for "${kw}". Cover budget tier (features, compromises, who it suits), mid-range tier (sweet spot analysis, value proposition), and premium tier (when the extra cost is justified). Include specific brand/product examples where possible.`;

        case "ecommerce_comparison":
          if (contentBlockIndex <= 1) {
            return `DETAILED FEATURE-BY-FEATURE BREAKDOWN (400-700 words, 3+ subsections with ### headings): Go beyond the comparison table. For each product/option being compared, explain build quality and materials, key performance metrics, user experience differences, durability expectations, and warranty coverage. Include hands-on style observations that help buyers visualize the difference.`;
          } else if (contentBlockIndex === 2) {
            return `REAL-WORLD TESTING & DURABILITY (400-700 words, 3+ subsections): Discuss long-term ownership experience, common wear patterns, maintenance requirements, and how each option holds up over time. Cover common complaints, known issues, and whether the product matches its marketing promises. Include care tips.`;
          }
          return `WHO SHOULD BUY WHAT (400-700 words, 3+ subsections): Match each product/option to specific buyer personas. Cover: budget-conscious shoppers, quality-focused buyers, gift-givers, professionals vs hobbyists, and first-time vs upgrading buyers. For each, explain the clear winner and why.`;

        case "ecommerce_pricing":
          if (contentBlockIndex <= 1) {
            return `PRICE HISTORY & TRENDS (400-700 words, 3+ subsections with ### headings): Historical pricing analysis for "${kw}". Cover: typical retail price range, seasonal sales patterns (Black Friday, Prime Day, etc.), price fluctuation frequency, coupon/promo availability, and whether prices are trending up or down. Include tips for price tracking tools like CamelCamelCamel, Honey, and price alert services.`;
          } else if (contentBlockIndex === 2) {
            return `WHERE TO FIND THE BEST DEALS (400-700 words, 3+ subsections): Comprehensive deal-finding guide. Cover: direct brand site vs retailers (Amazon, Walmart, Target), outlet/refurbished options, cashback platforms (Rakuten, TopCashback), browser extensions, email newsletter discounts, student/military discounts, and timing your purchase around sales cycles.`;
          }
          return `IS IT WORTH THE PRICE? (400-700 words, 3+ subsections): Value analysis of "${kw}" at different price points. Cover: cost-per-use calculation, durability vs price correlation, when premium is justified, the "sweet spot" price tier, and total cost of ownership including accessories, maintenance, and replacements.`;

        case "ecommerce_validation":
          if (contentBlockIndex <= 1) {
            return `WHAT IT IS & HOW IT WORKS (400-700 words, 3+ subsections with ### headings): Comprehensive product/store overview. What exactly you're getting, how the product functions, what makes it different from alternatives, and the brand's reputation and track record. ${hasBrandData ? "Reference VERIFIED data." : "Include publicly available information about the brand's history and market position."}`;
          } else if (contentBlockIndex === 2) {
            return `HANDS-ON EXPERIENCE & QUALITY (400-700 words, 3+ subsections): Detailed quality assessment covering materials, craftsmanship, packaging, first impressions, setup/assembly (if applicable), and initial usage experience. Discuss how it compares to expectations set by marketing. Address common quality concerns raised in customer reviews.`;
          } else if (contentBlockIndex === 3) {
            return `CUSTOMER SENTIMENT ANALYSIS (400-700 words, 3+ subsections): What real customers are saying — aggregate patterns from reviews. Cover: most praised aspects, most criticized elements, common issues and their frequency, customer service responsiveness, return/exchange experiences, and how sentiment has changed over time.`;
          }
          return `FINAL VERDICT (400-700 words, 3+ subsections): Definitive editorial assessment. Who should buy, who should skip, the ideal use case, best alternatives for those who decide against it, and a clear recommendation with honest qualification.`;

        case "d2c_comparison":
          if (contentBlockIndex <= 1) {
            return `BRAND STORY & VALUES COMPARISON (400-700 words, 3+ subsections with ### headings): Compare the origin stories, missions, and brand values of each D2C brand. Cover: founding philosophy, supply chain transparency, sustainability commitments, social impact initiatives, and how their brand identity affects product decisions. Consumers increasingly care about who they buy from — give them the context to decide.`;
          } else if (contentBlockIndex === 2) {
            return `PRODUCT QUALITY & MATERIALS (400-700 words, 3+ subsections): Deep dive into product quality for each brand. Cover: materials sourcing, manufacturing processes, quality control, durability testing, packaging quality, and unboxing experience. Compare how each brand approaches quality at similar price points.`;
          }
          return `SHIPPING, RETURNS & CUSTOMER EXPERIENCE (400-700 words, 3+ subsections): Practical comparison of the buying experience. Cover: shipping speeds and costs, free shipping thresholds, return windows and policies, exchange processes, customer support channels (live chat, email, phone), loyalty programs, and referral perks. Include real-world experiences.`;

        case "d2c_validation":
          if (contentBlockIndex <= 1) {
            return `BRAND OVERVIEW & MISSION (400-700 words, 3+ subsections with ### headings): Who is ${brand}? Cover: founding story, core mission, what problem they set out to solve, how they source/manufacture, their place in the D2C landscape, notable press coverage, and funding/growth trajectory. ${hasBrandData ? "Reference VERIFIED data." : "Use publicly available information."}`;
          } else if (contentBlockIndex === 2) {
            return `PRODUCT QUALITY DEEP DIVE (400-700 words, 3+ subsections): Detailed product quality analysis. Cover: materials used and their origin, manufacturing process, durability based on customer feedback, how quality compares to traditional retail alternatives at similar prices, and any quality certifications or testing standards met.`;
          } else if (contentBlockIndex === 3) {
            return `ORDERING & UNBOXING EXPERIENCE (400-700 words, 3+ subsections): Walk through the complete customer journey from website browsing to delivery. Cover: website UX, product customization options, checkout process, shipping tracking, packaging design, unboxing experience, product presentation, and included materials (guides, cards, samples).`;
          }
          return `CUSTOMER SERVICE & RETURNS (400-700 words, 3+ subsections): Honest assessment of after-purchase support. Cover: return policy details and ease of process, customer service response times by channel, warranty coverage, how they handle complaints and negative feedback, and community/social media presence. Include tips for getting the best support experience.`;

        case "d2c_pricing":
          if (contentBlockIndex <= 1) {
            return `ONE-TIME VS SUBSCRIPTION VALUE (400-700 words, 3+ subsections with ### headings): Detailed analysis of ${brand}'s pricing models. Compare one-time purchases vs subscription savings, minimum commitments, pause/skip flexibility, and the real per-unit cost at each option. Calculate the break-even point for subscriptions. ${hasBrandData ? "Reference VERIFIED pricing data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `HIDDEN COSTS: SHIPPING, RETURNS & ADD-ONS (400-700 words, 3+ subsections): What the product page doesn't prominently display. Cover: shipping costs by order size, free shipping thresholds, international shipping fees, return shipping costs, restocking fees (if any), add-on/accessory pricing, and gift wrapping or customization surcharges.`;
          }
          return `BEST DEALS & DISCOUNT STRATEGIES (400-700 words, 3+ subsections): How to get the most value from ${brand}. Cover: first-order discounts, referral programs and their value, seasonal sales calendar, bundle deals and their actual savings, email signup perks, social media flash sales, influencer codes, and student/military discounts.`;

        case "d2c_transactional":
          if (contentBlockIndex <= 1) {
            return `WHAT YOU'RE GETTING (400-700 words, 3+ subsections with ### headings): Detailed overview of the product range and what to expect. Cover: product categories, customization options, sizing/selection guidance, what's included vs what's sold separately, and any personalization features. Help the buyer feel confident about exactly what they'll receive.`;
          }
          return `CUSTOMIZATION & OPTIONS (400-700 words, 3+ subsections): Deep dive into available options. Cover: sizes/variants, color options, customization features, bundle configurations, subscription frequency options, and gift options. Include guidance on how to choose the right configuration for different needs.`;

        case "subscription_comparison":
          if (contentBlockIndex <= 1) {
            return `WHAT EACH SERVICE INCLUDES (400-700 words, 3+ subsections with ### headings): Detailed breakdown of what you actually get with each subscription. Cover: content/product library size and quality, exclusive features, update frequency, multi-device access, offline capabilities, and any limitations at each tier.`;
          } else if (contentBlockIndex === 2) {
            return `CONTENT/PRODUCT LIBRARY ANALYSIS (400-700 words, 3+ subsections): Go deep on the actual value of each library. Cover: breadth and depth of offerings, exclusive vs shared content, new release frequency, quality curation, niche category strengths, and which library serves different interests best.`;
          }
          return `SHARING, FAMILY PLANS & MULTI-DEVICE (400-700 words, 3+ subsections): Practical comparison of sharing and family features. Cover: number of profiles, simultaneous streams/users, family plan pricing and per-person cost, device limits, parental controls, shared watchlists or libraries, and offline download limits per account.`;

        case "subscription_pricing":
          if (contentBlockIndex <= 1) {
            return `PLAN-BY-PLAN DEEP DIVE (400-700 words, 3+ subsections with ### headings): Go beyond the pricing table — what does each tier actually deliver in practice? Cover: real-world feature differences between tiers, the features that most users actually need, whether the cheapest plan is viable long-term, and the upgrade triggers that push most users to higher tiers. ${hasBrandData ? "Reference VERIFIED pricing data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `WHAT'S ACTUALLY INCLUDED AT EACH TIER (400-700 words, 3+ subsections): Feature-by-feature walkthrough of each plan. Cover: ad experience (if applicable), quality/resolution limits, download/offline access, family/sharing features, customer support level, and early access to new features. Flag any surprising limitations.`;
          }
          return `UPGRADE & DOWNGRADE STRATEGIES (400-700 words, 3+ subsections): Smart subscription management. Cover: when to upgrade (triggers and indicators), how to downgrade without losing data/history, pause vs cancel decisions, billing cycle optimization, and how to time plan changes to avoid double-billing. Include specific step-by-step instructions.`;

        case "subscription_validation":
          if (contentBlockIndex <= 1) {
            return `WHAT YOU GET (400-700 words, 3+ subsections with ### headings): Comprehensive overview of ${brand}'s subscription. Cover: what's included at each tier, how the service works day-to-day, the onboarding/setup experience, and how it fits into your routine. ${hasBrandData ? "Reference VERIFIED data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `CONTENT/PRODUCT QUALITY DEEP DIVE (400-700 words, 3+ subsections): Honest assessment of the subscription's core offering. Cover: quality of products/content, curation quality, personalization accuracy, freshness/variety, and how it compares to buying individually or using a competitor.`;
          } else if (contentBlockIndex === 3) {
            return `USER EXPERIENCE & APP QUALITY (400-700 words, 3+ subsections): Review the technical experience. Cover: app/website design and navigation, recommendation algorithm quality, search and discovery features, playback/usage reliability, cross-device sync, and notification management. Include common UX complaints and workarounds.`;
          }
          return `CANCELLATION, PAUSING & FLEXIBILITY (400-700 words, 3+ subsections): What happens when you want to stop? Cover: cancellation process (how easy/hard), data retention after cancellation, pause options, contract/commitment length, auto-renewal practices, refund policy, and what you lose access to immediately vs gradually.`;

        case "subscription_transactional":
          if (contentBlockIndex <= 1) {
            return `WHAT YOU'RE SIGNING UP FOR (400-700 words, 3+ subsections with ### headings): Clear explanation of exactly what the subscription includes. Cover: what arrives in your first delivery/access period, how the ongoing service works, the commitment level, and what differentiates this from the free version (if applicable).`;
          }
          return `FIRST-MONTH EXPERIENCE (400-700 words, 3+ subsections): Detailed walkthrough of what to expect in your first 30 days. Cover: initial setup, first delivery/access, the discovery/onboarding period, when you'll see the full value, common first-month hiccups and how to avoid them, and milestones to hit to maximize the trial.`;

        case "finance_eligibility":
          if (contentBlockIndex <= 1) {
            return `COMPREHENSIVE OVERVIEW (400-700 words, 3+ subsections with ### headings): In-depth explanation of "${kw}" — what it is, how it works mechanically, key terms and jargon explained in plain English, the regulatory landscape, and how it fits into the broader financial picture. Write for someone researching this for the first time who needs to make a decision.`;
          } else if (contentBlockIndex === 2) {
            return `FACTORS THAT MATTER (400-700 words, 3+ subsections): Detailed breakdown of every factor that affects eligibility/outcomes. Cover: credit score requirements (with specific ranges), income thresholds, documentation needed (complete checklist), common pitfalls that cause rejections, and step-by-step instructions for improving your position.`;
          }
          return `COMMON MISTAKES TO AVOID (400-700 words, 3+ subsections): The 5-7 most common mistakes people make when dealing with "${kw}". For each mistake, explain: what goes wrong, why people make this error, the consequences, and exactly how to avoid it. Include real-world examples and recovery strategies.`;

        case "finance_comparison":
          if (contentBlockIndex <= 1) {
            return `WHAT MATTERS WHEN COMPARING (400-700 words, 3+ subsections with ### headings): Expert guide to evaluating financial products for "${kw}". Cover: the 5-7 most important comparison criteria (APR, fees, terms, flexibility, rewards), how each factor impacts your total cost over time, and which criteria matter most for different financial situations. Explain industry jargon in plain English.`;
          } else if (contentBlockIndex === 2) {
            return `FEE STRUCTURES EXPLAINED (400-700 words, 3+ subsections): Detailed breakdown of how fees work for each option. Cover: annual fees, transaction fees, late payment penalties, foreign transaction fees, balance transfer fees, cash advance fees, and any hidden charges. Calculate the total annual cost under realistic usage scenarios.`;
          } else if (contentBlockIndex === 3) {
            return `TERMS & CONDITIONS BREAKDOWN (400-700 words, 3+ subsections): What the fine print actually says. Cover: introductory period details, rate increase triggers, penalty clauses, grace periods, dispute resolution processes, and regulatory protections. Translate legalese into practical implications.`;
          }
          return `APPLICATION STRATEGY (400-700 words, 3+ subsections): How to maximize your approval odds and terms. Cover: timing your applications, impact on credit score, pre-qualification options, documentation preparation, negotiation tactics for better rates, and what to do if denied.`;

        case "finance_pricing":
          if (contentBlockIndex <= 1) {
            return `UNDERSTANDING THE FEE STRUCTURE (400-700 words, 3+ subsections with ### headings): Comprehensive breakdown of all costs for "${kw}". Cover: base rates/APR, fee categories (annual, monthly, transaction, penalty), how rates are calculated, variable vs fixed rate implications, and the true all-in cost over 1, 3, and 5 year horizons.`;
          } else if (contentBlockIndex === 2) {
            return `HIDDEN FEES & FINE PRINT (400-700 words, 3+ subsections): What they don't advertise prominently. Cover: penalty rate triggers, minimum balance fees, inactivity fees, account closure fees, paper statement fees, wire transfer costs, and situational fees most people miss. Calculate the worst-case annual cost scenario.`;
          }
          return `RATE NEGOTIATION STRATEGIES (400-700 words, 3+ subsections): Actionable tactics for getting better rates. Cover: when and how to call for rate reductions, leverage points (competitive offers, loyalty tenure, payment history), balance transfer negotiation, fee waiver requests, and when to walk away. Include specific scripts and talking points.`;

        case "finance_transactional":
          if (contentBlockIndex <= 1) {
            return `PRODUCT OVERVIEW (400-700 words, 3+ subsections with ### headings): Comprehensive explanation of this financial product. Cover: how it works, key benefits and features, who it's designed for, minimum requirements, and how it compares to the market. ${hasBrandData ? "Reference VERIFIED data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `DOCUMENTATION REQUIREMENTS (400-700 words, 3+ subsections): Complete list of what you need to apply. Cover: identification documents, income verification, address proof, financial statements, and any special documentation. Explain how to prepare each document, common mistakes that delay applications, and alternatives for each requirement.`;
          }
          return `AFTER APPROVAL — WHAT HAPPENS NEXT (400-700 words, 3+ subsections): Guide to the post-approval process. Cover: activation steps, first-use tips, setting up autopay, mobile app setup, security features to enable, rewards optimization from day one, and common first-month mistakes to avoid.`;

        case "health_informational":
          if (contentBlockIndex <= 1) {
            return `COMPREHENSIVE OVERVIEW (400-700 words, 3+ subsections with ### headings): Evidence-based explanation of "${kw}". Cover: what it is, the science behind it, how it works in the body/mind, historical context, current medical/scientific consensus, and common misconceptions. Write authoritatively but accessibly — no medical jargon without explanation.`;
          } else if (contentBlockIndex === 2) {
            return `SCIENCE & EVIDENCE REVIEW (400-700 words, 3+ subsections): What research actually shows about "${kw}". Cover: key clinical studies and their findings, meta-analyses, expert medical opinions, strength of evidence (preliminary vs established), limitations of current research, and areas where science is still evolving. Be honest about uncertainty.`;
          } else if (contentBlockIndex === 3) {
            return `HOW TO GET STARTED (400-700 words, 3+ subsections): Practical guide to implementing "${kw}". Cover: beginner steps, dosage/frequency recommendations (with appropriate medical disclaimers), what to expect in the first weeks, tracking progress, and when to adjust your approach. Include red flags that mean you should stop or consult a professional.`;
          }
          return `WHEN TO SEEK PROFESSIONAL HELP (400-700 words, 3+ subsections): Clear guidance on professional consultation. Cover: signs that indicate you need professional guidance, types of professionals to consult (and how to find them), questions to ask at appointments, how to evaluate advice quality, insurance/cost considerations, and online vs in-person options.`;

        case "health_comparison":
          if (contentBlockIndex <= 1) {
            return `WHAT THE SCIENCE SAYS (400-700 words, 3+ subsections with ### headings): Evidence-based comparison of each option. Cover: clinical study results for each, mechanism of action differences, bioavailability and absorption, interaction potential, and which has the strongest evidence base. Cite research quality levels.`;
          } else if (contentBlockIndex === 2) {
            return `INGREDIENT/METHOD ANALYSIS (400-700 words, 3+ subsections): Deep dive into what's actually in each product or how each method works. Cover: active ingredients and their dosages, filler/inactive ingredients and their purpose, manufacturing standards (GMP, third-party testing), form factors (pills, powders, liquids), and how ingredient quality varies between brands.`;
          }
          return `REAL-WORLD EFFECTIVENESS (400-700 words, 3+ subsections): What users actually experience. Cover: typical timeline to notice results, factors that affect effectiveness (age, diet, lifestyle), who responds best to each option, common side effects and their frequency, and long-term sustainability of results. Include common myths vs reality.`;

        case "health_validation":
          if (contentBlockIndex <= 1) {
            return `WHAT IT IS & HOW IT WORKS (400-700 words, 3+ subsections with ### headings): Comprehensive product/approach explanation. Cover: what it contains or involves, the mechanism of action, the scientific rationale, who developed it, and how it fits into the broader health/wellness landscape. ${hasBrandData ? "Reference VERIFIED data." : ""}`;
          } else if (contentBlockIndex === 2) {
            return `INGREDIENT/EVIDENCE ANALYSIS (400-700 words, 3+ subsections): Detailed examination of the key active components. Cover: each major ingredient's evidence base, optimal dosages vs what's provided, synergistic effects, potential interactions, and how the formulation compares to clinical study dosages. Be specific about evidence quality.`;
          } else if (contentBlockIndex === 3) {
            return `WHO SHOULD (AND SHOULDN'T) USE IT (400-700 words, 3+ subsections): Honest assessment of the target audience. Cover: ideal user profile, age/health considerations, contraindications, drug interactions to check, pregnancy/nursing considerations, and specific conditions where this should be avoided. Always recommend consulting a healthcare provider.`;
          }
          return `DOSAGE, TIMING & BEST PRACTICES (400-700 words, 3+ subsections): Practical usage guide. Cover: recommended dosage and timing, with vs without food, cycling recommendations (if applicable), how to start gradually, what to stack it with (and what to avoid), storage requirements, and signs it's working vs signs to stop.`;

        default:
          return `In-depth analysis section (400-700 words, 3+ subsections with ### headings). Provide genuinely useful, expert-level content about "${kw}". Include specific details, practical advice, concrete examples, and information the reader can immediately use. Every subsection should teach something new.`;
      }

    case "comparison_table":
      switch (blueprintName) {
        case "travel_route":
          return `Comparison table with 6-8 rows comparing travel options. Columns: Option, Price Range, Duration, Frequency, Baggage Included, Best For. Use realistic but qualified data. Include airlines, budget carriers, trains if applicable, and alternative airports.`;
        case "saas_comparison":
          return `Feature comparison table with 8-12 rows for thorough comparison. Include columns for Feature, and one column per product. Use "Yes/No", specific values, or brief descriptions. Cover: core features, pricing, integrations, support, API, mobile app, customization, and security. ${hasBrandData ? "Use VERIFIED feature data where available." : ""}`;
        case "saas_validation":
          return `Feature matrix table with 6-8 rows. Columns: Feature, ${brand}, Competitor 1, Competitor 2. Compare key capabilities, pricing, ease of use, support quality, and integration options. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "ecommerce_buying_guide":
          return `Product options comparison table with 6-8 rows across different price tiers. Include: Option/Tier, Price Range, Key Features, Limitations, Best For. Cover budget, mid-range, premium, and professional tiers.`;
        case "ecommerce_comparison":
          return `Product comparison table with 6-8 rows. Columns: Feature, and one column per product. Compare: price, materials/quality, warranty, shipping, return policy, user rating summary, and standout feature. Use specific values over vague descriptions.`;
        case "ecommerce_pricing":
        case "ecommerce_validation":
          return `Comparison table with 6-8 rows comparing this product vs alternatives. Columns: Attribute, ${brand}, Alternative 1, Alternative 2. Compare: price, quality indicators, shipping, warranty, customer satisfaction. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "d2c_comparison":
          return `D2C brand comparison table with 6-8 rows. Columns: Attribute, Brand 1, Brand 2, Brand 3. Compare: price range, subscription options, shipping speed, return policy, material quality, sustainability practices, customer ratings.`;
        case "d2c_validation":
        case "d2c_transactional":
          return `Product range overview table with 6-8 rows. Columns: Product, Price, Key Benefit, Best For. Cover the main product categories offered by ${brand}. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "d2c_pricing":
          return `Pricing comparison table with 6-8 rows. Columns: Product/Plan, One-Time Price, Subscription Price, Savings, Includes. Compare all major product lines and subscription tiers. ${hasBrandData ? "Use VERIFIED pricing data." : ""}`;
        case "subscription_comparison":
          return `Subscription service comparison table with 6-8 rows. Columns: Feature, and one column per service. Compare: monthly price, library size, simultaneous devices, offline access, family plan, free trial, exclusive content, ad experience.`;
        case "subscription_pricing":
        case "subscription_validation":
        case "subscription_transactional":
          return `Plan comparison table with 6-8 rows. Columns: Feature, and one column per tier. Compare: price, content access, quality/resolution, devices, ads, downloads, family sharing. ${hasBrandData ? "Use VERIFIED pricing data." : ""}`;
        case "finance_comparison":
          return `Financial product comparison table with 6-8 rows. Columns: Feature, and one column per product. Compare: APR/rate, annual fee, intro offer, rewards/benefits, minimum required, approval difficulty, notable terms.`;
        case "finance_pricing":
        case "finance_transactional":
          return `Rate/fee comparison table with 6-8 rows. Columns: Fee Type, ${brand}, Competitor 1, Industry Average. Compare all major fee categories and rates. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "health_comparison":
          return `Health product comparison table with 6-8 rows. Columns: Attribute, and one column per product. Compare: key ingredients, dosage, form factor, third-party tested, price per serving, evidence level, side effects.`;
        case "health_validation":
          return `Product vs alternatives table with 6-8 rows. Columns: Attribute, ${brand}, Alternative 1, Alternative 2. Compare: active ingredients, dosage, price, evidence quality, third-party testing, user ratings. ${hasBrandData ? "Use VERIFIED data." : ""}`;
        case "health_informational":
          return `Options/methods comparison table with 6-8 rows. Columns: Method, Evidence Level, Cost, Time to Results, Side Effects, Best For. Compare the major approaches available.`;
        default:
          return `Comparison table with 6-8 rows of meaningful data and 4+ columns. Compare relevant options factually with specific details, not just Yes/No where possible.`;
      }

    case "pricing_table":
      return `Pricing breakdown table. ${hasBrandData ? "Use the VERIFIED pricing data to create an accurate table." : `Use publicly available pricing tiers for ${brand}.`} Include plan names, prices, key features per plan, and who each plan is best for. At least 3 rows.`;

    case "tips":
      switch (blueprintName) {
        case "travel_route":
        case "travel_pricing":
          return `8 specific, actionable money-saving tips as items: [{"tip": "Specific Tip Title", "detail": "3-4 sentence explanation with concrete advice — mention specific tool names, exact timeframes, and step-by-step tactics"}]. NO generic tips like "be flexible" — every tip must name a specific tool, technique, or timeframe. Cover: price tracking tools, booking timing, fare classes, loyalty hacks, credit card strategies, airport selection, and packaging tricks.`;
        case "travel_destination":
          return `8 practical travel tips for visiting the destination as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with local insider knowledge and specific recommendations"}]. Cover: transport tricks, food recommendations, safety precautions, money-saving hacks, cultural etiquette, connectivity (SIM/WiFi), packing essentials, and off-the-beaten-path advice.`;
        case "saas_pricing":
          return `7-8 tips for choosing the right plan and saving money as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with specific tactics"}]. Cover: evaluating actual usage needs, negotiating enterprise deals (specific phrases to use), leveraging annual billing discounts, free trial maximization strategies, hidden costs to watch for, downgrade strategies, startup/nonprofit discount programs, and contract timing.`;
        case "saas_comparison":
        case "saas_validation":
          return `7-8 evaluation tips as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with specific approaches"}]. Cover: running an effective pilot program, specific questions to ask sales teams, migration risk assessment, contract negotiation tactics, reference customer checks, API/integration testing, team adoption strategies, and exit strategy planning.`;
        case "ecommerce_comparison":
        case "ecommerce_buying_guide":
        case "ecommerce_pricing":
        case "ecommerce_validation":
          return `7-8 smart shopping tips as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with specific tactics"}]. Cover: using price tracking tools (CamelCamelCamel, Honey, Keepa), timing purchases around sales, stacking cashback (Rakuten, credit card portals), reading reviews effectively, using browser extensions, setting price alerts, checking outlet/refurbished options, and warranty/protection plan evaluation.`;
        case "d2c_comparison":
        case "d2c_validation":
        case "d2c_pricing":
        case "d2c_transactional":
          return `7-8 D2C shopping tips as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with specific tactics"}]. Cover: maximizing first-order discounts, referral program stacking, subscription vs one-time value math, social media flash sale alerts, email signup perks, bundle optimization, review authentication (spotting fake reviews), and return policy leverage.`;
        case "subscription_comparison":
        case "subscription_pricing":
        case "subscription_validation":
        case "subscription_transactional":
          return `7-8 subscription optimization tips as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with specific tactics"}]. Cover: annual vs monthly math, free trial maximization strategy, family plan cost splitting, pause vs cancel decisions, credit card virtual numbers for trial management, content/product sharing legally, downgrade timing, and when to rotate between services.`;
        case "finance_eligibility":
        case "finance_comparison":
        case "finance_pricing":
        case "finance_transactional":
          return `7-8 financial tips as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with specific tactics"}]. Cover: credit score optimization before applying, rate comparison methodology, fee negotiation scripts, autopay discount setup, introductory offer maximization, balance transfer timing, rewards optimization from day one, and annual fee waiver request strategies.`;
        case "health_informational":
        case "health_comparison":
        case "health_validation":
          return `7-8 practical wellness tips as items: [{"tip": "Tip Title", "detail": "3-4 sentence explanation with evidence-based advice"}]. Cover: starting safely with low doses, tracking progress with specific apps/methods, optimal timing and frequency, combining with lifestyle factors, quality verification (third-party testing labels to look for), storage best practices, realistic expectation setting, and when to reassess your approach. Always include appropriate medical disclaimers.`;
        default:
          return `7-8 practical, actionable tips as items: [{"tip": "Specific Tip Title", "detail": "3-4 sentence explanation with concrete, immediately-useful advice including specific tools, timeframes, or strategies"}]. Every tip must include a specific "do this" action — no vague advice.`;
      }

    case "steps":
      return `Step-by-step guide as items array: [{"step": "1", "title": "Step Title", "detail": "3-5 sentence explanation of what to do, why it matters, and common mistakes to avoid at this step"}]. Include 6-8 clear, sequential steps. Each step should build on the previous one. Include pro tips within steps where relevant.`;

    case "faq":
      return `7-8 FAQ items as items array: [{"question": "Specific question about ${kw}", "answer": "5-8 sentence detailed answer that fully resolves the question"}]. Questions MUST address real user concerns: pricing/cost questions, feature comparisons, "how to" questions, common problems, alternatives, safety/trust concerns, and edge cases. Every answer should be so thorough that the reader doesn't need to search further.`;

    case "calculator":
      return `Interactive savings/budget calculator. Provide a config object with type ("flight", "subscription", or "general"), a reasonable baselineAmount, savingsPercentMin and savingsPercentMax based on realistic data, and 3 contextual tips triggered at different budget thresholds. The calculator lets users input their own numbers and see estimated savings.`;

    case "checklist":
      return `Interactive preparation/evaluation checklist with 8-12 items. Each item needs a "task" (specific action), "detail" (1-2 sentence explanation of why and how), and "priority" ("high", "medium", or "low"). Users can check items off interactively. Cover the most important preparation steps for "${kw}" — things users should verify, compare, or prepare before making a decision.`;

    case "scorecard":
      return `Visual evaluation scorecard for "${kw}". Include overallScore (1-10), overallLabel (brief verdict), 5-7 categories with name, score (1-10), maxScore (10), and detail (1 sentence explaining the score). Include a verdict paragraph (3-4 sentences) with your editorial assessment. Be honest — not everything should be 9/10. Show real differentiation between categories. ${hasBrandData ? "Use VERIFIED data to inform scores." : "Base scores on publicly available information and clearly qualify."}`;

    case "pros_cons":
      return `Comprehensive pros & cons analysis. Include 5-7 pros and 4-6 cons, each with "text" (the advantage/limitation), optional "detail" (extra context), and "weight" ("major" or "minor"). Major items should be genuinely significant differentiators. Include a "bottomLine" paragraph (3-4 sentences) with your overall assessment. Be balanced and honest — list real limitations, not token negatives. ${hasBrandData ? "Use VERIFIED pros/cons data." : ""}`;

    case "cta":
      return `Call-to-action section. Include heading (compelling but honest), content (2-3 sentences summarizing key value), ctaText, and ctaUrl="${input.destinationUrl}". The CTA should feel like a natural conclusion to the content, not a hard sell.`;

    case "disclosure":
      return `Affiliate disclosure. Content must state this page may contain affiliate links. Include specifics about editorial independence.`;

    default:
      return `General informational section about ${kw}. At least 400 words of expert-level, useful content with ### subheadings.`;
  }
}

/**
 * Ensure all required sections exist in the generated content.
 */
function ensureRequiredSections(content: GeneratedPageContent, input: GeneratePageInput): void {
  const existingTypes = new Set(content.sections.map((s) => s.type));

  // Always ensure disclosure section exists
  if (!existingTypes.has("disclosure")) {
    content.sections.push({
      type: "disclosure",
      heading: "Disclosure",
      content:
        "This page contains links to third-party websites. We may earn a commission if you make a purchase through these links, at no additional cost to you. This does not influence our editorial content.",
    });
  }

  // Ensure FAQ exists
  if (!existingTypes.has("faq")) {
    content.sections.push({
      type: "faq",
      heading: "Frequently Asked Questions",
      items: [
        {
          question: `What is ${input.brandName}?`,
          answer: `${input.brandName} is a service available at ${input.brandDomain}. Visit their website for the most current information about their offerings and features.`,
        },
      ],
    });
  }

  // Ensure hero has CTA
  const hero = content.sections.find((s) => s.type === "hero");
  if (hero && !hero.ctaUrl) {
    hero.ctaUrl = input.destinationUrl;
    hero.ctaText = input.blueprint.ctaTemplate.text
      .replace("{brand}", input.brandName)
      .replace("{origin}", input.entities?.cities?.[0] || "")
      .replace("{destination}", input.entities?.cities?.[1] || input.entities?.cities?.[0] || "");
  }
}
