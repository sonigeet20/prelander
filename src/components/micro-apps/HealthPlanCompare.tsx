"use client";

import { useState, useMemo } from "react";

/**
 * HealthPlanCompare — Health plan cost estimator for health verticals.
 * Users input their profile (age, coverage needs, usage level) → see
 * estimated monthly costs across plan tiers, then click to compare actual
 * plans on the brand's site.
 */

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const COVERAGE_NEEDS = [
  { id: "individual", label: "Just Me", multiplier: 1.0, icon: "👤" },
  { id: "couple", label: "Me + Spouse", multiplier: 1.8, icon: "👫" },
  { id: "family_small", label: "Family (1 child)", multiplier: 2.3, icon: "👨‍👩‍👧" },
  { id: "family_large", label: "Family (2+ kids)", multiplier: 2.8, icon: "👨‍👩‍👧‍👦" },
];

const USAGE_LEVELS = [
  { id: "low", label: "Rarely visit doctors", factor: 0.8, icon: "🟢" },
  { id: "medium", label: "A few visits per year", factor: 1.0, icon: "🟡" },
  { id: "high", label: "Regular treatments", factor: 1.25, icon: "🟠" },
  { id: "chronic", label: "Ongoing conditions", factor: 1.5, icon: "🔴" },
];

const PLAN_TYPES = [
  {
    id: "bronze",
    label: "Bronze",
    color: "amber",
    premiumBase: 220,
    deductible: 7000,
    copay: 60,
    coveragePct: 60,
    description: "Lower premium, higher out-of-pocket costs",
  },
  {
    id: "silver",
    label: "Silver",
    color: "gray",
    premiumBase: 350,
    deductible: 4500,
    copay: 40,
    coveragePct: 70,
    description: "Balanced premium and coverage",
  },
  {
    id: "gold",
    label: "Gold",
    color: "yellow",
    premiumBase: 480,
    deductible: 1500,
    copay: 20,
    coveragePct: 80,
    description: "Higher premium, lower out-of-pocket",
  },
  {
    id: "platinum",
    label: "Platinum",
    color: "violet",
    premiumBase: 620,
    deductible: 500,
    copay: 10,
    coveragePct: 90,
    description: "Maximum coverage, minimal out-of-pocket",
  },
];

export function HealthPlanCompare({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [age, setAge] = useState(35);
  const [coverage, setCoverage] = useState("individual");
  const [usage, setUsage] = useState("medium");
  const [showResults, setShowResults] = useState(false);

  const coverageData = COVERAGE_NEEDS.find((c) => c.id === coverage)!;
  const usageData = USAGE_LEVELS.find((u) => u.id === usage)!;

  // Age factor: younger = cheaper, older = more expensive
  const ageFactor = age < 30 ? 0.75 : age < 40 ? 1.0 : age < 50 ? 1.25 : age < 60 ? 1.55 : 1.85;

  const plans = useMemo(() => {
    return PLAN_TYPES.map((plan) => {
      const monthlyPremium = Math.round(plan.premiumBase * coverageData.multiplier * ageFactor);
      const annualPremium = monthlyPremium * 12;
      const estimatedAnnualOOP = Math.round(
        plan.deductible * usageData.factor * 0.3 + plan.copay * usageData.factor * 12
      );
      const totalAnnualCost = annualPremium + estimatedAnnualOOP;

      return {
        ...plan,
        monthlyPremium,
        annualPremium,
        estimatedAnnualOOP,
        totalAnnualCost,
      };
    });
  }, [coverageData, ageFactor, usageData]);

  const bestValue = plans.reduce((best, plan) =>
    plan.totalAnnualCost < best.totalAnnualCost ? plan : best
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">🏥</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Health Plan Cost Estimator</h3>
            <p className="text-rose-200 text-xs">Compare plan tiers based on your health profile</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Age */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-gray-500">Your Age</label>
            <span className="text-sm font-bold text-rose-700">{age} years old</span>
          </div>
          <input
            type="range" min={18} max={65} value={age}
            onChange={(e) => { setAge(Number(e.target.value)); setShowResults(false); }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>18</span>
            <span>65</span>
          </div>
        </div>

        {/* Coverage */}
        <p className="text-xs font-medium text-gray-500 mb-2">Who needs coverage?</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COVERAGE_NEEDS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCoverage(c.id); setShowResults(false); }}
              className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                coverage === c.id
                  ? "border-rose-400 bg-rose-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-sm">{c.icon}</span>
              <p className="text-xs font-semibold mt-0.5">{c.label}</p>
            </button>
          ))}
        </div>

        {/* Healthcare usage */}
        <p className="text-xs font-medium text-gray-500 mb-2">How often do you use healthcare?</p>
        <div className="space-y-1.5 mb-5">
          {USAGE_LEVELS.map((u) => (
            <button
              key={u.id}
              onClick={() => { setUsage(u.id); setShowResults(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-left transition-all ${
                usage === u.id
                  ? "border-rose-400 bg-rose-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{u.icon}</span>
              <span className="text-xs font-medium">{u.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowResults(true)}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Compare Plan Costs
        </button>

        {showResults && (
          <div className="mt-6 space-y-4">
            {/* Plan comparison cards */}
            <div className="grid grid-cols-2 gap-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3 rounded-xl border-2 ${
                    plan.id === bestValue.id
                      ? "border-emerald-400 bg-emerald-50 relative"
                      : "border-gray-200"
                  }`}
                >
                  {plan.id === bestValue.id && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                      Best Value
                    </span>
                  )}
                  <p className="text-xs font-bold text-gray-800">{plan.label}</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">
                    {formatCurrency(plan.monthlyPremium)}<span className="text-[10px] font-normal text-gray-400">/mo</span>
                  </p>
                  <div className="mt-2 space-y-1 text-[10px] text-gray-500">
                    <div className="flex justify-between">
                      <span>Deductible</span>
                      <span className="font-bold">{formatCurrency(plan.deductible)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Copay</span>
                      <span className="font-bold">${plan.copay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage</span>
                      <span className="font-bold">{plan.coveragePct}%</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Est. Annual Cost</span>
                      <span className="font-bold text-gray-700">{formatCurrency(plan.totalAnnualCost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">💡 Recommendation</p>
              <p className="text-xs text-blue-600">
                Based on your profile ({coverageData.label}, age {age}, {usageData.label.toLowerCase()}),
                the <strong>{bestValue.label}</strong> plan offers the best overall value at an estimated{" "}
                <strong>{formatCurrency(bestValue.totalAnnualCost)}/year</strong> total cost.
              </p>
            </div>

            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-0.5 transition-all"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                Compare Real Plans on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              Get personalized quotes and enroll on {brandDomain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
