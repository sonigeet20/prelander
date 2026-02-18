"use client";

import { useState, useCallback } from "react";

/**
 * FlightSearch — REAL flight search that shows actual results ON this site.
 *
 * Uses Amadeus API (via /api/flights/search) to fetch genuine flight offers
 * with real prices, airlines, stops, and durations.
 *
 * All "Book" CTAs go through /go/[slug] tracking link — no deep-linking to brand.
 */

const AIRPORTS = [
  { code: "LHR", city: "London Heathrow", country: "UK" },
  { code: "LGW", city: "London Gatwick", country: "UK" },
  { code: "STN", city: "London Stansted", country: "UK" },
  { code: "JFK", city: "New York JFK", country: "US" },
  { code: "EWR", city: "Newark", country: "US" },
  { code: "LAX", city: "Los Angeles", country: "US" },
  { code: "SFO", city: "San Francisco", country: "US" },
  { code: "ORD", city: "Chicago O'Hare", country: "US" },
  { code: "MIA", city: "Miami", country: "US" },
  { code: "ATL", city: "Atlanta", country: "US" },
  { code: "DFW", city: "Dallas/Fort Worth", country: "US" },
  { code: "SEA", city: "Seattle", country: "US" },
  { code: "BOS", city: "Boston", country: "US" },
  { code: "DEN", city: "Denver", country: "US" },
  { code: "LAS", city: "Las Vegas", country: "US" },
  { code: "CDG", city: "Paris CDG", country: "France" },
  { code: "FRA", city: "Frankfurt", country: "Germany" },
  { code: "MUC", city: "Munich", country: "Germany" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands" },
  { code: "BCN", city: "Barcelona", country: "Spain" },
  { code: "MAD", city: "Madrid", country: "Spain" },
  { code: "FCO", city: "Rome", country: "Italy" },
  { code: "IST", city: "Istanbul", country: "Turkey" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "DOH", city: "Doha", country: "Qatar" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "HND", city: "Tokyo Haneda", country: "Japan" },
  { code: "NRT", city: "Tokyo Narita", country: "Japan" },
  { code: "ICN", city: "Seoul Incheon", country: "South Korea" },
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "HKG", city: "Hong Kong", country: "China" },
  { code: "PVG", city: "Shanghai Pudong", country: "China" },
  { code: "PEK", city: "Beijing Capital", country: "China" },
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "BLR", city: "Bangalore", country: "India" },
  { code: "MAA", city: "Chennai", country: "India" },
  { code: "HYD", city: "Hyderabad", country: "India" },
  { code: "CCU", city: "Kolkata", country: "India" },
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "MEL", city: "Melbourne", country: "Australia" },
  { code: "YYZ", city: "Toronto", country: "Canada" },
  { code: "YVR", city: "Vancouver", country: "Canada" },
  { code: "MEX", city: "Mexico City", country: "Mexico" },
  { code: "CUN", city: "Cancún", country: "Mexico" },
  { code: "GRU", city: "São Paulo", country: "Brazil" },
  { code: "DUB", city: "Dublin", country: "Ireland" },
  { code: "ZRH", city: "Zurich", country: "Switzerland" },
  { code: "CPH", city: "Copenhagen", country: "Denmark" },
  { code: "LIS", city: "Lisbon", country: "Portugal" },
  { code: "ATH", city: "Athens", country: "Greece" },
  { code: "PRG", city: "Prague", country: "Czech Republic" },
  { code: "BUD", city: "Budapest", country: "Hungary" },
  { code: "WAW", city: "Warsaw", country: "Poland" },
  { code: "JED", city: "Jeddah", country: "Saudi Arabia" },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia" },
  { code: "CMB", city: "Colombo", country: "Sri Lanka" },
  { code: "KTM", city: "Kathmandu", country: "Nepal" },
  { code: "DAC", city: "Dhaka", country: "Bangladesh" },
];

