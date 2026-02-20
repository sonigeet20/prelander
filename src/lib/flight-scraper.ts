/**
 * Flight Scraper — Real-time live flight data via Google Search SERP.
 *
 * Uses Bright Data SERP API to fetch Google Search results for flight
 * queries. Google Search natively includes flight-card widgets with
 * airline, duration, stops, and prices — all rendered server-side,
 * no JavaScript execution required.
 *
 * • Bright Data SERP API — residential proxy, no CAPTCHA, fast (3-6s)
 * • Google Search flight cards — no JS rendering needed
 * • Works for both one-way and round-trip searches
 * • Smart caching — same route reuses results for 2 hours
 * • Fallback — direct fetch if no API key (dev/testing)
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
  suggestedLinks?: {
    googleFlights: string;
    skyscanner: string;
  };
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
  "icelandair": "FI", "american": "AA",
  "hawaiian airlines": "HA", "copa airlines": "CM",
  "aer lingus": "EI", "brussels airlines": "SN",
  "norwegian": "DY", "condor": "DE",
  "play": "OG", "azul": "AD",
};

// ─── In-memory cache (2 hour TTL) ──────────────────────────────────
// Same route + date + cabin → cached result for 2 hours.
// With 100k visitors/week and 2hr cache, ~168 unique slots/route/week.
// Most popular routes stay cached, Bright Data credits are preserved.

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_CACHE_ENTRIES = 500; // allow more entries with longer TTL

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

// ─── Build Google Flights deep link (for users to click) ────────────

function buildGoogleFlightsUrl(params: FlightSearchParams): string {
  const { origin, destination, departDate, returnDate } = params;
  const q = returnDate
    ? `flights from ${origin} to ${destination} ${departDate} to ${returnDate}`
    : `flights from ${origin} to ${destination} ${departDate}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&curr=USD&hl=en&gl=us`;
}

// ─── Build Google Search URL for SERP API ───────────────────────────
// Google Search returns flight-card widgets with airline, duration,
// stops, and price — all server-side rendered, no JS needed.

function buildGoogleSearchUrl(params: FlightSearchParams): string {
  const { origin, destination, departDate, returnDate } = params;
  // Format date for natural language: "march 8 2026"
  const fmtDate = (iso: string): string => {
    const d = new Date(iso + "T00:00:00Z");
    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()} ${d.getUTCFullYear()}`;
  };

  let q: string;
  if (returnDate) {
    q = `flights ${origin} to ${destination} ${fmtDate(departDate)} to ${fmtDate(returnDate)}`;
  } else {
    q = `flights ${origin} to ${destination} ${fmtDate(departDate)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en&gl=us`;
}

// ─── Parse flight cards from Google Search SERP HTML ────────────────
// Google Search flight widgets follow a consistent text pattern:
//   "Airline Duration Connecting|Nonstop from $Price"
// We strip HTML tags first, then match this pattern.

interface SerpFlightCard {
  airline: string;
  duration: string;
  stopsType: string; // "Nonstop" or "Connecting"
  price: number;
  currency: string;
}

/**
 * Parse flight cards from cleaned text.
 * Returns up to 8 flights sorted by price.
 */
function parseSerpFlightCards(html: string): SerpFlightCard[] {
  // Strip all HTML tags and normalize whitespace
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // Match: AirlineName Duration Connecting|Nonstop from $Price
  // Duration formats: "2h 15m", "22h 55m+", "1d 11h+", "4h 0m+"
  // Airline names can be 1-4 words like "Multiple airlines", "Air India Express", "IndiGo"
  const pattern =
    /(Multiple airlines|[A-Z][A-Za-z]+(?:\s+[A-Za-z]+){0,3})\s+(\d+[dh]\s*\d*[hm]?\+?)\s+(Connecting|Nonstop)\s+from\s+\$([\d,]+)/g;

  // Known non-airline prefixes that may get captured
  const stripPrefixes = [
    "Round trip ",
    "One way ",
    "Nonstop ",
    "Economy ",
    "Business ",
    "First class ",
  ];

  const cards: SerpFlightCard[] = [];
  const seen = new Set<string>(); // deduplicate
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(text)) !== null) {
    let airline = m[1].trim();
    const duration = m[2].trim();
    const stopsType = m[3];
    const price = parseInt(m[4].replace(/,/g, ""), 10);

    // Strip known non-airline prefixes
    for (const prefix of stripPrefixes) {
      if (airline.startsWith(prefix)) {
        airline = airline.slice(prefix.length).trim();
      }
    }

    const key = `${airline}|${duration}|${price}`;

    // Skip obvious false positives
    if (
      airline.length < 2 ||
      airline.length > 40 ||
      isNaN(price) ||
      price <= 0 ||
      seen.has(key)
    ) {
      continue;
    }
    seen.add(key);

    cards.push({ airline, duration, stopsType, price, currency: "USD" });
  }

  // Sort by price ascending
  cards.sort((a, b) => a.price - b.price);
  return cards.slice(0, 8);
}

// ─── Convert parsed card to FlightResult ────────────────────────────

