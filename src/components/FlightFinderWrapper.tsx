"use client";

import { useSearchParams } from "next/navigation";
import { FlightSearch } from "@/components/micro-apps/FlightSearch";

export function FlightFinderWrapper({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const searchParams = useSearchParams();

  // Read search parameters from URL: ?from=NYC&to=LAX&depart=2026-03-15&return=2026-03-22&pax=2
  const initialFromCode = searchParams.get("from") || undefined;
  const initialToCode = searchParams.get("to") || undefined;
  const initialDepart = searchParams.get("depart") || undefined;
  const initialReturn = searchParams.get("return") || undefined;
  const initialPax = searchParams.get("pax") ? parseInt(searchParams.get("pax")!, 10) : undefined;

  return (
    <FlightSearch
      brandName={brandName}
      trackingHref={trackingHref}
      brandDomain={brandDomain}
      initialFromCode={initialFromCode}
      initialToCode={initialToCode}
      initialDepart={initialDepart}
      initialReturn={initialReturn}
      initialPax={initialPax}
    />
  );
}
