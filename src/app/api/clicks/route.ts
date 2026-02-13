import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, cluster, source, userAgent, referrer } = body;

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get user IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Get URL parameters for tracking
    const url = new URL(request.url);
    const gclid = url.searchParams.get("gclid") || undefined;
    const gbraid = url.searchParams.get("gbraid") || undefined;
    const wbraid = url.searchParams.get("wbraid") || undefined;

    // Record click in database
    await prisma.clickSession.create({
      data: {
        campaignId,
        clusterId: cluster || "default",
        ip,
        userAgent: userAgent || "",
        referrer: referrer || undefined,
        gclid,
        gbraid,
        wbraid,
      },
    });

    // Server-side silent fetch of tracking URLs
    if (campaign.silentFetchEnabled && campaign.trackingUrls.length > 0) {
      void Promise.allSettled(
        campaign.trackingUrls.map((trackUrl) =>
          fetch(trackUrl, {
            method: "GET",
            headers: { "User-Agent": userAgent || "" },
            redirect: "follow",
          }),
        ),
      );
    }

    return NextResponse.json(
      {
        success: true,
        tracked: {
          campaignId,
          cluster,
          source,
          ip,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 },
    );
  }
}
