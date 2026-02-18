"use client";

import { useState, useMemo } from "react";

/**
 * LoanCalculator — Interactive loan/mortgage calculator for finance verticals.
 * Users input principal, rate, term → see monthly payment, total interest,
 * amortization schedule, then click through to the brand for real rates.
 */

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatCurrencyExact(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const PRESETS = [
  { label: "Personal Loan", principal: 10000, rate: 8.5, term: 36 },
  { label: "Auto Loan", principal: 30000, rate: 5.9, term: 60 },
  { label: "Mortgage", principal: 350000, rate: 6.8, term: 360 },
  { label: "Student Loan", principal: 40000, rate: 5.5, term: 120 },
];

export function LoanCalculator({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [activePreset, setActivePreset] = useState(0);
  const [principal, setPrincipal] = useState(PRESETS[0].principal);
  const [rate, setRate] = useState(PRESETS[0].rate);
  const [term, setTerm] = useState(PRESETS[0].term);
  const [showResults, setShowResults] = useState(false);

  const applyPreset = (i: number) => {
    setActivePreset(i);
    setPrincipal(PRESETS[i].principal);
    setRate(PRESETS[i].rate);
    setTerm(PRESETS[i].term);
    setShowResults(false);
  };

  const calc = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) {
      const monthly = principal / term;
      return { monthly, totalPaid: principal, totalInterest: 0, ratio: 0 };
    }
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPaid = monthly * term;
    const totalInterest = totalPaid - principal;
    const ratio = (totalInterest / totalPaid) * 100;
    return { monthly, totalPaid, totalInterest, ratio };
  }, [principal, rate, term]);

  // Simplified amortization for first 5 years / 5 rows
  const amorRows = useMemo(() => {
    const rows: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
    const monthlyRate = rate / 100 / 12;
    let balance = principal;
    const monthsPerStep = term <= 60 ? 12 : term <= 120 ? 12 : 12;
    const maxYears = Math.min(Math.ceil(term / 12), 5);

    for (let y = 1; y <= maxYears; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      const monthsThisYear = Math.min(12, term - (y - 1) * 12);
      for (let m = 0; m < monthsThisYear; m++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = calc.monthly - interestPayment;
        yearInterest += interestPayment;
        yearPrincipal += principalPayment;
        balance -= principalPayment;
      }
      rows.push({ year: y, principalPaid: yearPrincipal, interestPaid: yearInterest, balance: Math.max(0, balance) });
    }
    return rows;
  }, [principal, rate, term, calc.monthly]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">🧮</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Loan & Mortgage Calculator</h3>
            <p className="text-indigo-200 text-xs">Calculate payments, interest, and amortization</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-5">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activePreset === i
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-500">Loan Amount</label>
              <span className="text-sm font-bold text-indigo-700">{formatCurrency(principal)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={1000000}
              step={1000}
              value={principal}
              onChange={(e) => { setPrincipal(Number(e.target.value)); setShowResults(false); }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>$1K</span>
              <span>$1M</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-500">Interest Rate (APR)</label>
              <span className="text-sm font-bold text-indigo-700">{rate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={25}
              step={0.1}
              value={rate}
              onChange={(e) => { setRate(Number(e.target.value)); setShowResults(false); }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>0.5%</span>
              <span>25%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-500">Loan Term</label>
              <span className="text-sm font-bold text-indigo-700">{term} months ({(term / 12).toFixed(1)} yrs)</span>
            </div>
            <input
              type="range"
              min={6}
              max={360}
              step={6}
              value={term}
              onChange={(e) => { setTerm(Number(e.target.value)); setShowResults(false); }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>6 months</span>
              <span>30 years</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowResults(true)}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Calculate Payments
        </button>

        {showResults && (
          <div className="mt-6 space-y-4">
            {/* Key figures */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-indigo-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Payment</p>
                <p className="text-xl font-extrabold text-indigo-700">{formatCurrencyExact(calc.monthly)}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Interest</p>
                <p className="text-lg font-bold text-purple-700">{formatCurrency(calc.totalInterest)}</p>
              </div>
              <div className="text-center p-3 bg-violet-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Cost</p>
                <p className="text-lg font-bold text-violet-700">{formatCurrency(calc.totalPaid)}</p>
              </div>
            </div>

            {/* Interest ratio visual */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Principal vs Interest Breakdown</p>
              <div className="flex rounded-full h-4 overflow-hidden bg-gray-200">
                <div className="bg-indigo-500 transition-all duration-500" style={{ width: `${100 - calc.ratio}%` }} />
                <div className="bg-rose-400 transition-all duration-500" style={{ width: `${calc.ratio}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
                <span>Principal: {formatCurrency(principal)} ({(100 - calc.ratio).toFixed(1)}%)</span>
                <span>Interest: {formatCurrency(calc.totalInterest)} ({calc.ratio.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Amortization table (first 5 years) */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Amortization Summary (First {amorRows.length} Years)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 text-left font-medium text-gray-400">Year</th>
                      <th className="py-2 text-right font-medium text-gray-400">Principal</th>
                      <th className="py-2 text-right font-medium text-gray-400">Interest</th>
                      <th className="py-2 text-right font-medium text-gray-400">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amorRows.map((row) => (
                      <tr key={row.year} className="border-b border-gray-100">
                        <td className="py-1.5 text-gray-600">{row.year}</td>
                        <td className="py-1.5 text-right text-indigo-600 font-medium">{formatCurrency(row.principalPaid)}</td>
                        <td className="py-1.5 text-right text-rose-500">{formatCurrency(row.interestPaid)}</td>
                        <td className="py-1.5 text-right text-gray-700 font-medium">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                Check Real Rates on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              See personalized rates and offers on {brandDomain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
