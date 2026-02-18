import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyVertical } from "@/lib/services/vertical-classifier";

export async function GET() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { offers: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ brands });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { domain, name, description } = body;

  if (!domain || !name) {
    return NextResponse.json({ error: "domain and name are required" }, { status: 400 });
  }

  // Create brand
  const brand = await prisma.brand.create({
    data: {
      domain: domain.replace(/^https?:\/\//, "").replace(/\/+$/, ""),
      name,
      description: description || null,
    },
  });

  // Auto-classify vertical
  try {
    const result = await classifyVertical(brand.domain, brand.name, brand.description || undefined);
    await prisma.brand.update({
      where: { id: brand.id },
      data: { verticalType: result.verticalType, classifiedAt: new Date() },
    });
    await prisma.verticalClassification.create({
      data: {
        brandId: brand.id,
        verticalType: result.verticalType,
        confidence: result.confidence,
        reasoning: result.reasoning,
      },
    });
  } catch (err) {
    console.error("Auto-classify failed:", err);
  }

  const updated = await prisma.brand.findUnique({ where: { id: brand.id } });
  return NextResponse.json({ brand: updated }, { status: 201 });
}
