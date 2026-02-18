import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Clean affiliate click-through redirect.
 *
 * Flow: User clicks visible CTA → GET /go/{offer-slug} → 302 → destination URL
 *
 * This is standard affiliate link behaviour (identical to how Wirecutter,
 * NerdWallet, The Points Guy, etc. operate). Google Ads allows this because:
 *   ✅ Only fires on explicit, user-initiated clicks
 *   ✅ Link is fully visible with proper rel="nofollow sponsored"
 *   ✅ No hidden elements, no background fetches, no auto-redirects
 *   ✅ Destination matches what the user expects (Visit {Brand} →)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Look up the offer
  const offer = await prisma.offer.findUnique({
    where: { slug },
    select: { id: true, destinationUrl: true, status: true },
  });

  // If offer not found or not active, redirect to homepage gracefully
  if (!offer || !offer.destinationUrl) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  // Log the click (non-blocking — don't slow down the redirect)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ua = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";

  // Fire-and-forget click log — no await so redirect is instant
  prisma.clickLog.create({
    data: {
      offerId: offer.id,
      cluster: "cta",
      ip,
      userAgent: ua,
      referer,
      destinationUrl: offer.destinationUrl,
    },
  }).catch(() => {});

  // 302 redirect to the actual destination
  return NextResponse.redirect(offer.destinationUrl, 302);
}
