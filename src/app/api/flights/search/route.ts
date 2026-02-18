import { NextRequest, NextResponse } from "next/server";

/**
 * Real Flight Search API using Amadeus Self-Service.
 *
 * POST /api/flights/search
 * Body: { origin, destination, departDate, returnDate?, adults, cabinClass }
 *
 * Returns real flight offers with actual prices, airlines, stops, and durations.
 * Amadeus Self-Service free tier: 500 requests/month — sufficient for affiliate traffic.
 *
 * Required env vars: AMADEUS_API_KEY, AMADEUS_API_SECRET
 */

// ─── Amadeus auth token cache ────────────────────────────────────────
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const key = process.env.AMADEUS_API_KEY;
  const secret = process.env.AMADEUS_API_SECRET;
  if (!key || !secret) throw new Error("AMADEUS_API_KEY and AMADEUS_API_SECRET are required");

  const res = await fetch("https://api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: key,
      client_secret: secret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Amadeus auth failed:", text);
    throw new Error("Amadeus authentication failed");
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// ─── Airline name lookup ────────────────────────────────────────────
const AIRLINE_NAMES: Record<string, string> = {
  "6E": "IndiGo", AA: "American Airlines", AC: "Air Canada", AF: "Air France",
  AI: "Air India", AK: "AirAsia", AY: "Finnair", AZ: "ITA Airways",
  BA: "British Airways", BR: "EVA Air", CA: "Air China", CI: "China Airlines",
  CX: "Cathay Pacific", CZ: "China Southern", DL: "Delta", EK: "Emirates",
  ET: "Ethiopian Airlines", EY: "Etihad", FZ: "Flydubai", G8: "GoAir",
  GA: "Garuda Indonesia", HA: "Hawaiian Airlines", HU: "Hainan Airlines",
  IB: "Iberia", IX: "Air India Express", JL: "Japan Airlines", KE: "Korean Air",
  KL: "KLM", KU: "Kuwait Airways", LH: "Lufthansa", LO: "LOT Polish",
  LX: "SWISS", MH: "Malaysia Airlines", MU: "China Eastern", NH: "ANA",
  NZ: "Air New Zealand", OS: "Austrian", OZ: "Asiana", PC: "Pegasus",
  PK: "PIA", QF: "Qantas", QR: "Qatar Airways", RJ: "Royal Jordanian",
  SA: "South African Airways", SK: "SAS", SQ: "Singapore Airlines",
  SU: "Aeroflot", SV: "Saudia", TG: "Thai Airways", TK: "Turkish Airlines",
  TP: "TAP Portugal", UA: "United Airlines", UK: "Vistara", UL: "SriLankan",
  UX: "Air Europa", VN: "Vietnam Airlines", VS: "Virgin Atlantic",
  W6: "Wizz Air", WN: "Southwest", WY: "Oman Air",
  FR: "Ryanair", U2: "easyJet", SG: "SpiceJet", QG: "Citilink",
};

function airlineName(code: string): string {
  return AIRLINE_NAMES[code] || code;
}

// ─── Parse Amadeus duration (PT2H30M → "2h 30m") ───────────────────
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : "";
  const m = match[2] ? ` ${match[2]}m` : "";
  return `${h}${m}`.trim();
}

