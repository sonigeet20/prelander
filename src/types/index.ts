/* ─── Vertical Types ─────────────────────────────── */

export const VERTICAL_TYPES = [
  "travel",
  "ecommerce",
  "b2b_saas",
  "finance",
  "subscription",
  "d2c",
  "health",
  "other",
] as const;

export type VerticalType = (typeof VERTICAL_TYPES)[number];

/* ─── Intent Types ───────────────────────────────── */

export const INTENT_TYPES = [
  "transactional",
  "comparison",
  "validation",
  "pricing",
  "route_specific",
  "destination_specific",
  "use_case",
  "problem_solution",
  "informational",
] as const;

export type IntentType = (typeof INTENT_TYPES)[number];

/* ─── Page Section Types ─────────────────────────── */

export type SectionType =
  | "hero"
  | "quick_answer"
  | "content_block"
  | "comparison_table"
  | "pricing_table"
  | "tips"
  | "steps"
  | "faq"
  | "cta"
  | "disclosure"
  | "calculator"
  | "checklist"
  | "scorecard"
  | "pros_cons";

export interface PageSection {
  type: SectionType;
  heading: string;
  content?: string;
  subheading?: string;
  items?: Array<Record<string, string>>;
  highlights?: Array<{ label: string; value: string }>;
  rows?: Array<Record<string, string>>;
  ctaText?: string;
  ctaUrl?: string;
  // Calculator fields
  config?: {
    type?: "flight" | "subscription" | "general";
    baselineLabel?: string;
    baselineAmount?: number;
    savingsPercentMin?: number;
    savingsPercentMax?: number;
    tips?: Array<{ threshold: number; tip: string }>;
  };
  // Checklist fields
  checklistItems?: Array<{ task: string; detail?: string; priority?: "high" | "medium" | "low" }>;
  // Scorecard fields
  overallScore?: number;
  overallLabel?: string;
  categories?: Array<{ name: string; score: number; maxScore?: number; detail?: string }>;
  verdict?: string;
  // Pros & Cons fields
  pros?: Array<{ text: string; detail?: string; weight?: "major" | "minor" }>;
  cons?: Array<{ text: string; detail?: string; weight?: "major" | "minor" }>;
  bottomLine?: string;
}

export interface GeneratedPageContent {
  title: string;
  metaDescription: string;
  h1: string;
  sections: PageSection[];
}

/* ─── Blueprint Definition ───────────────────────── */

export interface BlueprintDefinition {
  name: string;
  verticalType: VerticalType;
  intentType: IntentType;
  description: string;
  sectionOrder: SectionType[];
  h1Template: string;
  requiredSections: SectionType[];
  ctaTemplate: { text: string; position: "after_hero" | "after_content" | "both" };
}

/* ─── Classification Results ─────────────────────── */

export interface VerticalClassificationResult {
  verticalType: VerticalType;
  confidence: number;
  reasoning: string;
}

export interface IntentClassificationResult {
  intentType: IntentType;
  confidence: number;
  reasoning: string;
  detectedEntities: {
    cities?: string[];
    brands?: string[];
    products?: string[];
    dates?: string[];
  };
}

/* ─── Compliance ─────────────────────────────────── */

export interface ComplianceViolation {
  rule: string;
  severity: "critical" | "warning" | "info";
  location: string;       // section or field where found
  original: string;       // the offending text
  suggestion: string;     // recommended replacement
}

export interface ComplianceScanResult {
  passed: boolean;
  score: number;
  violations: ComplianceViolation[];
}
