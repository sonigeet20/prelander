import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Savvy — Smart Research for Smarter Decisions",
  description: "Independent research guides to help you compare products, services, and pricing across travel, software, finance, and more.",
};

export default async function HomePage() {
  const [brandCount, pageCount, recentPages] = await Promise.all([
    prisma.brand.count(),
    prisma.generatedPage.count({ where: { status: "published" } }),
    prisma.generatedPage.findMany({
      where: { status: "published" },
      include: { offer: { include: { brand: true } }, keyword: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Smart Research for<br />Smarter Decisions
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-6">
            Independent guides to help you compare products, understand pricing, and find the right solution — across travel, software, finance, and more.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <span>{brandCount} brands covered</span>
            <span>·</span>
            <span>{pageCount} guides published</span>
          </div>
        </div>
      </section>

      {/* Recent Guides */}
      {recentPages.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPages.map((page) => {
              const brandSlug = page.offer.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              return (
                <a key={page.id} href={`/guides/${brandSlug}/${page.slug}`} className="block bg-white rounded-xl border p-5 hover:shadow-md transition group">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={`https://www.google.com/s2/favicons?domain=${page.offer.brand.domain}&sz=32`} alt="" width={16} height={16} className="rounded" />
                    <span className="text-xs text-gray-400 font-medium">{page.offer.brand.name}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition line-clamp-2">{page.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{page.metaDescription}</p>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Value Props */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900 mb-1">Independent Research</h3>
              <p className="text-sm text-gray-600">Every guide is written from publicly available data and independent analysis. We do not accept payment for favorable reviews.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-1">Transparent Methodology</h3>
              <p className="text-sm text-gray-600">We clearly explain how we evaluate products, what data we use, and how we reach our conclusions.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">💡</div>
              <h3 className="font-semibold text-gray-900 mb-1">Tailored Guides</h3>
              <p className="text-sm text-gray-600">Our guides cover pricing info, product comparisons, route guides, and buying advice — whatever helps you make better decisions.</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
