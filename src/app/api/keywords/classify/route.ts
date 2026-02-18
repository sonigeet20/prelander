import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyIntent } from "@/lib/services/intent-classifier";

export async function POST(req: NextRequest) {
  const { offerId } = await req.json();
  if (!offerId) return NextResponse.json({ error: "offerId required" }, { status: 400 });

  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { brand: true } });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  const keywords = await prisma.keyword.findMany({
    where: { offerId, intentType: null },
  });

  if (keywords.length === 0) {
    return NextResponse.json({ message: "No unclassified keywords found", classified: 0 });
  }

  const results = [];
  for (const kw of keywords) {
    const result = await classifyIntent(kw.keyword, offer.brand.verticalType || undefined);

    await prisma.keyword.update({
      where: { id: kw.id },
      data: { intentType: result.intentType, classifiedAt: new Date(), metadata: result.detectedEntities as any },
    });

    await prisma.intentClassification.create({
      data: {
        keywordId: kw.id,
        intentType: result.intentType,
        confidence: result.confidence,
        reasoning: result.reasoning,
        detectedEntities: result.detectedEntities as any,
      },
    });

    results.push({ keyword: kw.keyword, ...result });
  }

  return NextResponse.json({ classified: results.length, results });
}
