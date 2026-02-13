import { notFound } from "next/navigation";
import { listCampaigns } from "@/lib/campaigns";
import { slugify } from "@/lib/slug";
import { PopunderButton } from "@/components/PopunderButton";

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
    return {
      title: "Not Found",
    };
  }

  const clusterTitle = cluster.replace(/-/g, " ");
  return {
    title: `${campaign.offerName} - ${clusterTitle} | Official Information & Reviews`,
    description: `Discover everything about ${campaign.offerName}. Read verified reviews, compare features, pricing, and get started today. ${campaign.description}`,
    openGraph: {
      title: `${campaign.offerName} - ${clusterTitle}`,
      description: campaign.description,
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

  return (
    <div className="min-h-screen bg-white">
      {/* Schema.org structured data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `What is ${campaign.offerName}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${campaign.offerName} is a trusted service provider offering ${campaign.description || "premium solutions"}. We help users get the best value with verified quality and transparent pricing.`,
                },
              },
              {
                "@type": "Question",
                name: `How do I get started with ${campaign.offerName}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Click the 'Get Started' button to visit the official website and complete the signup process. It takes just a few minutes to begin.",
                },
              },
              {
                "@type": "Question",
                name: `Is ${campaign.offerName} available in my location?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${campaign.offerName} is available in ${campaign.geos.join(", ") || "multiple regions"}. Check the official site for specific availability details.`,
                },
              },
            ],
          }),
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="border-b border-zinc-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="text-lg font-semibold text-zinc-900">{campaign.offerName}</div>
          <PopunderButton href={clickHref} popunderUrl={popunderUrl} enabled={campaign.popunderEnabled}>
            <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              Visit Official Site
            </span>
          </PopunderButton>
        </div>
      </nav>

      {/* Hero Section - Above the fold optimization */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Verified & Trusted by Thousands</span>
              </div>
              
              <h1 className="mb-6 text-4xl font-bold leading-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                {campaign.offerName}:<br />
                {clusterTitle}
              </h1>
              
              <p className="mb-8 text-lg leading-relaxed text-zinc-700">
                {campaign.description || `Get comprehensive information about ${campaign.offerName}. Compare features, read verified reviews, and make informed decisions with our detailed guide.`}
              </p>

              <div className="flex flex-wrap gap-4">
                <PopunderButton href={clickHref} popunderUrl={popunderUrl} enabled={campaign.popunderEnabled}>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700">
                    Get Started Now
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </PopunderButton>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure & Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-6 text-center">
                  <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Quick Start Guide
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900">
                    Get Started in Minutes
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900">Visit Official Site</div>
                      <div className="text-sm text-zinc-600">Click to access the verified platform</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900">Create Your Account</div>
                      <div className="text-sm text-zinc-600">Quick signup with your email</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900">Start Using</div>
                      <div className="text-sm text-zinc-600">Access all features immediately</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <PopunderButton href={clickHref} popunderUrl={popunderUrl} enabled={campaign.popunderEnabled}>
                    <span className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
                      Start Now →
                    </span>
                  </PopunderButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Content Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 sm:text-4xl">
              Everything You Need to Know About {campaign.offerName}
            </h2>
            <p className="text-lg text-zinc-600">
              Comprehensive information to help you make the right decision
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900">Fast & Efficient</h3>
              <p className="leading-relaxed text-zinc-600">
                Experience lightning-fast performance with {campaign.offerName}. Our optimized platform ensures you get results quickly without compromising on quality. Designed for maximum efficiency and user satisfaction.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900">Secure & Private</h3>
              <p className="leading-relaxed text-zinc-600">
                Your security is our top priority. {campaign.offerName} uses enterprise-grade encryption and follows industry best practices to protect your data. All transactions are monitored and secured 24/7.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900">Best Value</h3>
              <p className="leading-relaxed text-zinc-600">
                Get premium features at competitive prices with {campaign.offerName}. We offer transparent pricing with no hidden fees. Compare our value proposition and see why thousands choose us for their needs.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900">24/7 Support</h3>
              <p className="leading-relaxed text-zinc-600">
                Our dedicated support team is available around the clock to assist you. Get help whenever you need it through multiple channels including chat, email, and phone support with fast response times.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900">Easy Integration</h3>
              <p className="leading-relaxed text-zinc-600">
                {campaign.offerName} works seamlessly with your existing tools and workflows. Simple setup process with comprehensive documentation and guides to get you started in minutes, not hours.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900">Trusted by Thousands</h3>
              <p className="leading-relaxed text-zinc-600">
                Join a growing community of satisfied users who rely on {campaign.offerName} daily. Read verified reviews and success stories from real users who achieved their goals with our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Important for Google Ads Quality */}
      <section className="bg-zinc-50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-zinc-600">
              Get answers to common questions about {campaign.offerName}
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                What is {campaign.offerName} and how does it work?
              </h3>
              <p className="leading-relaxed text-zinc-600">
                {campaign.offerName} is a trusted service provider that helps users {campaign.description || "achieve their goals efficiently"}. Our platform is designed to be intuitive and user-friendly, allowing you to get started immediately without any technical expertise. Simply sign up, complete your profile, and begin using all available features right away.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                How do I get started with {campaign.offerName}?
              </h3>
              <p className="leading-relaxed text-zinc-600">
                Getting started is simple and takes just a few minutes. Click the "Get Started" button to visit the official website, create your account using your email address, verify your identity, and you'll have immediate access to all features. Our onboarding process guides you through each step to ensure a smooth start.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                Is {campaign.offerName} available in my region?
              </h3>
              <p className="leading-relaxed text-zinc-600">
                {campaign.offerName} is currently available in {campaign.geos.length > 0 ? campaign.geos.join(", ") : "multiple regions worldwide"}. We continue to expand our service area regularly. Visit the official website to check specific availability for your location and see if we support your local currency and payment methods.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                What are the pricing options for {campaign.offerName}?
              </h3>
              <p className="leading-relaxed text-zinc-600">
                {campaign.offerName} offers flexible pricing plans designed to suit different needs and budgets. Visit the official website to view current pricing, available packages, and any promotional offers. All plans include core features with transparent pricing and no hidden fees. You can upgrade or downgrade your plan at any time.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                Is my data secure with {campaign.offerName}?
              </h3>
              <p className="leading-relaxed text-zinc-600">
                Yes, security is our top priority. {campaign.offerName} uses enterprise-grade encryption, secure data centers, and follows industry best practices to protect your information. We comply with data protection regulations and never share your personal information with third parties without your explicit consent. Regular security audits ensure your data remains safe.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                What kind of customer support does {campaign.offerName} provide?
              </h3>
              <p className="leading-relaxed text-zinc-600">
                We offer comprehensive customer support through multiple channels including 24/7 live chat, email support with responses within 24 hours, detailed documentation and video tutorials, and an active community forum. Premium plans may include priority support with dedicated account managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-16 text-center text-white shadow-2xl sm:px-16">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to Experience {campaign.offerName}?
            </h2>
            <p className="mb-8 text-lg text-blue-50">
              Join thousands of satisfied users. Get started today and see the difference for yourself.
            </p>
            <PopunderButton href={clickHref} popunderUrl={popunderUrl} enabled={campaign.popunderEnabled}>
              <span className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50">
                Get Started Now
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </PopunderButton>
            <p className="mt-6 text-sm text-blue-100">
              No credit card required • Free to start • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer with transparency info */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold text-zinc-900">About</h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>Company Information</li>
                <li>Contact Us</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-zinc-900">Support</h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community Forum</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-zinc-900">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-zinc-900">Connect</h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>Facebook</li>
                <li>Twitter</li>
                <li>LinkedIn</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-zinc-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
              <p>
                © 2026 {campaign.offerName}. All rights reserved.
              </p>
              <p className="text-center">
                <strong>Affiliate Disclosure:</strong> We may earn a commission from qualifying purchases or actions.
                This helps us provide free content. Read our full disclosure policy.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
