"use client";

import { useState } from "react";

interface ChecklistItem {
  task: string;
  detail?: string;
  priority?: "high" | "medium" | "low";
}

interface InteractiveChecklistProps {
  heading?: string;
  description?: string;
  items: ChecklistItem[];
}

/**
 * Interactive checklist widget — users can check off items as they complete them.
 * Great for "before you book" or "evaluation criteria" sections.
 */
export function InteractiveChecklist({ heading, description, items }: InteractiveChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const progress = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;

  const priorityColor = {
    high: "border-l-red-400 bg-red-50/30",
    medium: "border-l-amber-400 bg-amber-50/30",
    low: "border-l-gray-300 bg-gray-50/30",
  };
  const priorityBadge = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          {heading && <h3 className="text-xl font-bold text-gray-900">{heading}</h3>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">{checked.size}/{items.length}</span>
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: progress === 100
                  ? "linear-gradient(90deg, #10b981, #059669)"
                  : "linear-gradient(90deg, #6366f1, #8b5cf6)",
              }}
            />
          </div>
        </div>
      </div>

      {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}

      {progress === 100 && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
          <span>🎉</span>
          <p className="text-sm text-emerald-700 font-medium">All done! You&apos;re fully prepared.</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, idx) => {
          const isChecked = checked.has(idx);
          const prio = item.priority || "medium";
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 border border-gray-200/60 transition-all hover:shadow-sm ${
                isChecked ? "bg-gray-50 opacity-70" : priorityColor[prio]
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                isChecked ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-white"
              }`}>
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isChecked ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {item.task}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityBadge[prio]}`}>
                    {prio}
                  </span>
                </div>
                {item.detail && (
                  <p className={`text-xs mt-0.5 leading-relaxed ${isChecked ? "text-gray-300" : "text-gray-500"}`}>
                    {item.detail}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
