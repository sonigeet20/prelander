import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { selectBlueprint } from "@/lib/services/blueprint-selector";
import { generatePage } from "@/lib/services/page-generator";
import { scanCompliance } from "@/lib/services/compliance-scanner";
import { scrapeBrandData, isBrandDataFresh } from "@/lib/services/brand-data-scraper";
import { slugify } from "@/lib/slug";
import type { VerticalType, IntentType, GeneratedPageContent } from "@/types";

export async function POST(req: NextRequest) {
  const { keywordId } = await req.json();
  if (!keywordId) return NextResponse.json({ error: "keywordId required" }, { status: 400 });

  const keyword = await prisma.keyword.findUnique({
    where: { id: keywordId },
    include: { offer: { include: { brand: true } } },
  });
  if (!keyword) return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
  if (!keyword.intentType) return NextResponse.json({ error: "Keyword not classified yet — run intent classification first" }, { status: 400 });

  const { offer } = keyword;
  const { brand } = offer;
  const verticalType = (brand.verticalType || "other") as VerticalType;
  const intentType = keyword.intentType as IntentType;

  // Auto-scrape brand data if not fresh
  const fresh = await isBrandDataFresh(brand.id);
  if (!fresh) {
    try {
      await scrapeBrandData(brand.id, brand.name, brand.domain);
    } catch (err) {
      console.warn("Brand data scraping failed, continuing without:", err);
    }
  }

  // Select blueprint (pass entities so it can validate city presence)
  const entities = (keyword.metadata as any) || {};
  const blueprint = selectBlueprint(verticalType, intentType, entities);

  // Generate page (now with brandId for data injection)
  const content = await generatePage({
    keyword: keyword.keyword,
    brandName: brand.name,
    brandDomain: brand.domain,
    brandId: brand.id,
    verticalType,
    intentType,
    blueprint,
    destinationUrl: offer.destinationUrl,
    entities,
  });

  // Run final compliance scan
  const compliance = scanCompliance(content);

  // Store generated page
  const pageSlug = slugify(keyword.keyword, 64);
  const page = await prisma.generatedPage.upsert({
    where: { offerId_slug: { offerId: offer.id, slug: pageSlug } },
    update: {
      title: content.title,
      metaDescription: content.metaDescription,
      h1: content.h1,
      content: content as any,
      status: compliance.passed ? "compliant" : "review",
      complianceScore: compliance.score,
      keywordId: keyword.id,
    },
    create: {
      offerId: offer.id,
      keywordId: keyword.id,
      blueprintId: null, // blueprints are code-based, not DB-based for MVP
      slug: pageSlug,
      title: content.title,
      metaDescription: content.metaDescription,
      h1: content.h1,
      content: content as any,
      status: compliance.passed ? "compliant" : "review",
      complianceScore: compliance.score,
    },
  });

  // Log compliance scan
  await prisma.complianceLog.create({
    data: {
      pageId: page.id,
      scanType: "pre_publish",
      passed: compliance.passed,
      violations: compliance.violations as any,
    },
  });

  return NextResponse.json({
    page,
    compliance,
    blueprint: blueprint.name,
  });
}
