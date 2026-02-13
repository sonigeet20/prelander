"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OfferForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const data = new FormData(form);

    const offerName = String(data.get("offerName") || "").trim();
    const description = String(data.get("description") || "").trim();
    const destinationUrl = String(data.get("destinationUrl") || "").trim();
    const trackingUrls = String(data.get("trackingUrls") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const researchUrls = String(data.get("researchUrls") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const brandUrls = String(data.get("brandUrls") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const geos = String(data.get("geos") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const languages = String(data.get("languages") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!offerName) {
      setError("Offer name is required.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerName,
        description,
        destinationUrl,
        trackingUrls,
        researchUrls,
        brandUrls,
        geos,
        languages,
        popunderEnabled: Boolean(data.get("popunderEnabled")),
        silentFetchEnabled: Boolean(data.get("silentFetchEnabled")),
      }),
    });

    if (!response.ok) {
      setError("Failed to create offer.");
      setLoading(false);
      return;
    }

    form.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Offer name</label>
        <input
          name="offerName"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Example Brand"
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Short offer summary"
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Destination URL</label>
        <input
          name="destinationUrl"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="https://merchant.example.com"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Tracking URLs (comma separated)</label>
        <input
          name="trackingUrls"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="https://track.example.com/abc"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Research URLs (comma separated)</label>
        <input
          name="researchUrls"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="https://brand.example.com/pricing"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Brand URLs (comma separated)</label>
        <input
          name="brandUrls"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="https://brand.example.com"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Geos</label>
          <input
            name="geos"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            placeholder="US, CA"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Languages</label>
          <input
            name="languages"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            placeholder="en, es"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input name="popunderEnabled" type="checkbox" />
          Enable dual navigation
        </label>
        <label className="inline-flex items-center gap-2">
          <input name="silentFetchEnabled" type="checkbox" />
          Enable background prefetch (after click)
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create offer"}
      </button>
    </form>
  );
}
