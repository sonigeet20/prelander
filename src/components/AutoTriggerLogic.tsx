"use client";

import { useEffect, useRef } from "react";

interface AutoTriggerLogicProps {
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

export function AutoTriggerLogic({
  campaignId,
  cluster,
  autoTriggerOnInaction,
  autoTriggerDelay,
  autoRedirectDelay,
  destinationUrl,
  brandColors,
}: AutoTriggerLogicProps) {
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Track user interaction
    const handleInteraction = () => {
      // User interacted - clear auto-trigger timer but still trigger popunder/silent fetch
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }

      if (!triggeredRef.current) {
        triggeredRef.current = true;
        executePopunderAndSilentFetch();
        startAutoRedirect();
      }
    };

    // Track inaction
    const resetInactivityTimer = () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }

      if (autoTriggerOnInaction && !triggeredRef.current) {
        triggerTimeoutRef.current = setTimeout(() => {
          if (!triggeredRef.current) {
            triggeredRef.current = true;
            executePopunderAndSilentFetch();
            startAutoRedirect();
          }
        }, autoTriggerDelay);
      }
    };

    // Listen to interactions
    const interactionEvents = ["click", "scroll", "keypress", "mousemove", "touchstart"];
    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    // Start inactivity timer on page load
    if (autoTriggerOnInaction) {
      resetInactivityTimer();
    }

    return () => {
      // Cleanup
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [autoTriggerOnInaction, autoTriggerDelay]);

  const executePopunderAndSilentFetch = async () => {
    try {
      // Popunder
      const popunderWindow = window.open(
        destinationUrl,
        "_blank",
        "width=1024,height=768,left=50,top=50",
      );
      if (popunderWindow) {
        popunderWindow.blur();
        window.focus();
      }

      // Silent fetch to track click
      await fetch(`/api/clicks`, {
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
    // 0 = disabled (no auto-redirect). When enabled, enforce a minimum of 800ms.
    if (!autoRedirectDelay || autoRedirectDelay <= 0) return;
    const finalDelay = Math.max(autoRedirectDelay, 800);
    redirectTimeoutRef.current = setTimeout(() => {
      window.location.href = destinationUrl;
    }, finalDelay);
  };

  // Component renders nothing - it's purely a logic handler
  return null;
}
