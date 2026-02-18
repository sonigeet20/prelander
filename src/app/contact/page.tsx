import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Savvy",
  description:
    "Get in touch with the Savvy editorial team. We welcome feedback, corrections, and partnership inquiries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50 to-white py-14">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Contact Us
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Have a question, correction, or suggestion? We'd love to hear from you.
              Our editorial team typically responds within 1–2 business days.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Editorial Team</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  For questions about our content, corrections, or feedback on any of our
                  research guides.
                </p>
                <a
                  href="mailto:hello@savvy.guide"
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  hello@savvy.guide
                </a>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Partnerships</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Interested in collaborating or have a partnership inquiry?
                  Reach out to our partnerships team.
                </p>
                <a
                  href="mailto:partnerships@savvy.guide"
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  partnerships@savvy.guide
                </a>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Report an Issue</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  If you believe any information on our site is inaccurate or outdated,
                  please let us know. We take accuracy seriously and will investigate
                  and update our content promptly.
                </p>
              </div>
            </div>

            {/* FAQ / Response expectations */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked</h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    How long does it take to get a response?
                  </h3>
                  <p className="text-sm text-gray-600">
                    We aim to respond to all inquiries within 1–2 business days.
                    Complex questions may take slightly longer.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Can I request a review of a specific product?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Yes! We welcome suggestions for new guides. Email our editorial
                    team and we'll consider adding it to our research pipeline.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Do you accept sponsored content?
                  </h3>
                  <p className="text-sm text-gray-600">
                    No. All of our editorial content is independently produced.
                    We do not accept payment for favorable reviews.
                    See our <a href="/about#disclosure" className="text-indigo-600 underline">Affiliate Disclosure</a> for details.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    I found an error in one of your guides.
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please email <a href="mailto:hello@savvy.guide" className="text-indigo-600 underline">hello@savvy.guide</a> with
                    the guide URL and the specific correction. We'll review and update it promptly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
