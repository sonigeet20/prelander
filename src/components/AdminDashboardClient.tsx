"use client";

import Link from "next/link";
import { AdminLayout } from "./AdminLayout";

interface CampaignData {
  id: string;
  offerName: string;
  status: string;
  subdomain: string | null;
  autoTriggerOnInaction: boolean;
  autoTriggerDelay: number;
  clickCount: number;
  conversionCount: number;
}

interface AdminDashboardClientProps {
  userEmail?: string;
  campaigns: CampaignData[];
  totalClicks: number;
  totalConversions: number;
  activeCampaigns: number;
  conversionRate: string;
}

export function AdminDashboardClient({
  userEmail,
  campaigns,
  totalClicks,
  totalConversions,
  activeCampaigns,
  conversionRate,
}: AdminDashboardClientProps) {
  return (
    <AdminLayout userEmail={userEmail}>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Campaigns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Campaigns</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{campaigns.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                🎯
              </div>
            </div>
            <p className="text-xs text-green-600 mt-4 font-semibold">
              {activeCampaigns} active
            </p>
          </div>

          {/* Total Clicks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Clicks</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                👆
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">All time</p>
          </div>

          {/* Total Conversions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Conversions</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{totalConversions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                ✅
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">All time</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Conversion Rate</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{conversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                📊
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">Average</p>
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your offers and landing pages</p>
            </div>
            <Link
              href="/admin/campaigns/new"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-semibold flex items-center gap-2"
            >
              <span>➕</span>
              New Campaign
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-3">🎯</div>
              <p className="text-gray-500 font-medium">No campaigns yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first campaign to get started</p>
              <Link
                href="/admin/campaigns/new"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Offer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Conv. Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Auto Trigger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((campaign) => {
                    const campaignConvRate =
                      campaign.clickCount > 0
                        ? ((campaign.conversionCount / campaign.clickCount) * 100).toFixed(2)
                        : "0.00";
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {campaign.offerName}
                          {campaign.subdomain && (
                            <div className="text-xs text-gray-500 font-normal mt-1">
                              {campaign.subdomain}.prelander.ai
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                              campaign.status === "active"
                                ? "bg-green-100 text-green-700"
                                : campaign.status === "paused"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-semibold text-gray-900">
                            {campaign.clickCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-semibold text-gray-900">
                            {campaign.conversionCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-semibold text-purple-600">{campaignConvRate}%</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {campaign.autoTriggerOnInaction ? (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-green-700 font-semibold text-xs">
                                {campaign.autoTriggerDelay}ms
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">Off</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/admin/campaigns/${campaign.id}`}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 hover:underline"
                          >
                            Edit
                            <span>→</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="font-bold text-gray-900 mb-3">💡 Getting Started</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✅ Create campaigns to launch landing pages</li>
              <li>✅ Configure auto-trigger for popunders</li>
              <li>✅ Track clicks and conversions in real-time</li>
              <li>✅ Deploy subdomains on Vercel</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="font-bold text-gray-900 mb-3">🚀 Next Steps</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>📊 Monitor campaign performance</li>
              <li>⚙️ Configure auto-trigger delays</li>
              <li>🔗 Set up custom subdomains</li>
              <li>💰 Track revenue & conversions</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
