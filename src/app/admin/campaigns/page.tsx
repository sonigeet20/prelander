import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const campaigns = await prisma.campaign.findMany({
    include: {
      _count: {
        select: { clickSessions: true, conversions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout userEmail={session.user?.email}>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-1">Manage all your prelander campaigns</p>
          </div>
          <Link
            href="/admin/campaigns/new"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-semibold flex items-center gap-2 shadow-sm"
          >
            ➕ New Campaign
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-800">No campaigns yet</h2>
            <p className="text-gray-500 mt-2">Create your first campaign to get started</p>
            <Link
              href="/admin/campaigns/new"
              className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversions</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{campaign.offerName}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.description || campaign.destinationUrl}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-700"
                          : campaign.status === "paused"
                          ? "bg-yellow-100 text-yellow-700"
                          : campaign.status === "archived"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">
                      {campaign._count.clickSessions}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">
                      {campaign._count.conversions}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {campaign.popunderEnabled && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Popunder</span>
                        )}
                        {campaign.silentFetchEnabled && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Silent</span>
                        )}
                        {campaign.autoTriggerOnInaction && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Auto</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
