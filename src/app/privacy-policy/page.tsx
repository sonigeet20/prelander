export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {currentDate}</p>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              This Privacy Policy explains how Prelander Editorial collects, uses, and protects information
              when you access our review pages and related content.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Information We Collect</h2>
            <p>
              We may collect non-personal information such as browser type, device, general location, and
              anonymized usage data to improve content quality and user experience.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Improve site performance and content relevance.</li>
              <li>Analyze usage trends to enhance editorial coverage.</li>
              <li>Maintain security and prevent abuse.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Cookies</h2>
            <p>
              We may use cookies and similar technologies to remember preferences and measure engagement.
              You can disable cookies in your browser settings if desired.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Third-Party Links</h2>
            <p>
              Our pages may include links to third-party websites. We are not responsible for the privacy
              practices or content of those sites.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at
              <span className="font-semibold"> support@prelander.ai</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
