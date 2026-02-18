"use client";

import { useState, useEffect, useCallback } from "react";

interface Brand { id: string; name: string; domain: string; description: string | null; verticalType: string | null; classifiedAt: string | null; _count: { offers: number } }

export function BrandsManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ domain: "", name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/brands");
    if (res.ok) { const data = await res.json(); setBrands(data.brands || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.domain || !formData.name) return;
    setSaving(true);
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) { setShowForm(false); setFormData({ domain: "", name: "", description: "" }); fetchBrands(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand and all its offers?")) return;
    await fetch(`/api/brands/${id}`, { method: "DELETE" });
    fetchBrands();
  };

  const handleReclassify = async (id: string) => {
    await fetch("/api/brands/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: id }),
    });
    fetchBrands();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Brands</h2>
          <p className="text-sm text-gray-500">Manage brands and their vertical classification.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          {showForm ? "Cancel" : "+ Add Brand"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Skyscanner" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Domain *</label>
              <input type="text" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="skyscanner.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Flight comparison platform" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Creating…" : "Create Brand (auto-classifies vertical)"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading brands…</div>
      ) : brands.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
          <div className="text-4xl mb-3">🏢</div>
          <p className="text-gray-600 font-medium">No brands yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first brand to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {brands.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`} alt="" width={32} height={32} className="rounded-lg" />
                <div>
                  <div className="font-semibold text-gray-900">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.domain} · {b._count.offers} offer(s)</div>
                </div>
                {b.verticalType && (
                  <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">{b.verticalType}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleReclassify(b.id)} className="text-xs text-gray-500 hover:text-indigo-600 transition px-2 py-1">Reclassify</button>
                <a href={`/admin/offers?brandId=${b.id}`} className="text-xs text-indigo-600 hover:underline px-2 py-1">Offers →</a>
                <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:text-red-700 transition px-2 py-1">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