// ─── Format time (2025-03-04T14:30:00 → "2:30 PM") ─────────────────
function formatTime(datetime: string): string {
  const d = new Date(datetime);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(datetime: string): string {
  const d = new Date(datetime);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Types ──────────────────────────────────────────────────────────
interface FlightResult {
  id: string;
  price: string;
  currency: string;
  airlines: string[];
  airlineCodes: string[];
  outbound: {
    departure: string;
    arrival: string;
    departTime: string;
    arriveTime: string;
    departDate: string;
    duration: string;
    stops: number;
    stopCities: string[];
    segments: { from: string; to: string; airline: string; flightNo: string; departTime: string; arriveTime: string; duration: string }[];
  };
  inbound?: {
    departure: string;
    arrival: string;
    departTime: string;
    arriveTime: string;
    departDate: string;
    duration: string;
    stops: number;
    stopCities: string[];
    segments: { from: string; to: string; airline: string; flightNo: string; departTime: string; arriveTime: string; duration: string }[];
  };
  cabin: string;
  seatsLeft?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseItinerary(itin: any) {
  const segments = itin.segments || [];
  const stops = segments.length - 1;
  const stopCities = segments.slice(0, -1).map((s: { arrival: { iataCode: string } }) => s.arrival.iataCode);
  const first = segments[0];
  const last = segments[segments.length - 1];
  return {
    departure: first?.departure?.iataCode || "",
    arrival: last?.arrival?.iataCode || "",
    departTime: formatTime(first?.departure?.at || ""),
    arriveTime: formatTime(last?.arrival?.at || ""),
    departDate: formatDate(first?.departure?.at || ""),
    duration: parseDuration(itin.duration || ""),
    stops,
    stopCities,
    segments: segments.map((s: { departure: { iataCode: string; at: string }; arrival: { iataCode: string; at: string }; carrierCode: string; number: string; duration: string }) => ({
      from: s.departure.iataCode,
      to: s.arrival.iataCode,
      airline: airlineName(s.carrierCode),
      flightNo: `${s.carrierCode}${s.number}`,
      departTime: formatTime(s.departure.at),
      arriveTime: formatTime(s.arrival.at),
      duration: parseDuration(s.duration || ""),
    })),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, departDate, returnDate, adults = 1, cabinClass = "ECONOMY" } = body;

    if (!origin || !destination || !departDate) {
      return NextResponse.json({ error: "origin, destination, departDate are required" }, { status: 400 });
    }

    const token = await getAmadeusToken();

    // Build Amadeus flight-offers query
    const params = new URLSearchParams({
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate: departDate,
      adults: String(adults),
      travelClass: cabinClass.toUpperCase(),
      currencyCode: "USD",
      max: "8", // Get top 8 results
      nonStop: "false",
    });

    if (returnDate) {
      params.set("returnDate", returnDate);
    }

    const flightRes = await fetch(
      `https://api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!flightRes.ok) {
      const errText = await flightRes.text();
      console.error("Amadeus flight search error:", flightRes.status, errText);

      // Handle specific Amadeus errors
      if (flightRes.status === 400) {
        return NextResponse.json(
          { error: "Invalid search parameters. Please check your airports and dates.", flights: [] },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Flight search temporarily unavailable. Please try again.", flights: [] },
        { status: 200 }
      );
    }

    const data = await flightRes.json();
    const offers = data.data || [];

    const flights: FlightResult[] = offers.map((offer: {
      id: string;
      price: { grandTotal: string; currency: string };
      itineraries: unknown[];
      travelerPricings: { fareDetailsBySegment: { cabin: string }[] }[];
      numberOfBookableSeats?: number;
    }) => {
      // Collect unique airlines
      const airlineSet = new Set<string>();
      for (const itin of offer.itineraries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const seg of (itin as any).segments || []) {
          airlineSet.add(seg.carrierCode);
        }
      }
      const airlineCodes = Array.from(airlineSet);

      const outbound = parseItinerary(offer.itineraries[0]);
      const inbound = offer.itineraries.length > 1 ? parseItinerary(offer.itineraries[1]) : undefined;

      // Get cabin class from first fare detail
      const cabin = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || cabinClass;

      return {
        id: offer.id,
        price: offer.price.grandTotal,
        currency: offer.price.currency || "USD",
        airlines: airlineCodes.map(airlineName),
        airlineCodes,
        outbound,
        inbound,
        cabin: cabin.charAt(0).toUpperCase() + cabin.slice(1).toLowerCase(),
        seatsLeft: offer.numberOfBookableSeats,
      };
    });

    return NextResponse.json({
      flights,
      count: flights.length,
      searchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Flight search failed. Please try again.", flights: [] },
      { status: 200 }
    );
  }
}
