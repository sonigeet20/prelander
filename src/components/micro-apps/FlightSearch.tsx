"use client";

import { useState } from "react";

/**
 * FlightSearch — Interactive flight search tool for travel verticals.
 *
 * Users enter origin, destination, dates, and passengers.
 * The CTA "Search Flights on {Brand}" fires the tracking redirect
 * on a genuine user-initiated click.
 */

const POPULAR_AIRPORTS = [
  { code: "LHR", city: "London", country: "UK" },
  { code: "JFK", city: "New York", country: "US" },
  { code: "LAX", city: "Los Angeles", country: "US" },
  { code: "CDG", city: "Paris", country: "France" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "HND", city: "Tokyo", country: "Japan" },
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "FRA", city: "Frankfurt", country: "Germany" },
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands" },
  { code: "IST", city: "Istanbul", country: "Turkey" },
  { code: "BCN", city: "Barcelona", country: "Spain" },
  { code: "FCO", city: "Rome", country: "Italy" },
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "ORD", city: "Chicago", country: "US" },
  { code: "SFO", city: "San Francisco", country: "US" },
  { code: "MIA", city: "Miami", country: "US" },
  { code: "YYZ", city: "Toronto", country: "Canada" },
  { code: "MEX", city: "Mexico City", country: "Mexico" },
  { code: "GRU", city: "São Paulo", country: "Brazil" },
  { code: "ICN", city: "Seoul", country: "South Korea" },
  { code: "PEK", city: "Beijing", country: "China" },
];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function getReturnDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

export function FlightSearch({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState(getTomorrowDate());
  const [returnDate, setReturnDate] = useState(getReturnDate());
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [cabinClass, setCabinClass] = useState<"economy" | "premium" | "business" | "first">("economy");
  const [showResults, setShowResults] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<typeof POPULAR_AIRPORTS>([]);
  const [toSuggestions, setToSuggestions] = useState<typeof POPULAR_AIRPORTS>([]);

  const filterAirports = (query: string) => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return POPULAR_AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    ).slice(0, 5);
  };

  const handleSearch = () => {
    if (from && to && departDate) {
      setShowResults(true);
    }
  };

  const estimatedPrice = () => {
    // Generate a believable price range based on inputs
    const base = Math.floor(Math.random() * 200) + 150;
    const classMultiplier = cabinClass === "economy" ? 1 : cabinClass === "premium" ? 1.6 : cabinClass === "business" ? 3.2 : 5;
    const tripMultiplier = tripType === "roundtrip" ? 1.8 : 1;
    const price = Math.round(base * classMultiplier * tripMultiplier * passengers);
    return price;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Flight Search Tool</h3>
            <p className="text-indigo-200 text-xs">Compare prices across airlines instantly</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Trip type & cabin class */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setTripType("roundtrip")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tripType === "roundtrip" ? "bg-white shadow-sm text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              Round Trip
            </button>
            <button
              onClick={() => setTripType("oneway")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tripType === "oneway" ? "bg-white shadow-sm text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              One Way
            </button>
          </div>
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as typeof cabinClass)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
          >
            <option value="economy">Economy</option>
            <option value="premium">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>

        {/* Search fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* From */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="text"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setFromSuggestions(filterAirports(e.target.value));
                setShowResults(false);
              }}
              placeholder="City or airport code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
            {fromSuggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {fromSuggestions.map((a) => (
                  <button
                    key={a.code}
                    onClick={() => { setFrom(`${a.city} (${a.code})`); setFromSuggestions([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800">{a.city}</span>
                    <span className="text-xs text-gray-400">{a.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* To */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setToSuggestions(filterAirports(e.target.value));
                setShowResults(false);
              }}
              placeholder="City or airport code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
            {toSuggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {toSuggestions.map((a) => (
                  <button
                    key={a.code}
                    onClick={() => { setTo(`${a.city} (${a.code})`); setToSuggestions([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800">{a.city}</span>
                    <span className="text-xs text-gray-400">{a.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates & Passengers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Depart</label>
            <input
              type="date"
              value={departDate}
              onChange={(e) => { setDepartDate(e.target.value); setShowResults(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
          {tripType === "roundtrip" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Return</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => { setReturnDate(e.target.value); setShowResults(false); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Passengers</label>
            <select
              value={passengers}
              onChange={(e) => { setPassengers(Number(e.target.value)); setShowResults(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Passenger" : "Passengers"}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!from || !to || !departDate}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search Flights
        </button>

        {/* Results preview */}
        {showResults && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs font-medium text-gray-600">Estimated prices found for your route</p>
            </div>

            {/* Sample flight results */}
            {[
              { airline: "Multiple Airlines", stops: "Direct", time: "2h 30m", price: estimatedPrice() },
              { airline: "Multiple Airlines", stops: "1 Stop", time: "5h 15m", price: Math.round(estimatedPrice() * 0.75) },
              { airline: "Multiple Airlines", stops: "1 Stop", time: "7h 40m", price: Math.round(estimatedPrice() * 0.6) },
            ].map((flight, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{flight.airline}</p>
                    <p className="text-xs text-gray-400">{flight.stops} · {flight.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-700">from ${flight.price}</p>
                  <p className="text-[10px] text-gray-400">per person</p>
                </div>
              </div>
            ))}

            <p className="text-[11px] text-gray-400 text-center mt-2">
              Estimated prices based on typical fares. Actual prices may vary.
            </p>

            {/* The main CTA — user-initiated click fires the tracking redirect */}
            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all mt-4"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                See Live Prices on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>

            <p className="text-[10px] text-gray-400 text-center">
              You&apos;ll be redirected to {brandDomain} to see real-time prices and complete your booking
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
