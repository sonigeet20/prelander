import type { BlueprintDefinition } from "@/types";

export const BLUEPRINTS: BlueprintDefinition[] = [
  /* ═══════════════════════════════════════════════════
     TRAVEL
     ═══════════════════════════════════════════════════ */
  {
    name: "travel_route",
    verticalType: "travel",
    intentType: "route_specific",
    description: "Route planning guide between two cities",
    h1Template: "{origin} to {destination}: Complete Travel Guide",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // route overview
      "comparison_table", // airline/mode comparison
      "content_block",   // booking strategy deep dive
      "checklist",       // pre-booking checklist
      "calculator",      // savings calculator
      "tips",            // money-saving tips
      "content_block",   // seasonal analysis
      "scorecard",       // route quality scorecard
      "content_block",   // airport & transit guide
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Search {origin} to {destination} Options", position: "both" },
  },
  {
    name: "travel_destination",
    verticalType: "travel",
    intentType: "destination_specific",
    description: "Destination guide for a specific city/region",
    h1Template: "Travel Guide: Getting to {destination} — What You Need to Know",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // destination overview
      "scorecard",       // destination scorecard
      "content_block",   // how to get there
      "comparison_table", // flight options comparison
      "checklist",       // travel preparation checklist
      "calculator",      // trip budget calculator
      "tips",            // local travel tips
      "content_block",   // accommodation & transport
      "content_block",   // best time to visit
      "pros_cons",       // destination pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "Search Flights to {destination}", position: "both" },
  },
  {
    name: "travel_pricing",
    verticalType: "travel",
    intentType: "pricing",
    description: "Flight/hotel price analysis and comparison",
    h1Template: "{keyword}: Understanding Pricing & How to Save",
    sectionOrder: [
      "hero",
      "quick_answer",
      "pricing_table",
      "content_block",   // pricing factors explained
      "calculator",      // savings calculator
      "content_block",   // seasonal pricing analysis
      "comparison_table", // competitor price comparison
      "checklist",       // price-drop monitoring checklist
      "tips",            // how to find lower prices
      "content_block",   // advanced booking strategies
      "pros_cons",       // platform pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "pricing_table", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "Compare Current Prices", position: "both" },
  },

  /* ═══════════════════════════════════════════════════
     B2B SaaS
     ═══════════════════════════════════════════════════ */
  {
    name: "saas_pricing",
    verticalType: "b2b_saas",
    intentType: "pricing",
    description: "Software pricing analysis and plan breakdown",
    h1Template: "{brand} Pricing Breakdown — Plans, Features & Value Analysis",
    sectionOrder: [
      "hero",
      "quick_answer",
      "pricing_table",
      "content_block",   // plan-by-plan deep dive
      "calculator",      // cost calculator
      "content_block",   // hidden costs & gotchas
      "comparison_table", // vs competitors pricing
      "scorecard",       // value scorecard
      "content_block",   // who each plan is for
      "checklist",       // plan selection checklist
      "tips",            // negotiation & saving tips
      "pros_cons",       // pricing model pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "pricing_table", "faq", "disclosure"],
    ctaTemplate: { text: "View {brand} Plans", position: "both" },
  },
  {
    name: "saas_comparison",
    verticalType: "b2b_saas",
    intentType: "comparison",
    description: "Software comparison between competing products",
    h1Template: "{keyword}: Feature-by-Feature Analysis",
    sectionOrder: [
      "hero",
      "quick_answer",
      "comparison_table", // feature comparison matrix
      "content_block",   // detailed strengths & weaknesses
      "scorecard",       // head-to-head scorecard
      "content_block",   // real-world use case analysis
      "pros_cons",       // side-by-side pros & cons
      "content_block",   // migration & switching costs
      "checklist",       // evaluation checklist
      "tips",            // decision-making tips
      "content_block",   // expert recommendations
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Learn More", position: "after_content" },
  },
  {
    name: "saas_validation",
    verticalType: "b2b_saas",
    intentType: "validation",
    description: "Product validation — is it right for you?",
    h1Template: "{brand}: An In-Depth Look at Features, Pros & Considerations",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what it does & how it works
      "scorecard",       // product scorecard
      "content_block",   // key features deep dive
      "comparison_table", // feature matrix
      "content_block",   // real user scenarios
      "pros_cons",       // comprehensive pros & cons
      "content_block",   // who it's for
      "checklist",       // "is it right for you?" checklist
      "tips",            // getting the most out of it
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Visit {brand}", position: "after_content" },
  },

  /* ═══════════════════════════════════════════════════
     ECOMMERCE
     ═══════════════════════════════════════════════════ */
  {
    name: "ecommerce_buying_guide",
    verticalType: "ecommerce",
    intentType: "transactional",
    description: "Product buying guide with research and recommendations",
    h1Template: "{keyword}: A Practical Buying Guide",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what to look for
      "scorecard",       // product evaluation scorecard
      "comparison_table", // top options comparison
      "content_block",   // budget breakdown by tier
      "calculator",      // value calculator
      "checklist",       // pre-purchase checklist
      "tips",            // shopping tips
      "steps",           // how to buy
      "pros_cons",       // buying options pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "Shop Now", position: "after_content" },
  },
  {
    name: "ecommerce_comparison",
    verticalType: "ecommerce",
    intentType: "comparison",
    description: "Product or store comparison guide",
    h1Template: "{keyword}: Which Option Is Worth Your Money?",
    sectionOrder: [
      "hero",
      "quick_answer",
      "comparison_table", // head-to-head product/store matrix
      "content_block",   // detailed feature-by-feature breakdown
      "scorecard",       // overall value scorecard
      "content_block",   // real-world testing & durability
      "pros_cons",       // side-by-side pros & cons
      "content_block",   // who should buy what
      "checklist",       // buyer's evaluation checklist
      "calculator",      // cost-per-use value calculator
      "tips",            // smart shopping tips
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Compare Prices", position: "after_content" },
  },
  {
    name: "ecommerce_pricing",
    verticalType: "ecommerce",
    intentType: "pricing",
    description: "Product pricing analysis, deals, and value assessment",
    h1Template: "{keyword}: Pricing, Deals & What You Actually Pay",
    sectionOrder: [
      "hero",
      "quick_answer",
      "pricing_table",    // current pricing tiers
      "content_block",    // price history & trends
      "calculator",       // total cost of ownership calculator
      "comparison_table", // competitor pricing
      "content_block",    // where to find deals
      "checklist",        // deal-hunting checklist
      "tips",             // money-saving strategies
      "content_block",    // is it worth the price?
      "pros_cons",        // value proposition analysis
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "pricing_table", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "Check Current Prices", position: "both" },
  },
  {
    name: "ecommerce_validation",
    verticalType: "ecommerce",
    intentType: "validation",
    description: "Product or store legitimacy and quality review",
    h1Template: "{keyword}: An Honest Assessment",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what it is & how it works
      "scorecard",       // quality scorecard
      "content_block",   // hands-on experience & quality
      "comparison_table", // vs alternatives
      "content_block",   // customer sentiment analysis
      "pros_cons",       // comprehensive pros & cons
      "checklist",       // red flag checklist
      "tips",            // smart buying tips
      "content_block",   // final verdict
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Visit {brand}", position: "after_content" },
  },

  /* ═══════════════════════════════════════════════════
     D2C (Direct-to-Consumer) BRANDS
     ═══════════════════════════════════════════════════ */
  {
    name: "d2c_comparison",
    verticalType: "d2c",
    intentType: "comparison",
    description: "D2C brand comparison — product vs product",
    h1Template: "{keyword}: A Side-by-Side Brand Comparison",
    sectionOrder: [
      "hero",
      "quick_answer",
      "comparison_table", // brand/product matrix
      "content_block",   // brand story & values comparison
      "scorecard",       // brand evaluation scorecard
      "content_block",   // product quality & materials
      "pros_cons",       // brand pros & cons
      "content_block",   // shipping, returns & customer experience
      "checklist",       // brand evaluation checklist
      "calculator",      // subscription value calculator
      "tips",            // choosing the right D2C brand
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Compare Options", position: "after_content" },
  },
  {
    name: "d2c_validation",
    verticalType: "d2c",
    intentType: "validation",
    description: "D2C brand review — is it legit and worth it?",
    h1Template: "{brand}: Is This D2C Brand Worth the Hype?",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // brand overview & mission
      "scorecard",       // brand quality scorecard
      "content_block",   // product quality deep dive
      "comparison_table", // vs traditional alternatives
      "content_block",   // ordering & unboxing experience
      "pros_cons",       // honest pros & cons
      "content_block",   // customer service & returns
      "checklist",       // "should you try it?" checklist
      "tips",            // getting the most value
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Visit {brand}", position: "after_content" },
  },
  {
    name: "d2c_pricing",
    verticalType: "d2c",
    intentType: "pricing",
    description: "D2C brand pricing, subscriptions & value breakdown",
    h1Template: "{keyword}: Pricing, Subscriptions & Real Cost Breakdown",
    sectionOrder: [
      "hero",
      "quick_answer",
      "pricing_table",    // product/subscription pricing
      "content_block",    // one-time vs subscription value
      "calculator",       // subscription savings calculator
      "content_block",    // hidden costs (shipping, returns, add-ons)
      "comparison_table", // vs retail/competitor pricing
      "scorecard",        // value for money scorecard
      "content_block",    // best deals & discount strategies
      "checklist",        // subscription management checklist
      "tips",             // how to save on D2C
      "pros_cons",        // pricing model pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "pricing_table", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "View {brand} Pricing", position: "both" },
  },
  {
    name: "d2c_transactional",
    verticalType: "d2c",
    intentType: "transactional",
    description: "D2C brand buying guide — ready to purchase",
    h1Template: "{keyword}: Your Complete Buying Guide",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what you're getting
      "scorecard",       // product quality scorecard
      "comparison_table", // product range overview
      "content_block",   // customization & options
      "calculator",      // bundle value calculator
      "steps",           // how to order step by step
      "checklist",       // pre-order checklist
      "tips",            // first-order tips & discounts
      "pros_cons",       // buying pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "steps", "faq", "disclosure"],
    ctaTemplate: { text: "Shop {brand}", position: "both" },
  },

  /* ═══════════════════════════════════════════════════
     SUBSCRIPTION SERVICES
     ═══════════════════════════════════════════════════ */
  {
    name: "subscription_comparison",
    verticalType: "subscription",
    intentType: "comparison",
    description: "Subscription service comparison",
    h1Template: "{keyword}: Which Subscription Is Actually Worth It?",
    sectionOrder: [
      "hero",
      "quick_answer",
      "comparison_table", // service-by-service matrix
      "content_block",   // what each service includes
      "scorecard",       // value scorecard
      "content_block",   // content/product library analysis
      "pros_cons",       // platform pros & cons
      "content_block",   // sharing, family plans & multi-device
      "calculator",      // annual cost comparison calculator
      "checklist",       // subscription evaluation checklist
      "tips",            // subscription optimization tips
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Compare Plans", position: "after_content" },
  },
  {
    name: "subscription_pricing",
    verticalType: "subscription",
    intentType: "pricing",
    description: "Subscription pricing analysis and plan comparison",
    h1Template: "{keyword}: Plans, Pricing & What Each Tier Gets You",
    sectionOrder: [
      "hero",
      "quick_answer",
      "pricing_table",    // tier breakdown
      "content_block",    // plan-by-plan deep dive
      "calculator",       // monthly vs annual savings calculator
      "content_block",    // what's actually included at each tier
      "comparison_table", // vs competitors pricing
      "scorecard",        // value scorecard
      "content_block",    // upgrade & downgrade strategies
      "checklist",        // plan selection checklist
      "tips",             // saving money on subscriptions
      "pros_cons",        // pricing model pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "pricing_table", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "View Plans", position: "both" },
  },
  {
    name: "subscription_validation",
    verticalType: "subscription",
    intentType: "validation",
    description: "Subscription service review — is it worth subscribing?",
    h1Template: "{brand}: Is This Subscription Worth Your Money?",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what you get
      "scorecard",       // service quality scorecard
      "content_block",   // content/product quality deep dive
      "comparison_table", // vs alternatives
      "content_block",   // user experience & app quality
      "pros_cons",       // honest assessment
      "content_block",   // cancellation, pausing & flexibility
      "checklist",       // "is it right for you?" checklist
      "tips",            // maximizing your subscription
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Try {brand}", position: "after_content" },
  },
  {
    name: "subscription_transactional",
    verticalType: "subscription",
    intentType: "transactional",
    description: "Subscription sign-up guide",
    h1Template: "{keyword}: How to Get Started & What to Expect",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what you're signing up for
      "pricing_table",   // plan options
      "steps",           // sign-up walkthrough
      "content_block",   // first-month experience
      "scorecard",       // service scorecard
      "calculator",      // subscription cost calculator
      "checklist",       // getting started checklist
      "tips",            // first-timer tips
      "pros_cons",       // joining pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "steps", "pricing_table", "faq", "disclosure"],
    ctaTemplate: { text: "Start {brand} Free Trial", position: "both" },
  },

  /* ═══════════════════════════════════════════════════
     FINANCE
     ═══════════════════════════════════════════════════ */
  {
    name: "finance_eligibility",
    verticalType: "finance",
    intentType: "validation",
    description: "Eligibility / risk assessment informational page",
    h1Template: "{keyword}: Understanding Requirements & Eligibility",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // overview
      "scorecard",       // eligibility scorecard
      "steps",           // eligibility steps
      "content_block",   // factors that matter
      "checklist",       // documentation checklist
      "calculator",      // estimate calculator
      "comparison_table", // options comparison
      "tips",            // improving your chances
      "content_block",   // common mistakes
      "pros_cons",       // option pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "steps", "faq", "disclosure"],
    ctaTemplate: { text: "Check Eligibility", position: "after_content" },
  },
  {
    name: "finance_comparison",
    verticalType: "finance",
    intentType: "comparison",
    description: "Financial product comparison (cards, loans, accounts)",
    h1Template: "{keyword}: A Comprehensive Comparison",
    sectionOrder: [
      "hero",
      "quick_answer",
      "comparison_table", // product comparison matrix
      "content_block",   // what matters when comparing
      "scorecard",       // product evaluation scorecard
      "content_block",   // fee structures explained
      "calculator",      // interest/cost calculator
      "content_block",   // terms & conditions breakdown
      "pros_cons",       // product pros & cons
      "checklist",       // comparison checklist
      "tips",            // choosing the right product
      "content_block",   // application strategy
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Compare Options", position: "after_content" },
  },
  {
    name: "finance_pricing",
    verticalType: "finance",
    intentType: "pricing",
    description: "Financial product rates, fees & cost analysis",
    h1Template: "{keyword}: Rates, Fees & True Cost Analysis",
    sectionOrder: [
      "hero",
      "quick_answer",
      "pricing_table",   // rate/fee table
      "content_block",   // understanding the fee structure
      "calculator",      // total cost calculator
      "content_block",   // hidden fees & fine print
      "comparison_table", // vs competitor rates
      "scorecard",       // value scorecard
      "content_block",   // rate negotiation strategies
      "checklist",       // fee audit checklist
      "tips",            // minimizing costs
      "pros_cons",       // fee structure pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "pricing_table", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "Check Current Rates", position: "both" },
  },
  {
    name: "finance_transactional",
    verticalType: "finance",
    intentType: "transactional",
    description: "Financial product application/sign-up guide",
    h1Template: "{keyword}: How to Apply & What to Expect",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // product overview
      "scorecard",       // product scorecard
      "steps",           // application walkthrough
      "content_block",   // documentation requirements
      "checklist",       // application readiness checklist
      "calculator",      // affordability/eligibility calculator
      "comparison_table", // alternative options
      "tips",            // application success tips
      "content_block",   // after approval — what happens next
      "pros_cons",       // product pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "steps", "faq", "disclosure"],
    ctaTemplate: { text: "Apply Now", position: "both" },
  },

  /* ═══════════════════════════════════════════════════
     HEALTH & WELLNESS
     ═══════════════════════════════════════════════════ */
  {
    name: "health_informational",
    verticalType: "health",
    intentType: "informational",
    description: "Health/wellness educational and informational guide",
    h1Template: "{keyword}: What You Need to Know",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // comprehensive overview
      "scorecard",       // topic assessment scorecard
      "content_block",   // science & evidence review
      "comparison_table", // options/methods comparison
      "content_block",   // how to get started
      "checklist",       // health action checklist
      "tips",            // practical wellness tips
      "content_block",   // when to seek professional help
      "pros_cons",       // approach pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Learn More", position: "after_content" },
  },
  {
    name: "health_comparison",
    verticalType: "health",
    intentType: "comparison",
    description: "Health product or service comparison",
    h1Template: "{keyword}: Comparing Your Options",
    sectionOrder: [
      "hero",
      "quick_answer",
      "comparison_table", // product/service comparison
      "content_block",   // what the science says
      "scorecard",       // product evaluation scorecard
      "content_block",   // ingredient/method analysis
      "pros_cons",       // each option's pros & cons
      "content_block",   // real-world effectiveness
      "checklist",       // quality evaluation checklist
      "calculator",      // cost-per-day/dose calculator
      "tips",            // choosing the right option
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Compare Products", position: "after_content" },
  },
  {
    name: "health_validation",
    verticalType: "health",
    intentType: "validation",
    description: "Health product/supplement review — is it safe and effective?",
    h1Template: "{keyword}: Safety, Effectiveness & What to Expect",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what it is & how it works
      "scorecard",       // safety & efficacy scorecard
      "content_block",   // ingredient/evidence analysis
      "comparison_table", // vs alternatives
      "content_block",   // who should (and shouldn't) use it
      "pros_cons",       // honest pros & cons
      "checklist",       // safety checklist before trying
      "content_block",   // dosage, timing & best practices
      "tips",            // getting results safely
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Visit {brand}", position: "after_content" },
  },

  /* ═══════════════════════════════════════════════════
     GENERIC / OTHER (catch-all)
     ═══════════════════════════════════════════════════ */
  {
    name: "generic_comparison",
    verticalType: "other",
    intentType: "comparison",
    description: "Generic comparison page for any vertical",
    h1Template: "{keyword}: A Detailed Comparison",
    sectionOrder: [
      "hero",
      "quick_answer",
      "comparison_table",
      "content_block",   // detailed analysis
      "scorecard",       // comparison scorecard
      "content_block",   // use case recommendations
      "pros_cons",       // pros & cons
      "checklist",       // evaluation checklist
      "tips",
      "content_block",   // expert verdict
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "comparison_table", "faq", "disclosure"],
    ctaTemplate: { text: "Learn More", position: "after_content" },
  },
  {
    name: "generic_informational",
    verticalType: "other",
    intentType: "informational",
    description: "Generic informational / educational page",
    h1Template: "{keyword}: What You Need to Know",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // comprehensive overview
      "content_block",   // deep dive analysis
      "scorecard",       // topic scorecard
      "checklist",       // action items
      "tips",
      "content_block",   // expert perspective
      "pros_cons",       // advantages & limitations
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Get Started", position: "after_content" },
  },
  {
    name: "generic_validation",
    verticalType: "other",
    intentType: "validation",
    description: "Generic review / validation page for any vertical",
    h1Template: "{keyword}: An In-Depth Review",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // what it is
      "scorecard",       // evaluation scorecard
      "content_block",   // features & capabilities
      "comparison_table", // vs alternatives
      "content_block",   // real-world usage
      "pros_cons",       // pros & cons
      "checklist",       // evaluation checklist
      "tips",            // getting the most value
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "content_block", "faq", "disclosure"],
    ctaTemplate: { text: "Visit {brand}", position: "after_content" },
  },
  {
    name: "generic_pricing",
    verticalType: "other",
    intentType: "pricing",
    description: "Generic pricing analysis for any vertical",
    h1Template: "{keyword}: Pricing, Plans & Value Analysis",
    sectionOrder: [
      "hero",
      "quick_answer",
      "pricing_table",
      "content_block",   // pricing deep dive
      "calculator",      // cost calculator
      "content_block",   // hidden costs
      "comparison_table", // competitor pricing
      "scorecard",       // value scorecard
      "tips",            // saving money
      "content_block",   // who each option is for
      "pros_cons",       // pricing pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "pricing_table", "tips", "faq", "disclosure"],
    ctaTemplate: { text: "Check Prices", position: "both" },
  },
  {
    name: "generic_transactional",
    verticalType: "other",
    intentType: "transactional",
    description: "Generic transactional / buying guide for any vertical",
    h1Template: "{keyword}: Your Complete Guide to Getting Started",
    sectionOrder: [
      "hero",
      "quick_answer",
      "content_block",   // overview of what you're getting
      "scorecard",       // product/service scorecard
      "comparison_table", // options at a glance
      "steps",           // how to get started
      "content_block",   // what to expect
      "calculator",      // cost/value calculator
      "checklist",       // readiness checklist
      "tips",            // first-timer tips
      "pros_cons",       // decision pros & cons
      "faq",
      "cta",
      "disclosure",
    ],
    requiredSections: ["hero", "quick_answer", "steps", "faq", "disclosure"],
    ctaTemplate: { text: "Get Started", position: "both" },
  },
];
