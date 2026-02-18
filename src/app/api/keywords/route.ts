import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get("offerId");
  if (!offerId) return NextResponse.json({ error: "offerId required" }, { status: 400 });

  const keywords = await prisma.keyword.findMany({
    where: { offerId },
    include: { _count: { select: { generatedPages: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ keywords });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { offerId, keywords } = body as { offerId: string; keywords: string[] };

  if (!offerId || !keywords?.length) {
    return NextResponse.json({ error: "offerId and keywords[] required" }, { status: 400 });
  }

  // Upsert keywords (skip duplicates)
  const results = [];
  for (const kw of keywords) {
    const trimmed = kw.trim();
    if (!trimmed) continue;
    try {
      const created = await prisma.keyword.upsert({
        where: { offerId_keyword: { offerId, keyword: trimmed } },
        update: {},
        create: { offerId, keyword: trimmed },
      });
      results.push(created);
    } catch {
      // Skip duplicates
    }
  }

  return NextResponse.json({ keywords: results, count: results.length }, { status: 201 });
}
