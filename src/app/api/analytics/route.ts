import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/analytics - Fetch analytics summary and recent activity
 */
export async function GET() {
  const clickLogs = await prisma.clickLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      cluster: true,
      ip: true,
      userAgent: true,
      referer: true,
      gclid: true,
      gbraid: true,
      wbraid: true,
      destinationUrl: true,
      createdAt: true,
    },
  });

  const impressionLogs = await prisma.impressionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      pageUrl: true,
      ip: true,
      userAgent: true,
      referer: true,
      gclid: true,
      gbraid: true,
      wbraid: true,
      createdAt: true,
    },
  });

  const summary = {
    totalClicks: await prisma.clickLog.count(),
    totalImpressions: await prisma.impressionLog.count(),
    totalConversions: await prisma.conversion.count(),
    totalOffers: await prisma.offer.count(),
    clicksLast24h: await prisma.clickLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    impressionsLast24h: await prisma.impressionLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  };

  return NextResponse.json({ summary, recentClicks: clickLogs, recentImpressions: impressionLogs });
}

/**
 * POST /api/analytics - Log impression/click/conversion events
 * Called by TrackingPixels component
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, offerId, pageUrl } = body;

    if (!type || !offerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    // Read Google Ads click IDs from the JSON body (sent by TrackingPixels)
    let gclid = body.gclid || null;
    let gbraid = body.gbraid || null;
    let wbraid = body.wbraid || null;

    // Fallback: try to extract from the referer URL if not in body
    if (!gclid && !gbraid && !wbraid && referer) {
      try {
        const refUrl = new URL(referer);
        gclid = refUrl.searchParams.get("gclid") || null;
        gbraid = refUrl.searchParams.get("gbraid") || null;
        wbraid = refUrl.searchParams.get("wbraid") || null;
      } catch {
        // Ignore invalid referer URLs
      }
    }

    if (type === "impression" && pageUrl) {
      // Log page view
      await prisma.impressionLog.create({
        data: {
          offerId,
          pageUrl,
          ip,
          userAgent,
          referer,
          gclid,
          gbraid,
          wbraid,
        },
      });

      return NextResponse.json({ success: true, type: "impression" });
    }

    // Future: handle click/conversion types here if needed

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
