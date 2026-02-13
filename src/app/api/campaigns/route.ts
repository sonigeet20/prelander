import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Failed to list campaigns:", error);
    return NextResponse.json({ error: "Failed to list campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.offerName || body.offerName.trim().length === 0) {
      return NextResponse.json(
        { error: "offerName is required" },
        { status: 400 },
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        offerName: body.offerName.trim(),
        description: body.description?.trim() || "",
        destinationUrl: body.destinationUrl?.trim() || "",
        researchUrls: body.researchUrls || [],
        brandUrls: body.brandUrls || [],
        trackingUrls: body.trackingUrls || [],
        geos: body.geos || [],
        languages: body.languages || [],
        popunderEnabled: body.popunderEnabled ?? false,
        silentFetchEnabled: body.silentFetchEnabled ?? false,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
