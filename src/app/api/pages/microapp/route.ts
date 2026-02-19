import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/pages/microapp - Create dedicated microapp pages
 * Creates flight-finder or ai-assistant landing pages at:
 * - /offers/[slug]/flight-finder
 * - /offers/[slug]/ai-assistant
 */
export async function POST(req: NextRequest) {
  try {
    const { offerId, type } = await req.json();

    if (!offerId || !type || !["flight-finder", "ai-assistant"].includes(type)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { brand: true },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Check if microapp page already exists (stored as a marker in the offer or via a flag)
    // For now, we'll just return success - the pages are actual Next.js routes that exist
    // We can optionally create a database record if needed for tracking

    return NextResponse.json({
      success: true,
      message: `${type} page created at /offers/${offer.slug}/${type}`,
      url: `/offers/${offer.slug}/${type}`,
    });
  } catch (error: any) {
    console.error("Failed to create microapp page:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
