import { notFound } from "next/navigation";
import { listCampaigns } from "@/lib/campaigns";
import { slugify } from "@/lib/slug";
import { PopunderButton } from "@/components/PopunderButton";
import type { BrandFactPack } from "@/lib/ai-research";

export const dynamic = "force-dynamic";

interface OfferPageProps {
  params: Promise<{ offer: string; cluster: string }>;
}

export async function generateMetadata({ params }: OfferPageProps) {
  const { offer, cluster } = await params;
  const campaigns = await listCampaigns();
  const campaign = campaigns.find((item) => {
    const slug = slugify(item.offerName, 32);
    return slug === offer || item.subdomain === offer;
  });

  if (!campaign) {
    return { title: "Not Found" };
  }

  const factPack = campaign.metadata?.brandFactPack as BrandFactPack | undefined;
  const brandName = factPack?.brandName || campaign.offerName;
  const clusterTitle = cluster.replace(/-/g, " ");
  
  const title = factPack
    ? `${brandName} - ${clusterTitle} | ${factPack.tagline || "Official Guide"}`
    : `${campaign.offerName} - ${clusterTitle} | Official Information`;

  const description = factPack
    ? `${factPack.tagline || ""} ${factPack.keyBenefits.slice(0, 2).join(". ")}.`
    : `Discover ${campaign.offerName}. ${campaign.description}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { offer, cluster } = await params;
  const campaigns = await listCampaigns();
  const campaign = campaigns.find((item) => {
    const slug = slugify(item.offerName, 32);
    return slug === offer || item.subdomain === offer;
  });

  if (!campaign) {
    notFound();
  }

  const clickHref = `/click/${offer}/${cluster}`;
  const popunderUrl = campaign.trackingUrls[0] ?? campaign.destinationUrl;
  const clusterTitle = cluster.replace(/-/g, " ");

  // Get brand fact pack from research
  const factPack = campaign.metadata?.brandFactPack as BrandFactPack | undefined;
  const brandName = factPack?.brandName || campaign.offerName;
  const tagline = factPack?.tagline || campaign.description;
  const benefits = factPack?.keyBenefits || [
    "Easy to use platform",
    "Trusted by thousands",
    "Secure and reliable",
  ];
  const features = factPack?.features || [
    "User-friendly interface",
    "24/7 customer support",
    "Mobile and desktop access",
    "Secure platform",
  ];
  const trustSignals = factPack?.trustSignals || ["Verified Service", "Secure Platform"];
  const faqs = factPack?.faqItems || [];
  const category = factPack?.category || "Service Provider";

  return (
    <div className="min-h-screen bg-white">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.slice(0, 3).map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">{brandName}</h2>
            </div>
            <div>
              <a
                href={clickHref}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Visit Official Site
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {brandName}: {clusterTitle}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {tagline}
            </p>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {trustSignals.map((signal, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  ✓ {signal}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <PopunderButton
                href={clickHref}
                popunderUrl={popunderUrl}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started with {brandName} →
              </PopunderButton>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose {brandName}?
            </h2>
            <p className="text-gray-600">
              Here's what makes {brandName} stand out in {category.toLowerCase()}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.slice(0, 3).map((benefit, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                <div className="text-blue-600 text-2xl mb-3">✓</div>
                <h3 className="text-lg font-semibold mb-2">{benefit}</h3>
                <p className="text-gray-600 text-sm">
                  {factPack?.useCases[idx] || `Experience the best ${category.toLowerCase()} has to offer.`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Features
            </h2>
            <p className="text-gray-600">
              Everything you need in one powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.slice(0, 6).map((feature, idx) => {
              const icons = ["🎯", "💰", "⚡", "🔒", "📱", "🌟"];
              return (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{icons[idx % icons.length]}</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature}</h3>
                  <p className="text-gray-600 text-sm">
                    {factPack?.targetAudience 
                      ? `Perfect for ${factPack.targetAudience.toLowerCase()}`
                      : "Designed to enhance your experience"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join {trustSignals[0] || "thousands"} who trust {brandName}
          </p>
          <PopunderButton
            href={clickHref}
            popunderUrl={popunderUrl}
            className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 shadow-lg"
          >
            Visit {brandName} Now →
          </PopunderButton>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <summary className="font-semibold cursor-pointer text-lg text-gray-900">
                    {faq.question}
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Generic FAQ fallback */}
      {faqs.length === 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <details className="bg-gray-50 p-6 rounded-lg">
                <summary className="font-semibold cursor-pointer text-lg">
                  What is {brandName}?
                </summary>
                <p className="mt-4 text-gray-600">
                  {brandName} is a leading platform in {category.toLowerCase()}. 
                  {tagline}
                </p>
              </details>

              <details className="bg-gray-50 p-6 rounded-lg">
                <summary className="font-semibold cursor-pointer text-lg">
                  How do I get started?
                </summary>
                <p className="mt-4 text-gray-600">
                  Click the "Get Started" button above to visit the official website 
                  and begin using {brandName} immediately.
                </p>
              </details>

              {factPack?.pricingInfo && (
                <details className="bg-gray-50 p-6 rounded-lg">
                  <summary className="font-semibold cursor-pointer text-lg">
                    What's the pricing?
                  </summary>
                  <p className="mt-4 text-gray-600">
                    {factPack.pricingInfo}
                  </p>
                </details>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About {brandName}</h3>
              <p className="text-gray-400 text-sm">{tagline}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              <p className="text-gray-400 text-sm">{category}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Started</h3>
              <a
                href={clickHref}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Visit Official Website →
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>
              This is an informational page. Clicking links may redirect to the official 
              {brandName} website. We may earn a commission from qualifying actions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
