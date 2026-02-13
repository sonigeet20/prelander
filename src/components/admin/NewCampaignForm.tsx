"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function NewCampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    offerName: "",
    brandName: "",
    brandImageUrl: "",
    description: "",
    destinationUrl: "",
    researchUrls: "",
    brandUrls: "",
    trackingUrls: "",
    geos: "",
    languages: "",
    popunderEnabled: true,
    silentFetchEnabled: true,
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.offerName.trim()) {
      setError("Campaign name is required");
      return;
    }

    if (!form.destinationUrl.trim()) {
      setError("Destination URL is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerName: form.offerName.trim(),
          brandName: form.brandName.trim() || form.offerName.trim(),
          brandImageUrl: form.brandImageUrl.trim(),
          description: form.description.trim(),
          destinationUrl: form.destinationUrl.trim(),
          researchUrls: form.researchUrls
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean),
          brandUrls: form.brandUrls
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean),
          trackingUrls: form.trackingUrls
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean),
          geos: form.geos
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
          languages: form.languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          popunderEnabled: form.popunderEnabled,
          silentFetchEnabled: form.silentFetchEnabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      const data = await res.json();
      router.push(`/admin/campaigns/${data.campaign.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <span className="text-lg">❌</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Campaign Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm">📋</span>
          Campaign Info
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.offerName}
            onChange={(e) => updateField("offerName", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="e.g. NordVPN Holiday Sale"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name
          </label>
          <input
            type="text"
            value={form.brandName}
            onChange={(e) => updateField("brandName", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="e.g. NordVPN (displayed on the lander)"
          />
          <p className="text-xs text-gray-500 mt-1">The name shown on the preview lander. Defaults to Campaign Name if empty.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand / Hero Image URL
          </label>
          <input
            type="url"
            value={form.brandImageUrl}
            onChange={(e) => updateField("brandImageUrl", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="https://example.com/brand-hero.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">Image shown on the lander hero section. Use a high-quality landscape image (min 900px wide).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none bg-white text-gray-900 placeholder-gray-400"
            placeholder="Brief description of the campaign..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={form.destinationUrl}
            onChange={(e) => updateField("destinationUrl", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="https://offer.example.com/landing"
          />
          <p className="mt-1 text-xs text-gray-500">Where the user is redirected after interaction</p>
        </div>
      </div>

      {/* URLs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b border-green-200 pb-2 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm">🔗</span>
          URLs &amp; Sources
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Research URLs</label>
          <textarea
            value={form.researchUrls}
            onChange={(e) => updateField("researchUrls", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none font-mono text-sm bg-white text-gray-900 placeholder-gray-400"
            placeholder="https://example.com/review-1&#10;https://example.com/review-2"
          />
          <p className="mt-1 text-xs text-gray-500">One URL per line. Used for AI research to generate landing page content.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand URLs</label>
          <textarea
            value={form.brandUrls}
            onChange={(e) => updateField("brandUrls", e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none font-mono text-sm bg-white text-gray-900 placeholder-gray-400"
            placeholder="https://brand-website.com"
          />
          <p className="mt-1 text-xs text-gray-500">One URL per line. Brand websites for logo/style extraction.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URLs</label>
          <textarea
            value={form.trackingUrls}
            onChange={(e) => updateField("trackingUrls", e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none font-mono text-sm bg-white text-gray-900 placeholder-gray-400"
            placeholder="https://tracker.example.com/click?id={click_id}"
          />
          <p className="mt-1 text-xs text-gray-500">One URL per line. Third-party tracking pixels or postback URLs.</p>
        </div>
      </div>

      {/* Targeting */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b border-orange-200 pb-2 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm">🌍</span>
          Targeting
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GEOs</label>
            <input
              type="text"
              value={form.geos}
              onChange={(e) => updateField("geos", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-gray-900 placeholder-gray-400"
              placeholder="US, UK, CA, AU"
            />
            <p className="mt-1 text-xs text-gray-500">Comma-separated country codes</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
            <input
              type="text"
              value={form.languages}
              onChange={(e) => updateField("languages", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-gray-900 placeholder-gray-400"
              placeholder="en, es, fr"
            />
            <p className="mt-1 text-xs text-gray-500">Comma-separated language codes</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b border-purple-200 pb-2 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm">⚡</span>
          Features
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={form.popunderEnabled}
              onChange={(e) => updateField("popunderEnabled", e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div>
              <span className="font-medium text-gray-800">Dual Navigation</span>
              <p className="text-xs text-gray-500 mt-0.5">Open destination in background tab</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={form.silentFetchEnabled}
              onChange={(e) => updateField("silentFetchEnabled", e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div>
              <span className="font-medium text-gray-800">Background Prefetch</span>
              <p className="text-xs text-gray-500 mt-0.5">Track clicks via background request</p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link
          href="/admin/dashboard"
          className="text-gray-600 hover:text-gray-800 font-medium transition"
        >
          ← Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </>
          ) : (
            <>🚀 Create Campaign</>
          )}
        </button>
      </div>
    </form>
  );
}
