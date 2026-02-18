import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [brandCount, offerCount, keywordCount, pageCount, publishedCount, clickCount] = await Promise.all([
    prisma.brand.count(),
    prisma.offer.count(),
    prisma.keyword.count(),
    prisma.generatedPage.count(),
    prisma.generatedPage.count({ where: { status: "published" } }),
    prisma.clickLog.count(),
  ]);

  const recentPages = await prisma.generatedPage.findMany({
    include: { offer: { include: { brand: true } }, keyword: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
      <div className="max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Content Engine Overview</h2>
          <p className="text-gray-500 mt-1">Manage brands, generate intent-aligned pages, and monitor compliance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Brands", value: brandCount, icon: "🏢", href: "/admin/brands" },
            { label: "Offers", value: offerCount, icon: "🎯", href: "/admin/offers" },
            { label: "Keywords", value: keywordCount, icon: "🔑" },
            { label: "Pages", value: pageCount, icon: "📄", href: "/admin/pages" },
            { label: "Published", value: publishedCount, icon: "✅" },
            { label: "Clicks", value: clickCount, icon: "👆" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
              {s.href && <Link href={s.href} className="text-xs text-indigo-600 hover:underline mt-1 inline-block">View →</Link>}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/brands" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">+ Add Brand</Link>
            <Link href="/admin/offers" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">+ Create Offer</Link>
            <Link href="/admin/pages" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">View All Pages</Link>
          </div>
        </div>

        {/* Recent Pages */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Recently Generated Pages</h3>
          {recentPages.length === 0 ? (
            <p className="text-gray-400 text-sm">No pages generated yet. Add a brand → create an offer → add keywords → generate pages.</p>
          ) : (
            <div className="space-y-3">
              {recentPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-gray-900 truncate max-w-md">{page.title}</div>
                    <div className="text-xs text-gray-500">{page.offer.brand.name} · {page.keyword?.keyword || page.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${page.status === "published" ? "bg-green-100 text-green-700" : page.status === "compliant" ? "bg-blue-100 text-blue-700" : page.status === "review" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                      {page.status}
                    </span>
                    {page.complianceScore != null && <span className="text-xs text-gray-400">{page.complianceScore}%</span>}
                    <Link href={`/admin/pages/${page.id}`} className="text-xs text-indigo-600 hover:underline">View →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
