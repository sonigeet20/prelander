"use client";

import { useState, useMemo } from "react";

/**
 * PricingCalculator — SaaS pricing estimator for b2b_saas verticals.
 * Users configure team size, features, and billing cycle → see estimated cost,
 * then click to check real pricing on the brand's site.
 */

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const FEATURE_TIERS = [
  {
    id: "starter",
    label: "Starter",
    icon: "🌱",
    basePrice: 12,
    description: "Core features for small teams",
    features: ["Basic analytics", "5 GB storage", "Email support", "Up to 10 users"],
  },
  {
    id: "professional",
    label: "Professional",
    icon: "⚡",
    basePrice: 29,
    description: "Advanced tools for growing teams",
    features: ["Advanced analytics", "50 GB storage", "Priority support", "API access", "Custom integrations"],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    icon: "🏢",
    basePrice: 59,
    description: "Full suite for large organizations",
    features: ["Unlimited analytics", "Unlimited storage", "24/7 phone support", "SSO / SAML", "Dedicated manager", "SLA guarantee"],
  },
];

const ADD_ONS = [
  { id: "ai", label: "AI / Automation", price: 8, icon: "🤖" },
  { id: "security", label: "Advanced Security", price: 5, icon: "🔒" },
  { id: "compliance", label: "Compliance Pack", price: 10, icon: "📋" },
  { id: "training", label: "Onboarding & Training", price: 3, icon: "🎓" },
];

export function PricingCalculator({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [selectedTier, setSelectedTier] = useState(1); // professional by default
  const [teamSize, setTeamSize] = useState(10);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setShowEstimate(false);
  };

  const calc = useMemo(() => {
    const tier = FEATURE_TIERS[selectedTier];
    const baseCost = tier.basePrice * teamSize;
    const addOnCost = selectedAddOns.reduce((sum, id) => {
      const addon = ADD_ONS.find((a) => a.id === id);
      return sum + (addon ? addon.price * teamSize : 0);
    }, 0);
    const monthlyTotal = baseCost + addOnCost;
    const discount = billingCycle === "annual" ? 0.2 : 0;
    const effectiveMonthly = monthlyTotal * (1 - discount);
    const annualTotal = effectiveMonthly * 12;
    const savings = billingCycle === "annual" ? monthlyTotal * 12 - annualTotal : 0;

    return { baseCost, addOnCost, monthlyTotal, effectiveMonthly, annualTotal, discount, savings, tier };
  }, [selectedTier, teamSize, billingCycle, selectedAddOns]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">💲</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">SaaS Pricing Estimator</h3>
            <p className="text-blue-200 text-xs">Estimate your total cost before you commit</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tier selection */}
        <p className="text-xs font-medium text-gray-500 mb-2">Select Plan Tier</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {FEATURE_TIERS.map((tier, i) => (
            <button
              key={tier.id}
              onClick={() => { setSelectedTier(i); setShowEstimate(false); }}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                selectedTier === i
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{tier.icon}</span>
              <p className="text-xs font-bold mt-1">{tier.label}</p>
              <p className="text-[10px] text-gray-500">${tier.basePrice}/user/mo</p>
            </button>
          ))}
        </div>

        {/* Team size */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-gray-500">Team Size</label>
            <span className="text-sm font-bold text-blue-700">{teamSize} users</span>
          </div>
          <input
            type="range" min={1} max={500} step={1} value={teamSize}
            onChange={(e) => { setTeamSize(Number(e.target.value)); setShowEstimate(false); }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>1</span>
            <span>500</span>
          </div>
        </div>

        {/* Billing cycle */}
        <div className="flex items-center gap-2 mb-5 bg-gray-50 rounded-xl p-1">
          {(["monthly", "annual"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => { setBillingCycle(cycle); setShowEstimate(false); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === cycle
                  ? "bg-white shadow text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {cycle === "monthly" ? "Monthly" : "Annual (Save 20%)"}
            </button>
          ))}
        </div>

        {/* Add-ons */}
        <p className="text-xs font-medium text-gray-500 mb-2">Add-ons (per user/month)</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {ADD_ONS.map((addon) => (
            <button
              key={addon.id}
              onClick={() => toggleAddOn(addon.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                selectedAddOns.includes(addon.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{addon.icon}</span>
              <div className="text-left">
                <p className="text-xs font-medium">{addon.label}</p>
                <p className="text-[10px] text-gray-500">+${addon.price}/user</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowEstimate(true)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Calculate Total Cost
        </button>

        {showEstimate && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Cost</p>
                <p className="text-xl font-extrabold text-blue-700">{formatCurrency(calc.effectiveMonthly)}</p>
                <p className="text-[10px] text-gray-400">{formatCurrency(Math.round(calc.effectiveMonthly / teamSize))}/user</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Annual Cost</p>
                <p className="text-xl font-extrabold text-cyan-700">{formatCurrency(calc.annualTotal)}</p>
                {calc.savings > 0 && (
                  <p className="text-[10px] text-emerald-600 font-bold">Save {formatCurrency(calc.savings)}/yr</p>
                )}
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Cost Breakdown</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{calc.tier.icon} {calc.tier.label} Plan ({teamSize} users × ${calc.tier.basePrice})</span>
                <span className="font-bold">{formatCurrency(calc.baseCost)}</span>
              </div>
              {selectedAddOns.map((id) => {
                const addon = ADD_ONS.find((a) => a.id === id)!;
                return (
                  <div key={id} className="flex justify-between text-xs">
                    <span className="text-gray-600">{addon.icon} {addon.label} ({teamSize} × ${addon.price})</span>
                    <span className="font-bold">{formatCurrency(addon.price * teamSize)}</span>
                  </div>
                );
              })}
              {calc.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold border-t border-gray-200 pt-1">
                  <span>Annual discount (-20%)</span>
                  <span>-{formatCurrency(calc.monthlyTotal - calc.effectiveMonthly)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2">
                <span>Total / month</span>
                <span className="text-blue-700">{formatCurrency(calc.effectiveMonthly)}</span>
              </div>
            </div>

            {/* Plan features */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">{calc.tier.icon} {calc.tier.label} includes:</p>
              <ul className="space-y-1">
                {calc.tier.features.map((f) => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                See Actual Pricing on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              Get exact pricing and start a free trial on {brandDomain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
