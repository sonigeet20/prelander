"use client";

import { FlightSearch } from "./FlightSearch";
import { TravelBudgetPlanner } from "./TravelBudgetPlanner";
import { LoanCalculator } from "./LoanCalculator";
import { SavingsGoalCalculator } from "./SavingsGoalCalculator";
import { PricingCalculator } from "./PricingCalculator";
import { PriceCompare } from "./PriceCompare";
import { HealthPlanCompare } from "./HealthPlanCompare";
import { SmartSearch } from "./SmartSearch";

/**
 * MicroAppSelector — Maps a brand's verticalType to the appropriate
 * interactive micro-app(s). Each micro-app provides real utility and
 * embeds tracking CTAs naturally within user-initiated interactions.
 *
 * Verticals → Tools:
 *   travel        → FlightSearch + TravelBudgetPlanner
 *   finance       → LoanCalculator + SavingsGoalCalculator
 *   b2b_saas      → PricingCalculator
 *   subscription  → PricingCalculator (shared with SaaS)
 *   ecommerce     → PriceCompare
 *   d2c           → PriceCompare
 *   health        → HealthPlanCompare
 *   other         → SmartSearch (generic fallback)
 */

interface MicroAppProps {
  verticalType: string | null | undefined;
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}

export function MicroAppSelector({
  verticalType,
  brandName,
  trackingHref,
  brandDomain,
}: MicroAppProps) {
  const props = { brandName, trackingHref, brandDomain };

  switch (verticalType) {
    case "travel":
      return (
        <div className="space-y-6">
          <FlightSearch {...props} />
          <TravelBudgetPlanner {...props} />
        </div>
      );

    case "finance":
      return (
        <div className="space-y-6">
          <LoanCalculator {...props} />
          <SavingsGoalCalculator {...props} />
        </div>
      );

    case "b2b_saas":
    case "subscription":
      return <PricingCalculator {...props} />;

    case "ecommerce":
    case "d2c":
      return <PriceCompare {...props} />;

    case "health":
      return <HealthPlanCompare {...props} />;

    default:
      return <SmartSearch {...props} />;
  }
}
