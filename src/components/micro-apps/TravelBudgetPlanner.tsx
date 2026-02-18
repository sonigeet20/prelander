"use client";

import { useState } from "react";

/**
 * TravelBudgetPlanner — Interactive budget planning tool for travel verticals.
 * Users input trip details and get a breakdown estimate, then click to see
 * real prices on the brand's site.
 */

const TRIP_CATEGORIES = [
  { id: "flights", label: "✈️ Flights", defaultPct: 40 },
  { id: "hotels", label: "🏨 Accommodation", defaultPct: 30 },
  { id: "food", label: "🍽️ Food & Dining", defaultPct: 15 },
  { id: "activities", label: "🎯 Activities", defaultPct: 10 },
  { id: "transport", label: "🚕 Local Transport", defaultPct: 5 },
];

const DESTINATIONS: Record<string, { costIndex: number; currency: string }> = {
  "Southeast Asia": { costIndex: 0.5, currency: "USD" },
  "Western Europe": { costIndex: 1.3, currency: "EUR" },
  "Eastern Europe": { costIndex: 0.7, currency: "EUR" },
  "North America": { costIndex: 1.2, currency: "USD" },
  "South America": { costIndex: 0.6, currency: "USD" },
  "Middle East": { costIndex: 1.1, currency: "USD" },
  "Australia/NZ": { costIndex: 1.4, currency: "AUD" },
  "East Asia": { costIndex: 1.0, currency: "USD" },
  "Africa": { costIndex: 0.6, currency: "USD" },
  "South Asia": { costIndex: 0.4, currency: "USD" },
};

export function TravelBudgetPlanner({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [budget, setBudget] = useState(2000);
  const [travelers, setTravelers] = useState(1);
  const [days, setDays] = useState(7);
  const [destination, setDestination] = useState("Western Europe");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const costIndex = DESTINATIONS[destination]?.costIndex || 1;
  const perPersonPerDay = (budget / travelers / days);
  const adjustedDaily = perPersonPerDay / costIndex;

  const budgetLevel = adjustedDaily > 200 ? "Luxury" : adjustedDaily > 100 ? "Comfortable" : adjustedDaily > 50 ? "Mid-Range" : "Budget";
  const budgetColor = adjustedDaily > 200 ? "text-purple-700 bg-purple-50" : adjustedDaily > 100 ? "text-emerald-700 bg-emerald-50" : adjustedDaily > 50 ? "text-blue-700 bg-blue-50" : "text-amber-700 bg-amber-50";

  const breakdown = TRIP_CATEGORIES.map((cat) => ({
    ...cat,
    amount: Math.round((budget * cat.defaultPct) / 100),
  }));

  const tips = adjustedDaily > 150
    ? ["Consider premium airline options for comfort on long flights", "Look into boutique hotels for unique experiences"]
    : adjustedDaily > 75
    ? ["Book flights 6-8 weeks ahead for the sweet spot on pricing", "Mix hotels with vacation rentals for variety and savings"]
    : ["Be flexible with dates — midweek flights are often cheaper", "Consider hostels or guesthouses to stretch your budget", "Use price alerts to catch fare drops"];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">💰</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Travel Budget Planner</h3>
            <p className="text-emerald-200 text-xs">Plan your trip expenses and find the best deals</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Total Budget ($)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => { setBudget(Number(e.target.value) || 0); setShowBreakdown(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
              min={100}
              step={100}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Travelers</label>
            <select
              value={travelers}
              onChange={(e) => { setTravelers(Number(e.target.value)); setShowBreakdown(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Trip Duration</label>
            <select
              value={days}
              onChange={(e) => { setDays(Number(e.target.value)); setShowBreakdown(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
            >
              {[3, 5, 7, 10, 14, 21, 30].map((n) => (
                <option key={n} value={n}>{n} Days</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Destination Region</label>
            <select
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setShowBreakdown(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
            >
              {Object.keys(DESTINATIONS).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowBreakdown(true)}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Calculate Budget Breakdown
        </button>

        {showBreakdown && (
          <div className="mt-6 space-y-4">
            {/* Budget level indicator */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-500">Your trip style</p>
                <p className="text-lg font-bold text-gray-800">${Math.round(perPersonPerDay)}/day per person</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${budgetColor}`}>
                {budgetLevel}
              </span>
            </div>

            {/* Breakdown bars */}
            <div className="space-y-2">
              {breakdown.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="text-sm w-36 shrink-0">{cat.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${cat.defaultPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-16 text-right">${cat.amount}</span>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-2">💡 Money-Saving Tips</p>
              <ul className="space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                Find Deals on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              Compare real-time prices and deals on {brandDomain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
