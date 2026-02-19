"use client";

import { useEffect, useState } from "react";

interface ClickLog {
  id: string;
  cluster: string | null;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  destinationUrl: string;
  createdAt: string;
}

interface AnalyticsSummary {
  totalClicks: number;
  totalConversions: number;
  totalOffers: number;
  clicksLast24h: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  recentClicks: ClickLog[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  // Parse user agents for device breakdown
  const deviceBreakdown = data.recentClicks.reduce((acc, click) => {
    const ua = click.userAgent?.toLowerCase() || "";
    let device = "Unknown";
    if (ua.includes("mobile") || ua.includes("android")) device = "Mobile";
    else if (ua.includes("tablet") || ua.includes("ipad")) device = "Tablet";
    else if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider")) device = "Bot";
    else if (ua.includes("mac") || ua.includes("windows") || ua.includes("linux")) device = "Desktop";
    
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Parse referrers
  const referrerBreakdown = data.recentClicks.reduce((acc, click) => {
    const ref = click.referer || "Direct";
    const key = ref === "Direct" ? "Direct" : new URL(ref).pathname;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Parse geo from IP (rough estimate - would need real geo-ip service)
  const hasGoogleAds = data.recentClicks.some(c => c.gclid || c.gbraid || c.wbraid);
  const realUsers = data.recentClicks.filter(c => {
    const ua = c.userAgent?.toLowerCase() || "";
    return !ua.includes("bot") && !ua.includes("crawler") && !ua.includes("spider");
  });

  const conversionRate = data.summary.totalClicks > 0
    ? ((data.summary.totalConversions / data.summary.totalClicks) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time click tracking and engagement metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span>🔄</span> Refresh
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh (10s)</span>
          </label>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-4xl mb-2">👆</div>
          <div className="text-3xl font-bold">{data.summary.totalClicks}</div>
          <div className="text-indigo-100 text-sm">Total Clicks</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold">{data.summary.totalConversions}</div>
          <div className="text-green-100 text-sm">Conversions</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold">{data.summary.clicksLast24h}</div>
          <div className="text-orange-100 text-sm">Last 24 Hours</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold">{conversionRate}%</div>
          <div className="text-blue-100 text-sm">Conversion Rate</div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>👤</span> Real Users
          </h3>
          <div className="text-2xl font-bold text-gray-900">{realUsers.length}</div>
          <div className="text-sm text-gray-500 mt-1">Excluding bots ({data.recentClicks.length - realUsers.length} bot visits)</div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>📡</span> Google Ads Traffic
          </h3>
          <div className="text-2xl font-bold text-gray-900">{hasGoogleAds ? "Detected" : "None"}</div>
          <div className="text-sm text-gray-500 mt-1">
            {hasGoogleAds ? "GCLID/GBRAID present" : "No ad click IDs found"}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>🎯</span> Active Offers
          </h3>
          <div className="text-2xl font-bold text-gray-900">{data.summary.totalOffers}</div>
          <div className="text-sm text-gray-500 mt-1">Configured in system</div>
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(deviceBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([device, count]) => {
                const pct = ((count / data.recentClicks.length) * 100).toFixed(1);
                const icons: Record<string, string> = {
                  Mobile: "📱",
                  Desktop: "💻",
                  Tablet: "📲",
                  Bot: "🤖",
                  Unknown: "❓"
                };
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icons[device] || "❓"}</span>
                      <span className="text-gray-700">{device}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                        {count} ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Referrers</h3>
          <div className="space-y-3">
            {Object.entries(referrerBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([ref, count]) => {
                const pct = ((count / data.recentClicks.length) * 100).toFixed(1);
                return (
                  <div key={ref} className="flex items-center justify-between">
                    <div className="text-gray-700 text-sm truncate max-w-xs">
                      {ref === "Direct" ? "🔗 Direct / None" : `📄 ${ref}`}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Clicks Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Recent Clicks (Last 20)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Google Ads
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recentClicks.map((click) => {
                const ua = click.userAgent?.toLowerCase() || "";
                const isBot = ua.includes("bot") || ua.includes("crawler") || ua.includes("spider");
                const device = ua.includes("mobile") ? "📱 Mobile" : ua.includes("tablet") ? "📲 Tablet" : isBot ? "🤖 Bot" : "💻 Desktop";
                const hasAd = click.gclid || click.gbraid || click.wbraid;
                const time = new Date(click.createdAt).toLocaleString();
                const refDisplay = click.referer ? new URL(click.referer).pathname.substring(0, 40) : "—";

                return (
                  <tr key={click.id} className={isBot ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {click.ip || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {device}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                      {refDisplay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {hasAd ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
