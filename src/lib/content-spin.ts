/**
 * Content Spinning Engine
 * ─────────────────────────────────────────────────────────────
 * Produces deterministic but varied text for each brand, so every
 * landing page reads differently while saying the same thing.
 *
 * Uses a simple seed derived from the brand name (+ optional cluster)
 * to pick among synonym pools and sentence templates.
 * This avoids cookie-cutter AI-sounding copy.
 */

/* ── Seed helpers ──────────────────────────────────────────── */

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic pick from an array using a seed offset */
function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[((seed + offset) >>> 0) % arr.length];
}

/** Deterministic shuffle of an array (Fisher-Yates with seeded RNG) */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const j = ((s >>> 0) % (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ── Public API ────────────────────────────────────────────── */

export interface SpinContext {
  brandName: string;
  category: string;
  bestFor: string;
  tagline: string;
  cluster?: string;
  isTravel: boolean;
  pricingInfo?: string;
}

export function createSpinner(ctx: SpinContext) {
  const seed = hashStr(ctx.brandName + (ctx.cluster || ""));
  const bn = ctx.brandName;
  const cat = ctx.category.toLowerCase();
  const bf = ctx.bestFor.toLowerCase();

  /* ── Word-level synonym pools ─────────────────────────── */

  const examine = pick(["evaluate", "examine", "analyze", "assess", "investigate", "look at", "scrutinize"], seed, 0);
  const thorough = pick(["thorough", "in-depth", "comprehensive", "detailed", "extensive", "rigorous"], seed, 1);
  const offering = pick(["offering", "solution", "platform", "service", "product", "tool"], seed, 2);
  const standout = pick(["standout", "notable", "prominent", "key", "significant", "distinctive"], seed, 3);
  const aimed = pick(["aimed at", "designed for", "built for", "tailored to", "geared toward", "intended for"], seed, 4);
  const landscape = pick(["landscape", "market", "space", "industry", "arena", "sector"], seed, 5);
  const notably = pick(["notably", "particularly", "especially", "specifically", "in particular"], seed, 6);
  const strength = pick(["strength", "advantage", "selling point", "highlight", "forte", "strong suit"], seed, 7);
  const wellSuited = pick(["well-suited", "ideal", "a solid match", "a natural fit", "well-positioned", "well-tailored"], seed, 8);
  const weighed = pick(["weighed", "considered", "factored in", "accounted for", "balanced", "taken into account"], seed, 9);
  const genuine = pick(["genuine", "real", "actual", "substantive", "concrete", "tangible"], seed, 10);
  const overall = pick(["Overall", "All things considered", "On balance", "Taking everything into account", "When you weigh it all up", "In summary"], seed, 11);
  const suggests = pick(["suggests", "indicates", "points to", "demonstrates", "shows", "reveals"], seed, 12);
  const competitive = pick(["competitive", "strong", "respectable", "solid", "credible", "noteworthy"], seed, 13);
  const worth = pick(["worth considering", "worth a closer look", "worth exploring", "deserving of attention", "worth your time"], seed, 14);
  const drawback = pick(["drawback", "limitation", "downside", "weak point", "area for improvement", "caveat"], seed, 15);

  /* ── Sentence template pools ──────────────────────────── */

  const introTemplates = [
    `Our editorial team set out to ${examine} ${bn} from the ground up — looking at everything from its core feature set to its pricing structure and the overall user experience it delivers.`,
    `We conducted a ${thorough} review of ${bn}, covering its main features, value proposition, and how it stacks up against alternatives in the ${cat} ${landscape}.`,
    `For this analysis, we took an independent look at ${bn} as a ${offering} in the ${cat} ${landscape}, focusing on what real users care about most: functionality, pricing, and ease of use.`,
    `${bn} has built a reputation in the ${cat} ${landscape}, so we decided to put its claims to the test. Here is what we found after a careful, hands-on review.`,
    `Is ${bn} the right ${offering} for you? We spent time researching its features, pricing, and user feedback to help you decide — and here is our honest assessment.`,
    `The ${cat} market is crowded, but ${bn} regularly comes up as a top contender. We set out to figure out whether that reputation is justified.`,
  ];

  const detailParaTemplates = [
    `A ${standout} ${strength} of ${bn} is that it is ${aimed} ${bf}. In a ${cat} ${landscape} that can feel overwhelming, this focus gives ${bn} a clear identity and helps users understand exactly what they are getting.`,
    `What sets ${bn} apart in the ${cat} ${landscape} is its approach to serving ${bf}. Rather than trying to be everything to everyone, ${bn} concentrates its resources on delivering ${genuine} value where it matters most.`,
    `One thing that quickly becomes apparent when using ${bn} is how ${wellSuited} it is for ${bf}. The interface, feature set, and pricing all align around this core audience, which is something not every ${cat} ${offering} achieves.`,
  ];

  const comparisonTemplates = [
    `When comparing ${bn} to other options in the ${cat} ${landscape}, several things stand out. ${bn} ${notably} differentiates itself through its combination of features and pricing transparency. While some competitors may offer a broader feature set, ${bn} focuses on doing its core functions well — which is often more practical than a bloated feature list.`,
    `In the broader ${cat} market, ${bn} holds a ${competitive} position. It may not have every bell and whistle, but the features it does provide are well-implemented. We ${weighed} factors such as customer support, documentation quality, and update frequency — and ${bn} performs respectably on all fronts.`,
    `There is no shortage of ${cat} tools available today, so where does ${bn} fit? Based on our analysis, it occupies a sweet spot between full-featured enterprise solutions and bare-bones budget options. This middle-ground approach makes it ${worth} for ${bf}.`,
  ];

  const pricingParaTemplates = ctx.pricingInfo ? [
    `When it comes to pricing, ${bn} offers: ${ctx.pricingInfo}. Relative to what you get, this is a ${competitive} value proposition in the ${cat} ${landscape}. We would encourage prospective buyers to check the official website for the latest pricing, as these figures can change.`,
    `${bn} pricing is as follows: ${ctx.pricingInfo}. Whether this represents good value depends on your specific needs — but for ${bf}, the price-to-feature ratio is reasonable in the current ${cat} ${landscape}.`,
    `Regarding cost, ${bn} positions itself as follows: ${ctx.pricingInfo}. Keep in mind that pricing structures and promotional offers change frequently, so verifying on the official site is always a good idea.`,
  ] : [
    `${bn} does not prominently advertise a single price point, which is common in the ${cat} ${landscape} — pricing often varies by plan, region, or promotional period. We recommend visiting the official ${bn} website for up-to-date pricing details.`,
    `Pricing for ${bn} is structured across multiple tiers, with exact figures available on their official website. This flexible approach means different user segments can find a plan that fits their budget.`,
  ];

  const drawbackParaTemplates = [
    `No ${offering} is perfect, and ${bn} has its share of limitations. The most commonly cited ${drawback} is ${pick(["that some advanced features require a higher-tier plan", "occasional interface complexity for first-time users", "limited customization on lower-tier plans", "that customer support response times can vary"], seed, 20)}. For many users this will not be a dealbreaker, but it is ${worth} knowing before you commit.`,
    `Where ${bn} falls short is in areas that many ${cat} tools struggle with: ${pick(["onboarding could be smoother for non-technical users", "the mobile experience does not quite match the desktop version", "documentation could be more comprehensive in some areas", "international coverage or regional support varies"], seed, 21)}. These are not unique failings — but transparency demands we call them out.`,
  ];

  const bottomLineTemplates = [
    `${overall}, ${bn} ${suggests} itself as a ${competitive} option for ${bf}. Its strengths in ${pick(["features and user experience", "value and reliability", "breadth of service and pricing", "functionality and ease of use"], seed, 25)} outweigh the minor ${drawback}s we identified, though individual needs will vary.`,
    `${overall}, our research ${suggests} that ${bn} delivers ${genuine} value in the ${cat} ${landscape}, ${notably} for ${bf}. As always, we encourage users to try the service firsthand and form their own opinions.`,
    `${overall}, ${bn} earns a ${competitive} score from our editorial team. It is not without its ${drawback}s, but for ${bf}, it remains a ${offering} that is ${worth}.`,
  ];

  const methodologyIntroTemplates = [
    `Our editorial process involves ${examine}ing each product across multiple dimensions. For ${bn}, we looked at publicly available documentation, feature comparisons, community feedback, and our own hands-on experience to form an honest picture.`,
    `We take a structured approach to every review. For ${bn}, our team ${examine}d the product across features, pricing, user experience, and support — triangulating information from official sources and independent third-party reviews.`,
    `Transparency is central to our review process. We ${examine}d ${bn} using a consistent framework that covers functionality, value for money, support quality, and real-world usability — all verified against publicly available information.`,
  ];

  const historyTemplates = [
    `${bn} has established itself as a recognizable name in the ${cat} ${landscape}. Over the years, it has evolved its feature set to keep pace with user expectations and competitive pressures, which ${suggests} an active commitment to product development.`,
    `As a player in the ${cat} ${landscape}, ${bn} has a track record that spans a meaningful period. The ${offering} has gone through several iterations, and its current form reflects accumulated feedback and market learning.`,
    `${bn}'s journey in the ${cat} ${landscape} is one of steady iteration. The brand has consistently refined its core ${offering}, adding capabilities that align with what ${bf} actually need — rather than chasing feature-count bragging rights.`,
  ];

  /* ── Assembled paragraphs ──────────────────────────────── */

  /* ── High-intent / deal-oriented templates ─────────── */

  const dealIntroTravel = [
    `Finding the best deal on ${bn} comes down to timing, flexibility, and knowing where to look. Below are strategies our team has identified that can help you save money on your next booking.`,
    `Getting the most out of ${bn} does not require insider knowledge — but a few smart habits can make a real difference to what you pay. Here are practical tips that can stretch your travel budget further.`,
    `Whether you are a seasoned traveler or booking your first trip through ${bn}, these money-saving strategies can help you lock in better prices and avoid common pitfalls.`,
  ];

  const dealIntroGeneral = [
    `Smart shopping means knowing how to maximize value. We have put together actionable tips for getting the best deal when using ${bn}, based on ${thorough} research and real user strategies.`,
    `Before you commit to a purchase through ${bn}, it is ${worth} knowing a few strategies that can help you save money and get the most out of the ${offering}. Here is what we recommend.`,
    `${bn} offers ${competitive} pricing in the ${cat} ${landscape}, but there are still ways to optimize your spending. These tips can help you find the sweet spot between features and cost.`,
  ];

  const guideIntroTemplates = [
    `New to ${bn}? Getting started is straightforward. We have broken the process down into clear steps so you can go from sign-up to active use in minutes, without missing anything important.`,
    `If you have decided ${bn} is ${worth}, here is exactly how to set up your account and start using the ${offering} effectively. We have walked through the process step by step.`,
    `Setting up ${bn} for the first time? This quick-start guide covers everything from creating your account to making your first ${ctx.isTravel ? "search" : "purchase"} — no technical knowledge required.`,
  ];

  const alternativesIntroTemplates = [
    `${bn} is not the only player in the ${cat} ${landscape}. To help you make an informed choice, we have compared it head-to-head against three popular alternatives on the dimensions that matter most.`,
    `How does ${bn} stack up against the competition? We compared it to three other ${cat} tools across key criteria. Here is where each one shines — and where it falls short.`,
    `Choosing the right ${cat} ${offering} means understanding the trade-offs. Below is a side-by-side look at ${bn} and its closest competitors, with honest assessments of each.`,
  ];

  const timingIntroTemplates = [
    `Timing can significantly affect the value you get from ${bn}. ${ctx.isTravel ? "Flight prices fluctuate based on season, day of week, and how far in advance you book." : "Promotional cycles, seasonal sales, and renewal windows all create opportunities to save."} Here is what to keep in mind.`,
    `When you ${ctx.isTravel ? "book" : "buy"} matters just as much as where. Understanding ${bn}'s pricing patterns and ${ctx.isTravel ? "fare trends" : "promotional calendar"} can help you time your ${ctx.isTravel ? "booking" : "purchase"} for maximum savings.`,
    `One of the most overlooked ways to save with ${bn} is simply choosing the right moment. ${ctx.isTravel ? "Airfares and hotel rates" : "Subscription prices and bundle deals"} vary considerably throughout the year — here is what our research ${suggests}.`,
  ];

  return {
    /** 2–3 intro paragraphs for "In a Nutshell / What Is …?" */
    introBlock(): string[] {
      const p1 = pick(introTemplates, seed, 30);
      const p2 = pick(detailParaTemplates, seed, 31);
      return [p1, p2];
    },

    /** Comparison / competitive positioning paragraph */
    comparisonParagraph(): string {
      return pick(comparisonTemplates, seed, 40);
    },

    /** Pricing discussion paragraph */
    pricingParagraph(): string {
      return pick(pricingParaTemplates, seed, 50);
    },

    /** Drawback transparency paragraph */
    drawbackParagraph(): string {
      return pick(drawbackParaTemplates, seed, 60);
    },

    /** Bottom line / conclusion paragraph */
    bottomLineParagraph(): string {
      return pick(bottomLineTemplates, seed, 70);
    },

    /** Methodology intro paragraph */
    methodologyParagraph(): string {
      return pick(methodologyIntroTemplates, seed, 80);
    },

    /** Brand history / background paragraph */
    historyParagraph(): string {
      return pick(historyTemplates, seed, 90);
    },

    /** Deal / savings intro paragraph */
    dealIntroParagraph(): string {
      return ctx.isTravel
        ? pick(dealIntroTravel, seed, 130)
        : pick(dealIntroGeneral, seed, 130);
    },

    /** Getting started guide intro paragraph */
    guideIntroParagraph(): string {
      return pick(guideIntroTemplates, seed, 140);
    },

    /** Alternatives comparison intro paragraph */
    alternativesIntroParagraph(): string {
      return pick(alternativesIntroTemplates, seed, 150);
    },

    /** Timing / seasonal advice intro paragraph */
    timingIntroParagraph(): string {
      return pick(timingIntroTemplates, seed, 160);
    },

    /** Shuffle an array deterministically for this brand */
    shuffle<T>(arr: T[]): T[] {
      return seededShuffle(arr, seed);
    },

    /** Pick a transition word for variety */
    transition(idx: number): string {
      const pool = [
        "Furthermore", "Additionally", "On top of that",
        "It is also worth noting that", "Another point worth mentioning is that",
        "Beyond that", "Equally important",
      ];
      return pick(pool, seed, 100 + idx);
    },

    /** Pick a verb for "we found/discovered/observed" */
    weFound(idx: number): string {
      const pool = [
        "we found", "we observed", "we noticed", "our team noted",
        "it became clear", "we discovered", "our analysis revealed",
      ];
      return pick(pool, seed, 110 + idx);
    },

    /** Pick a hedging phrase */
    hedge(idx: number): string {
      const pool = [
        "Based on our research,", "From what we have seen,",
        "According to our analysis,", "In our assessment,",
        "From publicly available information,", "As far as we can determine,",
      ];
      return pick(pool, seed, 120 + idx);
    },
  };
}
