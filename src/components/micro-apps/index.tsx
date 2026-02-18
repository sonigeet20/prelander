"use client";

import { FlightSearch } from "./FlightSearch";
import { LoanCalculator } from "./LoanCalculator";
import { ROICalculator } from "./ROICalculator";
import { AIAssistant } from "./AIAssistant";

/**
 * MicroAppSelector — Maps verticalType to REAL micro-apps.
 *
 * Every tool provides genuine utility:
 *   - FlightSearch: Deep-link builder → opens real results on brand site
 *   - LoanCalculator: Real amortization math
 *   - ROICalculator: Real ROI/TCO calculations
 *   - AIAssistant: GPT-4o-mini powered chat (real AI responses)
 *
 * Verticals → Tools:
 *   travel       → FlightSearch + AI Travel Assistant
 *   finance      → LoanCalculator + AI Finance Advisor
 *   b2b_saas     → ROICalculator + AI Software Advisor
 *   subscription → ROICalculator + AI Subscription Advisor
 *   ecommerce    → AI Shopping Assistant
 *   d2c          → AI Product Expert
 *   health       → AI Health Plan Guide
 *   other        → AI Research Assistant
 */

interface MicroAppProps {
  verticalType: string | null | undefined;
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}

export function MicroAppSelector({ verticalType, brandName, trackingHref, brandDomain }: MicroAppProps) {
  const props = { brandName, trackingHref, brandDomain };
  const vertical = verticalType || "other";

  switch (vertical) {
    case "travel":
      return (
        <div className="space-y-6">
          <FlightSearch {...props} />
          <AIAssistant {...props} vertical="travel" />
        </div>
      );

    case "finance":
      return (
        <div className="space-y-6">
          <LoanCalculator {...props} />
          <AIAssistant {...props} vertical="finance" />
        </div>
      );

    case "b2b_saas":
      return (
        <div className="space-y-6">
          <ROICalculator {...props} />
          <AIAssistant {...props} vertical="b2b_saas" />
        </div>
      );

    case "subscription":
      return (
        <div className="space-y-6">
          <ROICalculator {...props} />
          <AIAssistant {...props} vertical="subscription" />
        </div>
      );

    case "ecommerce":
      return <AIAssistant {...props} vertical="ecommerce" />;

    case "d2c":
      return <AIAssistant {...props} vertical="d2c" />;

    case "health":
      return <AIAssistant {...props} vertical="health" />;

    default:
      return <AIAssistant {...props} vertical="other" />;
  }
}
