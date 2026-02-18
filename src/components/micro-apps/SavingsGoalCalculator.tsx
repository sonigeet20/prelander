"use client";

import { useState, useMemo } from "react";

/**
 * SavingsGoalCalculator — Interactive savings/investment calculator for finance verticals.
 * Users set a goal, see how much to save monthly/weekly, and click to compare
 * savings accounts or investment options on the brand's site.
 */

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function SavingsGoalCalculator({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [goal, setGoal] = useState(25000);
  const [currentSavings, setCurrentSavings] = useState(2000);
  const [months, setMonths] = useState(24);
  const [annualReturn, setAnnualReturn] = useState(5.0);
  const [showPlan, setShowPlan] = useState(false);

  const calc = useMemo(() => {
    const remaining = Math.max(0, goal - currentSavings);
    const monthlyRate = annualReturn / 100 / 12;

    let monthlySaving: number;
    if (monthlyRate === 0) {
      monthlySaving = remaining / months;
    } else {
      // Future value of annuity formula solving for PMT
      monthlySaving = remaining * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalContributions = monthlySaving * months + currentSavings;
    const interestEarned = goal - totalContributions;
    const weeklySaving = monthlySaving * 12 / 52;
    const dailySaving = monthlySaving * 12 / 365;

    // Growth milestones
    const milestones: { month: number; balance: number }[] = [];
    let balance = currentSavings;
    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + monthlyRate) + monthlySaving;
      if (m === Math.ceil(months * 0.25) || m === Math.ceil(months * 0.5) || m === Math.ceil(months * 0.75) || m === months) {
        milestones.push({ month: m, balance });
      }
    }

    return { monthlySaving, weeklySaving, dailySaving, totalContributions, interestEarned, remaining, milestones };
  }, [goal, currentSavings, months, annualReturn]);

  const difficultyLevel = calc.monthlySaving > 2000 ? "Aggressive" : calc.monthlySaving > 1000 ? "Moderate" : calc.monthlySaving > 500 ? "Achievable" : "Easy";
  const difficultyColor = calc.monthlySaving > 2000 ? "text-red-600 bg-red-50" : calc.monthlySaving > 1000 ? "text-amber-600 bg-amber-50" : calc.monthlySaving > 500 ? "text-blue-600 bg-blue-50" : "text-emerald-600 bg-emerald-50";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Savings Goal Planner</h3>
            <p className="text-emerald-200 text-xs">Map your path to your savings target</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-500">Savings Goal</label>
              <span className="text-sm font-bold text-emerald-700">{formatCurrency(goal)}</span>
            </div>
            <input
              type="range" min={1000} max={500000} step={1000} value={goal}
              onChange={(e) => { setGoal(Number(e.target.value)); setShowPlan(false); }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-500">Current Savings</label>
              <span className="text-sm font-bold text-emerald-700">{formatCurrency(currentSavings)}</span>
            </div>
            <input
              type="range" min={0} max={Math.floor(goal * 0.9)} step={500} value={currentSavings}
              onChange={(e) => { setCurrentSavings(Number(e.target.value)); setShowPlan(false); }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-gray-500">Timeline</label>
                <span className="text-sm font-bold text-emerald-700">{months} months</span>
              </div>
              <input
                type="range" min={3} max={120} step={3} value={months}
                onChange={(e) => { setMonths(Number(e.target.value)); setShowPlan(false); }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-gray-500">Est. Return</label>
                <span className="text-sm font-bold text-emerald-700">{annualReturn.toFixed(1)}% APY</span>
              </div>
              <input
                type="range" min={0} max={12} step={0.5} value={annualReturn}
                onChange={(e) => { setAnnualReturn(Number(e.target.value)); setShowPlan(false); }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPlan(true)}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Build My Savings Plan
        </button>

        {showPlan && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly</p>
                <p className="text-xl font-extrabold text-emerald-700">{formatCurrency(calc.monthlySaving)}</p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Weekly</p>
                <p className="text-lg font-bold text-teal-700">{formatCurrency(calc.weeklySaving)}</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Daily</p>
                <p className="text-lg font-bold text-cyan-700">{formatCurrency(calc.dailySaving)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-500">Difficulty Level</p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatCurrency(calc.interestEarned)} earned in interest
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColor}`}>
                {difficultyLevel}
              </span>
            </div>

            {/* Milestones */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Growth Milestones</p>
              <div className="space-y-2">
                {calc.milestones.map((ms) => (
                  <div key={ms.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20 shrink-0">Month {ms.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (ms.balance / goal) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-20 text-right">
                      {formatCurrency(ms.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                Compare Rates on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              Find the best savings rates and investment options on {brandDomain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
