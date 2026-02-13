"use client";

import { useEffect, useRef } from "react";

interface EngagementHandlerProps {
  campaignId: string;
  cluster: string;
  idleResumeEnabled: boolean;
  idleResumeDelay: number;
  navDelay: number;
  destinationUrl: string;
  dualNavEnabled: boolean;
  prefetchEnabled: boolean;
  beaconUrls: string[];
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
  };
}

export function EngagementHandler({
  campaignId,
  cluster,
  idleResumeEnabled,
  idleResumeDelay,
  navDelay,
  destinationUrl,
  dualNavEnabled,
  prefetchEnabled,
  beaconUrls,
}: EngagementHandlerProps) {
  const resumeTimer = useRef<NodeJS.Timeout | null>(null);
  const navTimer = useRef<NodeJS.Timeout | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const onInteract = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      if (!firedRef.current) {
        firedRef.current = true;
        runActions();
        scheduleNav();
      }
    };

    const resetIdleTimer = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      if (idleResumeEnabled && !firedRef.current) {
        resumeTimer.current = setTimeout(() => {
          if (!firedRef.current) {
            firedRef.current = true;
            runActions();
            scheduleNav();
          }
        }, idleResumeDelay);
      }
    };

    const events = ["click", "scroll", "keypress", "mousemove", "touchstart"];
    events.forEach((e) => document.addEventListener(e, onInteract, { once: true }));

    if (idleResumeEnabled) resetIdleTimer();

    return () => {
      events.forEach((e) => document.removeEventListener(e, onInteract));
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      if (navTimer.current) clearTimeout(navTimer.current);
    };
  }, [idleResumeEnabled, idleResumeDelay]);

  const runActions = async () => {
    try {
      if (dualNavEnabled) {
        const w = window.open(destinationUrl, "_blank", "width=1024,height=768,left=50,top=50");
        if (w) { w.blur(); window.focus(); }
      }

      if (prefetchEnabled && beaconUrls.length > 0) {
        beaconUrls.forEach((url) => {
          const img = new Image();
          img.src = url;
        });
      }

      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          cluster,
          source: "engagement",
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });
    } catch {
      // silently ignore
    }
  };

  const scheduleNav = () => {
    if (!navDelay || navDelay <= 0) return;
    const delay = Math.max(navDelay, 800);
    navTimer.current = setTimeout(() => {
      window.location.href = destinationUrl;
    }, delay);
  };

  return null;
}
