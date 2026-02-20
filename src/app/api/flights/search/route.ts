import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/flight-scraper";

/**
 * Flight Search API — Real-time via Bright Data SERP proxy.
 *
 * POST /api/flights/search
 * Body: { origin, destination, departDate, returnDate?, adults, cabinClass }
 *
 * Uses Bright Data residential proxies to fetch Google Flights data.
 * Results cached for 2 hours to minimize API usage.
 */

// Bright Data SERP requests take 7-25s — extend Vercel timeout
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, departDate, returnDate, adults = 1, cabinClass = "ECONOMY" } = body;

    if (!origin || !destination || !departDate) {
      return NextResponse.json({ error: "origin, destination, departDate are required" }, { status: 400 });
    }

    // Forward the visitor's real IP
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";

    const result = await searchFlights({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departDate,
      returnDate,
      adults,
      cabinClass: cabinClass.toUpperCase(),
      clientIp,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Flight search failed. Please try again.", flights: [], count: 0 },
      { status: 200 }
    );
  }
}
