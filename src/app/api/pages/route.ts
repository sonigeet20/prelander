import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get("offerId");
  const status = req.nextUrl.searchParams.get("status");

  const where: any = {};
  if (offerId) where.offerId = offerId;
  if (status) where.status = status;

  const pages = await prisma.generatedPage.findMany({
    where,
    include: {
      offer: { include: { brand: true } },
      keyword: true,
      _count: { select: { complianceLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pages });
}
