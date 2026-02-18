import type { VerticalType, IntentType, BlueprintDefinition } from "@/types";
import { BLUEPRINTS } from "@/lib/blueprints";

/**
 * Select the most appropriate blueprint for a given vertical + intent combination.
 * @param entities - Optional detected entities (cities, brands, etc.) for validation
 */
export function selectBlueprint(
  verticalType: VerticalType,
  intentType: IntentType,
  entities?: { cities?: string[] }
): BlueprintDefinition {
  // Guard: don't use destination/route blueprints without actual city names
  let safeIntentType = intentType;
  if (intentType === "destination_specific" && (!entities?.cities || entities.cities.length === 0)) {
    safeIntentType = "comparison" as IntentType;
  }
  if (intentType === "route_specific" && (!entities?.cities || entities.cities.length < 2)) {
    safeIntentType = entities?.cities?.length === 1 ? "destination_specific" as IntentType : "comparison" as IntentType;
  }

  // Exact match
  const exact = BLUEPRINTS.find(
    (b) => b.verticalType === verticalType && b.intentType === safeIntentType
  );
  if (exact) return exact;

  // Fallback: same vertical, informational intent
  const verticalFallback = BLUEPRINTS.find(
    (b) => b.verticalType === verticalType && b.intentType === "informational"
  );
  if (verticalFallback) return verticalFallback;

  // Fallback: same intent, "other" vertical
  const intentFallback = BLUEPRINTS.find(
    (b) => b.verticalType === "other" && b.intentType === safeIntentType
  );
  if (intentFallback) return intentFallback;

  // Ultimate fallback: generic informational
  return BLUEPRINTS.find(
    (b) => b.name === "generic_informational"
  ) || BLUEPRINTS[0];
}
