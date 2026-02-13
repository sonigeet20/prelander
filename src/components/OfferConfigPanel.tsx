"use client";

import { EngagementHandler } from "./EngagementHandler";

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
}: OfferConfigPanelProps) {
  return (
    <EngagementHandler
      campaignId={campaignId}
      cluster={cluster}
      idleResumeEnabled={autoTriggerOnInaction}
      idleResumeDelay={autoTriggerDelay}
      navDelay={autoRedirectDelay}
      destinationUrl={destinationUrl}
      dualNavEnabled={false}
      prefetchEnabled={false}
      beaconUrls={[]}
    />
  );
}
