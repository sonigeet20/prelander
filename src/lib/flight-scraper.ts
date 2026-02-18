/**
 * Flight Scraper — Real-time flight data from Google Flights.
 *
 * Scrapes Google Flights search results by fetching the page HTML and
 * extracting the embedded JSON data that Google injects for SSR.
 *
 * • No API keys needed — completely free
 * • No monthly quota — unlimited searches
 * • Real, live prices from airlines
 * • Forwards visitor's IP via headers to avoid server-side blocking
 *
 * Used by both /api/flights/search (widget) and AI assistant.
 */

// ─── Types ──────────────────────────────────────────────────────────
export interface FlightSegment {
  from: string;
  to: string;
  airline: string;
  flightNo: string;
  departTime: string;
  arriveTime: string;
  duration: string;
}

export interface FlightLeg {
  departure: string;
  arrival: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  duration: string;
  stops: number;
  stopCities: string[];
  segments: FlightSegment[];
}

export interface FlightResult {
  id: string;
  price: string;
  currency: string;
  airlines: string[];
  airlineCodes: string[];
  outbound: FlightLeg;
  inbound?: FlightLeg;
  cabin: string;
  seatsLeft?: number;
  deepLink: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  cabinClass?: string;
  clientIp?: string;
}

export interface FlightSearchResult {
  flights: FlightResult[];
  count: number;
  searchedAt: string;
  source: string;
}

// ─── Airline codes → names ──────────────────────────────────────────
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
  WS: "WestJet", B6: "JetBlue", AS: "Alaska Airlines", NK: "Spirit Airlines",
  F9: "Frontier Airlines", G4: "Allegiant Air", SY: "Sun Country",
};

function airlineName(code: string): string {
  return AIRLINE_NAMES[code] || code;
}

// ─── Date formatting helpers ────────────────────────────────────────
function formatGoogleDate(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d };
}

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

function formatDateDisplay(year: number, month: number, day: number): string {
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ""}`;
}

// ─── Cabin class mapping ────────────────────────────────────────────
function cabinToGoogle(cabin: string): number {
  switch (cabin?.toUpperCase()) {
    case "ECONOMY": return 1;
    case "PREMIUM_ECONOMY": return 2;
    case "BUSINESS": return 3;
    case "FIRST": return 4;
    default: return 1;
  }
}

function cabinLabel(num: number): string {
  switch (num) {
    case 1: return "Economy";
    case 2: return "Premium Economy";
    case 3: return "Business";
    case 4: return "First";
    default: return "Economy";
  }
}

// ─── Random user agents for rotation ────────────────────────────────
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── Build Google Flights deep link ─────────────────────────────────
function buildGoogleFlightsLink(params: FlightSearchParams): string {
  const { origin, destination, departDate, returnDate, adults = 1, cabinClass = "ECONOMY" } = params;
  const cabin = cabinToGoogle(cabinClass);
  const cabinParam = cabin === 1 ? "" : `&tfc=C${cabin === 2 ? "PE" : cabin === 3 ? "B" : "F"}`;
  const base = `https://www.google.com/travel/flights?q=Flights+to+${destination}+from+${origin}+on+${departDate}${returnDate ? `+return+${returnDate}` : ""}${adults > 1 ? `+${adults}+passengers` : ""}${cabinParam}`;
  return base;
}

// ─── Build Skyscanner deep link (for Book CTAs) ─────────────────────
export function buildSkyscannerLink(params: FlightSearchParams): string {
  const { origin, destination, departDate, returnDate } = params;
  const depFormatted = departDate.replace(/-/g, "").slice(2); // YYMMDD
  let url = `https://www.skyscanner.net/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${depFormatted}/`;
  if (returnDate) {
    const retFormatted = returnDate.replace(/-/g, "").slice(2);
    url += `${retFormatted}/`;
  }
  return url;
}

