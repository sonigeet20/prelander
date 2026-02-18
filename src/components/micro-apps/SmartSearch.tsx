"use client";

import { useState } from "react";

/**
 * SmartSearch — Generic discovery/search tool for any vertical.
 * Works as a fallback when no vertical-specific tool is available.
 * Users describe what they're looking for → get contextual tips →
 * click to explore on the brand's site.
 */

const QUICK_PROMPTS = [
  "Best deals right now",
  "Beginner recommendations",
  "Compare top options",
  "Money-saving tips",
  "Hidden features to look for",
  "Common mistakes to avoid",
];

export function SmartSearch({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const generateTips = (q: string): string[] => {
    const lowerQ = q.toLowerCase();
    if (lowerQ.includes("deal") || lowerQ.includes("save") || lowerQ.includes("cheap") || lowerQ.includes("budget")) {
      return [
        "Compare prices across multiple listings before committing",
        "Check for seasonal promotions and limited-time offers",
        "Look for bundle deals that combine related products/services",
        "Sign up for price alerts to catch drops",
        "Read reviews focused on value-for-money",
      ];
    }
    if (lowerQ.includes("best") || lowerQ.includes("top") || lowerQ.includes("recommend")) {
      return [
        "Focus on features that match your specific use case",
        "Check expert reviews alongside user ratings",
        "Compare at least 3 options before deciding",
        "Look for products/services with good return policies",
        "Consider long-term value, not just upfront cost",
      ];
    }
    if (lowerQ.includes("compare") || lowerQ.includes("vs") || lowerQ.includes("difference")) {
      return [
        "Create a comparison checklist of must-have features",
        "Weigh ongoing costs vs. one-time expenses",
        "Read reviews from users with similar needs",
        "Check warranty and support differences",
        "Look at upgrade paths and future flexibility",
      ];
    }
    if (lowerQ.includes("beginner") || lowerQ.includes("start") || lowerQ.includes("new")) {
      return [
        "Start with mid-range options — avoid cheapest and priciest",
        "Look for starter bundles designed for beginners",
        "Prioritize ease of use over advanced features",
        "Check if there's a free trial or money-back guarantee",
        "Join community forums for real user advice",
      ];
    }
    return [
      "Compare options side-by-side to find the best fit",
      "Look for verified reviews and expert recommendations",
      "Check for current promotions and seasonal deals",
      "Consider your specific needs and budget constraints",
      "Take advantage of free trials when available",
    ];
  };

  const tips = generateTips(query);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">🔍</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Smart Discovery Tool</h3>
            <p className="text-gray-400 text-xs">Tell us what you&apos;re looking for and we&apos;ll help you find it</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick prompts */}
        <p className="text-xs font-medium text-gray-500 mb-2">Quick search ideas:</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => { setQuery(prompt); setShowResults(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                query === prompt ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative mb-5">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(false); }}
            placeholder="What are you looking for?"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-400 outline-none pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <button
          onClick={() => setShowResults(true)}
          disabled={!query.trim()}
          className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Get Personalized Tips
        </button>

        {showResults && query.trim() && (
          <div className="mt-6 space-y-4">
            {/* Search context */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Searching for:</p>
              <p className="text-sm font-bold text-gray-800">&quot;{query}&quot;</p>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600">💡 Expert Tips</p>
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                  <span className="text-emerald-500 font-bold text-sm mt-0.5">{i + 1}</span>
                  <p className="text-xs text-gray-700">{tip}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                Explore on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              Browse options and current offers on {brandDomain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
