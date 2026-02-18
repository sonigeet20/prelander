"use client";

import { useState } from "react";

/**
 * "Was this guide helpful?" feedback widget.
 * Stores feedback locally (no backend needed — could be extended to POST to an API).
 */
export function HelpfulFeedback({ pageSlug }: { pageSlug: string }) {
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const handleFeedback = (value: "yes" | "no") => {
    setFeedback(value);
    // Could POST to an analytics endpoint here
    try {
      if (typeof window !== "undefined") {
        const key = `feedback_${pageSlug}`;
        localStorage.setItem(key, value);
      }
    } catch {
      // ignore localStorage errors
    }
  };

  if (feedback) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-center">
        <p className="text-sm text-emerald-700 font-medium">
          {feedback === "yes"
            ? "Thanks! Glad this guide was helpful. 🎉"
            : "Thanks for your feedback. We'll work on improving this guide."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-5 text-center">
      <p className="text-sm font-medium text-gray-700 mb-3">Was this guide helpful?</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleFeedback("yes")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm"
        >
          <span className="text-base">👍</span> Yes, helpful
        </button>
        <button
          onClick={() => handleFeedback("no")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all shadow-sm"
        >
          <span className="text-base">👎</span> Not really
        </button>
      </div>
    </div>
  );
}
