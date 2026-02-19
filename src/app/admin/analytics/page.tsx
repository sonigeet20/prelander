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

interface ImpressionLog {
  id: string;
  pageUrl: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  createdAt: string;
}

interface AnalyticsSummary {
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  totalOffers: number;
  clicksLast24h: number;
  impressionsLast24h: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  recentClicks: ClickLog[];
  recentImpressions: ImpressionLog[];
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

  // Calculate CTR
  const ctr = data.summary.totalImpressions > 0 
    ? ((data.summary.totalClicks / data.summary.totalImpressions) * 100).toFixed(2)
    : "0";

  // Parse user agents for device breakdown (for impressions)
  const impressionDeviceBreakdown = data.recentImpressions.reduce((acc, imp) => {
    const ua = imp.userAgent?.toLowerCase() || "";
    let device = "Unknown";
    if (ua.includes("mobile") || ua.includes("android")) device = "Mobile";
    else if (ua.includes("tablet") || ua.includes("ipad")) device = "Tablet";
    else if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider")) device = "Bot";
    else if (ua.includes("mac") || ua.includes("windows") || ua.includes("linux")) device = "Desktop";
    
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Parse user agents for device breakdown (for clicks)
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
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time tracking and engagement metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 shadow-sm"
          >
            Refresh
          </button>
          <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm hover:bg-gray-50 transition-all">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
            <span className="text-xs text-gray-400">(10s)</span>
          </label>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Impressions</span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">{data.summary.totalImpressions.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Page visits</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Clicks</span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">{data.summary.totalClicks.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Outbound clicks</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">CTR</span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">{ctr}%</div>
          <div className="text-xs text-gray-500">Click-through rate</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Conversions</span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">{data.summary.totalConversions.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total conversions</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">24h Activity</span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">{data.summary.clicksLast24h.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Clicks last 24h</div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Real Users
          </h3>
          <div className="text-2xl font-semibold text-gray-900">{realUsers.length}</div>
          <p className="text-xs text-gray-500 mt-1">Excluding bots ({data.recentClicks.length - realUsers.length} bot visits)</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Google Ads Traffic
          </h3>
          <div className="text-2xl font-semibold text-gray-900">{hasGoogleAds ? "Active" : "None"}</div>
          <p className="text-xs text-gray-500 mt-1">{hasGoogleAds ? "Ad click IDs detected" : "No ad click IDs found"}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Active Offers
          </h3>
          <div className="text-2xl font-semibold text-gray-900">{data.summary.totalOffers}</div>
          <p className="text-xs text-gray-500 mt-1">Configured in system</p>
        </div>
      </div>

      {/* Device & Referrer Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Device Breakdown</h3>
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
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">🖱️ Recent Clicks (Last 20)</h3>
          <p className="text-sm text-gray-500 mt-1">Outbound clicks to affiliate links</p>
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

      {/* Recent Impressions Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">👁️ Recent Page Visits (Last 20)</h3>
          <p className="text-sm text-gray-500 mt-1">Landing page views (impressions)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page URL
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
              {data.recentImpressions.map((impression) => {
                const ua = impression.userAgent?.toLowerCase() || "";
                const isBot = ua.includes("bot") || ua.includes("crawler") || ua.includes("spider");
                const device = ua.includes("mobile") ? "📱 Mobile" : ua.includes("tablet") ? "📲 Tablet" : isBot ? "🤖 Bot" : "💻 Desktop";
                const hasAd = impression.gclid || impression.gbraid || impression.wbraid;
                const time = new Date(impression.createdAt).toLocaleString();
                const refDisplay = impression.referer ? new URL(impression.referer).pathname.substring(0, 40) : "—";

                return (
                  <tr key={impression.id} className={isBot ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {impression.pageUrl}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {impression.ip || "—"}
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
