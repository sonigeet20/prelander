import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/flight-scraper";

/**
 * Flight Search API — Real-time scraper.
 *
 * POST /api/flights/search
 * Body: { origin, destination, departDate, returnDate?, adults, cabinClass }
 *
 * Scrapes live flight data from Google Flights & Skyscanner.
 * No API keys needed, no monthly quota, real prices.
 * Forwards the visitor's IP so our server doesn't get flagged.
 */

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
