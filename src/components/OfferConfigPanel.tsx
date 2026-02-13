"use client";

import { useState } from "react";
import { AutoTriggerLogic } from "./AutoTriggerLogic";

interface OfferConfigPanelProps {
  campaignId: string;
  cluster: string;
  autoTriggerOnInaction: boolean;
  autoTriggerDelay: number;
  autoRedirectDelay: number;
  destinationUrl: string;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
  };
}

export function OfferConfigPanel({
  campaignId,
  cluster,
  autoTriggerOnInaction,
  autoTriggerDelay,
  autoRedirectDelay,
  destinationUrl,
  brandColors,
}: OfferConfigPanelProps) {
  const [redirectDelay, setRedirectDelay] = useState(autoRedirectDelay);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      <AutoTriggerLogic
        campaignId={campaignId}
        cluster={cluster}
        autoTriggerOnInaction={autoTriggerOnInaction}
        autoTriggerDelay={autoTriggerDelay}
        autoRedirectDelay={redirectDelay}
        destinationUrl={destinationUrl}
        popunderEnabled={false}
        silentFetchEnabled={false}
        trackingUrls={[]}
      />

      {/* Config Panel - Dev/Debug */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition"
        >
          ⚙️ Redirect Config
        </button>

        {showConfig && (
          <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
            <h3 className="font-bold text-gray-900 mb-3">Auto-Redirect Configuration</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Redirect Delay (ms)
              </label>
              <input
                type="number"
                value={redirectDelay}
                onChange={(e) => setRedirectDelay(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                {redirectDelay === 0
                  ? "Auto-redirect disabled (0ms)"
                  : `Current: ${redirectDelay}ms (${(redirectDelay / 1000).toFixed(1)}s)`}
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-blue-700 mb-3">
              <strong>Note:</strong> Minimum auto-applied is 800ms. This setting will use a higher value if configured.
            </div>

            <div className="text-xs text-gray-600">
              <p className="mb-2"><strong>Current Config:</strong></p>
              <ul className="space-y-1 ml-2">
                <li>• Auto-trigger on inaction: {autoTriggerOnInaction ? "Yes" : "No"}</li>
                <li>• Inaction delay: {autoTriggerDelay}ms</li>
                <li>• Redirect delay: {redirectDelay}ms</li>
              </ul>
            </div>

            <button
              onClick={() => setShowConfig(false)}
              className="w-full mt-3 bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
