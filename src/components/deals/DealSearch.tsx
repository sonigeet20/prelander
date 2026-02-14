"use client";

import { useState } from "react";

interface DealSearchProps {
  brandName: string;
}

export function DealSearch({ brandName }: DealSearchProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-xl mx-auto">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={`Search ${brandName} deals, coupons & promo codes...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 border-0"
        />
      </div>
      <p className="text-sm mt-3 opacity-75">
        🔥 Popular: Discount codes, Free shipping, New customer deals, Seasonal offers
      </p>
    </div>
  );
}
