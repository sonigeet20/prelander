"use client";

import { useState, useEffect } from "react";
import { OfferKeywordsManager } from "@/components/admin/OfferKeywordsManager";

interface OfferDetail {
  id: string; name: string; slug: string; status: string; destinationUrl: string;
  redirectDelaySec: number | null;
  brand: { name: string; domain: string };
  _count: { keywords: number; generatedPages: number; clickLogs: number };
}

export default function AdminOfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [editingDelay, setEditingDelay] = useState(false);
  const [delayValue, setDelayValue] = useState("");
  const [savingDelay, setSavingDelay] = useState(false);

  useEffect(() => {
    params.then((p) => setResolvedId(p.id));
  }, [params]);

  useEffect(() => {
    if (!resolvedId) return;
    (async () => {
      const res = await fetch(`/api/offers/${resolvedId}`);
      if (res.ok) { const data = await res.json(); setOffer(data.offer); }
      setLoading(false);
    })();
  }, [resolvedId]);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading…</div>;
  if (!offer) return <div className="py-12 text-center text-red-500">Offer not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            <a href="/admin/brands" className="hover:underline">{offer.brand.name}</a> →
          </div>
          <h2 className="text-xl font-bold text-gray-900">{offer.name}</h2>
          <p className="text-sm text-gray-500 font-mono">{offer.slug}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${offer.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {offer.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{offer._count.keywords}</div>
          <div className="text-xs text-blue-500 font-medium">Keywords</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{offer._count.generatedPages}</div>
          <div className="text-xs text-green-500 font-medium">Pages</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{offer._count.clickLogs}</div>
          <div className="text-xs text-amber-500 font-medium">Clicks</div>
        </div>
      </div>

      {/* Tracking / Destination URL */}
      <div className="bg-gray-50 rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold text-gray-500">🔗 Tracking / Destination URL</div>
          {!editingUrl && (
            <button onClick={() => { setEditingUrl(true); setUrlValue(offer.destinationUrl); }} className="text-xs text-indigo-600 hover:underline">Edit</button>
          )}
        </div>
        {editingUrl ? (
          <div className="flex gap-2 mt-1">
            <input type="url" value={urlValue} onChange={(e) => setUrlValue(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono" placeholder="https://your-tracking-link.com/..." />
            <button
              disabled={savingUrl}
              onClick={async () => {
                setSavingUrl(true);
                const res = await fetch(`/api/offers/${offer.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destinationUrl: urlValue }) });
                if (res.ok) { const data = await res.json(); setOffer(data.offer); }
                setEditingUrl(false);
                setSavingUrl(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >{savingUrl ? "Saving…" : "Save"}</button>
            <button onClick={() => setEditingUrl(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        ) : (
          <a href={offer.destinationUrl} target="_blank" className="text-sm text-indigo-600 hover:underline break-all font-mono">{offer.destinationUrl}</a>
        )}
        <p className="text-xs text-gray-400 mt-2">This is where users get redirected when they click. Put your affiliate/tracking link here.</p>
      </div>

      {/* Redirect Delay (Global) */}
      <div className="bg-gray-50 rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold text-gray-500">⏱️ Auto-Redirect Delay (Global Default)</div>
          {!editingDelay && (
            <button onClick={() => { setEditingDelay(true); setDelayValue(offer.redirectDelaySec?.toString() || ""); }} className="text-xs text-indigo-600 hover:underline">Edit</button>
          )}
        </div>
        {editingDelay ? (
          <div className="flex gap-2 mt-1">
            <input type="number" min="0" max="300" value={delayValue} onChange={(e) => setDelayValue(e.target.value)} className="w-32 px-3 py-2 border rounded-lg text-sm font-mono" placeholder="e.g. 15" />
            <span className="self-center text-sm text-gray-500">seconds</span>
            <button
              disabled={savingDelay}
              onClick={async () => {
                setSavingDelay(true);
                const val = delayValue.trim() === "" ? null : parseInt(delayValue, 10);
                const res = await fetch(`/api/offers/${offer.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ redirectDelaySec: val }) });
                if (res.ok) { const data = await res.json(); setOffer(data.offer); }
                setEditingDelay(false);
                setSavingDelay(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >{savingDelay ? "Saving…" : "Save"}</button>
            <button onClick={() => setEditingDelay(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        ) : (
          <div className="text-sm text-gray-800 font-mono">
            {offer.redirectDelaySec !== null ? `${offer.redirectDelaySec}s` : <span className="text-gray-400">Not set (no auto-redirect)</span>}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">After this many seconds, the page auto-redirects to the tracking URL. This is the <strong>global default</strong> for all pages under this offer. Individual pages can override this.</p>
      </div>

      {/* Keywords + Page generation */}
      <OfferKeywordsManager offerId={offer.id} />
    </div>
  );
}
