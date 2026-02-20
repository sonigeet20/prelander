/**
 * Flight Scraper — Real-time live flight data from Google Flights.
 *
 * Scrapes Google Flights search page HTML and parses the aria-label
 * attributes that contain full flight details (price, airline, times,
 * stops, layovers, duration).
 *
 * • No API keys — completely free
 * • No monthly quota — unlimited
 * • Real, live prices from airlines
 * • Forwards visitor's IP to avoid server-side blocking
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
  error?: string;
}

// ─── Airline code lookup ────────────────────────────────────────────

const AIRLINE_TO_CODE: Record<string, string> = {
  "indigo": "6E", "oman air": "WY", "air india": "AI",
  "air india express": "IX", "spicejet": "SG", "vistara": "UK",
  "emirates": "EK", "flydubai": "FZ", "etihad": "EY",
  "qatar airways": "QR", "british airways": "BA",
  "american airlines": "AA", "delta": "DL",
  "united": "UA", "united airlines": "UA",
  "lufthansa": "LH", "klm": "KL", "air france": "AF",
  "turkish airlines": "TK", "singapore airlines": "SQ",
  "cathay pacific": "CX", "japan airlines": "JL", "ana": "NH",
  "korean air": "KE", "asiana": "OZ",
  "thai airways": "TG", "malaysia airlines": "MH",
  "qantas": "QF", "air new zealand": "NZ",
  "southwest": "WN", "jetblue": "B6", "alaska airlines": "AS",
  "spirit": "NK", "frontier": "F9",
  "ryanair": "FR", "easyjet": "U2", "wizz air": "W6",
  "saudia": "SV", "gulf air": "GF",
  "lot polish": "LO", "tap portugal": "TP",
  "swiss": "LX", "austrian": "OS", "sas": "SK",
  "finnair": "AY", "iberia": "IB",
  "virgin atlantic": "VS", "air canada": "AC",
  "westjet": "WS", "aeromexico": "AM",
  "avianca": "AV", "latam": "LA",
  "ethiopian airlines": "ET", "kenya airways": "KQ",
  "south african airways": "SA", "royal jordanian": "RJ",
  "pegasus": "PC", "garuda indonesia": "GA",
  "vietnam airlines": "VN", "air china": "CA",
  "china eastern": "MU", "china southern": "CZ",
  "hainan airlines": "HU", "ita airways": "AZ",
  "air europa": "UX", "srilankan": "UL",
  "sun country": "SY", "allegiant": "G4",
  "goair": "G8", "go first": "G8",
  "akasa air": "QP", "batik air": "ID",
};

// ─── In-memory cache (30 min TTL) ──────────────────────────────────
// Same route + date + cabin → cached result for 30 minutes.
// 1,000 users searching DEL→DXB = 1 Google request, not 1,000.

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_ENTRIES = 200; // prevent unbounded memory growth

interface CacheEntry {
  result: FlightSearchResult;
  expiresAt: number;
}

const flightCache = new Map<string, CacheEntry>();

function buildCacheKey(params: FlightSearchParams): string {
  return [
    params.origin.toUpperCase(),
    params.destination.toUpperCase(),
    params.departDate,
    params.returnDate || "ow",
    String(params.adults || 1),
    (params.cabinClass || "ECONOMY").toUpperCase(),
  ].join("|");
}

function getCached(key: string): FlightSearchResult | null {
  const entry = flightCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    flightCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCache(key: string, result: FlightSearchResult): void {
  // Evict oldest entries if at capacity
  if (flightCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = flightCache.keys().next().value;
    if (firstKey) flightCache.delete(firstKey);
  }
  flightCache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Random user agents for rotation ────────────────────────────────

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── Build Skyscanner tracking deep link ────────────────────────────

export function buildSkyscannerLink(params: FlightSearchParams): string {
  const { origin, destination, departDate, returnDate } = params;
  const depFmt = departDate.replace(/-/g, "").slice(2); // YYMMDD
  let url = `https://www.skyscanner.net/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${depFmt}/`;
  if (returnDate) {
    url += `${returnDate.replace(/-/g, "").slice(2)}/`;
  }
  return url;
}

// ─── Build Google Flights search URL ────────────────────────────────

function buildGoogleFlightsUrl(params: FlightSearchParams): string {
  const { origin, destination, departDate, returnDate, adults = 1, cabinClass = "ECONOMY" } = params;

  // Google Flights accepts a natural-language ?q= parameter
  let q = `Flights to ${destination.toUpperCase()} from ${origin.toUpperCase()} on ${departDate}`;
  if (returnDate) q += ` return ${returnDate}`;
  if (adults > 1) q += ` ${adults} passengers`;

  // Map cabin class
  const cabinMap: Record<string, string> = {
    ECONOMY: "economy", PREMIUM_ECONOMY: "premium+economy",
    BUSINESS: "business", FIRST: "first+class",
  };
  const cabinStr = cabinMap[cabinClass.toUpperCase()] || "economy";
  if (cabinStr !== "economy") q += ` ${cabinStr}`;

  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&curr=USD&gl=us&hl=en`;
}

// ─── Parse a single flight from aria-label ──────────────────────────

interface ParsedFlight {
  price: number;
  currency: string;
  currencyLabel: string;
  airlines: string[];
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  duration: string;
  stops: number;
  stopDescription: string;
  layovers: { duration: string; airport: string; city: string }[];
  departAirport: string;
  arriveAirport: string;
  tripType: string;
}

function parseFlightLabel(label: string): ParsedFlight | null {
  try {
    // Example:
    // "From 301 US dollars round trip total. 1 stop flight with Oman Air.
    //  Leaves Indira Gandhi International Airport at 3:20 PM on Wednesday, March 4
    //  and arrives at Dubai International Airport at 9:35 PM on Wednesday, March 4.
    //  Total duration 7 hr 45 min. Layover (1 of 1) is a 2 hr 50 min layover at
    //  Muscat International Airport in Muscat. Select flight"

    // Price
    const priceMatch = label.match(/From (\d[\d,]*)\s+(.+?)\s+(round trip|one way)/i);
    if (!priceMatch) return null;
    const price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
    const currencyLabel = priceMatch[2]; // "US dollars" or "Indian rupees"
    const tripType = priceMatch[3];

    // Determine currency code
    let currency = "USD";
    if (/indian rupee/i.test(currencyLabel)) currency = "INR";
    else if (/euro/i.test(currencyLabel)) currency = "EUR";
    else if (/british pound|pound sterling/i.test(currencyLabel)) currency = "GBP";
    else if (/canadian dollar/i.test(currencyLabel)) currency = "CAD";
    else if (/australian dollar/i.test(currencyLabel)) currency = "AUD";

    // Stops
    let stops = 0;
    const stopsMatch = label.match(/(\d+)\s+stop\s+flight/i);
    const nonstopMatch = label.match(/Nonstop flight/i);
    if (stopsMatch) stops = parseInt(stopsMatch[1], 10);
    else if (nonstopMatch) stops = 0;

    // Airlines — "with IndiGo" or "with Air India and Air India Express"
    const airlineMatch = label.match(/flight with (.+?)\.\s/i);
    let airlines: string[] = [];
    if (airlineMatch) {
      airlines = airlineMatch[1].split(/\s+and\s+/i).map((a) => a.trim());
    }

    // Departure: "Leaves {airport} at {time} on {day}, {date}"
    const departMatch = label.match(
      /Leaves (.+?) at (\d{1,2}:\d{2}\s*[AP]M) on (\w+day), (.+?) and arrives/i
    );
    let departTime = "";
    let departDate = "";
    let departAirport = "";
    if (departMatch) {
      departAirport = departMatch[1];
      departTime = departMatch[2];
      departDate = `${departMatch[3]}, ${departMatch[4]}`;
    }

    // Arrival: "arrives at {airport} at {time} on {day}, {date}"
    const arriveMatch = label.match(
      /arrives at (.+?) at (\d{1,2}:\d{2}\s*[AP]M) on (\w+day), (.+?)\./i
    );
    let arriveTime = "";
    let arriveDate = "";
    let arriveAirport = "";
    if (arriveMatch) {
      arriveAirport = arriveMatch[1];
      arriveTime = arriveMatch[2];
      arriveDate = `${arriveMatch[3]}, ${arriveMatch[4]}`;
    }

    // Duration: "Total duration 7 hr 45 min" or "Total duration 4 hr 5 min"
    const durationMatch = label.match(/Total duration (\d+\s*hr(?:\s+\d+\s*min)?)/i);
    const duration = durationMatch
      ? durationMatch[1].replace(/\s+/g, " ").replace(/hr/, "h").replace(/min/, "m")
      : "";

    // Layovers: "Layover (1 of 1) is a 2 hr 50 min layover at {airport} in {city}"
    const layovers: { duration: string; airport: string; city: string }[] = [];
    const layoverRegex =
      /Layover \(\d+ of \d+\) is a (.+?) (?:overnight )?layover at (.+?) in (.+?)(?:\.|$)/gi;
    let lm;
    while ((lm = layoverRegex.exec(label)) !== null) {
      layovers.push({
        duration: lm[1].replace(/\s+/g, " ").replace(/hr/, "h").replace(/min/, "m"),
        airport: lm[2],
        city: lm[3].replace(/\.\s*Select flight.*$/, ""),
      });
    }

    // Stop description
    let stopDescription = stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`;
    if (layovers.length > 0) {
      stopDescription += ` via ${layovers.map((l) => l.city).join(", ")}`;
    }

    return {
      price,
      currency,
      currencyLabel,
      airlines,
      departTime,
      arriveTime,
      departDate,
      arriveDate,
      duration,
      stops,
      stopDescription,
      layovers,
      departAirport,
      arriveAirport,
      tripType,
    };
  } catch (err) {
    console.error("Failed to parse flight label:", err);
    return null;
  }
}

// ─── Convert parsed flight to FlightResult ──────────────────────────

function toFlightResult(
  parsed: ParsedFlight,
  index: number,
  params: FlightSearchParams
): FlightResult {
  const airlineCodes = parsed.airlines.map((name) => {
    const key = name.toLowerCase();
    return AIRLINE_TO_CODE[key] || name.substring(0, 2).toUpperCase();
  });

  // Extract IATA codes from airport names if possible
  const depIata = params.origin.toUpperCase();
  const arrIata = params.destination.toUpperCase();

  const stopCities = parsed.layovers.map((l) => l.city);

  return {
    id: `gf-${index}-${depIata}-${arrIata}-${parsed.price}`,
    price: String(parsed.price),
    currency: parsed.currency,
    airlines: parsed.airlines,
    airlineCodes,
    outbound: {
      departure: depIata,
      arrival: arrIata,
      departTime: parsed.departTime || "—",
      arriveTime: parsed.arriveTime || "—",
      departDate: parsed.departDate || "",
      duration: parsed.duration || "—",
      stops: parsed.stops,
      stopCities,
      segments: parsed.airlines.map((airline, i) => ({
        from: i === 0 ? depIata : stopCities[i - 1] || depIata,
        to: i === parsed.airlines.length - 1 ? arrIata : stopCities[i] || arrIata,
        airline,
        flightNo: airlineCodes[i] || "",
        departTime: i === 0 ? parsed.departTime : "—",
        arriveTime: i === parsed.airlines.length - 1 ? parsed.arriveTime : "—",
        duration: parsed.layovers[i]?.duration || "—",
      })),
    },
    cabin: params.cabinClass
      ? params.cabinClass.charAt(0).toUpperCase() + params.cabinClass.slice(1).toLowerCase()
      : "Economy",
    deepLink: buildSkyscannerLink(params),
  };
}

// ─── Main search function ───────────────────────────────────────────

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult> {
  const { origin, destination, departDate } = params;

  if (!origin || !destination || !departDate) {
    return {
      flights: [],
      count: 0,
      searchedAt: new Date().toISOString(),
      source: "error",
      error: "origin, destination, and departDate are required",
    };
  }

  // ─── Check cache first ────────────────────────────────────────
  const cacheKey = buildCacheKey(params);
  const cached = getCached(cacheKey);
  if (cached) {
    console.log("[flight-scraper] Cache HIT for", cacheKey);
    return { ...cached, source: "google-flights-cached" };
  }
  console.log("[flight-scraper] Cache MISS for", cacheKey);

  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const headers: Record<string, string> = {
      "User-Agent": randomUA(),
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
    };

    // Forward client IP if available
    if (params.clientIp) {
      headers["X-Forwarded-For"] = params.clientIp;
    }

    try {
      const url = buildGoogleFlightsUrl(params);
      console.log(`[flight-scraper] Attempt ${attempt}/${MAX_RETRIES} — Fetching:`, url);

      const res = await fetch(url, { headers, redirect: "follow" });

      if (!res.ok) {
        console.error("[flight-scraper] Google Flights returned", res.status);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
          continue;
        }
        return {
          flights: [],
          count: 0,
          searchedAt: new Date().toISOString(),
          source: "error",
          error: `Google Flights returned HTTP ${res.status}`,
        };
      }

      const html = await res.text();
      console.log("[flight-scraper] Received HTML:", html.length, "bytes");

      // Extract all flight aria-labels
      // Pattern: aria-label="From {price} {currency} {trip_type} total. ..."
      const flightLabelRegex =
        /aria-label="(From \d[\d,]*\s+.+?Select flight)"/g;
      const labels: string[] = [];
      let match;
      while ((match = flightLabelRegex.exec(html)) !== null) {
        labels.push(match[1]);
      }

      console.log("[flight-scraper] Found", labels.length, "flight labels");

      if (labels.length === 0) {
        // Detect actual CAPTCHA / blocking (not cookie consent banners)
        const htmlLower = html.toLowerCase();
        const isCaptcha =
          htmlLower.includes("recaptcha") ||
          htmlLower.includes("id=\"captcha\"") ||
          htmlLower.includes("class=\"captcha\"") ||
          htmlLower.includes("solve this captcha");
        const isBlocked =
          htmlLower.includes("unusual traffic") ||
          htmlLower.includes("automated queries") ||
          htmlLower.includes("systems have detected");

        console.warn(
          `[flight-scraper] Attempt ${attempt}: No flights found.`,
          isCaptcha ? "CAPTCHA detected." : "",
          isBlocked ? "Blocked." : "",
          "HTML length:", html.length,
          "Sample:", html.substring(0, 500).replace(/\n/g, " ").substring(0, 200)
        );

        if ((isCaptcha || isBlocked) && attempt < MAX_RETRIES) {
          // Retry with different UA after a delay
          console.log("[flight-scraper] Retrying with different User-Agent...");
          await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500));
          continue;
        }

        if (isCaptcha || isBlocked) {
          return {
            flights: [],
            count: 0,
            searchedAt: new Date().toISOString(),
            source: "error",
            error: "Search temporarily limited. Please try again in a moment.",
          };
        }

        // No blocking — route genuinely has no flights
        return {
          flights: [],
          count: 0,
          searchedAt: new Date().toISOString(),
          source: "no-results",
          error: "No flights found for this route. Try different dates or nearby airports.",
        };
      }

      // Parse each label into a FlightResult
      const flights: FlightResult[] = [];
      for (let i = 0; i < labels.length && flights.length < 10; i++) {
        const parsed = parseFlightLabel(labels[i]);
        if (parsed) {
          flights.push(toFlightResult(parsed, i, params));
        }
      }

      // Sort by price
      flights.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

      const result: FlightSearchResult = {
        flights: flights.slice(0, 8),
        count: Math.min(flights.length, 8),
        searchedAt: new Date().toISOString(),
        source: "google-flights",
      };

      // ─── Store in cache ───────────────────────────────────────────
      if (result.count > 0) {
        setCache(cacheKey, result);
        console.log("[flight-scraper] Cached", result.count, "flights for", cacheKey);
      }

      return result;
    } catch (err) {
      console.error(`[flight-scraper] Attempt ${attempt} error:`, err);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
        continue;
      }
      return {
        flights: [],
        count: 0,
        searchedAt: new Date().toISOString(),
        source: "error",
        error: "Flight search failed. Please try again.",
      };
    }
  }

  // Should not reach here, but safety fallback
  return {
    flights: [],
    count: 0,
    searchedAt: new Date().toISOString(),
    source: "error",
    error: "Flight search failed after retries.",
  };
}

// ─── Simplified output for AI assistant ─────────────────────────────

export async function searchFlightsForAI(
  params: FlightSearchParams
): Promise<string> {
  const result = await searchFlights(params);

  if (result.source === "error" || result.count === 0) {
    return JSON.stringify({
      error:
        result.error ||
        "Could not fetch live flight data right now.",
      note: "Direct the user to check prices on Google Flights or Skyscanner.",
      googleFlightsLink: buildGoogleFlightsUrl(params),
      skyscannerLink: buildSkyscannerLink(params),
      flights: [],
    });
  }

  const simplified = result.flights.map((f, i) => ({
    rank: i + 1,
    price: `${f.currency === "USD" ? "$" : f.currency + " "}${parseInt(f.price).toLocaleString()}`,
    airlines: f.airlines.join(", "),
    departure: `${f.outbound.departTime} from ${f.outbound.departure}`,
    arrival: `${f.outbound.arriveTime} at ${f.outbound.arrival}`,
    duration: f.outbound.duration,
    stops:
      f.outbound.stops === 0
        ? "Direct"
        : `${f.outbound.stops} stop${f.outbound.stops > 1 ? "s" : ""}${
            f.outbound.stopCities.length > 0
              ? " via " + f.outbound.stopCities.join(", ")
              : ""
          }`,
    trip_type: params.returnDate ? "round trip" : "one way",
  }));

  return JSON.stringify({
    count: simplified.length,
    currency: result.flights[0]?.currency || "USD",
    source: "google-flights",
    flights: simplified,
  });
}