// ─── Google Flights protobuf-like request builder ───────────────────
// Google Flights uses a batch RPC endpoint. We construct the serialized
// request that their frontend sends, which returns structured JSON data.
function buildGoogleFlightsPayload(params: FlightSearchParams): string {
  const dep = formatGoogleDate(params.departDate);
  const cabin = cabinToGoogle(params.cabinClass || "ECONOMY");
  const adults = params.adults || 1;

  // Build the leg structure
  const legs: string[] = [];

  // Outbound
  legs.push(
    `[null,null,${cabin},[],[${adults}],null,null,null,null,null,[],null,null,` +
    `[[["${params.origin.toUpperCase()}",0]],[["${params.destination.toUpperCase()}",0]],` +
    `[${dep.year},${dep.month},${dep.day}],null,` +
    `[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1]]`
  );

  // Return leg
  if (params.returnDate) {
    const ret = formatGoogleDate(params.returnDate);
    legs.push(
      `[null,null,${cabin},[],[${adults}],null,null,null,null,null,[],null,null,` +
      `[[["${params.destination.toUpperCase()}",0]],[["${params.origin.toUpperCase()}",0]],` +
      `[${ret.year},${ret.month},${ret.day}],null,` +
      `[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1]]`
    );
  }

  // Wrap in the outer structure
  const inner = `[${legs.join(",")}]`;
  return `[null,${inner}]`;
}

// ─── Parse Google Flights response ──────────────────────────────────
// Google returns a complex nested array structure. We extract flights from it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseGoogleFlightsResponse(data: any[], params: FlightSearchParams): FlightResult[] {
  const results: FlightResult[] = [];
  const cabinNum = cabinToGoogle(params.cabinClass || "ECONOMY");

  try {
    // The flight offers are typically in data[2] or data[3]
    // Navigate the nested structure to find flight itineraries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findFlights = (node: any, depth = 0): any[] => {
      if (!node || depth > 8) return [];
      if (Array.isArray(node)) {
        // Look for arrays that look like flight offers (contain price + segments)
        // Flight offers typically have: [price_info, leg_info, ...]
        // We look for arrays containing departure/arrival info + price
        for (const item of node) {
          if (Array.isArray(item)) {
            const found = findFlights(item, depth + 1);
            if (found.length > 0) return found;
          }
        }
        // Check if this node itself contains flight data
        // A flight node often has a price as a number and nested airport codes
        if (node.length > 3 && typeof node[0] === 'object') {
          return [node]; // Potentially a list of flights
        }
      }
      return [];
    };

    // Try to find the offers array
    // Google's response structure: [metadata, [offers], ...]
    // Each offer: [[leg_details], price, booking_info, ...]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let offers: any[] = [];

    // Navigate through the data to find the itineraries
    if (Array.isArray(data)) {
      // The main results are usually in data[2] or nested deeper
      for (let i = 0; i < Math.min(data.length, 10); i++) {
        const chunk = data[i];
        if (!Array.isArray(chunk)) continue;

        // Look for arrays of flight itineraries
        // Each itinerary typically has segments with airport codes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractOffers = (arr: any[], level = 0): void => {
          if (!Array.isArray(arr) || level > 6 || offers.length >= 8) return;

          for (const item of arr) {
            if (offers.length >= 8) break;
            if (!Array.isArray(item)) continue;

            // A flight offer contains: segments array, price
            // Check if this looks like a flight by checking for airport code pattern
            const hasAirportCodes = JSON.stringify(item).match(/[A-Z]{3}/g);
            const hasPrice = JSON.stringify(item).match(/\d{2,6}/);

            if (hasAirportCodes && hasAirportCodes.length >= 2 && hasPrice) {
              // Try to extract flight data from this node
              const flight = tryExtractFlight(item, params, cabinNum);
              if (flight) {
                offers.push(flight);
                continue;
              }
            }

            extractOffers(item, level + 1);
          }
        };

        extractOffers(chunk);
        if (offers.length > 0) break;
      }
    }

    return offers.length > 0 ? offers : results;
  } catch (err) {
    console.error("Error parsing Google Flights response:", err);
    return results;
  }
}

