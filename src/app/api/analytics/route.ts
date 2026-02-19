import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const summary = {
    totalClicks: await prisma.clickLog.count(),
    totalConversions: await prisma.conversion.count(),
    totalOffers: await prisma.offer.count(),
    clicksLast24h: await prisma.clickLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  };

  return NextResponse.json({ summary, recentClicks: clickLogs });
}
