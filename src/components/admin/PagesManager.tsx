"use client";

import { useState, useEffect, useCallback } from "react";

interface GeneratedPage {
  id: string; slug: string; title: string; status: string; complianceScore: number | null;
  publishedUrl: string | null; publishedAt: string | null; createdAt: string;
  redirectDelaySec: number | null;
  offer: { name: string; redirectDelaySec: number | null; brand: { name: string; domain: string } };
  keyword: { keyword: string; intentType: string | null } | null;
}

export function PagesManager() {
  const [pages, setPages] = useState<GeneratedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editingRedirect, setEditingRedirect] = useState<string | null>(null);
  const [redirectValue, setRedirectValue] = useState("");
  const [savingRedirect, setSavingRedirect] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    const url = filter === "all" ? "/api/pages" : `/api/pages?status=${filter}`;
    const res = await fetch(url);
    if (res.ok) { const data = await res.json(); setPages(data.pages || []); }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handlePublish = async (id: string) => {
    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    if (res.ok) fetchPages();
  };

  const handleScan = async (id: string) => {
    await fetch("/api/compliance/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: id }),
    });
    fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    fetchPages();
  };

  const handleSaveRedirect = async (id: string) => {
    setSavingRedirect(true);
    const val = redirectValue.trim() === "" ? null : parseInt(redirectValue, 10);
    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectDelaySec: val }),
    });
    if (res.ok) fetchPages();
    setEditingRedirect(null);
    setSavingRedirect(false);
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    review: "bg-amber-100 text-amber-700",
    compliant: "bg-blue-100 text-blue-700",
    published: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const complianceColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Generated Pages</h2>
          <p className="text-sm text-gray-500">Manage, review, and publish AI-generated content pages.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {["all", "draft", "review", "compliant", "published", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading pages…</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-gray-600 font-medium">No pages generated yet</p>
          <p className="text-sm text-gray-400 mt-1">Go to an offer, add keywords, and generate pages.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => {
            const effectiveDelay = p.redirectDelaySec ?? p.offer.redirectDelaySec ?? null;
            return (
            <div key={p.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.offer.brand.name} · {p.offer.name} · {p.keyword?.keyword || p.slug}
                  </div>
                  {p.keyword?.intentType && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{p.keyword.intentType}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`font-mono text-sm font-bold ${complianceColor(p.complianceScore)}`}>
                    {p.complianceScore !== null ? `${p.complianceScore}%` : "—"}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </div>
              </div>

              {/* Redirect Delay — inline control */}
              <div className="mt-3 flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">⏱️ Redirect:</span>
                {editingRedirect === p.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" max="300"
                      value={redirectValue}
                      onChange={(e) => setRedirectValue(e.target.value)}
                      className="w-20 px-2 py-1 border rounded text-xs font-mono"
                      placeholder="sec"
                      autoFocus
                    />
                    <span className="text-xs text-gray-400">sec</span>
                    <button
                      onClick={() => handleSaveRedirect(p.id)}
                      disabled={savingRedirect}
                      className="text-xs px-2 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >{savingRedirect ? "…" : "Save"}</button>
                    <button onClick={() => setEditingRedirect(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${effectiveDelay !== null ? "text-indigo-700 font-bold" : "text-gray-400"}`}>
                      {p.redirectDelaySec !== null
                        ? `${p.redirectDelaySec}s (page override)`
                        : p.offer.redirectDelaySec !== null
                          ? `${p.offer.redirectDelaySec}s (from offer)`
                          : "Off"}
                    </span>
                    <button
                      onClick={() => { setEditingRedirect(p.id); setRedirectValue(p.redirectDelaySec?.toString() || ""); }}
                      className="text-xs text-indigo-600 hover:underline"
                    >Edit</button>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2 border-t pt-3">
                <a href={`/admin/pages/${p.id}`} className="text-xs text-indigo-600 hover:underline">Preview</a>
                {p.publishedUrl && (
                  <a href={p.publishedUrl} target="_blank" className="text-xs text-green-600 hover:underline">View Live ↗</a>
                )}
                {p.status !== "published" && (p.complianceScore === null || p.complianceScore >= 70) && (
                  <button onClick={() => handlePublish(p.id)} className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Publish</button>
                )}
                <button onClick={() => handleScan(p.id)} className="text-xs text-gray-500 hover:text-indigo-600 transition">Re-scan</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700 transition ml-auto">Delete</button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
