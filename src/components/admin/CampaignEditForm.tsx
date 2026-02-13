"use client";

import { useState } from "react";
import { Campaign } from "@prisma/client";
import { useRouter } from "next/navigation";

interface CampaignEditFormProps {
  campaign: Campaign;
}

export function CampaignEditForm({ campaign }: CampaignEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [autoTriggerOnInaction, setAutoTriggerOnInaction] = useState(
    campaign.autoTriggerOnInaction,
  );
  const [autoTriggerDelay, setAutoTriggerDelay] = useState(
    campaign.autoTriggerDelay,
  );
  const [autoRedirectDelay, setAutoRedirectDelay] = useState(
    campaign.autoRedirectDelay,
  );
  const [status, setStatus] = useState(campaign.status);
  const [brandName, setBrandName] = useState(campaign.brandName || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          autoTriggerOnInaction,
          autoTriggerDelay: parseInt(autoTriggerDelay.toString()),
          autoRedirectDelay: parseInt(autoRedirectDelay.toString()),
          status,
        }),
      });

      if (!res.ok) throw new Error("Failed to update campaign");
      setSuccess("✅ Campaign updated successfully");
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Campaign Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📋</span> Campaign Information
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Offer Name
            </label>
            <div className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 text-gray-900 font-medium">
              {campaign.offerName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Brand Name (displayed on lander)
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
              placeholder={campaign.offerName}
            />
          </div>
          {campaign.subdomain && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subdomain
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 text-gray-900 font-medium font-mono text-sm">
                {campaign.subdomain}.prelander.ai
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>🎯</span> Campaign Status
        </h3>
        
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
          >
            <option value="draft">Draft - Not yet published</option>
            <option value="active">Active - Currently live</option>
            <option value="paused">Paused - Temporarily disabled</option>
            <option value="archived">Archived - No longer in use</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">Set the campaign status to control visibility</p>
        </div>
      </div>

      {/* Auto-Trigger Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>⚡</span> Auto-Trigger on Inaction
        </h3>
        
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-100">
          <input
            type="checkbox"
            id="autoTrigger"
            checked={autoTriggerOnInaction}
            onChange={(e) => setAutoTriggerOnInaction(e.target.checked)}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="autoTrigger" className="text-sm font-semibold text-gray-900 cursor-pointer flex-1">
            Automatically trigger popunder when user is inactive
          </label>
        </div>

        {autoTriggerOnInaction && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Inactivity Delay (milliseconds)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={autoTriggerDelay}
                onChange={(e) => setAutoTriggerDelay(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                placeholder="3000"
              />
              <p className="text-xs text-gray-600 mt-2">
                <strong>How it works:</strong> If user doesn't click, scroll, type, or move mouse for this duration, the popunder triggers
              </p>
              <div className="mt-3 p-3 bg-white rounded border border-blue-100 text-xs text-gray-700">
                <span className="font-semibold">Examples:</span>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>1000ms (1 second) - Very aggressive</li>
                  <li>3000ms (3 seconds) - Standard, good balance</li>
                  <li>5000ms (5 seconds) - Allows user to read page</li>
                  <li>10000ms (10 seconds) - Very permissive</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!autoTriggerOnInaction && (
          <div className="p-3 bg-white rounded border border-blue-100 text-xs text-gray-600">
            <span className="font-semibold">ℹ️ Disabled:</span> Popunder will only trigger on user interaction (click, scroll, etc.)
          </div>
        )}
      </div>

      {/* Auto-Redirect Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>🔄</span> Auto-Redirect Settings
        </h3>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Auto-Redirect Delay (milliseconds)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={autoRedirectDelay}
            onChange={(e) => setAutoRedirectDelay(parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            placeholder="5000"
          />
          <p className="text-xs text-gray-600 mt-2">
            <strong>How it works:</strong> After popunder opens, automatically redirect the main page to the destination after this duration. Minimum 800ms enforced.
          </p>
          <div className="mt-3 p-3 bg-white rounded border border-purple-100 text-xs text-gray-700">
            <span className="font-semibold">Examples:</span>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>0ms - Disabled, no redirect</li>
              <li>2000ms (2 seconds) - Quick redirect</li>
              <li>5000ms (5 seconds) - Gives user time to close popunder</li>
              <li>10000ms (10 seconds) - More page visibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl">❌</span>
          <div>
            <p className="text-sm font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-green-900">Success</p>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50 font-bold flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.342.342l-.707.707M21 12h-1m0 6.342l-.707-.707M12 21v-1m-6.342-.342l.707-.707M3 12h1m0-6.342l.707.707M12 5a7 7 0 110 14 7 7 0 010-14z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <span>💾</span>
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
        >
          Cancel
        </button>
      </div>

      {/* Preview Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-900">
          <strong>💡 Tip:</strong> Visit the offer page to see these settings in action. Use the config panel in the bottom-right corner of the landing page to test redirect delays.
        </p>
      </div>
    </form>
  );
}
