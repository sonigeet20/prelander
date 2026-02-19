"use client";

import { useState, useEffect } from "react";
import { OfferKeywordsManager } from "@/components/admin/OfferKeywordsManager";

interface OfferDetail {
  id: string; name: string; slug: string; status: string; destinationUrl: string;
  redirectDelaySec: number | null;
  impressionPixelUrl: string | null;
  clickPixelUrl: string | null;
  conversionPixelUrl: string | null;
  googleAdsConversionId: string | null;
  googleAdsConversionLabel: string | null;
  metaPixelId: string | null;
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
  const [editingPixels, setEditingPixels] = useState(false);
  const [impressionPixel, setImpressionPixel] = useState("");
  const [clickPixel, setClickPixel] = useState("");
  const [conversionPixel, setConversionPixel] = useState("");
  const [savingPixels, setSavingPixels] = useState(false);
  const [editingAdPlatforms, setEditingAdPlatforms] = useState(false);
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [googleAdsLabel, setGoogleAdsLabel] = useState("");
  const [metaPixel, setMetaPixel] = useState("");
  const [savingAdPlatforms, setSavingAdPlatforms] = useState(false);
  const [creatingMicroapp, setCreatingMicroapp] = useState<"flight-finder" | "ai-assistant" | null>(null);
  const [creatingLoading, setCreatingLoading] = useState(false);

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

      {/* Dedicated Microapp Landing Pages */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Dedicated Microapp Pages
        </h3>
        <p className="text-xs text-gray-600 mb-4">Create high-performance landing pages with live tools built-in. These pages have their own URLs under this offer.</p>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Flight Finder */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-2">✈️ Flight Finder</div>
            <p className="text-xs text-gray-500 mb-3">Real-time flight search with live prices</p>
            <div className="text-xs font-mono text-gray-400 mb-3">/offers/{offer.slug}/flight-finder</div>
            <button
              onClick={async () => {
                setCreatingMicroapp("flight-finder");
                setCreatingLoading(true);
                const res = await fetch("/api/pages/microapp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ offerId: offer.id, type: "flight-finder" }),
                });
                if (res.ok) {
                  window.open(`/offers/${offer.slug}/flight-finder`, "_blank");
                }
                setCreatingLoading(false);
                setCreatingMicroapp(null);
              }}
              disabled={creatingLoading}
              className="w-full px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition disabled:opacity-50"
            >
              {creatingLoading && creatingMicroapp === "flight-finder" ? "Creating..." : "Create Page"}
            </button>
          </div>

          {/* AI Assistant */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-2">🤖 AI Assistant</div>
            <p className="text-xs text-gray-500 mb-3">Chat interface with GPT-4o mini powered answers</p>
            <div className="text-xs font-mono text-gray-400 mb-3">/offers/{offer.slug}/ai-assistant</div>
            <button
              onClick={async () => {
                setCreatingMicroapp("ai-assistant");
                setCreatingLoading(true);
                const res = await fetch("/api/pages/microapp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ offerId: offer.id, type: "ai-assistant" }),
                });
                if (res.ok) {
                  window.open(`/offers/${offer.slug}/ai-assistant`, "_blank");
                }
                setCreatingLoading(false);
                setCreatingMicroapp(null);
              }}
              disabled={creatingLoading}
              className="w-full px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition disabled:opacity-50"
            >
              {creatingLoading && creatingMicroapp === "ai-assistant" ? "Creating..." : "Create Page"}
            </button>
          </div>
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

      {/* Tracking Pixels */}
      <div className="bg-gray-50 rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-gray-500">📊 Tracking Pixels</div>
          {!editingPixels && (
            <button onClick={() => { 
              setEditingPixels(true); 
              setImpressionPixel(offer.impressionPixelUrl || "");
              setClickPixel(offer.clickPixelUrl || "");
              setConversionPixel(offer.conversionPixelUrl || "");
            }} className="text-xs text-indigo-600 hover:underline">Edit</button>
          )}
        </div>
        
