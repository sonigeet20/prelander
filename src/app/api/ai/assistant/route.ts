import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

/**
 * AI Assistant API — streaming chat with tool-calling.
 *
 * The AI can search real flights by calling the Amadeus-powered /api/flights/search
 * endpoint, then weave results into its response.
 *
 * POST /api/ai/assistant
 * Body: { messages, vertical, brandName }
 */

const VERTICAL_CONTEXTS: Record<string, string> = {
  travel: `You are a knowledgeable travel advisor with access to a real flight search tool.
When a user asks you to find flights, search for flights, or asks about prices on a route:
1. Extract the origin city/airport, destination city/airport, approximate dates, and number of passengers
2. Call the search_flights function with IATA airport codes
3. Present the results clearly with prices, airlines, stops, and durations
4. Always encourage the user to book through the brand for the best deals

If the user mentions a city, convert it to the most common IATA code (e.g., London→LHR, Dubai→DXB, Delhi→DEL, Mumbai→BOM, New York→JFK, Paris→CDG, Tokyo→NRT, Singapore→SIN, Bangkok→BKK, etc.)

For non-flight questions, help with: destination recommendations, packing tips, visa requirements, travel insurance, budget breakdowns, airport tips.`,

  finance: `You are a personal finance advisor. Help users with:
- Loan comparisons (mortgage, auto, personal, student)
- Interest rate analysis and refinancing strategies
- Budgeting frameworks (50/30/20, zero-based, envelope method)
- Investment basics (index funds, ETFs, retirement accounts)
- Credit score improvement, debt payoff strategies
Provide specific calculations. Note you're not a licensed financial advisor.`,

  b2b_saas: `You are a SaaS evaluation consultant. Help with: software comparison, TCO analysis, feature prioritization, migration planning, ROI estimation, contract negotiation. Provide structured, practical advice.`,

  subscription: `You are a subscription optimization advisor. Help with: cost evaluations, tier comparisons, usage pattern analysis, cancellation strategies, bundle vs individual analysis. Provide cost-benefit breakdowns.`,

  ecommerce: `You are a smart shopping advisor. Help with: product comparison, price tracking, quality indicators, return policies, coupon strategies. Provide actionable shopping advice.`,

  d2c: `You are a product research expert. Help with: DTC brand evaluation, quality vs price, ingredient/material analysis, subscription box reviews. Provide honest assessments.`,

  health: `You are a health plan research assistant. Help with: insurance terminology, plan type comparisons (HMO/PPO/EPO/HDHP), cost estimation, HSA/FSA strategies, open enrollment prep. Note you provide educational info only.`,
};

// Flight search tool definition for OpenAI function calling
const FLIGHT_SEARCH_TOOL = {
  type: "function" as const,
  function: {
    name: "search_flights",
    description: "Search for real flights with actual prices, airlines, stops, and durations. Use this when the user asks to find flights, search flights, or asks about flight prices between two cities.",
    parameters: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Origin airport IATA code (e.g. DEL, JFK, LHR)" },
        destination: { type: "string", description: "Destination airport IATA code (e.g. DXB, CDG, NRT)" },
        departDate: { type: "string", description: "Departure date in YYYY-MM-DD format. If user says 'next week', calculate from today's date." },
        returnDate: { type: "string", description: "Return date in YYYY-MM-DD format. Omit for one-way." },
        adults: { type: "number", description: "Number of adult passengers. Default 1." },
        cabinClass: { type: "string", enum: ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"], description: "Cabin class. Default ECONOMY." },
      },
      required: ["origin", "destination", "departDate"],
    },
  },
};

