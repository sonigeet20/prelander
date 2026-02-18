"use client";

interface ScoreCardProps {
  heading?: string;
  overallScore?: number;
  overallLabel?: string;
  categories: Array<{
    name: string;
    score: number;
    maxScore?: number;
    detail?: string;
  }>;
  verdict?: string;
}

/**
 * Visual score/rating breakdown card — like a review scorecard.
 * Shows individual category scores as progress bars with an overall verdict.
 */
export function ScoreCard({ heading, overallScore, overallLabel, categories, verdict }: ScoreCardProps) {
  const avg = overallScore ?? Math.round(categories.reduce((sum, c) => sum + (c.score / (c.maxScore || 10)) * 10, 0) / categories.length);

  const scoreColor = (score: number, max: number = 10) => {
    const pct = score / max;
    if (pct >= 0.8) return { bar: "from-emerald-400 to-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
    if (pct >= 0.6) return { bar: "from-blue-400 to-indigo-500", text: "text-blue-700", bg: "bg-blue-50" };
    if (pct >= 0.4) return { bar: "from-amber-400 to-orange-500", text: "text-amber-700", bg: "bg-amber-50" };
    return { bar: "from-red-400 to-red-500", text: "text-red-700", bg: "bg-red-50" };
  };

  const overallColors = scoreColor(avg, 10);

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white overflow-hidden shadow-sm">
      {/* Header with overall score */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            {heading && <h3 className="text-lg font-bold text-white mb-1">{heading}</h3>}
            {overallLabel && <p className="text-sm text-gray-400">{overallLabel}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl ${overallColors.bg} flex items-center justify-center`}>
              <span className={`text-2xl font-bold font-mono ${overallColors.text}`}>{avg}</span>
            </div>
            <span className="text-gray-400 text-sm font-medium">/10</span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="px-6 py-5 sm:px-8 space-y-4">
        {categories.map((cat, idx) => {
          const max = cat.maxScore || 10;
          const pct = Math.round((cat.score / max) * 100);
          const colors = scoreColor(cat.score, max);
          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                <span className={`text-sm font-bold font-mono ${colors.text}`}>{cat.score}/{max}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {cat.detail && <p className="text-xs text-gray-400 mt-1">{cat.detail}</p>}
            </div>
          );
        })}
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="px-6 py-4 sm:px-8 bg-gray-50 border-t border-gray-100">
          <div className="flex items-start gap-2.5">
            <span className="text-lg">📝</span>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Editorial Verdict</p>
              <p className="text-sm text-gray-700 leading-relaxed">{verdict}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
