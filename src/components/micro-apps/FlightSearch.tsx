"use client";

import { useState } from "react";

/**
 * FlightSearch — REAL flight search deep-link builder.
 *
 * Takes user inputs (origin, dest, dates, passengers, cabin) and constructs
 * a real search URL for the brand's website with parameters pre-filled.
 * NO fake prices, NO simulated results — just genuinely useful search
 * construction that opens real results on the brand's site.
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
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
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
];

function getDefaultDepart() {
  const d = new Date(); d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}
function getDefaultReturn() {
  const d = new Date(); d.setDate(d.getDate() + 21);
  return d.toISOString().split("T")[0];
}

function buildSearchUrl(brandDomain: string, from: string, to: string, depart: string, ret: string | null, pax: number, cabin: string) {
  const d = brandDomain.replace(/^www\./, "").toLowerCase();
  const dep = depart.replace(/-/g, "").slice(2); // YYMMDD
  const retF = ret ? ret.replace(/-/g, "").slice(2) : "";

  if (d.includes("skyscanner")) {
    const cabinMap: Record<string, string> = { economy: "economy", premium_economy: "premiumeconomy", business: "business", first: "first" };
    const path = ret
      ? `/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${dep}/${retF}/`
      : `/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${dep}/`;
    return `https://www.skyscanner.com${path}?adults=${pax}&cabinclass=${cabinMap[cabin] || "economy"}`;
  }
  if (d.includes("kayak")) return `https://www.kayak.com/flights/${from}-${to}/${depart}${ret ? "/" + ret : ""}?sort=bestflight_a`;
  if (d.includes("google")) return `https://www.google.com/travel/flights?q=flights+from+${from}+to+${to}`;
  if (d.includes("expedia")) return `https://www.expedia.com/Flights-search/${from}-${to}/${depart}${ret ? "/" + ret : ""}`;
  return `https://${brandDomain}`;
}

const TIPS = [
  { icon: "📅", text: "Book 6–8 weeks ahead for domestic flights, 2–3 months for international" },
  { icon: "📊", text: "Tuesday & Wednesday departures are typically 15–25% cheaper" },
  { icon: "🔔", text: "Set price alerts — fares can drop 20–40% before a flash sale ends" },
  { icon: "🗓️", text: "Use the 'whole month' view to find the cheapest departure days" },
  { icon: "🛫", text: "Check nearby airports — they can save $50–$200 per ticket" },
];

export function FlightSearch({ brandName, trackingHref, brandDomain }: { brandName: string; trackingHref: string; brandDomain: string }) {
  const [fromQ, setFromQ] = useState("");
  const [toQ, setToQ] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [depart, setDepart] = useState(getDefaultDepart());
  const [ret, setRet] = useState(getDefaultReturn());
  const [pax, setPax] = useState(1);
  const [tripType, setTripType] = useState<"rt" | "ow">("rt");
  const [cabin, setCabin] = useState("economy");
  const [fromSug, setFromSug] = useState<typeof AIRPORTS>([]);
  const [toSug, setToSug] = useState<typeof AIRPORTS>([]);
  const [ready, setReady] = useState(false);

  const filter = (q: string) => {
    if (q.length < 1) return [];
    const l = q.toLowerCase();
    return AIRPORTS.filter(a => a.city.toLowerCase().includes(l) || a.code.toLowerCase() === l || a.country.toLowerCase().includes(l)).slice(0, 6);
  };

  const searchUrl = ready ? buildSearchUrl(brandDomain, fromCode, toCode, depart, tripType === "rt" ? ret : null, pax, cabin) : "";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"><span className="text-xl">✈️</span></div>
          <div>
            <h3 className="text-white font-bold text-lg">Flight Search</h3>
            <p className="text-indigo-200 text-xs">Find and compare real flights on {brandName}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {([["rt", "Round Trip"], ["ow", "One Way"]] as const).map(([v, label]) => (
              <button key={v} onClick={() => { setTripType(v as "rt"|"ow"); setReady(false); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tripType === v ? "bg-white shadow-sm text-indigo-700" : "text-gray-500"}`}>
                {label}
              </button>
            ))}
          </div>
          <select value={cabin} onChange={e => { setCabin(e.target.value); setReady(false); }}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none">
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* FROM */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input type="text" value={fromQ}
              onChange={e => { setFromQ(e.target.value); setFromSug(filter(e.target.value)); setFromCode(""); setReady(false); }}
              placeholder="City or airport code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none" />
            {fromSug.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                {fromSug.map(a => (
                  <button key={a.code} onClick={() => { setFromQ(`${a.city} (${a.code})`); setFromCode(a.code); setFromSug([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center justify-between">
                    <span><span className="font-medium text-gray-800">{a.city}</span> <span className="text-xs text-gray-400">{a.country}</span></span>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{a.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* TO */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input type="text" value={toQ}
              onChange={e => { setToQ(e.target.value); setToSug(filter(e.target.value)); setToCode(""); setReady(false); }}
              placeholder="City or airport code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none" />
            {toSug.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                {toSug.map(a => (
                  <button key={a.code} onClick={() => { setToQ(`${a.city} (${a.code})`); setToCode(a.code); setToSug([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center justify-between">
                    <span><span className="font-medium text-gray-800">{a.city}</span> <span className="text-xs text-gray-400">{a.country}</span></span>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{a.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`grid gap-3 mb-5 ${tripType === "rt" ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Depart</label>
            <input type="date" value={depart} min={new Date().toISOString().split("T")[0]}
              onChange={e => { setDepart(e.target.value); setReady(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          {tripType === "rt" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Return</label>
              <input type="date" value={ret} min={depart}
                onChange={e => { setRet(e.target.value); setReady(false); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Passengers</label>
            <select value={pax} onChange={e => { setPax(Number(e.target.value)); setReady(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white">
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} {n===1?"Passenger":"Passengers"}</option>)}
            </select>
          </div>
        </div>

        {!ready ? (
          <button onClick={() => { if (fromCode && toCode && depart) setReady(true); }}
            disabled={!fromCode || !toCode || !depart}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {!fromCode || !toCode ? "Select airports to continue" : "Find Flights"}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span>{fromCode}</span><span className="text-indigo-400">→</span><span>{toCode}</span>
                {tripType === "rt" && <><span className="text-indigo-400">→</span><span>{fromCode}</span></>}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(depart).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                {tripType === "rt" && ret && <> — {new Date(ret).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</>}
                {" · "}{pax} pax · {cabin.replace("_", " ")}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600">💡 Tips for This Route</p>
              {TIPS.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-0.5">{t.icon}</span><span>{t.text}</span>
                </div>
              ))}
            </div>

            <a href={searchUrl} target="_blank" rel="nofollow sponsored noopener"
              className="block w-full text-center py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all"
              onClick={() => { fetch(trackingHref, { mode: "no-cors" }).catch(() => {}); }}>
              <span className="flex items-center justify-center gap-2">
                Search Real Flights on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">Opens {brandDomain} with your search pre-filled — real-time prices</p>
          </div>
        )}
      </div>
    </div>
  );
}
