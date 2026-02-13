import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractBrandInfo } from "@/lib/ai-research";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    campaignId?: string;
  };

  if (!body.campaignId) {
    return NextResponse.json(
      { error: "campaignId is required" },
      { status: 400 },
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: body.campaignId },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (!campaign.brandUrls || campaign.brandUrls.length === 0) {
    return NextResponse.json(
      { error: "No brand URLs configured for this campaign" },
      { status: 400 },
    );
  }

  try {
    // Extract brand info from first URL
    const brandUrl = campaign.brandUrls[0];
    console.log(`Researching brand: ${brandUrl}`);
    
    const factPack = await extractBrandInfo(brandUrl);

    // Store in campaign metadata
    const existingMeta = (campaign.metadata as Record<string, unknown>) || {};
    await prisma.campaign.update({
      where: { id: body.campaignId },
      data: {
        metadata: {
          ...existingMeta,
          brandFactPack: JSON.parse(JSON.stringify(factPack)),
        } as Prisma.InputJsonValue,
        lastResearchedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Brand research completed successfully",
      factPack,
    });
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json(
      { 
        error: "Failed to research brand", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 },
    );
  }
}
