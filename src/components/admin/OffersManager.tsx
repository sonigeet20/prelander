"use client";

import { useState, useEffect, useCallback } from "react";

interface Offer {
  id: string; name: string; slug: string; status: string; destinationUrl: string;
  brand: { id: string; name: string; domain: string };
  _count: { keywords: number; generatedPages: number; clickLogs: number };
}
interface Brand { id: string; name: string; domain: string }

export function OffersManager({ initialBrandId }: { initialBrandId?: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ brandId: initialBrandId || "", name: "", destinationUrl: "" });
  const [saving, setSaving] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    const url = initialBrandId ? `/api/offers?brandId=${initialBrandId}` : "/api/offers";
    const res = await fetch(url);
    if (res.ok) { const data = await res.json(); setOffers(data.offers || []); }
    setLoading(false);
  }, [initialBrandId]);

  const fetchBrands = useCallback(async () => {
    const res = await fetch("/api/brands");
    if (res.ok) { const data = await res.json(); setBrands(data.brands || []); }
  }, []);

  useEffect(() => { fetchOffers(); fetchBrands(); }, [fetchOffers, fetchBrands]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandId || !formData.name || !formData.destinationUrl) return;
    setSaving(true);
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) { setShowForm(false); setFormData({ brandId: initialBrandId || "", name: "", destinationUrl: "" }); fetchOffers(); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Offers</h2>
          <p className="text-sm text-gray-500">Create offers and manage keyword targeting.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          {showForm ? "Cancel" : "+ New Offer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand *</label>
              <select value={formData.brandId} onChange={(e) => setFormData({ ...formData, brandId: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">Select brand…</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Offer Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Cheap Flights UK" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Destination URL *</label>
              <input type="url" value={formData.destinationUrl} onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://skyscanner.com" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Creating…" : "Create Offer"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-600 font-medium">No offers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o) => (
            <a key={o.id} href={`/admin/offers/${o.id}`} className="block bg-white rounded-xl border p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{o.name}</div>
                  <div className="text-xs text-gray-500">{o.brand.name} · {o.slug}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{o._count.keywords} keywords</span>
                  <span>{o._count.generatedPages} pages</span>
                  <span>{o._count.clickLogs} clicks</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${o.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
