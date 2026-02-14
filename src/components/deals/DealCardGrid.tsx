"use client";

import { useState, useRef } from "react";

interface Deal {
  id: string;
  title: string;
  description: string;
  code: string | null;
  discountLabel: string;
  discountPercent: number | null;
  category: string;
  destinationUrl: string;
  verified: boolean;
  featured: boolean;
  expiresAt: string | null;
  usedCount: number;
}

interface DealCardGridProps {
  deals: Deal[];
  categories: string[];
  brandColors: { primary: string; secondary: string; accent: string; soft: string };
  clickHref: string;
  brandName: string;
}

export function DealCardGrid({ deals, categories, brandColors, clickHref, brandName }: DealCardGridProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = deals.filter((d) => {
    const matchCat = activeCategory === "All" || d.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.filter((d) => d.featured);
  const regular = filtered.filter((d) => !d.featured);

  const revealCode = (dealId: string) => {
    setRevealedCodes((prev) => new Set(prev).add(dealId));
  };

  const copyCode = async (code: string, dealId: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(dealId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
            style={activeCategory === cat ? { backgroundColor: brandColors.primary } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search within deals */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={`Search ${brandName} deals...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ ["--tw-ring-color" as string]: brandColors.primary } as React.CSSProperties}
        />
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-gray-600">No deals match your search. Try a different term or category.</p>
        </div>
      )}

      {/* Featured Deals */}
      {featured.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⭐</span> Featured Deals
          </h3>
          <div className="space-y-4">
            {featured.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                brandColors={brandColors}
                clickHref={clickHref}
                revealed={revealedCodes.has(deal.id)}
                copied={copiedId === deal.id}
                onReveal={() => revealCode(deal.id)}
                onCopy={(code) => copyCode(code, deal.id)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Deals */}
      {regular.length > 0 && (
        <div className="space-y-4">
          {regular.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              brandColors={brandColors}
              clickHref={clickHref}
              revealed={revealedCodes.has(deal.id)}
              copied={copiedId === deal.id}
              onReveal={() => revealCode(deal.id)}
              onCopy={(code) => copyCode(code, deal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────
// Individual Deal Card
// ──────────────────────────────────────
interface DealCardProps {
  deal: Deal;
  brandColors: { primary: string; secondary: string; accent: string; soft: string };
  clickHref: string;
  revealed: boolean;
  copied: boolean;
  onReveal: () => void;
  onCopy: (code: string) => void;
  featured?: boolean;
}

function DealCard({ deal, brandColors, clickHref, revealed, copied, onReveal, onCopy, featured }: DealCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
        featured ? "ring-2" : ""
      }`}
      style={featured ? { borderColor: brandColors.accent, ["--tw-ring-color" as string]: brandColors.accent } as React.CSSProperties : {}}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Discount Badge */}
        <div
          className="flex-shrink-0 w-full sm:w-32 flex items-center justify-center p-4 text-white"
          style={{ backgroundColor: featured ? brandColors.accent : brandColors.primary }}
        >
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-extrabold leading-tight">
              {deal.discountLabel || "DEAL"}
            </div>
            {featured && <div className="text-xs mt-1 opacity-90 font-medium">⭐ Featured</div>}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-base mb-1">{deal.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{deal.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{deal.category}</span>
                {deal.verified && (
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
                {deal.expiresAt && (
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                    Expires {new Date(deal.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                {deal.usedCount > 0 && (
                  <span className="text-gray-400">{deal.usedCount} used today</span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 text-right">
              {deal.code ? (
                revealed ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 border-2 border-dashed rounded-lg font-mono font-bold text-sm tracking-wider" style={{ borderColor: brandColors.primary, color: brandColors.primary }}>
                      {deal.code}
                    </div>
                    <button
                      onClick={() => onCopy(deal.code!)}
                      className="w-full px-4 py-1.5 text-white text-xs font-semibold rounded-lg transition"
                      style={{ backgroundColor: copied ? "#22c55e" : brandColors.primary }}
                    >
                      {copied ? "Copied! ✓" : "Copy Code"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onReveal}
                    className="px-5 py-2.5 text-white font-semibold rounded-lg transition hover:opacity-90 text-sm whitespace-nowrap"
                    style={{ backgroundColor: brandColors.primary }}
                  >
                    Get Code →
                  </button>
                )
              ) : (
                <a
                  href={clickHref}
                  className="inline-block px-5 py-2.5 text-white font-semibold rounded-lg transition hover:opacity-90 text-sm whitespace-nowrap"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Get Deal →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