function cardToFlightResult(
  card: SerpFlightCard,
  index: number,
  params: FlightSearchParams,
  deepLink?: string
): FlightResult {
  const airlineLower = card.airline.toLowerCase();
  const airlineCode =
    AIRLINE_TO_CODE[airlineLower] ||
    (card.airline === "Multiple airlines"
      ? "MIX"
      : card.airline.substring(0, 2).toUpperCase());

  const depIata = params.origin.toUpperCase();
  const arrIata = params.destination.toUpperCase();
  const stops = card.stopsType === "Nonstop" ? 0 : 1;

  return {
    id: `gf-${index}-${depIata}-${arrIata}-${card.price}`,
    price: String(card.price),
    currency: card.currency,
    airlines: [card.airline],
    airlineCodes: [airlineCode],
    outbound: {
      departure: depIata,
      arrival: arrIata,
      departTime: "—",
      arriveTime: "—",
      departDate: params.departDate,
      duration: card.duration
        .replace(/\s+/g, " ")
        .replace(/\+$/, "")
        .replace(/d/, "d ")
        .replace(/h/, "h ")
        .replace(/m/, "m")
        .trim(),
      stops,
      stopCities: [],
      segments: [
        {
          from: depIata,
          to: arrIata,
          airline: card.airline,
          flightNo: airlineCode,
          departTime: "—",
          arriveTime: "—",
          duration: card.duration,
        },
      ],
    },
    cabin: params.cabinClass
      ? params.cabinClass.charAt(0).toUpperCase() +
        params.cabinClass.slice(1).toLowerCase()
      : "Economy",
    deepLink: deepLink || buildSkyscannerLink(params),
  };
}

// ─── Fetch via Bright Data SERP API ─────────────────────────────────
// Uses Google Search (not Google Flights) since SERP zone natively
// parses search results without JS rendering.

async function fetchViaBrightData(searchUrl: string): Promise<string> {
  const apiKey = process.env.BRIGHTDATA_API_KEY;
  if (!apiKey) {
    throw new Error("BRIGHTDATA_API_KEY not set");
  }

  const res = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      zone: "serp",
      url: searchUrl,
      format: "raw",
    }),
  });

  if (!res.ok) {
    throw new Error(`Bright Data returned HTTP ${res.status}`);
  }

  return res.text();
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

  const useBrightData = !!process.env.BRIGHTDATA_API_KEY;
  const googleFlightsUrl = buildGoogleFlightsUrl(params);

  try {
    const searchUrl = buildGoogleSearchUrl(params);
    console.log(
      "[flight-scraper] Fetching via",
      useBrightData ? "Bright Data SERP" : "direct",
      ":",
      searchUrl
    );

    let html: string;
    if (useBrightData) {
      html = await fetchViaBrightData(searchUrl);
    } else {
      // Direct fetch fallback (works in dev, may be blocked in production)
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });
      if (!res.ok) {
        return {
          flights: [],
          count: 0,
          searchedAt: new Date().toISOString(),
          source: "error",
          error: `Google returned HTTP ${res.status}`,
        };
      }
      html = await res.text();
    }

    console.log("[flight-scraper] Received HTML:", html.length, "bytes");

    // ─── Parse flight cards from SERP HTML ────────────────────────
    const cards = parseSerpFlightCards(html);
    console.log("[flight-scraper] Parsed", cards.length, "flight cards");

    if (cards.length === 0) {
      // Check for blocking signals
      const htmlLower = html.toLowerCase();
      const isCaptcha =
        htmlLower.includes("recaptcha") ||
        htmlLower.includes("id=\"captcha\"") ||
        htmlLower.includes("class=\"captcha\"");
      const isBlocked =
        htmlLower.includes("unusual traffic") ||
        htmlLower.includes("automated queries") ||
        htmlLower.includes("systems have detected");

      console.warn(
        "[flight-scraper] No flights found.",
        isCaptcha ? "CAPTCHA." : "",
        isBlocked ? "Blocked." : "",
        "HTML length:",
        html.length
      );

      if (isCaptcha || isBlocked) {
        return {
          flights: [],
          count: 0,
          searchedAt: new Date().toISOString(),
          source: "error",
          error: "Search temporarily limited. Please try again in a moment.",
          suggestedLinks: {
            googleFlights: googleFlightsUrl,
            skyscanner: buildSkyscannerLink(params),
          },
        };
      }

      return {
        flights: [],
        count: 0,
        searchedAt: new Date().toISOString(),
        source: "no-results",
        error:
          "No flights found for this route. Try different dates or nearby airports.",
        suggestedLinks: {
          googleFlights: googleFlightsUrl,
          skyscanner: buildSkyscannerLink(params),
        },
      };
    }

    // ─── Convert cards to FlightResult array ──────────────────────
    const flights: FlightResult[] = cards.map((card, i) =>
      cardToFlightResult(card, i, params, googleFlightsUrl)
    );

    const result: FlightSearchResult = {
      flights: flights.slice(0, 8),
      count: Math.min(flights.length, 8),
      searchedAt: new Date().toISOString(),
      source: useBrightData ? "google-flights" : "google-flights-direct",
    };

    // ─── Store in cache ───────────────────────────────────────────
    if (result.count > 0) {
      setCache(cacheKey, result);
      console.log(
        "[flight-scraper] Cached",
        result.count,
        "flights for",
        cacheKey
      );
    }

    return result;
  } catch (err) {
    console.error("[flight-scraper] Error:", err);
    return {
      flights: [],
      count: 0,
      searchedAt: new Date().toISOString(),
      source: "error",
      error: "Flight search failed. Please try again.",
      suggestedLinks: {
        googleFlights: googleFlightsUrl,
        skyscanner: buildSkyscannerLink(params),
      },
    };
  }
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
