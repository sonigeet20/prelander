import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

/**
 * AI Assistant API — streaming chat endpoint.
 *
 * POST /api/ai/assistant
 * Body: { messages: [{role, content}], vertical: string, brandName: string }
 *
 * Returns a streaming text response using GPT-4o-mini (fast + cheap).
 * Used by the AI Assistant micro-app on guide pages.
 */

const VERTICAL_CONTEXTS: Record<string, string> = {
  travel: `You are a knowledgeable travel advisor. Help users with:
- Flight booking strategies (best times to book, flexible dates, hidden-city ticketing)
- Destination recommendations based on budget, season, interests
- Packing tips, visa requirements, travel insurance advice
- Airport tips, layover optimization, airline comparisons
- Hotel vs Airbnb advice, neighborhood recommendations
- Budget breakdowns for different destinations
Provide specific, actionable advice with real data points when possible.`,

  finance: `You are a personal finance advisor. Help users with:
- Loan comparisons (mortgage, auto, personal, student)
- Interest rate analysis and refinancing strategies
- Budgeting frameworks (50/30/20, zero-based, envelope method)
- Investment basics (index funds, ETFs, retirement accounts)
- Credit score improvement strategies
- Debt payoff strategies (avalanche vs snowball)
Provide specific calculations and actionable steps. Always note you're not a licensed financial advisor.`,

  b2b_saas: `You are a SaaS evaluation consultant. Help users with:
- Software comparison and selection criteria
- TCO (Total Cost of Ownership) analysis
- Feature prioritization for their use case
- Migration and implementation planning
- ROI estimation frameworks
- Contract negotiation tips
Provide structured, practical advice for software buying decisions.`,

  subscription: `You are a subscription optimization advisor. Help users with:
- Evaluating if a subscription is worth the cost
- Comparing subscription tiers and features
- Finding the best plan for their usage patterns
- Cancellation and downgrade strategies
- Bundle vs individual subscription analysis
Provide specific cost-benefit breakdowns.`,

  ecommerce: `You are a smart shopping advisor. Help users with:
- Product comparison and selection
- Price tracking strategies and best times to buy
- Quality indicators and red flags
- Return policy understanding
- Coupon and deal-finding strategies
- Product category expertise (electronics, fashion, home, etc.)
Provide specific, actionable shopping advice.`,

  d2c: `You are a product research expert. Help users with:
- Direct-to-consumer brand evaluation
- Quality vs price analysis
- Ingredient/material analysis for products
- Subscription box evaluations
- Comparing DTC brands to traditional alternatives
Provide honest, detailed product assessments.`,

  health: `You are a health plan research assistant. Help users with:
- Understanding health insurance terminology (deductible, copay, coinsurance, OOP max)
- Comparing plan types (HMO, PPO, EPO, HDHP)
- Estimating annual healthcare costs based on usage
- HSA/FSA strategies and tax benefits
- Open enrollment preparation
- Prescription coverage analysis
Always note you're providing educational info, not medical or insurance advice.`,
};

export async function POST(request: NextRequest) {
  try {
    const { messages, vertical, brandName } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const openai = getOpenAI();
    const systemContext = VERTICAL_CONTEXTS[vertical] || VERTICAL_CONTEXTS["ecommerce"];

    const systemPrompt = `${systemContext}

You are embedded on a guide page about ${brandName}. You may reference ${brandName} when relevant, but remain objective and unbiased. Keep responses concise (2-4 paragraphs max), practical, and well-formatted with bullet points where helpful. If the user asks something unrelated to your domain, politely redirect them.

Important: You are an AI assistant. Be transparent about that. Never make up specific prices, availability, or time-sensitive data — instead, advise users to check the brand's site for current info.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-8), // Keep last 8 messages for context window
      ],
      max_tokens: 600,
      temperature: 0.7,
      stream: true,
    });

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
