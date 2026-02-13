"use client";

import { useEffect, useRef } from "react";

interface AutoTriggerLogicProps {
  campaignId: string;
  cluster: string;
  autoTriggerOnInaction: boolean;
  autoTriggerDelay: number;
  autoRedirectDelay: number;
  destinationUrl: string;
  popunderEnabled: boolean;
  silentFetchEnabled: boolean;
  trackingUrls: string[];
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
  };
}

export function AutoTriggerLogic({
  campaignId,
  cluster,
  autoTriggerOnInaction,
  autoTriggerDelay,
  autoRedirectDelay,
  destinationUrl,
  popunderEnabled,
  silentFetchEnabled,
  trackingUrls,
}: AutoTriggerLogicProps) {
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
      if (!triggeredRef.current) {
        triggeredRef.current = true;
        executeTrigger();
        startAutoRedirect();
      }
    };

    const resetInactivityTimer = () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
      if (autoTriggerOnInaction && !triggeredRef.current) {
        triggerTimeoutRef.current = setTimeout(() => {
          if (!triggeredRef.current) {
            triggeredRef.current = true;
            executeTrigger();
            startAutoRedirect();
          }
        }, autoTriggerDelay);
      }
    };

    const interactionEvents = ["click", "scroll", "keypress", "mousemove", "touchstart"];
    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    if (autoTriggerOnInaction) {
      resetInactivityTimer();
    }

    return () => {
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
      if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [autoTriggerOnInaction, autoTriggerDelay]);

  const executeTrigger = async () => {
    try {
      // Popunder: only if enabled
      if (popunderEnabled) {
        const popunderWindow = window.open(
          destinationUrl,
          "_blank",
          "width=1024,height=768,left=50,top=50",
        );
        if (popunderWindow) {
          popunderWindow.blur();
          window.focus();
        }
      }

      // Silent fetch: fire all tracking URLs in the background
      if (silentFetchEnabled && trackingUrls.length > 0) {
        trackingUrls.forEach((url) => {
          // Use an Image beacon for cross-origin compatibility
          const img = new Image();
          img.src = url;
        });
      }

      // Record the click in our own analytics
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          cluster,
          source: "auto-trigger",
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error("Error in auto-trigger:", error);
    }
  };

  const startAutoRedirect = () => {
    if (!autoRedirectDelay || autoRedirectDelay <= 0) return;
    const finalDelay = Math.max(autoRedirectDelay, 800);
    redirectTimeoutRef.current = setTimeout(() => {
      window.location.href = destinationUrl;
    }, finalDelay);
  };

  return null;
}
