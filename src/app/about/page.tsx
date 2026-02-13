export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | Prelander Editorial",
  description:
    "Learn about our editorial team, review methodology, and affiliate disclosure policy.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold">About Prelander Editorial</h1>
          <p className="text-slate-300 mt-2">
            Independent product reviews to help you make informed decisions.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Who We Are */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Prelander Editorial is an independent review platform. Our team
            researches products and services across multiple categories —
            including travel, cybersecurity, finance, and software — to provide
            consumers with clear, honest, and transparent information.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We are not a news outlet, marketplace, or retailer. We do not sell
            products. Our mission is to help people compare options and make
            better purchasing decisions based on factual, well-researched
            content.
          </p>
        </section>

        {/* Methodology */}
        <section id="methodology">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How We Review Products
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Every review on our site follows a consistent methodology. Our
            editorial team evaluates products based on publicly available
            information, official documentation, and independent testing where
            possible. We consider the following criteria:
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Features &amp; Functionality:</strong> What does the
              product offer? How does its feature set compare to competitors in
              the same category?
            </li>
            <li>
              <strong>Pricing &amp; Transparency:</strong> Is the pricing
              clearly communicated? Does the value justify the cost? Are there
              hidden fees?
            </li>
            <li>
              <strong>User Experience:</strong> How easy is the product to set
              up and use? Is the interface intuitive? Is customer support
              accessible?
            </li>
            <li>
              <strong>Reputation &amp; Trust:</strong> What do reputable
              third-party review platforms say? Does the company have a track
              record of reliability?
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            We assign an assessment score on a scale of 1–10 based on these
            criteria. This score represents our editorial opinion and should not
            be taken as an absolute rating. Individual experiences may vary, and
            we always recommend visiting the official product website for the
            most current information.
          </p>
        </section>

        {/* Affiliate Disclosure */}
        <section id="disclosure">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Affiliate Disclosure
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Some of the links on our website are affiliate links. This means
            that if you click on a link and subsequently make a purchase, we may
            receive a small commission at no additional cost to you. This
            commission helps us maintain the site and continue producing free
            content.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Important:</strong> Our affiliate relationships do not
            influence our editorial content. Reviews are written independently by
            our editorial team. We do not accept payment from companies in
            exchange for favorable reviews, and our assessment scores are
            determined solely by our evaluation criteria described above.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We clearly label affiliate links and advertising on our pages. If
            you have questions about our affiliate relationships, please contact
            us at{" "}
            <a
              href="mailto:support@prelander.ai"
              className="text-indigo-600 underline"
            >
              support@prelander.ai
            </a>
            .
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions, corrections, or feedback about any of our reviews,
            please reach out to our editorial team at{" "}
            <a
              href="mailto:support@prelander.ai"
              className="text-indigo-600 underline"
            >
              support@prelander.ai
            </a>
            . We take accuracy seriously and will update our content promptly if
            any errors are identified.
          </p>
        </section>

        {/* Back link */}
        <div className="pt-6 border-t">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Home
          </a>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-xs py-6 text-center">
        © {new Date().getFullYear()} Prelander Editorial. All rights reserved.
      </footer>
    </div>
  );
}
