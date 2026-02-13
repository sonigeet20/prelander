"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";

interface CampaignActionsProps {
  campaign: {
    id: string;
    offerName: string;
    brandUrls: string[];
    metadata: any;
    lastResearchedAt: Date | string | null;
  };
}

export function CampaignActions({ campaign }: CampaignActionsProps) {
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchSuccess, setResearchSuccess] = useState(false);

  const slug = slugify(campaign.offerName, 32);
  const previewUrl = `/offer/${slug}/default`;
  const hasFactPack = !!campaign.metadata?.brandFactPack;
  const hasBrandUrls = campaign.brandUrls && campaign.brandUrls.length > 0;

  const handleResearch = async () => {
    setResearchLoading(true);
    setResearchError(null);
    setResearchSuccess(false);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Research failed");
      }

      setResearchSuccess(true);
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setResearchLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-indigo-100 bg-indigo-50 p-5">
      <h3 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider mb-4">
        Quick Actions
      </h3>

      <div className="flex flex-wrap gap-3">
        {/* Preview Lander */}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-medium text-sm hover:bg-indigo-100 transition"
        >
          <span>👁️</span>
          Preview Lander
        </a>

        {/* Copy Lander URL */}
        <button
          onClick={() => {
            const url = `${window.location.origin}${previewUrl}`;
            navigator.clipboard.writeText(url);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-medium text-sm hover:bg-indigo-100 transition"
        >
          <span>📋</span>
          Copy Lander URL
        </button>

        {/* Research Brand */}
        <button
          onClick={handleResearch}
          disabled={researchLoading || !hasBrandUrls}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
            !hasBrandUrls
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : researchLoading
                ? "bg-amber-100 text-amber-700 border border-amber-200 cursor-wait"
                : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          <span>{researchLoading ? "⏳" : "🔬"}</span>
          {researchLoading ? "Researching…" : "Research Brand"}
        </button>
      </div>

      {/* Status messages */}
      {researchError && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          ❌ {researchError}
        </div>
      )}
      {researchSuccess && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          ✅ Brand research complete! Reload the preview to see updated content.
        </div>
      )}

      {/* Info pills */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span
          className={`px-2 py-1 rounded-full ${hasFactPack ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          {hasFactPack ? "✓ Brand data available" : "○ No brand data yet"}
        </span>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          Slug: <code className="font-mono">{slug}</code>
        </span>
        {campaign.lastResearchedAt && (
          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600">
            Researched: {new Date(campaign.lastResearchedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