// Try to extract a single flight from a nested array node
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryExtractFlight(node: any, params: FlightSearchParams, cabinNum: number): FlightResult | null {
  try {
    const json = JSON.stringify(node);

    // Extract price — look for USD amounts
    const priceMatch = json.match(/"USD",(\d+)/);
    if (!priceMatch) return null;
    const price = priceMatch[1];

    // Extract airport codes (3 uppercase letters)
    const airports = json.match(/"([A-Z]{3})"/g)?.map((s: string) => s.replace(/"/g, "")) || [];
    if (airports.length < 2) return null;

    // Extract airline codes (2 uppercase letters)
    const airlineMatches = json.match(/"([A-Z0-9]{2})"/g)?.map((s: string) => s.replace(/"/g, "")) || [];
    const knownAirlines = airlineMatches.filter((c: string) => AIRLINE_NAMES[c]);
    if (knownAirlines.length === 0) return null;

    // Extract times — look for time patterns
    const timeMatches = json.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi) || [];

    // Build a basic flight result
    const dep = airports.includes(params.origin.toUpperCase()) ? params.origin.toUpperCase() : airports[0];
    const arr = airports.includes(params.destination.toUpperCase()) ? params.destination.toUpperCase() : airports[1];

    // Count intermediate stops
    const uniqueAirports = [...new Set(airports)];
    const stopCities = uniqueAirports.filter((a: string) => a !== dep && a !== arr);
    const stops = Math.max(0, stopCities.length);

    const uniqueAirlineCodes = [...new Set(knownAirlines)];

    // Extract duration if available
    const durationMatch = json.match(/(\d{1,2})\s*h(?:r)?s?\s*(\d{1,2})?\s*m?i?n?/i);
    const duration = durationMatch
      ? `${durationMatch[1]}h${durationMatch[2] ? ` ${durationMatch[2]}m` : ""}`
      : "—";

    const id = `gf-${dep}-${arr}-${price}-${uniqueAirlineCodes[0]}`;

    return {
      id,
      price,
      currency: "USD",
      airlines: uniqueAirlineCodes.map(airlineName),
      airlineCodes: uniqueAirlineCodes as string[],
      outbound: {
        departure: dep,
        arrival: arr,
        departTime: timeMatches[0] || "—",
        arriveTime: timeMatches[1] || "—",
        departDate: formatDateDisplay(...(params.departDate.split("-").map(Number) as [number, number, number])),
        duration,
        stops,
        stopCities: stopCities as string[],
        segments: uniqueAirlineCodes.map((code: string, i: number) => ({
          from: i === 0 ? dep : (stopCities[i - 1] as string || dep),
          to: i === uniqueAirlineCodes.length - 1 ? arr : (stopCities[i] as string || arr),
          airline: airlineName(code),
          flightNo: code,
          departTime: timeMatches[i * 2] || "—",
          arriveTime: timeMatches[i * 2 + 1] || "—",
          duration: "—",
        })),
      },
      cabin: cabinLabel(cabinNum),
      deepLink: buildSkyscannerLink(params),
    };
  } catch {
    return null;
  }
}

// ─── Main search function ───────────────────────────────────────────
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  const { origin, destination, departDate, returnDate, adults = 1, cabinClass = "ECONOMY" } = params;

  // Validate
  if (!origin || !destination || !departDate) {
    return { flights: [], count: 0, searchedAt: new Date().toISOString(), source: "error" };
  }

  const headers: Record<string, string> = {
    "User-Agent": randomUA(),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
  };

  // Forward client IP if available
  if (params.clientIp) {
    headers["X-Forwarded-For"] = params.clientIp;
  }

  try {
    // ─── Strategy 1: Scrape Google Flights page ──────────────────
    const googleUrl = buildGoogleFlightsLink({ origin, destination, departDate, returnDate, adults, cabinClass });

    const res = await fetch(googleUrl, {
      headers,
      redirect: "follow",
    });

    if (res.ok) {
      const html = await res.text();

      // Google embeds flight data as JSON in script tags
      // Look for the data payload in various formats
      const flights = parseGoogleFlightsHTML(html, params);

      if (flights.length > 0) {
        return {
          flights: flights.slice(0, 8),
          count: Math.min(flights.length, 8),
          searchedAt: new Date().toISOString(),
          source: "google-flights",
        };
      }
    }

    // ─── Strategy 2: Scrape Skyscanner browse page ───────────────
    const skyscannerFlights = await scrapeSkyscanner(params, headers);
    if (skyscannerFlights.length > 0) {
      return {
        flights: skyscannerFlights.slice(0, 8),
        count: Math.min(skyscannerFlights.length, 8),
        searchedAt: new Date().toISOString(),
        source: "skyscanner",
      };
    }

    // ─── Strategy 3: Return deep links with no pricing ───────────
    // If scraping didn't yield results, return search links so the user
    // can click through to check prices themselves.
    return {
      flights: [{
        id: "dl-1",
        price: "0",
        currency: "USD",
        airlines: [],
        airlineCodes: [],
        outbound: {
          departure: origin.toUpperCase(),
          arrival: destination.toUpperCase(),
          departTime: "—",
          arriveTime: "—",
          departDate: formatDateDisplay(...(departDate.split("-").map(Number) as [number, number, number])),
          duration: "—",
          stops: -1,
          stopCities: [],
          segments: [],
        },
        cabin: cabinClass ? cabinClass.charAt(0) + cabinClass.slice(1).toLowerCase() : "Economy",
        deepLink: buildSkyscannerLink(params),
      }],
      count: 0, // signals "no scraped data, just deep link"
      searchedAt: new Date().toISOString(),
      source: "deeplink-only",
    };
  } catch (err) {
    console.error("Flight scraper error:", err);
    return { flights: [], count: 0, searchedAt: new Date().toISOString(), source: "error" };
  }
}

// ─── Parse Google Flights HTML for embedded flight data ─────────────
function parseGoogleFlightsHTML(html: string, params: FlightSearchParams): FlightResult[] {
  const flights: FlightResult[] = [];
  const cabinNum = cabinToGoogle(params.cabinClass || "ECONOMY");

  try {
    // Google Flights embeds data in AF_initDataCallback calls
    // These contain serialized JSON arrays with flight data
    const dataCallbacks = html.match(/AF_initDataCallback\(\{[^}]*data:(\[[\s\S]*?\])\s*\}\)/g) || [];

    for (const cb of dataCallbacks) {
      try {
        const dataMatch = cb.match(/data:(\[[\s\S]*?\])\s*\}/);
        if (!dataMatch) continue;
        const data = JSON.parse(dataMatch[1]);
        const parsed = parseGoogleFlightsResponse(data, params);
        flights.push(...parsed);
      } catch {
        // Skip malformed callbacks
      }
    }

    // Also look for structured data (JSON-LD)
    const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
    for (const ldScript of ldMatches) {
      try {
        const jsonStr = ldScript.replace(/<\/?script[^>]*>/g, "");
        const ld = JSON.parse(jsonStr);
        if (ld["@type"] === "FlightReservation" || ld["@type"] === "Flight") {
          // Extract flight info from JSON-LD
          const flight = parseLDFlight(ld, params, cabinNum);
          if (flight) flights.push(flight);
        }
      } catch {
        // Skip malformed JSON-LD
      }
    }

    // Try extracting from inline script data
    // Google sometimes puts flight data in window variables
    const scriptDataMatches = html.match(/\bvar\s+\w+\s*=\s*(\[[\s\S]{100,}?\]);/g) || [];
    for (const scriptData of scriptDataMatches) {
      try {
        const jsonMatch = scriptData.match(/=\s*(\[[\s\S]*?\]);/);
        if (!jsonMatch) continue;
        const data = JSON.parse(jsonMatch[1]);
        if (Array.isArray(data)) {
          const parsed = parseGoogleFlightsResponse(data, params);
          flights.push(...parsed);
        }
      } catch {
        // Skip
      }
    }
  } catch (err) {
    console.error("HTML parse error:", err);
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return flights.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

// Parse JSON-LD flight data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseLDFlight(ld: any, params: FlightSearchParams, cabinNum: number): FlightResult | null {
  try {
    const flight = ld.reservationFor || ld;
    if (!flight.departureAirport || !flight.arrivalAirport) return null;

    const depCode = flight.departureAirport.iataCode || params.origin.toUpperCase();
    const arrCode = flight.arrivalAirport.iataCode || params.destination.toUpperCase();
    const airline = flight.airline?.iataCode || "";
    const flightNum = flight.flightNumber || "";
    const depTime = flight.departureTime ? new Date(flight.departureTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—";
    const arrTime = flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—";

    return {
      id: `ld-${depCode}-${arrCode}-${airline}${flightNum}`,
      price: "0",
      currency: "USD",
      airlines: [airlineName(airline)],
      airlineCodes: [airline],
      outbound: {
        departure: depCode,
        arrival: arrCode,
        departTime: depTime,
        arriveTime: arrTime,
        departDate: formatDateDisplay(...(params.departDate.split("-").map(Number) as [number, number, number])),
        duration: "—",
        stops: 0,
        stopCities: [],
        segments: [{
          from: depCode,
          to: arrCode,
          airline: airlineName(airline),
          flightNo: `${airline}${flightNum}`,
          departTime: depTime,
          arriveTime: arrTime,
          duration: "—",
        }],
      },
      cabin: cabinLabel(cabinNum),
      deepLink: buildSkyscannerLink(params),
    };
  } catch {
    return null;
  }
}

// ─── Skyscanner scraper (browse page) ───────────────────────────────
async function scrapeSkyscanner(params: FlightSearchParams, headers: Record<string, string>): Promise<FlightResult[]> {
  const flights: FlightResult[] = [];
  const cabinNum = cabinToGoogle(params.cabinClass || "ECONOMY");

  try {
    // Skyscanner's browse URL returns SSR HTML with some data
    const url = buildSkyscannerLink(params);

    const res = await fetch(url, {
      headers: {
        ...headers,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) return flights;

    const html = await res.text();

    // Skyscanner embeds __NEXT_DATA__ with preloaded state
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const itineraries = findInObject(nextData, "itineraries") ||
                            findInObject(nextData, "results") ||
                            findInObject(nextData, "quotes");

        if (Array.isArray(itineraries)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const itin of itineraries.slice(0, 8)) {
            const flight = parseSkyscannerItinerary(itin, params, cabinNum);
            if (flight) flights.push(flight);
          }
        }
      } catch {
        // Skip malformed __NEXT_DATA__
      }
    }

    // Also try JSON-LD from Skyscanner
    const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
    for (const ldScript of ldMatches) {
      try {
        const jsonStr = ldScript.replace(/<\/?script[^>]*>/g, "");
        const ld = JSON.parse(jsonStr);
        if (ld.offers || ld["@type"]?.includes("Flight")) {
          const flight = parseLDFlight(ld, params, cabinNum);
          if (flight) flights.push(flight);
        }
      } catch {
        // Skip
      }
    }

    // Try to extract indicative prices from HTML meta/data attributes
    const priceMatches = html.match(/data-price="(\d+)"/g) || [];
    const airlineMatches = html.match(/data-carrier="([^"]+)"/g) || [];

    if (priceMatches.length > 0) {
      for (let i = 0; i < Math.min(priceMatches.length, 8); i++) {
        const price = priceMatches[i].match(/(\d+)/)?.[1] || "0";
        const carrier = airlineMatches[i]?.match(/"([^"]+)"/)?.[1] || "";
        flights.push({
          id: `sk-${i}-${price}`,
          price,
          currency: "USD",
          airlines: [airlineName(carrier)],
          airlineCodes: [carrier],
          outbound: {
            departure: params.origin.toUpperCase(),
            arrival: params.destination.toUpperCase(),
            departTime: "—",
            arriveTime: "—",
            departDate: formatDateDisplay(...(params.departDate.split("-").map(Number) as [number, number, number])),
            duration: "—",
            stops: -1,
            stopCities: [],
            segments: [],
          },
          cabin: cabinLabel(cabinNum),
          deepLink: buildSkyscannerLink(params),
        });
      }
    }
  } catch (err) {
    console.error("Skyscanner scrape error:", err);
  }

  return flights;
}