async function executeFlightSearch(args: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  cabinClass?: string;
}): Promise<string> {
  try {
    // Call our own flights API using the internal Amadeus endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/flights/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    const data = await res.json();

    if (data.error && (!data.flights || data.flights.length === 0)) {
      return JSON.stringify({ error: data.error, flights: [] });
    }

    // Simplify the flight data for the LLM context
    const simplified = (data.flights || []).slice(0, 6).map((f: {
      price: string;
      airlines: string[];
      outbound: { departTime: string; arriveTime: string; departure: string; arrival: string; duration: string; stops: number; stopCities: string[]; departDate: string };
      inbound?: { departTime: string; arriveTime: string; departure: string; arrival: string; duration: string; stops: number; stopCities: string[]; departDate: string };
      cabin: string;
      seatsLeft?: number;
    }, i: number) => ({
      rank: i + 1,
      price_usd: `$${parseFloat(f.price).toLocaleString()}`,
      airlines: f.airlines.join(", "),
      outbound: `${f.outbound.departTime} → ${f.outbound.arriveTime} (${f.outbound.duration}, ${f.outbound.stops === 0 ? "direct" : f.outbound.stops + " stop" + (f.outbound.stops > 1 ? "s" : "") + " via " + f.outbound.stopCities.join(", ")})`,
      outbound_date: f.outbound.departDate,
      ...(f.inbound ? {
        return: `${f.inbound.departTime} → ${f.inbound.arriveTime} (${f.inbound.duration}, ${f.inbound.stops === 0 ? "direct" : f.inbound.stops + " stop(s)"})`,
        return_date: f.inbound.departDate,
      } : {}),
      cabin: f.cabin,
      ...(f.seatsLeft && f.seatsLeft <= 4 ? { seats_left: f.seatsLeft } : {}),
    }));

    return JSON.stringify({ count: simplified.length, flights: simplified });
  } catch (err) {
    console.error("Flight search execution error:", err);
    return JSON.stringify({ error: "Flight search unavailable right now", flights: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, vertical, brandName } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const openai = getOpenAI();
    const systemContext = VERTICAL_CONTEXTS[vertical] || VERTICAL_CONTEXTS["ecommerce"];
    const isTravel = vertical === "travel";

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `${systemContext}

You are embedded on a guide page about ${brandName}. Today's date is ${today}. You may reference ${brandName} when relevant, but remain objective. Keep responses concise (2-4 paragraphs max), practical, and well-formatted with bullet points where helpful.

${isTravel ? `IMPORTANT: When users ask to find/search flights or ask about flight prices, you MUST use the search_flights tool. Do NOT say you can't search flights — you CAN. After getting results, present them in a clear formatted list showing price, airline, times, stops, and duration. Always recommend booking via ${brandName}.

If the user doesn't specify dates, use dates ~2 weeks from today. If they don't specify passengers, assume 1 adult in economy.` : ""}

Be transparent that you're an AI. Never fabricate prices or data — use the search tool for real data or advise checking ${brandName} directly.`;

    const apiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // First completion — may trigger tool call
    const firstResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
      max_tokens: 800,
      temperature: 0.7,
      ...(isTravel ? { tools: [FLIGHT_SEARCH_TOOL], tool_choice: "auto" } : {}),
    });

    const firstChoice = firstResponse.choices[0];

    // If the model wants to call a tool
    if (firstChoice.finish_reason === "tool_calls" && firstChoice.message.tool_calls) {
      const toolCall = firstChoice.message.tool_calls[0];
      // Extract function info — handle both standard and custom tool call shapes
      const fn = "function" in toolCall ? toolCall.function : null;
      const tcId = toolCall.id;

      if (fn && fn.name === "search_flights") {
        const args = JSON.parse(fn.arguments);
        const flightResults = await executeFlightSearch(args);

        // Second completion with tool results — stream this one
        const secondCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            ...apiMessages,
            firstChoice.message,
            {
              role: "tool" as const,
              tool_call_id: tcId,
              content: flightResults,
            },
          ],
          max_tokens: 1200,
          temperature: 0.7,
          stream: true,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            for await (const chunk of secondCompletion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
        });
      }
    }

    // No tool call — stream directly
    // If response is already complete (non-streaming first call), return it
    if (firstChoice.message.content) {
      // Re-do as streaming for consistent UX
      const streamCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages,
        max_tokens: 800,
        temperature: 0.7,
        stream: true,
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of streamCompletion) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
      });
    }

    return NextResponse.json({ error: "No response generated" }, { status: 500 });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
