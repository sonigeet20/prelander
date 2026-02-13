# Review-Style Landing Pages

## Overview
Landing pages now follow a **review editorial format** inspired by top10.com, providing:
- Editorial ratings and scores
- Pros & Cons analysis
- "At a Glance" summary boxes
- Expert verdicts
- User testimonials
- Detailed feature breakdowns

## Page Structure

### 1. Header Section
- Category tag
- Publication date
- Editorial branding

### 2. Title & Hero
```
[Brand Name] Review (2026)
[Tagline/Description]
[Visit Site CTA] [Star Rating] (8.2/10)
```

### 3. At a Glance Box (Blue highlight)
- **Editorial Score**: 8.2/10
- **Best For**: Budget-conscious users
- **Price**: From $25/month
- **Category**: Travel & Tourism

### 4. In a Nutshell
Brief 2-3 sentence overview positioning the review.

### 5. Pros & Cons Section
**Two-column layout:**
- ✓ **Pros**: 3-5 positive points
- ✗ **Cons**: 2-4 limitations

Includes CTA button below.

### 6. Features & Services
Detailed breakdown of 3-4 key features with descriptions.

### 7. Pricing Section
- Pricing table/info
- Value for money assessment

### 8. User Testimonials (if available)
- Quoted user feedback
- Star ratings
- Author attribution

### 9. FAQ Section
Expandable accordion-style Q&A.

### 10. Bottom Line (Blue gradient CTA box)
- Expert verdict paragraph
- Large "Try [Brand] Now" CTA
- Editorial score display

### 11. Disclosure Footer
Advertising disclosure and editorial independence statement.

## AI Extraction Enhancements

### New Data Points Extracted

**Pros/Cons Detection:**
```typescript
pros: [
  "Fast 5G speeds",
  "Nationwide coverage",
  "Affordable pricing"
]
cons: [
  "Limited device selection",
  "Doesn't operate own network"
]
```

**Editorial Score (Auto-generated):**
```typescript
editorialScore: 8.2  // Based on content quality signals
```

**Best For:**
```typescript
bestFor: "Budget-conscious users looking for unlimited data"
```

**Testimonials:**
```typescript
testimonials: [
  {
    author: "Amy Cook",
    text: "Great service, haven't had any issues",
    rating: 5
  }
]
```

## Scoring Algorithm

Base score: **7.0**

Increases for:
- "best" mentions: +0.5
- "award" mentions: +0.5
- "trusted" mentions: +0.3
- "secure" mentions: +0.2
- Large user base (10M+): +0.5

Max score: **9.5**

## Content Extraction Logic

### Pros Extraction
Looks for:
- Headings with: "advantage", "benefit", "pro", "strength"
- Content with: "fast", "easy", "reliable", "affordable", "free"

### Cons Extraction
Looks for:
- Headings with: "disadvantage", "con", "weakness", "limitation"
- Content with: "limited", "no ", "doesn't", "issue"

### Best For Inference
Pattern matching:
- "budget/affordable/cheap" → "Budget-conscious users"
- "business/enterprise" → "Businesses and professionals"
- "beginner/easy" → "Beginners seeking simplicity"
- "advanced/power" → "Advanced users and power users"

### Testimonials Extraction
- Finds quoted text (30-200 chars)
- Assigns "Verified User" attribution
- Defaults to 5-star rating

## Visual Design

### Color Scheme
- **Primary**: Blue (#2563eb)
- **Success/Pros**: Green (#16a34a)
- **Warning/Cons**: Red (#dc2626)
- **Backgrounds**: Gray-50, White
- **Accents**: Blue gradient for CTAs

### Typography
- **Headings**: Bold, 2xl-4xl
- **Body**: Gray-700, relaxed leading
- **Scores**: Large, bold, colored

### Components
- **Summary Box**: Blue-50 background, blue-600 left border
- **Pros/Cons**: Two-column grid with icons
- **FAQ**: Accordion with hover states
- **CTA Boxes**: Gradient backgrounds, prominent buttons
- **Testimonials**: Gray-50 cards with blue left border

## SEO Optimization

### Schema.org Markup
```json
{
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "Skyscanner"
  },
  "reviewRating": {
    "ratingValue": 8.2,
    "bestRating": 10
  }
}
```

### Meta Tags
- **Title**: "[Brand] Review (2026) - [Cluster] | Expert Analysis"
- **Description**: Includes pros count, features, testimonials mention
- **OpenGraph Type**: "article" (not "website")

## Example: Skyscanner Review Page

```
Title: Skyscanner Review (2026) - flights | Expert Analysis

At a Glance:
- Score: 8.5/10
- Best For: Travelers seeking cheap flights
- Price: Free to use
- Category: Travel & Tourism

Pros:
✓ Search 1000s of airlines
✓ Price comparison
✓ No booking fees
✓ Mobile apps for iOS/Android

Cons:
✗ Doesn't book directly
✗ Some prices may vary

Bottom Line:
Skyscanner excels at flight comparison with comprehensive 
search and zero fees. Highly recommended for budget travelers.
```

## File Locations

**Landing Page:**
- `/src/app/offer/[offer]/[cluster]/page.tsx` - Review-style template
- `/src/app/offer/[offer]/[cluster]/page-brand.tsx` - Previous brand template (backup)
- `/src/app/offer/[offer]/[cluster]/page-old.tsx` - Original generic template (backup)

**AI Research:**
- `/src/lib/ai-research.ts` - Enhanced with pros/cons/testimonials extraction

**Types:**
- BrandFactPack interface now includes:
  - `pros: string[]`
  - `cons: string[]`
  - `editorialScore?: number`
  - `bestFor?: string`
  - `testimonials?: Array<{author, text, rating}>`

## Testing Checklist

- [x] Build compiles without errors
- [ ] Run research on Skyscanner offer
- [ ] Verify pros/cons extracted correctly
- [ ] Check editorial score displays (7.0-9.5 range)
- [ ] Validate testimonials section appears
- [ ] Test FAQ accordion functionality
- [ ] Verify CTA buttons trigger popunder
- [ ] Check mobile responsive design
- [ ] Validate Schema.org markup in source
- [ ] Test with and without research data (fallbacks)

## Next Steps

1. **Test with real brand**:
   ```bash
   # Visit offer detail page
   # Click "Run Research"
   # View landing page preview
   ```

2. **Enhance extraction** (future):
   - LLM-powered content generation
   - Sentiment analysis for pros/cons
   - Competitor comparison extraction
   - Price trend analysis

3. **A/B Testing**:
   - Test review vs brand template
   - Measure conversion rates
   - Track engagement metrics
