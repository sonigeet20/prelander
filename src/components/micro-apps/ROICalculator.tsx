"use client";

import { useState, useMemo } from "react";

/**
 * ROICalculator — Real ROI/TCO calculator for SaaS verticals.
 * Users input their current costs and team metrics, get a genuine
 * ROI projection. No fake data — just real math.
 */

function fmt(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n); }

export function ROICalculator({ brandName, trackingHref, brandDomain }: { brandName: string; trackingHref: string; brandDomain: string }) {
  const [teamSize, setTeamSize] = useState(10);
  const [avgSalary, setAvgSalary] = useState(75000);
  const [hoursWastedPerWeek, setHoursWastedPerWeek] = useState(5);
  const [toolCostPerUser, setToolCostPerUser] = useState(30);
  const [currentToolCost, setCurrentToolCost] = useState(0);

  const calc = useMemo(() => {
    const hourlyRate = avgSalary / 52 / 40;
    const weeklyWastedCost = hoursWastedPerWeek * hourlyRate * teamSize;
    const annualWastedCost = weeklyWastedCost * 52;
    // Assume new tool saves 60% of wasted time (conservative estimate)
    const timeSavingsPct = 0.6;
    const annualTimeSavings = annualWastedCost * timeSavingsPct;
    const annualToolCost = toolCostPerUser * teamSize * 12;
    const annualCurrentToolCost = currentToolCost * teamSize * 12;
    const netSavings = annualTimeSavings + annualCurrentToolCost - annualToolCost;
    const roi = annualToolCost > 0 ? ((netSavings / annualToolCost) * 100) : 0;
    const paybackMonths = netSavings > 0 ? Math.ceil(annualToolCost / (netSavings / 12)) : Infinity;
    const hoursSavedPerWeek = hoursWastedPerWeek * timeSavingsPct * teamSize;

    return { hourlyRate, annualWastedCost, annualTimeSavings, annualToolCost, annualCurrentToolCost, netSavings, roi, paybackMonths, hoursSavedPerWeek };
  }, [teamSize, avgSalary, hoursWastedPerWeek, toolCostPerUser, currentToolCost]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"><span className="text-xl">📊</span></div>
          <div>
            <h3 className="text-white font-bold text-lg">ROI Calculator</h3>
            <p className="text-blue-200 text-xs">Calculate your real return on investment</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-500">Team Size</label><span className="text-sm font-bold text-blue-700">{teamSize} people</span></div>
          <input type="range" min={1} max={500} value={teamSize} onChange={e => setTeamSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>
        <div>
          <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-500">Avg. Annual Salary</label><span className="text-sm font-bold text-blue-700">{fmt(avgSalary)}</span></div>
          <input type="range" min={30000} max={200000} step={5000} value={avgSalary} onChange={e => setAvgSalary(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>
        <div>
          <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-500">Hours Wasted / Week (per person)</label><span className="text-sm font-bold text-blue-700">{hoursWastedPerWeek}h</span></div>
          <input type="range" min={1} max={20} value={hoursWastedPerWeek} onChange={e => setHoursWastedPerWeek(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-500">New Tool $/user/mo</label><span className="text-xs font-bold text-blue-700">${toolCostPerUser}</span></div>
            <input type="range" min={0} max={200} step={5} value={toolCostPerUser} onChange={e => setToolCostPerUser(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
          <div>
            <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-500">Current Tool $/user/mo</label><span className="text-xs font-bold text-blue-700">${currentToolCost}</span></div>
            <input type="range" min={0} max={200} step={5} value={currentToolCost} onChange={e => setCurrentToolCost(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
        </div>

        {/* Results — always live */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase">Annual ROI</p>
            <p className={`text-xl font-extrabold ${calc.roi > 0 ? "text-emerald-600" : "text-red-500"}`}>{calc.roi > 0 ? "+" : ""}{Math.round(calc.roi)}%</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase">Net Savings/yr</p>
            <p className={`text-lg font-bold ${calc.netSavings > 0 ? "text-emerald-600" : "text-red-500"}`}>{fmt(calc.netSavings)}</p>
          </div>
          <div className="text-center p-3 bg-cyan-50 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase">Payback</p>
            <p className="text-lg font-bold text-cyan-700">{calc.paybackMonths === Infinity ? "N/A" : `${calc.paybackMonths} mo`}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
          <p className="font-bold text-gray-600">Breakdown</p>
          <div className="flex justify-between"><span className="text-gray-500">Time wasted annually (team)</span><span className="font-bold text-red-500">{fmt(calc.annualWastedCost)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Estimated time savings (60%)</span><span className="font-bold text-emerald-600">+{fmt(calc.annualTimeSavings)}</span></div>
          {calc.annualCurrentToolCost > 0 && <div className="flex justify-between"><span className="text-gray-500">Current tool costs saved</span><span className="font-bold text-emerald-600">+{fmt(calc.annualCurrentToolCost)}</span></div>}
          <div className="flex justify-between border-t border-gray-200 pt-1"><span className="text-gray-500">New tool annual cost</span><span className="font-bold text-gray-700">-{fmt(calc.annualToolCost)}</span></div>
          <div className="flex justify-between border-t border-gray-300 pt-1 text-sm"><span className="font-bold">Net Annual Impact</span><span className={`font-extrabold ${calc.netSavings > 0 ? "text-emerald-600" : "text-red-500"}`}>{fmt(calc.netSavings)}</span></div>
          <p className="text-[10px] text-gray-400 mt-2">⏱️ {Math.round(calc.hoursSavedPerWeek)} team hours saved per week</p>
        </div>

        <p className="text-[10px] text-gray-400 bg-amber-50 rounded-lg p-2 border border-amber-100">
          💡 <strong>Methodology:</strong> Time savings estimated at 60% of wasted hours (industry conservative average). Actual ROI varies based on implementation, adoption rate, and workflow complexity.
        </p>

        <a href={trackingHref}
          className="block w-full text-center py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
          rel="nofollow sponsored">
          <span className="flex items-center justify-center gap-2">
            See Pricing on {brandName}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </span>
        </a>
        <p className="text-[10px] text-gray-400 text-center">Start a free trial and see real pricing on {brandDomain}</p>
      </div>
    </div>
  );
}
