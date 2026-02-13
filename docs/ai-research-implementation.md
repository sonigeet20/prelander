# AI Brand Research Implementation

## Overview
The landing pages now automatically extract and display real brand information from the configured brand URLs.

## How It Works

### 1. Research Phase
When you click "Run Research" on an offer:
- The system fetches the brand's landing page from `brandUrls[0]`
- Extracts key information using intelligent parsing:
  - **Brand name** from page title
  - **Tagline** from meta description
  - **Category** inferred from content (Travel, Finance, Software, etc.)
  - **Key benefits** from headings and benefit-focused text
  - **Features** from feature sections
  - **Trust signals** (user counts, security badges, support availability)
  - **Use cases** from content patterns
  - **FAQs** by detecting question/answer patterns
  - **Tone** (professional, casual, premium, friendly)

### 2. Storage
The extracted data is stored as a `BrandFactPack` in the campaign's `metadata.brandFactPack` field in `data/db.json`.

### 3. Landing Page Display
The landing page automatically uses this data:
- **Hero section**: Brand name, tagline, and trust signals
- **Benefits section**: Top 3 key benefits extracted from brand site
- **Features grid**: Up to 6 features with auto-generated icons
- **FAQ section**: Questions and answers extracted from brand content
- **Meta tags**: SEO-optimized titles and descriptions using brand data

## Files Modified

### New Files
- `src/lib/ai-research.ts` - Brand information extraction engine

### Modified Files
- `src/app/api/research/route.ts` - Now actually fetches and extracts brand data
- `src/app/offer/[offer]/[cluster]/page.tsx` - Uses brand fact pack for dynamic content
- `src/lib/types.ts` - Added `metadata` and `brandFactPack` to Campaign interface
- `src/lib/campaigns.ts` - Added `metadata` and `lastResearchedAt` to updateCampaign
- `src/components/OfferActions.tsx` - Shows research progress with extracted data count
- `src/components/PopunderButton.tsx` - Added className prop support

## Usage

### Step 1: Configure Brand URLs
When creating/editing an offer, add the brand's landing page URL to the "Brand URLs" field:
```
https://www.skyscanner.com
```

### Step 2: Run Research
1. Go to the offer detail page
2. Click "Run Research"
3. Wait for completion (usually 2-5 seconds)
4. You'll see: "Research completed! Extracted: X benefits, Y features"

### Step 3: View Dynamic Landing Page
1. Click "Preview Landing Page" or visit `/offer/{slug}/{cluster}`
2. The page now shows:
   - Real brand name and tagline
   - Extracted benefits and features
   - Brand-specific trust signals
   - FAQs from the brand site
   - SEO metadata optimized for Google Ads

## Example: Skyscanner

Before research (generic):
```
Title: SKYSCANNER_CLD - flights | Official Guide
Benefits: Easy to use, Compare options, Save time
```

After research (brand-specific):
```
Title: Skyscanner - flights | Compare flight prices
Benefits: Search 1000s of airlines, Best price guaranteed, No hidden fees
Features: Price alerts, Flexible search, Mobile app, Everywhere search
Trust: Trusted by millions, Free to use, Secure booking
```

## Extraction Intelligence

The system uses smart heuristics to identify quality content:

### Benefits Detection
- Looks for headings with keywords: "benefit", "why", "best", "save"
- Finds sentences starting with "helps you", "you can", "allows you"
- Filters out noise and keeps meaningful benefits (20-120 chars)

### Features Detection
- Searches for "feature", "include", "offer", "provide" in headings
- Falls back to sensible defaults if none found

### Trust Signals
- User count patterns: "10M+ users", "trusted by thousands"
- Security indicators: "secure", "SSL", "encrypted"
- Support availability: "24/7", "support"

### FAQ Extraction
- Detects question patterns (ending with ?, starting with how/what/why)
- Pairs questions with following sentences as answers
- Validates answer length (20-300 chars)

## Fallback Behavior

If research fails or brand URL is inaccessible:
- Returns generic but professional fact pack
- Page still renders with placeholder content
- User experience is not broken

## Next Steps

### Enhance Extraction (Future)
- Integrate LLM (OpenAI/Anthropic) for deeper content understanding
- Extract pricing tiers and plans
- Identify competitor comparisons
- Pull testimonials and reviews

### Multi-URL Support
- Currently uses first brand URL only
- Could aggregate data from multiple URLs
- Compare different landing pages for best content

### Keyword Clustering
- Use extracted content to generate keyword clusters
- Match cluster intent with brand features
- Create targeted landing pages per cluster

## Testing

Test the research API directly:
```bash
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "your-campaign-id"}'
```

Response:
```json
{
  "success": true,
  "message": "Brand research completed successfully",
  "factPack": {
    "brandName": "Skyscanner",
    "tagline": "Compare cheap flights...",
    "category": "Travel & Tourism",
    "keyBenefits": [...],
    "features": [...],
    ...
  }
}
```
