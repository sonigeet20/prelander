"use client";

import { useState, useMemo } from "react";

interface SavingsCalculatorProps {
  heading?: string;
  config: {
    type: "flight" | "subscription" | "general";
    baselineLabel?: string;
    baselineAmount?: number;
    savingsPercentMin?: number;
    savingsPercentMax?: number;
    tips?: Array<{ threshold: number; tip: string }>;
  };
}

/**
 * Interactive savings/budget calculator widget.
 * Users input their budget/spend and get personalised savings estimates + tips.
 */
export function SavingsCalculator({ heading, config }: SavingsCalculatorProps) {
  const [budget, setBudget] = useState(config.baselineAmount || 500);
  const [travelers, setTravelers] = useState(1);
  const [frequency, setFrequency] = useState<"once" | "monthly" | "yearly">("once");

  const savings = useMemo(() => {
    const minPct = config.savingsPercentMin || 10;
    const maxPct = config.savingsPercentMax || 35;
    const total = budget * travelers * (frequency === "yearly" ? 12 : frequency === "monthly" ? 1 : 1);
    const minSave = Math.round(total * (minPct / 100));
    const maxSave = Math.round(total * (maxPct / 100));
    const annualMin = frequency === "once" ? minSave : frequency === "monthly" ? minSave * 12 : minSave;
    const annualMax = frequency === "once" ? maxSave : frequency === "monthly" ? maxSave * 12 : maxSave;
    return { minSave, maxSave, annualMin, annualMax, total };
  }, [budget, travelers, frequency, config]);

  const activeTip = useMemo(() => {
    if (!config.tips?.length) return null;
    const sorted = [...config.tips].sort((a, b) => b.threshold - a.threshold);
    return sorted.find((t) => budget >= t.threshold) || sorted[sorted.length - 1];
  }, [budget, config.tips]);

  return (
    <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 p-6 sm:p-8 shadow-sm">
      {heading && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🧮</span>
          <h3 className="text-xl font-bold text-gray-900">{heading}</h3>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Budget Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            {config.type === "flight" ? "Flight Budget" : config.type === "subscription" ? "Monthly Spend" : "Budget"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
          </div>
        </div>

        {/* Travelers / Users */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            {config.type === "flight" ? "Travelers" : config.type === "subscription" ? "Seats/Users" : "Quantity"}
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={travelers}
            onChange={(e) => setTravelers(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as "once" | "monthly" | "yearly")}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition bg-white"
          >
            <option value="once">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-xs text-gray-400 font-medium mb-1">Your Total</div>
          <div className="text-xl font-bold text-gray-800 font-mono">${savings.total.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 shadow-sm text-center">
          <div className="text-xs text-emerald-600 font-medium mb-1">Potential Savings</div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            ${savings.minSave.toLocaleString()} – ${savings.maxSave.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100 shadow-sm text-center">
          <div className="text-xs text-violet-600 font-medium mb-1">Annual Impact</div>
          <div className="text-xl font-bold text-violet-700 font-mono">
            ${savings.annualMin.toLocaleString()} – ${savings.annualMax.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Contextual tip */}
      {activeTip && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mt-4">
          <span className="text-amber-500 mt-0.5">💡</span>
          <p className="text-sm text-amber-800">{activeTip.tip}</p>
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-4 text-center">
        Estimates based on typical savings ranges. Actual savings depend on timing, availability, and other factors.
      </p>
    </div>
  );
}
