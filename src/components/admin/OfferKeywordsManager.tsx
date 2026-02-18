"use client";

import { useState, useEffect, useCallback } from "react";

interface Keyword { id: string; keyword: string; intentType: string | null; classifiedAt: string | null; _count: { generatedPages: number } }

const INTENT_OPTIONS = [
  { value: "comparison", label: "Comparison" },
  { value: "pricing", label: "Pricing" },
  { value: "validation", label: "Validation" },
  { value: "transactional", label: "Transactional" },
  { value: "informational", label: "Informational" },
  { value: "destination_specific", label: "Destination Specific" },
  { value: "route_specific", label: "Route Specific" },
  { value: "use_case", label: "Use Case" },
  { value: "problem_solution", label: "Problem/Solution" },
];

export function OfferKeywordsManager({ offerId }: { offerId: string }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkInput, setBulkInput] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingIntent, setSavingIntent] = useState<string | null>(null);
  const [deletingKw, setDeletingKw] = useState<string | null>(null);

  const fetchKeywords = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/keywords?offerId=${offerId}`);
    if (res.ok) { const data = await res.json(); setKeywords(data.keywords || []); }
    setLoading(false);
  }, [offerId]);

  useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

  const handleAddKeywords = async () => {
    const kws = bulkInput.split("\n").map((k) => k.trim()).filter(Boolean);
    if (kws.length === 0) return;
    await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, keywords: kws }),
    });
    setBulkInput("");
    fetchKeywords();
  };

  const handleClassifyAll = async () => {
    setClassifying(true);
    setMessage(null);
    try {
      const res = await fetch("/api/keywords/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const data = await res.json();
      setMessage(`✅ Classified ${data.classified} keywords`);
      fetchKeywords();
    } catch {
      setMessage("❌ Classification failed");
    }
    setClassifying(false);
  };

  const handleGeneratePage = async (keywordId: string) => {
    setGenerating(keywordId);
    setMessage(null);
    try {
      const res = await fetch("/api/pages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Page generated: "${data.page.title}" (compliance: ${data.compliance.score}%)`);
        fetchKeywords();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Generation failed");
    }
    setGenerating(null);
  };

  const handleIntentOverride = async (keywordId: string, newIntent: string | null) => {
    setSavingIntent(keywordId);
    try {
      const res = await fetch(`/api/keywords/${keywordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentType: newIntent }),
      });
      if (res.ok) {
        setMessage(`✅ Intent updated`);
        fetchKeywords();
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Failed to update intent");
    }
    setSavingIntent(null);
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    if (!confirm("Delete this keyword and any generated pages?")) return;
    setDeletingKw(keywordId);
    try {
      await fetch(`/api/keywords/${keywordId}`, { method: "DELETE" });
      setMessage("✅ Keyword deleted");
      fetchKeywords();
    } catch {
      setMessage("❌ Failed to delete keyword");
    }
    setDeletingKw(null);
  };

  const unclassified = keywords.filter((k) => !k.intentType).length;

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🔑 Keywords & Page Generation</h3>

      {/* Add keywords */}
      <div className="bg-gray-50 rounded-xl border p-4 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Add Keywords (one per line)</label>
        <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder={"cheap flights london to paris\nskyscanner pricing\nskyscanner vs kayak"} />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">{bulkInput.split("\n").filter(Boolean).length} keyword(s)</span>
          <button onClick={handleAddKeywords} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Add Keywords</button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4">
        {unclassified > 0 && (
          <button onClick={handleClassifyAll} disabled={classifying} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${classifying ? "bg-amber-100 text-amber-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {classifying ? "⏳ Classifying…" : `🤖 Classify ${unclassified} Keyword(s)`}
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 text-sm px-4 py-2 rounded-lg ${message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      {/* Keyword list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading…</div>
      ) : keywords.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500 text-sm">No keywords added yet. Paste keywords above to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keywords.map((kw) => (
            <div key={kw.id} className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <code className="text-sm text-gray-800 font-mono truncate">{kw.keyword}</code>
                  {kw._count.generatedPages > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium flex-shrink-0">📄 {kw._count.generatedPages}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Intent Type Dropdown */}
                  <select
                    value={kw.intentType || ""}
                    onChange={(e) => handleIntentOverride(kw.id, e.target.value || null)}
                    disabled={savingIntent === kw.id}
                    className={`text-xs px-2 py-1.5 rounded-lg border font-medium appearance-none cursor-pointer transition ${
                      kw.intentType
                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400"
                    } ${savingIntent === kw.id ? "opacity-50" : ""}`}
                  >
                    <option value="">— Unclassified —</option>
                    {INTENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {/* Generate / Regenerate button */}
                  {kw.intentType && (
                    <button
                      onClick={() => handleGeneratePage(kw.id)}
                      disabled={generating === kw.id}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${generating === kw.id ? "bg-amber-100 text-amber-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                    >
                      {generating === kw.id ? "⏳ Generating…" : kw._count.generatedPages > 0 ? "🔄 Regen" : "📄 Generate"}
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteKeyword(kw.id)}
                    disabled={deletingKw === kw.id}
                    className="text-xs px-2 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete keyword"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