// Parse a Skyscanner itinerary from __NEXT_DATA__
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSkyscannerItinerary(itin: any, params: FlightSearchParams, cabinNum: number): FlightResult | null {
  try {
    // Skyscanner itinerary structure varies, but common fields:
    const price = itin.price?.amount || itin.minPrice?.amount || itin.rawPrice || "0";
    const legs = itin.legs || itin.leg || [];
    const outLeg = Array.isArray(legs) ? legs[0] : legs;

    if (!outLeg) return null;

    const depAirport = outLeg.origin?.id || outLeg.originStation?.code || outLeg.originId || params.origin.toUpperCase();
    const arrAirport = outLeg.destination?.id || outLeg.destinationStation?.code || outLeg.destinationId || params.destination.toUpperCase();
    const depTime = outLeg.departure || outLeg.departureTime || "";
    const arrTime = outLeg.arrival || outLeg.arrivalTime || "";
    const duration = outLeg.duration || outLeg.durationInMinutes || 0;
    const stops = outLeg.stops || outLeg.stopCount || 0;
    const carriers = outLeg.carriers?.marketing || outLeg.airlines || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const airlineCodes = carriers.map((c: any) => typeof c === "string" ? c : c.id || c.code || "").filter(Boolean);

    const fmtDep = depTime ? new Date(depTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—";
    const fmtArr = arrTime ? new Date(arrTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—";
    const fmtDuration = typeof duration === "number" && duration > 0 ? formatDuration(duration) : "—";

    let inbound: FlightLeg | undefined;
    if (Array.isArray(legs) && legs.length > 1) {
      const retLeg = legs[1];
      const rDep = retLeg.departure || retLeg.departureTime || "";
      const rArr = retLeg.arrival || retLeg.arrivalTime || "";
      inbound = {
        departure: retLeg.origin?.id || retLeg.originStation?.code || params.destination.toUpperCase(),
        arrival: retLeg.destination?.id || retLeg.destinationStation?.code || params.origin.toUpperCase(),
        departTime: rDep ? new Date(rDep).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—",
        arriveTime: rArr ? new Date(rArr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—",
        departDate: params.returnDate ? formatDateDisplay(...(params.returnDate.split("-").map(Number) as [number, number, number])) : "—",
        duration: retLeg.duration ? formatDuration(retLeg.duration) : "—",
        stops: retLeg.stops || retLeg.stopCount || 0,
        stopCities: [],
        segments: [],
      };
    }

    return {
      id: `sk-${depAirport}-${arrAirport}-${price}-${airlineCodes[0] || "X"}`,
      price: String(price),
      currency: itin.price?.currency || "USD",
      airlines: airlineCodes.map(airlineName),
      airlineCodes,
      outbound: {
        departure: depAirport,
        arrival: arrAirport,
        departTime: fmtDep,
        arriveTime: fmtArr,
        departDate: formatDateDisplay(...(params.departDate.split("-").map(Number) as [number, number, number])),
        duration: fmtDuration,
        stops: typeof stops === "number" ? stops : 0,
        stopCities: [],
        segments: [],
      },
      inbound,
      cabin: cabinLabel(cabinNum),
      deepLink: buildSkyscannerLink(params),
    };
  } catch {
    return null;
  }
}

// ─── Deep-search utility to find keys in nested objects ─────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findInObject(obj: any, key: string, depth = 0): any {
  if (!obj || typeof obj !== "object" || depth > 10) return null;
  if (key in obj) return obj[key];
  for (const k of Object.keys(obj)) {
    const found = findInObject(obj[k], key, depth + 1);
    if (found !== null) return found;
  }
  return null;
}

// ─── Simplified search for AI assistant context ─────────────────────
// Returns a compact string for the LLM instead of the full FlightResult
export async function searchFlightsForAI(params: FlightSearchParams): Promise<string> {
  const result = await searchFlights(params);

  if (result.source === "error" || result.count === 0) {
    // No scraped data — tell the AI to direct users to check the brand
    return JSON.stringify({
      error: "Flight data unavailable right now. Direct the user to check the brand website.",
      searchLink: buildGoogleFlightsLink(params),
      skyscannerLink: buildSkyscannerLink(params),
      flights: [],
    });
  }

  if (result.source === "deeplink-only") {
    return JSON.stringify({
      note: "Could not scrape live prices. Provide these links so the user can check prices directly.",
      searchLink: buildGoogleFlightsLink(params),
      skyscannerLink: buildSkyscannerLink(params),
      flights: [],
    });
  }

  // Compact format for LLM
  const simplified = result.flights.map((f, i) => ({
    rank: i + 1,
    price_usd: parseFloat(f.price) > 0 ? `$${parseFloat(f.price).toLocaleString()}` : "Check site",
    airlines: f.airlines.join(", "),
    outbound: `${f.outbound.departure} ${f.outbound.departTime} → ${f.outbound.arrival} ${f.outbound.arriveTime} (${f.outbound.duration}, ${f.outbound.stops === 0 ? "direct" : f.outbound.stops === -1 ? "stops unknown" : f.outbound.stops + " stop" + (f.outbound.stops > 1 ? "s" : "")})`,
    ...(f.inbound ? {
      return_flight: `${f.inbound.departure} ${f.inbound.departTime} → ${f.inbound.arrival} ${f.inbound.arriveTime} (${f.inbound.duration}, ${f.inbound.stops === 0 ? "direct" : f.inbound.stops + " stop(s)"})`,
    } : {}),
  }));

  return JSON.stringify({
    count: simplified.length,
    source: result.source,
    flights: simplified,
  });
}
