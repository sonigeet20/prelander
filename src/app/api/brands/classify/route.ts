import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyVertical } from "@/lib/services/vertical-classifier";

export async function POST(req: NextRequest) {
  const { brandId } = await req.json();
  if (!brandId) return NextResponse.json({ error: "brandId required" }, { status: 400 });

  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const result = await classifyVertical(brand.domain, brand.name, brand.description || undefined);

  await prisma.brand.update({
    where: { id: brand.id },
    data: { verticalType: result.verticalType, classifiedAt: new Date() },
  });

  const log = await prisma.verticalClassification.create({
    data: {
      brandId: brand.id,
      verticalType: result.verticalType,
      confidence: result.confidence,
      reasoning: result.reasoning,
    },
  });

  return NextResponse.json({ classification: log, brand: { ...brand, verticalType: result.verticalType } });
}
