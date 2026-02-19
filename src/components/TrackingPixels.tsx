"use client";

import { useEffect, useRef } from "react";

interface TrackingPixelsProps {
  offerId: string;
  impressionPixelUrl?: string | null;
  clickPixelUrl?: string | null;
  conversionPixelUrl?: string | null;
}

/**
 * Fires tracking pixels based on offer configuration
 * - Impression: fires on page load (tracked internally + optional custom pixel)
 * - Click: fires when user clicks any CTA link (via /go/ redirect)
 * - Conversion: manual trigger via window.fireConversionPixel()
 * 
 * Only fires custom pixels to same-origin URLs for Google Ads compliance.
 */
export function TrackingPixels({ offerId, impressionPixelUrl, clickPixelUrl, conversionPixelUrl }: TrackingPixelsProps) {
  const firedImpression = useRef(false);
  const firedConversion = useRef(false);

  useEffect(() => {
    // Fire impression tracking on mount (page load)
    if (!firedImpression.current) {
      firedImpression.current = true;

      // ALWAYS track internally for analytics
      trackImpression(offerId);

      // OPTIONAL: Fire custom impression pixel if configured
      if (impressionPixelUrl) {
        firePixel(impressionPixelUrl, "impression");
      }
    }

    // Attach click pixel to all /go/ links
    if (clickPixelUrl) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest("a");
        if (link && link.href.includes("/go/")) {
          firePixel(clickPixelUrl, "click");
        }
      };

      document.addEventListener("click", handleClick, true); // capture phase
      return () => document.removeEventListener("click", handleClick, true);
    }
  }, [offerId, impressionPixelUrl, clickPixelUrl]);

  useEffect(() => {
    // Expose conversion pixel trigger globally
    if (conversionPixelUrl) {
      (window as any).fireConversionPixel = () => {
        if (!firedConversion.current) {
          firePixel(conversionPixelUrl, "conversion");
          firedConversion.current = true;
        }
      };
    }
  }, [conversionPixelUrl]);

  return null; // This component doesn't render anything
}

/**
 * Track impression (page view) to our internal analytics API
 */
function trackImpression(offerId: string) {
  try {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      type: "impression",
      offerId,
      pageUrl: window.location.pathname,
      gclid: params.get("gclid"),
      gbraid: params.get("gbraid"),
      wbraid: params.get("wbraid"),
    };

    // Use sendBeacon for fire-and-forget tracking
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics", blob);
      if (sent) {
        console.log("[TrackingPixels] Impression tracked:", payload);
      }
    } else {
      // Fallback to fetch with keepalive
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(console.error);
    }
  } catch (err) {
    console.error("[TrackingPixels] Failed to track impression:", err);
  }
}

/**
 * Fire a tracking pixel using navigator.sendBeacon (preferred) or img fallback
 */
function firePixel(url: string, type: string) {
  try {
    // Only fire to same-origin URLs for compliance
    const pixelUrl = new URL(url, window.location.origin);
    
    // Security check: only fire to same origin OR explicitly allowed domains
    if (pixelUrl.origin !== window.location.origin) {
      console.warn(`[TrackingPixels] Blocked cross-origin pixel: ${url} (policy: same-origin only)`);
      return;
    }

    // Prefer sendBeacon (fire-and-forget, survives page navigation)
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(url);
      if (sent) {
        console.log(`[TrackingPixels] ${type} pixel fired via sendBeacon:`, url);
        return;
      }
    }

    // Fallback: 1x1 transparent image
    const img = new Image(1, 1);
    img.src = url;
    img.onload = () => console.log(`[TrackingPixels] ${type} pixel fired via img:`, url);
    img.onerror = () => console.error(`[TrackingPixels] ${type} pixel failed:`, url);
  } catch (err) {
    console.error(`[TrackingPixels] Invalid ${type} pixel URL:`, url, err);
  }
}
