import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeBrandData, getBrandData, isBrandDataFresh } from "@/lib/services/brand-data-scraper";

/**
 * POST /api/brands/[id]/scrape — Trigger brand data scraping
 * GET  /api/brands/[id]/scrape — Retrieve stored brand data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const force = body.force === true;

  // Check if data is fresh (skip scraping if so, unless forced)
  if (!force) {
    const fresh = await isBrandDataFresh(id);
    if (fresh) {
      const existing = await getBrandData(id);
      return NextResponse.json({
        status: "cached",
        message: "Brand data is still fresh. Use force=true to refresh.",
        data: existing,
      });
    }
  }

  // Scrape all data types
  const dataTypes = body.dataTypes || ["pricing", "features", "pros_cons", "company_info", "competitors"];
  const data = await scrapeBrandData(id, brand.name, brand.domain, dataTypes);

  return NextResponse.json({
    status: "scraped",
    brand: { id: brand.id, name: brand.name, domain: brand.domain },
    dataTypes: Object.keys(data),
    data,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const data = await getBrandData(id);
  const fresh = await isBrandDataFresh(id);

  return NextResponse.json({
    brand: { id: brand.id, name: brand.name, domain: brand.domain },
    isFresh: fresh,
    dataTypes: Object.keys(data),
    data,
  });
}
