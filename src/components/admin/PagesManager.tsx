"use client";

import { useState, useEffect, useCallback } from "react";

interface GeneratedPage {
  id: string; 
  slug: string; 
  title: string; 
  status: string; 
  pageType?: string; // 'microapp' or 'generated'
  microappType?: string; // 'flight-finder' or 'ai-assistant'
  complianceScore: number | null;
  publishedUrl: string | null; 
  publishedAt: string | null; 
  createdAt: string;
  redirectDelaySec: number | null;
  offer: { 
    id: string;
    name: string; 
    slug: string;
    redirectDelaySec: number | null; 
    brand: { name: string; domain: string } 
  };
  keyword: { keyword: string; intentType: string | null } | null;
}

interface OfferGroup {
  offerId: string;
  offerName: string;
  offerSlug: string;
  brandName: string;
  pages: GeneratedPage[];
  microappPages: {
    flightFinder?: boolean;
    aiAssistant?: boolean;
  };
}

export function PagesManager() {
  const [pages, setPages] = useState<GeneratedPage[]>([]);
  const [offerGroups, setOfferGroups] = useState<OfferGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editingRedirect, setEditingRedirect] = useState<string | null>(null);
  const [redirectValue, setRedirectValue] = useState("");
  const [savingRedirect, setSavingRedirect] = useState(false);
  const [creatingMicroapp, setCreatingMicroapp] = useState<{ offerId: string; type: string } | null>(null);
  const [creatingMicroappLoading, setCreatingMicroappLoading] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    const url = filter === "all" ? "/api/pages" : `/api/pages?status=${filter}`;
    const res = await fetch(url);
    if (res.ok) { 
      const data = await res.json(); 
      const allPages = data.pages || [];
      setPages(allPages);

      // Group pages by offer and track microapp pages
      const groups: Record<string, OfferGroup> = {};
      allPages.forEach((page: GeneratedPage) => {
        const key = page.offer.id;
        if (!groups[key]) {
          groups[key] = {
            offerId: page.offer.id,
            offerName: page.offer.name,
            offerSlug: page.offer.slug,
            brandName: page.offer.brand.name,
            pages: [],
            microappPages: {},
          };
        }
        
        // Check if this is a microapp page
        if (page.pageType === "microapp") {
          const microappType = page.microappType as "flightFinder" | "aiAssistant" | undefined;
          if (microappType) {
            groups[key].microappPages[microappType] = true;
          }
        } else {
          groups[key].pages.push(page);
        }
      });

      setOfferGroups(Object.values(groups));
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const createMicroappPage = async (offerId: string, type: "flight-finder" | "ai-assistant") => {
    setCreatingMicroappLoading(true);
    const res = await fetch("/api/pages/microapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, type }),
    });
    if (res.ok) {
      fetchPages();
      setCreatingMicroapp(null);
    } else {
      alert("Failed to create microapp page");
    }
    setCreatingMicroappLoading(false);
  };

  const handlePublish = async (id: string) => {
    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    if (res.ok) fetchPages();
  };

  const handleScan = async (id: string) => {
    await fetch("/api/compliance/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: id }),
    });
    fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    fetchPages();
  };

  const handleSaveRedirect = async (id: string) => {
    setSavingRedirect(true);
    const val = redirectValue.trim() === "" ? null : parseInt(redirectValue, 10);
    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectDelaySec: val }),
    });
    if (res.ok) fetchPages();
    setEditingRedirect(null);
    setSavingRedirect(false);
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    review: "bg-amber-100 text-amber-700",
    compliant: "bg-blue-100 text-blue-700",
    published: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const complianceColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading pages…</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pages</h2>
          <p className="text-sm text-gray-500">Manage microapp and generated content pages</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {["all", "draft", "review", "compliant", "published", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filter === f ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {offerGroups.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No pages yet</p>
          <p className="text-sm text-gray-400 mt-1">Create offers and generate pages to see them here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {offerGroups.map((group) => (
            <div key={group.offerId} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Offer Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.offerName}</h3>
                    <p className="text-xs text-gray-500 mt-1">{group.brandName} — {group.pages.length + Object.values(group.microappPages).filter(Boolean).length} page{group.pages.length + Object.values(group.microappPages).filter(Boolean).length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Microapp Pages Section */}
              <div className="px-6 py-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Dedicated Microapp Pages</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Flight Finder */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Flight Finder</span>
                      {group.microappPages.flightFinder && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">✓ Active</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">/offers/{group.offerSlug}/flight-finder</p>
                    {group.microappPages.flightFinder ? (
                      <a href={`/offers/${group.offerSlug}/flight-finder`} target="_blank" className="text-xs text-indigo-600 hover:underline">View Page →</a>
                    ) : (
                      <button
                        onClick={() => setCreatingMicroapp({ offerId: group.offerId, type: 'flight-finder' })}
                        className="w-full px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 transition"
                      >
                        Create Page
                      </button>
                    )}
                  </div>

                  {/* AI Assistant */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">AI Assistant</span>
                      {group.microappPages.aiAssistant && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">✓ Active</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">/offers/{group.offerSlug}/ai-assistant</p>
                    {group.microappPages.aiAssistant ? (
                      <a href={`/offers/${group.offerSlug}/ai-assistant`} target="_blank" className="text-xs text-indigo-600 hover:underline">View Page →</a>
                    ) : (
                      <button
                        onClick={() => setCreatingMicroapp({ offerId: group.offerId, type: 'ai-assistant' })}
                        className="w-full px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 transition"
                      >
                        Create Page
                      </button>
                    )}
                  </div>
                </div>

                {/* Modal for creating microapp */}
                {creatingMicroapp?.offerId === group.offerId && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Creating {creatingMicroapp.type === 'flight-finder' ? 'Flight Finder' : 'AI Assistant'} page...
                    </p>
                    <button
                      onClick={() => createMicroappPage(group.offerId, creatingMicroapp.type as "flight-finder" | "ai-assistant")}
                      disabled={creatingMicroappLoading}
                      className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {creatingMicroappLoading ? 'Creating...' : 'Confirm Create'}
                    </button>
                  </div>
                )}
              </div>

              {/* Generated Pages Section */}
              {group.pages.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">AI-Generated Pages ({group.pages.length})</h4>
                  <div className="space-y-2">
                    {group.pages.slice(0, 3).map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                          <p className="text-xs text-gray-500">Keyword: {page.keyword?.keyword || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[page.status]}`}>
                            {page.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {group.pages.length > 3 && (
                      <p className="text-xs text-gray-500 px-3 py-2">+{group.pages.length - 3} more pages</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
