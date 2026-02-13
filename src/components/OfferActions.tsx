"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OfferActionsProps {
  campaignId: string;
  offerName: string;
  researchUrls: string[];
}

export function OfferActions({
  campaignId,
  offerName,
  researchUrls,
}: OfferActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function runResearch() {
    if (researchUrls.length === 0) {
      setStatus("Add research URLs (brand URLs) before running research.");
      return;
    }
    setStatus("Researching brand...");
    const response = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setStatus(
        `Research completed! Extracted: ${data.factPack?.keyBenefits?.length || 0} benefits, ${data.factPack?.features?.length || 0} features`,
      );
      router.refresh();
    } else {
      const error = await response.json();
      setStatus(`Research failed: ${error.error || "Unknown error"}`);
    }
  }

  async function generateDraft() {
    setStatus("Generating draft...");
    const draftResponse = await fetch("/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerName, tone: "clear and helpful" }),
    });

    if (!draftResponse.ok) {
      setStatus("Draft failed.");
      return;
    }

    const { draft } = (await draftResponse.json()) as {
      draft: { title: string; body: string; cta: string };
    };

    const createResponse = await fetch("/api/landers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId,
        title: draft.title,
        body: draft.body,
        cta: draft.cta,
      }),
    });

    setStatus(createResponse.ok ? "Draft lander created." : "Draft failed.");
    router.refresh();
  }

  async function provisionSubdomain() {
    setStatus("Provisioning subdomain...");
    const response = await fetch("/api/subdomains/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, offerName }),
    });
    setStatus(response.ok ? "Subdomain provisioned." : "Provision failed.");
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={runResearch}
          className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold"
        >
          Research brand
        </button>
        <button
          type="button"
          onClick={generateDraft}
          className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold"
        >
          Generate draft lander
        </button>
        <button
          type="button"
          onClick={provisionSubdomain}
          className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold"
        >
          Provision subdomain
        </button>
      </div>
      {status && <p className="text-xs text-zinc-500">{status}</p>}
    </div>
  );
}
