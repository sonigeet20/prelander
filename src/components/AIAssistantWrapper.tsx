"use client";

import { useSearchParams } from "next/navigation";
import { AIAssistant } from "@/components/micro-apps/AIAssistant";

export function AIAssistantWrapper({
  brandName,
  trackingHref,
  brandDomain,
  vertical,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
  vertical: string;
}) {
  const searchParams = useSearchParams();

  // Read search parameter from URL: ?query=What+is+the+best+way+to+save+money
  const initialQuery = searchParams.get("query") || undefined;

  return (
    <AIAssistant
      brandName={brandName}
      trackingHref={trackingHref}
      brandDomain={brandDomain}
      vertical={vertical}
      initialQuery={initialQuery}
    />
  );
}
