"use client";

import { useState, useEffect, useCallback } from "react";
import { slugify } from "@/lib/slug";

interface Deal {
  id: string;
  title: string;
  description: string;
  code: string | null;
  discountLabel: string;
  discountPercent: number | null;
  category: string;
  destinationUrl: string;
  verified: boolean;
  featured: boolean;
  active: boolean;
  expiresAt: string | null;
  usedCount: number;
  createdAt: string;
}

interface CampaignDealsManagerProps {
  campaignId: string;
  offerName: string;
}

export function CampaignDealsManager({ campaignId, offerName }: CampaignDealsManagerProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const slug = slugify(offerName, 32);
  const dealsPageUrl = `/deals/${slug}`;

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deals?campaignId=${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMessage(null);
    try {
      const res = await fetch("/api/deals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setGenMessage(`✅ Generated ${data.deals?.length || 0} deals!`);
      fetchDeals();
    } catch (err) {
      setGenMessage(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm("Delete this deal?")) return;
    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      if (res.ok) fetchDeals();
    } catch {
      // silent
    }
  };

  const handleToggle = async (dealId: string, field: "active" | "featured" | "verified", value: boolean) => {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) fetchDeals();
    } catch {
      // silent
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Delete ALL ${deals.length} deals for this campaign? This cannot be undone.`)) return;
    for (const deal of deals) {
      await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
    }
    fetchDeals();
  };

  const activeCount = deals.filter(d => d.active).length;
  const featuredCount = deals.filter(d => d.featured).length;

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🏷️</span> Deals & Coupons
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {deals.length} total · {activeCount} active · {featuredCount} featured
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={dealsPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            👁️ Preview
          </a>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
          >
            ➕ Add Deal
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              generating
                ? "bg-amber-100 text-amber-700 border border-amber-200 cursor-wait"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {generating ? "⏳ Generating…" : "🤖 AI Generate Deals"}
          </button>
        </div>
      </div>

      {genMessage && (
        <div className={`mb-4 text-sm px-4 py-2 rounded-lg ${genMessage.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {genMessage}
        </div>
      )}

      {/* Add Deal Form */}
      {showAddForm && (
        <DealForm
          campaignId={campaignId}
          onSave={() => { setShowAddForm(false); fetchDeals(); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Deal Form */}
      {editingDeal && (
        <DealForm
          campaignId={campaignId}
          deal={editingDeal}
          onSave={() => { setEditingDeal(null); fetchDeals(); }}
          onCancel={() => setEditingDeal(null)}
        />
      )}

      {/* Deals List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading deals…</div>
      ) : deals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="text-gray-600 font-medium">No deals yet</p>
          <p className="text-sm text-gray-400 mt-1">Click &quot;AI Generate Deals&quot; to auto-create deals for this brand</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className={`bg-white rounded-lg border p-4 flex items-start gap-4 ${
                  !deal.active ? "opacity-50" : deal.featured ? "border-amber-300 bg-amber-50/30" : "border-gray-200"
                }`}
              >
                {/* Discount badge */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center text-center">
                  {deal.discountPercent ? (
                    <>
                      <span className="text-lg font-bold leading-none">{deal.discountPercent}%</span>
                      <span className="text-[10px] uppercase tracking-wide">off</span>
                    </>
                  ) : (
                    <span className="text-xs font-bold">DEAL</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{deal.title}</h4>
                    {deal.featured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">⭐ Featured</span>}
                    {deal.verified && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">✓ Verified</span>}
                    {!deal.active && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Inactive</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{deal.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {deal.code && <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{deal.code}</span>}
                    <span>{deal.category}</span>
                    <span>{deal.discountLabel}</span>
                    {deal.expiresAt && <span>Exp: {new Date(deal.expiresAt).toLocaleDateString()}</span>}
                    <span>{deal.usedCount} used</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(deal.id, "active", !deal.active)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                    title={deal.active ? "Deactivate" : "Activate"}
                  >
                    {deal.active ? "🟢" : "🔴"}
                  </button>
                  <button
                    onClick={() => handleToggle(deal.id, "featured", !deal.featured)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                    title={deal.featured ? "Unfeature" : "Feature"}
                  >
                    {deal.featured ? "⭐" : "☆"}
                  </button>
                  <button
                    onClick={() => setEditingDeal(deal)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteDeal(deal.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {deals.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleDeleteAll}
                className="text-xs text-red-500 hover:text-red-700 transition"
              >
                Delete all deals
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Deal Form (Add / Edit) ─── */

interface DealFormProps {
  campaignId: string;
  deal?: Deal;
  onSave: () => void;
  onCancel: () => void;
}

function DealForm({ campaignId, deal, onSave, onCancel }: DealFormProps) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(deal?.title || "");
  const [description, setDescription] = useState(deal?.description || "");
  const [code, setCode] = useState(deal?.code || "");
  const [discountLabel, setDiscountLabel] = useState(deal?.discountLabel || "");
  const [discountPercent, setDiscountPercent] = useState(deal?.discountPercent?.toString() || "");
  const [category, setCategory] = useState(deal?.category || "General");
  const [destinationUrl, setDestinationUrl] = useState(deal?.destinationUrl || "");
  const [verified, setVerified] = useState(deal?.verified ?? true);
  const [featured, setFeatured] = useState(deal?.featured ?? false);
  const [expiresAt, setExpiresAt] = useState(deal?.expiresAt?.split("T")[0] || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !discountLabel.trim()) return;
    setSaving(true);

    const body = {
      campaignId,
      title: title.trim(),
      description: description.trim(),
      code: code.trim() || null,
      discountLabel: discountLabel.trim(),
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      category,
      destinationUrl: destinationUrl.trim() || "",
      verified,
      featured,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      const url = deal ? `/api/deals/${deal.id}` : "/api/deals";
      const method = deal ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) onSave();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-indigo-50 rounded-xl border border-indigo-100 p-5">
      <h4 className="font-bold text-indigo-800 mb-4">{deal ? "Edit Deal" : "Add New Deal"}</h4>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., 25% Off First Booking" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Short deal description" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Promo Code</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" placeholder="SAVE25" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Label *</label>
          <input type="text" value={discountLabel} onChange={e => setDiscountLabel(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="25% Off" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Percent</label>
          <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="25" min="0" max="100" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            {["General","Flights","Hotels","Bundles","Loyalty","Seasonal","Free Shipping","Software","New Customer"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Destination URL</label>
          <input type="url" value={destinationUrl} onChange={e => setDestinationUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Expires At</label>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} className="rounded" />
            Verified
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded" />
            Featured
          </label>
        </div>
      </div>
      <div className="mt-4 flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {saving ? "Saving…" : deal ? "Update Deal" : "Create Deal"}
        </button>
      </div>
    </form>
  );
}
