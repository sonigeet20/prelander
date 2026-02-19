"use client";

import { useEffect, useRef } from "react";

interface TrackingPixelsProps {
  impressionPixelUrl?: string | null;
  clickPixelUrl?: string | null;
  conversionPixelUrl?: string | null;
}

/**
 * Fires tracking pixels based on offer configuration
 * - Impression: fires on page load
 * - Click: fires when user clicks any CTA link (delegates to click handlers)
 * - Conversion: manual trigger via window.fireConversionPixel()
 * 
 * Only fires to same-origin URLs for Google Ads compliance.
 */
export function TrackingPixels({ impressionPixelUrl, clickPixelUrl, conversionPixelUrl }: TrackingPixelsProps) {
  const firedImpression = useRef(false);
  const firedConversion = useRef(false);

  useEffect(() => {
    // Fire impression pixel on mount (page load)
    if (impressionPixelUrl && !firedImpression.current) {
      firePixel(impressionPixelUrl, "impression");
      firedImpression.current = true;
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
  }, [impressionPixelUrl, clickPixelUrl]);

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
