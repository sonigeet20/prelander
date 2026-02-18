"use client";

import { useState, useEffect } from "react";

interface PageDetail {
  id: string; slug: string; title: string; metaDescription: string; h1: string;
  content: { sections: Array<{ type: string; heading?: string; content?: string; items?: Array<{ question: string; answer: string }> }> };
  status: string; complianceScore: number | null; publishedUrl: string | null;
  redirectDelaySec: number | null;
  offer: { name: string; slug: string; redirectDelaySec: number | null; brand: { name: string; domain: string } };
  keyword: { keyword: string; intentType: string | null } | null;
  complianceLogs: Array<{ id: string; scanType: string; passed: boolean; violations: unknown; createdAt: string }>;
}

export default function AdminPageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [page, setPage] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [editingDelay, setEditingDelay] = useState(false);
  const [delayValue, setDelayValue] = useState("");
  const [savingDelay, setSavingDelay] = useState(false);

  useEffect(() => { params.then((p) => setResolvedId(p.id)); }, [params]);

  useEffect(() => {
    if (!resolvedId) return;
    (async () => {
      const res = await fetch(`/api/pages/${resolvedId}`);
      if (res.ok) { const data = await res.json(); setPage(data.page); }
      setLoading(false);
    })();
  }, [resolvedId]);

  const handlePublish = async () => {
    if (!resolvedId) return;
    const res = await fetch(`/api/pages/${resolvedId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    if (res.ok) { const data = await res.json(); setPage(data.page); }
  };

  const handleScan = async () => {
    if (!resolvedId) return;
    await fetch("/api/compliance/scan", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: resolvedId }),
    });
    // Reload page
    const res = await fetch(`/api/pages/${resolvedId}`);
    if (res.ok) { const data = await res.json(); setPage(data.page); }
  };

  if (loading) return <div className="py-12 text-center text-gray-400">Loading…</div>;
  if (!page) return <div className="py-12 text-center text-red-500">Page not found</div>;

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700", review: "bg-amber-100 text-amber-700",
    compliant: "bg-blue-100 text-blue-700", published: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            <a href="/admin/pages" className="hover:underline">Pages</a> →
          </div>
          <h2 className="text-xl font-bold text-gray-900">{page.title}</h2>
          <p className="text-sm text-gray-500">{page.offer.brand.name} · {page.keyword?.keyword || page.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[page.status] || "bg-gray-100"}`}>
            {page.status}
          </span>
          {page.complianceScore !== null && (
            <span className={`font-mono font-bold text-sm ${page.complianceScore >= 80 ? "text-green-600" : page.complianceScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {page.complianceScore}%
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        {page.status !== "published" && (
          <button onClick={handlePublish} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">🚀 Publish</button>
        )}
        <button onClick={handleScan} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">🔍 Re-scan Compliance</button>
        {page.publishedUrl && (
          <a href={page.publishedUrl} target="_blank" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">View Live ↗</a>
        )}
      </div>

      {/* Meta */}
      <div className="bg-gray-50 rounded-xl border p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">Title Tag</div>
            <div className="text-sm text-gray-800">{page.title}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">Meta Description</div>
            <div className="text-sm text-gray-800">{page.metaDescription}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">H1</div>
            <div className="text-sm text-gray-800">{page.h1}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">URL Slug</div>
            <div className="text-sm font-mono text-gray-800">/guides/{page.offer.brand.name.toLowerCase().replace(/\s+/g, "-")}/{page.slug}</div>
          </div>
        </div>
      </div>

      {/* Redirect Delay (Page Override) */}
      <div className="bg-gray-50 rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold text-gray-500">⏱️ Auto-Redirect Delay (Page Override)</div>
          {!editingDelay && (
            <button onClick={() => { setEditingDelay(true); setDelayValue(page.redirectDelaySec?.toString() || ""); }} className="text-xs text-indigo-600 hover:underline">Edit</button>
          )}
        </div>
        {editingDelay ? (
          <div className="flex gap-2 mt-1">
            <input type="number" min="0" max="300" value={delayValue} onChange={(e) => setDelayValue(e.target.value)} className="w-32 px-3 py-2 border rounded-lg text-sm font-mono" placeholder="e.g. 10" />
            <span className="self-center text-sm text-gray-500">seconds</span>
            <button
              disabled={savingDelay}
              onClick={async () => {
                setSavingDelay(true);
                const val = delayValue.trim() === "" ? null : parseInt(delayValue, 10);
                const res = await fetch(`/api/pages/${resolvedId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ redirectDelaySec: val }) });
                if (res.ok) { const data = await res.json(); setPage(data.page); }
                setEditingDelay(false);
                setSavingDelay(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >{savingDelay ? "Saving…" : "Save"}</button>
            <button onClick={() => setEditingDelay(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        ) : (
          <div className="text-sm text-gray-800 font-mono">
            {page.redirectDelaySec !== null
              ? `${page.redirectDelaySec}s (overrides offer default)`
              : <span className="text-gray-400">Not set — using offer default: {page.offer.redirectDelaySec !== null ? `${page.offer.redirectDelaySec}s` : "none"}</span>}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">Override the offer-level redirect delay for this specific page. Leave empty to inherit from the offer-level setting.</p>
      </div>

      {/* Content Preview */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="px-5 py-3 border-b bg-gray-50 rounded-t-xl">
          <h3 className="font-semibold text-gray-800">📄 Content Preview</h3>
        </div>
        <div className="p-5 prose prose-sm max-w-none">
          <h1>{page.h1}</h1>
          {page.content?.sections?.map((section, i) => (
            <div key={i} className="mb-6">
              {section.heading && <h2 className="text-lg font-bold text-gray-900">{section.heading}</h2>}
              {section.content && <div className="text-gray-700 whitespace-pre-wrap">{section.content}</div>}
              {section.type === "faq" && section.items?.map((item, j) => (
                <details key={j} className="border-b py-2">
                  <summary className="font-medium cursor-pointer">{item.question}</summary>
                  <p className="mt-2 text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Logs */}
      {page.complianceLogs.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-3 border-b bg-gray-50 rounded-t-xl">
            <h3 className="font-semibold text-gray-800">🔍 Compliance History</h3>
          </div>
          <div className="divide-y">
            {page.complianceLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${log.passed ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-sm text-gray-700">{log.scanType}</span>
                  <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <span className={`text-xs font-medium ${log.passed ? "text-green-600" : "text-red-600"}`}>
                  {log.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