interface FlightSegment {
  from: string;
  to: string;
  airline: string;
  flightNo: string;
  departTime: string;
  arriveTime: string;
  duration: string;
}

interface FlightLeg {
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

interface FlightResult {
  id: string;
  price: string;
  currency: string;
  airlines: string[];
  airlineCodes: string[];
  outbound: FlightLeg;
  inbound?: FlightLeg;
  cabin: string;
  seatsLeft?: number;
}

function getDefaultDepart() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}
function getDefaultReturn() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().split("T")[0];
}

export function FlightSearch({
  brandName,
  trackingHref,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  // Search form state
  const [fromQ, setFromQ] = useState("");
  const [toQ, setToQ] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [depart, setDepart] = useState(getDefaultDepart());
  const [ret, setRet] = useState(getDefaultReturn());
  const [pax, setPax] = useState(1);
  const [tripType, setTripType] = useState<"rt" | "ow">("rt");
  const [cabin, setCabin] = useState("ECONOMY");
  const [fromSug, setFromSug] = useState<typeof AIRPORTS>([]);
  const [toSug, setToSug] = useState<typeof AIRPORTS>([]);

  // Results state
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "stops">("price");
  const [dataSource, setDataSource] = useState<string>("");

  const filter = (q: string) => {
    if (q.length < 1) return [];
    const l = q.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(l) ||
        a.code.toLowerCase() === l ||
        a.country.toLowerCase().includes(l)
    ).slice(0, 6);
  };

  const searchFlights = useCallback(async () => {
    if (!fromCode || !toCode || !depart) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setFlights([]);

    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: fromCode,
          destination: toCode,
          departDate: depart,
          returnDate: tripType === "rt" ? ret : undefined,
          adults: pax,
          cabinClass: cabin,
        }),
      });

      const data = await res.json();
      setDataSource(data.source || "");
      if (data.error && (!data.flights || data.flights.length === 0)) {
        setError(data.error);
      } else if (data.source === "deeplink-only" || data.count === 0) {
        // Scraping didn't return live prices — show redirect CTA
        setFlights([]);
        setError("Live prices aren't available right now. Click below to check prices directly.");
      } else {
        setFlights(data.flights || []);
      }
    } catch {
      setError("Failed to search flights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromCode, toCode, depart, ret, tripType, pax, cabin]);

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === "price") return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "stops") return a.outbound.stops - b.outbound.stops;
    return a.outbound.duration.localeCompare(b.outbound.duration);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">✈️</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Flight Search</h3>
            <p className="text-indigo-200 text-xs">
              Real-time prices • Book via {brandName}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Trip type & cabin */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {([["rt", "Round Trip"], ["ow", "One Way"]] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setTripType(v as "rt" | "ow")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  tripType === v ? "bg-white shadow-sm text-indigo-700" : "text-gray-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={cabin}
            onChange={(e) => setCabin(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none"
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First Class</option>
          </select>
        </div>

        {/* Origin / Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="text"
              value={fromQ}
              onChange={(e) => {
                setFromQ(e.target.value);
                setFromSug(filter(e.target.value));
                setFromCode("");
              }}
              placeholder="City or airport code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
            {fromSug.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                {fromSug.map((a) => (
                  <button
                    key={a.code}
                    onClick={() => {
                      setFromQ(`${a.city} (${a.code})`);
                      setFromCode(a.code);
                      setFromSug([]);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span>
                      <span className="font-medium text-gray-800">{a.city}</span>{" "}
                      <span className="text-xs text-gray-400">{a.country}</span>
                    </span>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {a.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="text"
              value={toQ}
              onChange={(e) => {
                setToQ(e.target.value);
                setToSug(filter(e.target.value));
                setToCode("");
              }}
              placeholder="City or airport code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
            {toSug.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                {toSug.map((a) => (
                  <button
                    key={a.code}
                    onClick={() => {
                      setToQ(`${a.city} (${a.code})`);
                      setToCode(a.code);
                      setToSug([]);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span>
                      <span className="font-medium text-gray-800">{a.city}</span>{" "}
                      <span className="text-xs text-gray-400">{a.country}</span>
                    </span>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {a.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates & Passengers */}
        <div className={`grid gap-3 mb-5 ${tripType === "rt" ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Depart</label>
            <input
              type="date"
              value={depart}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDepart(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none"
            />
          </div>
          {tripType === "rt" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Return</label>
              <input
                type="date"
                value={ret}
                min={depart}
                onChange={(e) => setRet(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Passengers</label>
            <select
              value={pax}
              onChange={(e) => setPax(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Passenger" : "Passengers"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={searchFlights}
          disabled={!fromCode || !toCode || !depart || loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching real flights...
            </>
          ) : !fromCode || !toCode ? (
            "Select airports to search"
          ) : (
            "🔍 Search Flights"
          )}
        </button>

        {/* ─── Results ─── */}
        {searched && !loading && (
          <div className="mt-6">
            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                ⚠️ {error}
              </div>
            )}

            {flights.length > 0 && (
              <>
                {/* Results header */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-700">
                    {flights.length} flight{flights.length !== 1 ? "s" : ""} found
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      {fromCode} → {toCode}
                    </span>
                  </p>
                  <div className="flex gap-1">
                    {(["price", "duration", "stops"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-all ${
                          sortBy === s
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {s === "price" ? "Cheapest" : s === "duration" ? "Fastest" : "Fewest stops"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flight cards */}
                <div className="space-y-3">
                  {sortedFlights.map((flight, idx) => (
                    <div
                      key={flight.id}
                      className={`border rounded-xl overflow-hidden transition-all ${
                        idx === 0 && sortBy === "price"
                          ? "border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-100"
                          : "border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      <div className="p-4">
                        {idx === 0 && sortBy === "price" && (
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-2">
                            ✨ Best Price
                          </span>
                        )}

                        {/* Outbound leg */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-lg font-bold text-gray-900">{flight.outbound.departTime}</p>
                                <p className="text-[10px] text-gray-400">{flight.outbound.departure}</p>
                              </div>
                              <div className="flex-1 px-2">
                                <div className="text-[10px] text-gray-400 text-center mb-1">
                                  {flight.outbound.duration}
                                </div>
                                <div className="relative">
                                  <div className="h-px bg-gray-300 w-full" />
                                  {flight.outbound.stops > 0 && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                                      {flight.outbound.stopCities.map((city, i) => (
                                        <span
                                          key={i}
                                          className="w-2 h-2 bg-orange-400 rounded-full border border-white"
                                          title={city}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-[10px] text-center mt-1">
                                  {flight.outbound.stops === 0 ? (
                                    <span className="text-emerald-600 font-medium">Direct</span>
                                  ) : (
                                    <span className="text-orange-600">
                                      {flight.outbound.stops} stop{flight.outbound.stops > 1 ? "s" : ""}
                                      {flight.outbound.stopCities.length > 0 &&
                                        ` (${flight.outbound.stopCities.join(", ")})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{flight.outbound.arriveTime}</p>
                                <p className="text-[10px] text-gray-400">{flight.outbound.arrival}</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {flight.airlines.join(", ")} • {flight.outbound.departDate}
                            </p>
                          </div>
                          <div className="ml-4 text-right pl-4 border-l border-gray-200">
                            <p className="text-xl font-extrabold text-indigo-700">
                              ${parseFloat(flight.price).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {tripType === "rt" ? "round trip" : "one way"}
                            </p>
                            {flight.seatsLeft && flight.seatsLeft <= 4 && (
                              <p className="text-[10px] text-red-500 font-medium mt-0.5">
                                {flight.seatsLeft} left
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Return leg */}
                        {flight.inbound && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{flight.inbound.departTime}</p>
                                <p className="text-[10px] text-gray-400">{flight.inbound.departure}</p>
                              </div>
                              <div className="flex-1 px-2">
                                <div className="text-[10px] text-gray-400 text-center mb-1">
                                  {flight.inbound.duration}
                                </div>
                                <div className="relative">
                                  <div className="h-px bg-gray-300 w-full" />
                                  {flight.inbound.stops > 0 && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                                      {flight.inbound.stopCities.map((city, i) => (
                                        <span
                                          key={i}
                                          className="w-2 h-2 bg-orange-400 rounded-full border border-white"
                                          title={city}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-[10px] text-center mt-1">
                                  {flight.inbound.stops === 0 ? (
                                    <span className="text-emerald-600 font-medium">Direct</span>
                                  ) : (
                                    <span className="text-orange-600">
                                      {flight.inbound.stops} stop{flight.inbound.stops > 1 ? "s" : ""}{" "}
                                      {flight.inbound.stopCities.length > 0 &&
                                        `(${flight.inbound.stopCities.join(", ")})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{flight.inbound.arriveTime}</p>
                                <p className="text-[10px] text-gray-400">{flight.inbound.arrival}</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Return • {flight.inbound.departDate}
                            </p>
                          </div>
                        )}

                        {/* Book button */}
                        <div className="flex items-center gap-2 mt-3">
                          <a
                            href={trackingHref}
                            className="flex-1 text-center py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-semibold text-xs hover:shadow-lg transition-all"
                            rel="nofollow sponsored"
                          >
                            Book on {brandName} →
                          </a>
                          <button
                            onClick={() => setExpandedId(expandedId === flight.id ? null : flight.id)}
                            className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all"
                          >
                            {expandedId === flight.id ? "Hide" : "Details"}
                          </button>
                        </div>

                        {/* Expanded details */}
                        {expandedId === flight.id && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                              Flight Details
                            </p>
                            {flight.outbound.segments.map((seg, i) => (
                              <div key={i} className="flex items-center gap-3 py-1.5 text-xs">
                                <span className="font-mono text-indigo-600 w-14 shrink-0">{seg.flightNo}</span>
                                <span className="text-gray-700">
                                  {seg.from} → {seg.to}
                                </span>
                                <span className="text-gray-400 ml-auto">
                                  {seg.departTime} – {seg.arriveTime}
                                </span>
                                <span className="text-gray-400">{seg.duration}</span>
                              </div>
                            ))}
                            {flight.inbound?.segments && (
                              <>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 mb-1">Return</p>
                                {flight.inbound.segments.map((seg, i) => (
                                  <div key={i} className="flex items-center gap-3 py-1.5 text-xs">
                                    <span className="font-mono text-indigo-600 w-14 shrink-0">{seg.flightNo}</span>
                                    <span className="text-gray-700">
                                      {seg.from} → {seg.to}
                                    </span>
                                    <span className="text-gray-400 ml-auto">
                                      {seg.departTime} – {seg.arriveTime}
                                    </span>
                                    <span className="text-gray-400">{seg.duration}</span>
                                  </div>
                                ))}
                              </>
                            )}
                            <div className="mt-2 pt-2 border-t border-gray-100 flex gap-3 text-[10px] text-gray-400">
                              <span>Cabin: {flight.cabin}</span>
                              <span>•</span>
                              <span>{flight.airlines.join(", ")}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-4 text-center">
                  <a
                    href={trackingHref}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    rel="nofollow sponsored"
                  >
                    See All Deals on {brandName}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>
              </>
            )}

            {flights.length === 0 && !error && (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm font-medium text-gray-700">No flights found for this route</p>
                <p className="text-xs text-gray-400 mt-1">Try different dates or nearby airports</p>
                <a
                  href={trackingHref}
                  className="inline-block mt-4 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-xs hover:shadow-lg transition-all"
                  rel="nofollow sponsored"
                >
                  Search directly on {brandName} →
                </a>
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-4">
          Live flight prices • Final booking on {brandName}
        </p>
      </div>
    </div>
  );
}
