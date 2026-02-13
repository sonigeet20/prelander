import { NextRequest, NextResponse } from "next/server";
import { getCampaignById } from "@/lib/campaigns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, cluster, source, userAgent, referrer } = body;

    // Validate campaign exists
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get user IP
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Get URL parameters for tracking
    const url = new URL(request.url);
    const gclid = url.searchParams.get("gclid");
    const gbraid = url.searchParams.get("gbraid");
    const wbraid = url.searchParams.get("wbraid");

    // Log the click (for now, just return success)
    // In production with Prisma, this would be:
    // await prisma.clickSession.create({
    //   data: {
    //     campaignId,
    //     clusterId: cluster,
    //     ip,
    //     userAgent,
    //     referrer,
    //     gclid: gclid || undefined,
    //     gbraid: gbraid || undefined,
    //     wbraid: wbraid || undefined,
    //   },
    // });

    console.log(`Click tracked: ${campaignId} / ${cluster} from ${ip}`);

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
