"use client";

import { useState } from "react";

interface ProConItem {
  text: string;
  detail?: string;
  weight?: "major" | "minor";
}

interface ProConAnalysisProps {
  heading?: string;
  pros: ProConItem[];
  cons: ProConItem[];
  bottomLine?: string;
}

/**
 * Visual pros & cons analysis with weighted items and a bottom-line verdict.
 */
export function ProConAnalysis({ heading, pros, cons, bottomLine }: ProConAnalysisProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_SHOW = 4;

  const displayPros = showAll ? pros : pros.slice(0, INITIAL_SHOW);
  const displayCons = showAll ? cons : cons.slice(0, INITIAL_SHOW);
  const hasMore = pros.length > INITIAL_SHOW || cons.length > INITIAL_SHOW;

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white overflow-hidden shadow-sm">
      {heading && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚖️</span>
            <h3 className="text-lg font-bold text-gray-900">{heading}</h3>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Pros */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Advantages</span>
            <span className="text-xs text-gray-400">({pros.length})</span>
          </div>
          <div className="space-y-2.5">
            {displayPros.map((item, idx) => (
              <div key={idx} className={`flex items-start gap-2.5 ${item.weight === "major" ? "bg-emerald-50/60 -mx-2 px-2 py-1.5 rounded-lg" : ""}`}>
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                <div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                  {item.weight === "major" && <span className="ml-1.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Key</span>}
                  {item.detail && <p className="text-xs text-gray-400 mt-0.5">{item.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cons */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-sm font-bold text-red-700 uppercase tracking-wide">Limitations</span>
            <span className="text-xs text-gray-400">({cons.length})</span>
          </div>
          <div className="space-y-2.5">
            {displayCons.map((item, idx) => (
              <div key={idx} className={`flex items-start gap-2.5 ${item.weight === "major" ? "bg-red-50/60 -mx-2 px-2 py-1.5 rounded-lg" : ""}`}>
                <span className="text-red-400 mt-0.5 flex-shrink-0">−</span>
                <div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                  {item.weight === "major" && <span className="ml-1.5 text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Notable</span>}
                  {item.detail && <p className="text-xs text-gray-400 mt-0.5">{item.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hasMore && !showAll && (
        <div className="px-6 py-3 border-t border-gray-100 text-center">
          <button onClick={() => setShowAll(true)} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition">
            Show all pros & cons →
          </button>
        </div>
      )}

      {/* Bottom line */}
      {bottomLine && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/50">
          <div className="flex items-start gap-2.5">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Bottom Line</p>
              <p className="text-sm text-gray-700 leading-relaxed">{bottomLine}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
