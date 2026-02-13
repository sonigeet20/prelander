import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isBotUserAgent } from "@/lib/bot";
import { checkRateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/slug";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offer: string; cluster: string }> },
) {
  const { offer, cluster } = await params;
  const userAgent = request.headers.get("user-agent");
  const ip = getClientIp(request) ?? undefined;

  const rateKey = `${ip ?? "unknown"}:${userAgent ?? "ua"}`;
  const rate = checkRateLimit(rateKey, 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (isBotUserAgent(userAgent)) {
    return NextResponse.json({ error: "bot_detected" }, { status: 429 });
  }

  // Find campaign in Prisma
  const campaigns = await prisma.campaign.findMany();
  const match = campaigns.find((campaign) => {
    const slug = slugify(campaign.offerName, 32);
    return slug === offer || campaign.subdomain === offer;
  });

  if (!match) {
    return NextResponse.json({ error: "offer_not_found" }, { status: 404 });
  }

  const gclid = request.cookies.get("gclid")?.value;
  const gbraid = request.cookies.get("gbraid")?.value;
  const wbraid = request.cookies.get("wbraid")?.value;

  // Record click in database
  await prisma.clickSession.create({
    data: {
      campaignId: match.id,
      clusterId: cluster,
      ip: ip || "unknown",
      userAgent: userAgent || "",
      gclid,
      gbraid,
      wbraid,
    },
  });

  // Silent fetch of tracking URLs
  if (match.silentFetchEnabled && match.trackingUrls.length > 0) {
    void Promise.allSettled(
      match.trackingUrls.map((url) =>
        fetch(url, {
          method: "GET",
          headers: { "User-Agent": userAgent ?? "" },
          redirect: "follow",
        }),
      ),
    );
  }

  const destination = match.destinationUrl || match.trackingUrls[0];
  if (!destination) {
    return NextResponse.json(
      { error: "destination_not_configured" },
      { status: 400 },
    );
  }

  return NextResponse.redirect(destination, 302);
}
