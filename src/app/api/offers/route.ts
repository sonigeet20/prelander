import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brandId");
  const where = brandId ? { brandId } : {};
  const offers = await prisma.offer.findMany({
    where,
    include: {
      brand: true,
      _count: { select: { keywords: true, generatedPages: true, clickLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { brandId, name, destinationUrl, targetGeos, targetLanguages } = body;

  if (!brandId || !name || !destinationUrl) {
    return NextResponse.json({ error: "brandId, name, and destinationUrl are required" }, { status: 400 });
  }

  const slug = slugify(name, 48);

  const offer = await prisma.offer.create({
    data: {
      brandId,
      name,
      slug,
      destinationUrl,
      targetGeos: targetGeos || [],
      targetLanguages: targetLanguages || ["en"],
    },
  });

  return NextResponse.json({ offer }, { status: 201 });
}