        {editingPixels ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Impression Pixel (fires on page load)</label>
              <input 
                type="url" 
                value={impressionPixel} 
                onChange={(e) => setImpressionPixel(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono" 
                placeholder="https://tracker.com/impression?id=..." 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Click Pixel (fires on CTA click)</label>
              <input 
                type="url" 
                value={clickPixel} 
                onChange={(e) => setClickPixel(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono" 
                placeholder="https://tracker.com/click?id=..." 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Conversion Pixel (fires on conversion)</label>
              <input 
                type="url" 
                value={conversionPixel} 
                onChange={(e) => setConversionPixel(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono" 
                placeholder="https://tracker.com/conversion?id=..." 
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                disabled={savingPixels}
                onClick={async () => {
                  setSavingPixels(true);
                  const res = await fetch(`/api/offers/${offer.id}`, { 
                    method: "PATCH", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ 
                      impressionPixelUrl: impressionPixel.trim() || null,
                      clickPixelUrl: clickPixel.trim() || null,
                      conversionPixelUrl: conversionPixel.trim() || null
                    }) 
                  });
                  if (res.ok) { const data = await res.json(); setOffer(data.offer); }
                  setEditingPixels(false);
                  setSavingPixels(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >{savingPixels ? "Saving…" : "Save All"}</button>
              <button onClick={() => setEditingPixels(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Impression:</span> 
              {offer.impressionPixelUrl ? (
                <a href={offer.impressionPixelUrl} target="_blank" className="text-indigo-600 hover:underline break-all font-mono ml-2 text-xs">{offer.impressionPixelUrl}</a>
              ) : (
                <span className="text-gray-400 ml-2 text-xs">Not set</span>
              )}
            </div>
            <div>
              <span className="text-gray-500 text-xs">Click:</span> 
              {offer.clickPixelUrl ? (
                <a href={offer.clickPixelUrl} target="_blank" className="text-indigo-600 hover:underline break-all font-mono ml-2 text-xs">{offer.clickPixelUrl}</a>
              ) : (
                <span className="text-gray-400 ml-2 text-xs">Not set</span>
              )}
            </div>
            <div>
              <span className="text-gray-500 text-xs">Conversion:</span> 
              {offer.conversionPixelUrl ? (
                <a href={offer.conversionPixelUrl} target="_blank" className="text-indigo-600 hover:underline break-all font-mono ml-2 text-xs">{offer.conversionPixelUrl}</a>
              ) : (
                <span className="text-gray-400 ml-2 text-xs">Not set</span>
              )}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          These pixels will be automatically injected into all landing pages for this offer. 
          <strong className="text-amber-600"> ⚠️ Important:</strong> Only use your own first-party tracking URLs (e.g., rightprice.site/api/track), 
          never third-party affiliate pixels — that would violate Google Ads policies.
        </p>
      </div>

      {/* Ad Platform Conversion Tracking */}
      <div className="bg-gray-50 rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold text-gray-500">📊 Ad Platform Conversion Tracking</div>
          {!editingAdPlatforms && (
            <button onClick={() => { 
              setEditingAdPlatforms(true); 
              setGoogleAdsId(offer.googleAdsConversionId || "");
              setGoogleAdsLabel(offer.googleAdsConversionLabel || "");
              setMetaPixel(offer.metaPixelId || "");
            }} className="text-xs text-indigo-600 hover:underline">Edit</button>
          )}
        </div>
        
        {editingAdPlatforms ? (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">🔵 Google Ads Conversion Tracking</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Conversion ID</label>
                  <input 
                    type="text" 
                    value={googleAdsId} 
                    onChange={(e) => setGoogleAdsId(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono" 
                    placeholder="AW-123456789" 
                  />
                  <p className="text-xs text-gray-400 mt-1">Found in Google Ads → Tools → Conversions → Tag setup</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Conversion Label</label>
                  <input 
                    type="text" 
                    value={googleAdsLabel} 
                    onChange={(e) => setGoogleAdsLabel(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono" 
                    placeholder="abc123DEF456ghi789" 
                  />
                  <p className="text-xs text-gray-400 mt-1">Conversion action label (e.g., "purchase", "lead")</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">🔷 Meta (Facebook) Pixel</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pixel ID</label>
                <input 
                  type="text" 
                  value={metaPixel} 
                  onChange={(e) => setMetaPixel(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono" 
                  placeholder="1234567890123456" 
                />
                <p className="text-xs text-gray-400 mt-1">Found in Meta Events Manager → Data Sources → Pixel ID</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                disabled={savingAdPlatforms}
                onClick={async () => {
                  setSavingAdPlatforms(true);
                  const res = await fetch(`/api/offers/${offer.id}`, { 
                    method: "PATCH", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ 
                      googleAdsConversionId: googleAdsId.trim() || null,
                      googleAdsConversionLabel: googleAdsLabel.trim() || null,
                      metaPixelId: metaPixel.trim() || null
                    }) 
                  });
                  if (res.ok) { const data = await res.json(); setOffer(data.offer); }
                  setEditingAdPlatforms(false);
                  setSavingAdPlatforms(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >{savingAdPlatforms ? "Saving…" : "Save All"}</button>
              <button onClick={() => setEditingAdPlatforms(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">🔵 Google Ads</div>
              <div className="ml-3 space-y-1">
                <div>
                  <span className="text-gray-500 text-xs">Conversion ID:</span> 
                  {offer.googleAdsConversionId ? (
                    <span className="text-gray-900 font-mono ml-2 text-xs">{offer.googleAdsConversionId}</span>
                  ) : (
                    <span className="text-gray-400 ml-2 text-xs">Not set</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Conversion Label:</span> 
                  {offer.googleAdsConversionLabel ? (
                    <span className="text-gray-900 font-mono ml-2 text-xs">{offer.googleAdsConversionLabel}</span>
                  ) : (
                    <span className="text-gray-400 ml-2 text-xs">Not set</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">🔷 Meta (Facebook) Pixel</div>
              <div className="ml-3">
                <span className="text-gray-500 text-xs">Pixel ID:</span> 
                {offer.metaPixelId ? (
                  <span className="text-gray-900 font-mono ml-2 text-xs">{offer.metaPixelId}</span>
                ) : (
                  <span className="text-gray-400 ml-2 text-xs">Not set</span>
                )}
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          ✅ <strong>These are SAFE:</strong> Tracking YOUR OWN ad campaigns (Google Ads/Meta Ads) is legitimate and compliant. 
          These pixels track conversions from your paid traffic, not affiliate cookie stuffing.
        </p>
      </div>

      {/* Keywords + Page generation */}
      <OfferKeywordsManager offerId={offer.id} />
    </div>
  );
}
