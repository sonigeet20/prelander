import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/campaigns";
import { listLandersByCampaign } from "@/lib/landers";
import { OfferActions } from "@/components/OfferActions";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

interface OfferDetailProps {
  params: Promise<{ id: string }>;
}

export default async function OfferDetailPage({ params }: OfferDetailProps) {
  const { id } = await params;
  const campaign = await getCampaignById(id);
  if (!campaign) {
    notFound();
  }

  const landers = await listLandersByCampaign(campaign.id);
  const previewSlug = campaign.subdomain ?? slugify(campaign.offerName, 32);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <Link href="/" className="text-xs font-semibold text-zinc-500 underline">
          Back to offers
        </Link>

        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Offer detail
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {campaign.offerName}
          </h1>
          <p className="text-sm text-zinc-600">{campaign.description}</p>
        </header>

        <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Actions</h2>
          
          {campaign.lastResearchedAt && campaign.metadata?.brandFactPack && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                ✓ Brand research completed on{" "}
                {new Date(campaign.lastResearchedAt).toLocaleString()}
                <span className="block mt-1 text-green-700">
                  Extracted: {campaign.metadata.brandFactPack.keyBenefits?.length || 0} benefits, 
                  {" "}{campaign.metadata.brandFactPack.features?.length || 0} features,
                  {" "}{campaign.metadata.brandFactPack.faqItems?.length || 0} FAQs
                </span>
              </p>
            </div>
          )}
          
          <OfferActions
            campaignId={campaign.id}
            offerName={campaign.offerName}
            researchUrls={campaign.researchUrls}
          />
        </section>

        <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Configuration</h2>
          <dl className="grid gap-3 text-sm text-zinc-600">
            <div>
              <dt className="font-medium text-zinc-900">Destination URL</dt>
              <dd>{campaign.destinationUrl || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Tracking URLs</dt>
              <dd>{campaign.trackingUrls.join(", ") || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Research URLs</dt>
              <dd>{campaign.researchUrls.join(", ") || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Subdomain</dt>
              <dd>{campaign.subdomain || "Not provisioned"}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Preview</dt>
              <dd>
                <Link
                  href={`/offer/${previewSlug}/default`}
                  className="text-xs font-semibold text-zinc-900 underline"
                >
                  Open preview
                </Link>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Geos</dt>
              <dd>{campaign.geos.join(", ") || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Languages</dt>
              <dd>{campaign.languages.join(", ") || "None"}</dd>
            </div>
          </dl>
        </section>

        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Landers</h2>
          {landers.length === 0 ? (
            <p className="text-sm text-zinc-500">No landers created yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {landers.map((lander) => (
                <div
                  key={lander.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold text-zinc-900">
                    {lander.title}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {lander.cta}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
