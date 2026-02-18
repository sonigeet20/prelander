import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | Savvy",
  description: "Learn how Savvy collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-indigo-50 to-white py-14">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: February 2026</p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              This Privacy Policy explains how Savvy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses,
              and protects information when you visit our website and use our research guides.
              We are committed to protecting your privacy and being transparent about our data practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of non-personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Browser and device information:</strong> Browser type, operating system, screen resolution, and device type.</li>
              <li><strong>Usage data:</strong> Pages visited, time spent on pages, referral source, and general navigation patterns.</li>
              <li><strong>Approximate location:</strong> General geographic region based on IP address (we do not collect precise location data).</li>
              <li><strong>Click data:</strong> When you click on affiliate links, we record the click to track which guides are most useful to our readers.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> collect personal information such as your name, email address, or
              payment details unless you voluntarily contact us via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Improve site performance, content quality, and user experience.</li>
              <li>Analyze usage trends to enhance editorial coverage and guide relevance.</li>
              <li>Track affiliate link clicks to measure the effectiveness of our content.</li>
              <li>Maintain security and prevent abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies and Tracking Technologies</h2>
            <p className="mb-3">We use cookies and similar technologies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential cookies:</strong> To remember your preferences and ensure the site functions correctly.</li>
              <li><strong>Analytics cookies:</strong> To understand how visitors use our site and improve our content.</li>
              <li><strong>Affiliate tracking cookies:</strong> When you click on affiliate links, cookies may be set by our affiliate partners to track referrals. These cookies are used to attribute purchases to our site so we can earn commissions.</li>
              <li><strong>Advertising parameters:</strong> If you arrive via an advertising link, we may store advertising identifiers (such as click IDs) in cookies to measure campaign performance.</li>
            </ul>
            <p className="mt-3">
              You can control or disable cookies through your browser settings. Please note that
              disabling cookies may affect site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Affiliate Links and Third-Party Services</h2>
            <p className="mb-3">
              Our site contains affiliate links to third-party products and services. When you click on
              these links, you will be directed to the third-party website. We are not responsible for
              the privacy practices or content of those external sites.
            </p>
            <p>
              We encourage you to review the privacy policies of any third-party sites you visit through
              our links. Our affiliate relationships are disclosed on each guide page and in our{" "}
              <a href="/about#disclosure" className="text-indigo-600 underline">Affiliate Disclosure</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share
              anonymized, aggregated usage data with analytics providers to improve our service. We may
              also disclose information if required by law or to protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
            <p>
              We retain usage data and click logs for a reasonable period to analyze trends and improve
              our content. Aggregated data may be retained indefinitely. If you contact us via email,
              we retain your correspondence for as long as necessary to address your inquiry.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, or delete your
              personal data, or to object to certain data processing. To exercise these rights, please
              contact us at{" "}
              <a href="mailto:hello@savvy.guide" className="text-indigo-600 underline">hello@savvy.guide</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated &quot;Last updated&quot; date. Your continued use of the site constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:hello@savvy.guide" className="text-indigo-600 underline">hello@savvy.guide</a>.
            </p>
          </section>

          <div className="pt-6 border-t">
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              ← Back to Home
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
