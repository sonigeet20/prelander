import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      offers: { include: { _count: { select: { keywords: true, generatedPages: true } } } },
      verticalClassifications: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  return NextResponse.json({ brand });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const brand = await prisma.brand.update({ where: { id }, data: body });
  return NextResponse.json({ brand });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.brand.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
