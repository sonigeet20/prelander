import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import type { BrandFactPack } from "@/lib/ai-research";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

export async function POST(req: NextRequest) {
  try {
    const { campaignId } = await req.json();
    if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    const factPack = (campaign.metadata as Record<string, unknown>)?.brandFactPack as BrandFactPack | undefined;
    const brandName = campaign.brandName || factPack?.brandName || campaign.offerName;
    const category = factPack?.category || "General";
    const destUrl = campaign.destinationUrl;

    const travelKw = ["travel", "flight", "airline", "hotel", "booking", "trip", "vacation"];
    const isTravel = travelKw.some((k) => category.toLowerCase().includes(k));

    const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    const prompt = `Generate 8-12 realistic promotional deals/coupons for "${brandName}" (category: ${category}).
Current date context: ${currentMonth}.

Requirements:
1. Each deal must have: title, description, code (coupon code or null if no code needed), discountLabel (e.g. "25% OFF", "Free Shipping", "$50 OFF"), discountPercent (number or null), category (one of the brand's relevant sub-categories), featured (boolean, make 2-3 featured)
2. Make deals feel current and seasonal — reference ${currentMonth}, upcoming holidays, or seasonal events
3. ${isTravel ? "For travel: include flight deals, hotel discounts, bundle offers, loyalty program bonuses, last-minute deals, early bird savings" : "Include percentage discounts, free shipping, bundle deals, seasonal sales, new customer offers, loyalty rewards"}
4. Coupon codes should be realistic: short, uppercase, brand-related (e.g. ${brandName.toUpperCase().slice(0, 4)}SAVE25, FLY${currentMonth.split(" ")[0].toUpperCase().slice(0, 3)})
5. Some deals should have no code (automatic discounts / "No code needed")
6. Descriptions should be 1-2 sentences, specific and actionable
7. Categories for ${isTravel ? "travel: Flights, Hotels, Car Rentals, Bundles, Last Minute, Loyalty" : "general: Subscription, One-Time, Bundle, Seasonal, New Customer, Loyalty"}

Return JSON: { "deals": [ { "title": "...", "description": "...", "code": "..." or null, "discountLabel": "...", "discountPercent": number or null, "category": "...", "featured": boolean } ] }`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        { role: "system", content: "You are a deal/coupon content generator. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ error: "No response from AI" }, { status: 500 });

    const parsed = JSON.parse(raw);
    const generatedDeals = parsed.deals || [];

    // Save all generated deals to DB
    const created = [];
    for (const deal of generatedDeals) {
      const saved = await prisma.deal.create({
        data: {
          campaignId,
          title: deal.title,
          description: deal.description,
          code: deal.code || null,
          discountLabel: deal.discountLabel || "",
          discountPercent: deal.discountPercent || null,
          category: deal.category || "General",
          destinationUrl: destUrl,
          verified: true,
          featured: deal.featured === true,
          active: true,
        },
      });
      created.push(saved);
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${created.length} deals for ${brandName}`,
      deals: created,
    });
  } catch (error) {
    console.error("Failed to generate deals:", error);
    return NextResponse.json({ error: "Failed to generate deals" }, { status: 500 });
  }
}
