import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/deals — list deals, optionally filtered by campaignId or brand slug
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = { active: true };

  if (campaignId) where.campaignId = campaignId;

  if (brand) {
    // Find campaign by brand slug
    const campaigns = await prisma.campaign.findMany();
    const { slugify } = await import("@/lib/slug");
    const match = campaigns.find((c) => {
      const slug = slugify(c.offerName, 32);
      return slug === brand || c.subdomain === brand || c.brandName.toLowerCase() === brand.toLowerCase();
    });
    if (match) where.campaignId = match.id;
    else return NextResponse.json({ deals: [] });
  }

  if (category && category !== "All") where.category = category;
  if (featured === "true") where.featured = true;

  const deals = await prisma.deal.findMany({
    where,
    include: { campaign: { select: { id: true, offerName: true, brandName: true, destinationUrl: true, metadata: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ deals });
}

// POST /api/deals — create a new deal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      campaignId,
      title,
      description,
      code,
      discountLabel,
      discountPercent,
      category,
      destinationUrl,
      verified,
      featured,
      expiresAt,
    } = body;

    if (!campaignId || !title || !description) {
      return NextResponse.json({ error: "campaignId, title, and description are required" }, { status: 400 });
    }

    const deal = await prisma.deal.create({
      data: {
        campaignId,
        title,
        description,
        code: code || null,
        discountLabel: discountLabel || "",
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        category: category || "General",
        destinationUrl: destinationUrl || "",
        verified: verified !== false,
        featured: featured === true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error("Failed to create deal:", error);
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
