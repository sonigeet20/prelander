import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Use | Savvy",
  description: "Terms and conditions for using the Savvy research platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-indigo-50 to-white py-14">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms of Use</h1>
            <p className="text-gray-500 text-sm">Last updated: February 2026</p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the Savvy website (&quot;the
            Site&quot;), you accept and agree to be bound by these Terms of Use.
            If you do not agree to these terms, please do not use the Site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            2. Nature of Content
          </h2>
          <p className="mb-3">
            The content on this Site consists of editorial reviews, opinions, and
            informational articles. Our reviews represent the opinions of our
            editorial team based on publicly available information and
            independent research.
          </p>
          <p>
            <strong>
              The content is provided for informational purposes only and should
              not be construed as professional advice.
            </strong>{" "}
            We recommend that you conduct your own research and visit official
            product websites before making any purchasing decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            3. Affiliate Links
          </h2>
          <p>
            The Site contains affiliate links to third-party products and
            services. When you click on these links and make a purchase, we may
            receive a commission. This does not affect the price you pay. Our
            affiliate relationships do not influence our editorial content or
            assessment scores. For more information, see our{" "}
            <a
              href="/about#disclosure"
              className="text-indigo-600 underline"
            >
              Affiliate Disclosure
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            4. Accuracy of Information
          </h2>
          <p>
            While we strive to keep our content accurate and up-to-date, we
            cannot guarantee that all information on the Site is complete,
            current, or error-free. Product features, pricing, and availability
            are subject to change by the respective companies at any time. We
            encourage users to verify information directly with the product
            provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            5. Intellectual Property
          </h2>
          <p>
            All editorial content, design, and code on this Site are the
            property of Savvy or its licensors. Product names,
            logos, and trademarks mentioned on the Site belong to their
            respective owners and are used for identification purposes only.
            Their use does not imply endorsement by or affiliation with
            Savvy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            6. Limitation of Liability
          </h2>
          <p>
            Savvy shall not be liable for any direct, indirect,
            incidental, or consequential damages arising from your use of the
            Site or reliance on any content provided herein. Use the Site at
            your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            7. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Use at any time.
            Changes will be effective immediately upon posting on this page.
            Your continued use of the Site constitutes acceptance of the updated
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            8. Contact
          </h2>
          <p>
            For questions about these Terms of Use, please contact us at{" "}
            <a
              href="mailto:hello@savvy.guide"
              className="text-indigo-600 underline"
            >
              hello@savvy.guide
            </a>
            .
          </p>
        </section>

        <div className="pt-6 border-t">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Home
          </a>
        </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
