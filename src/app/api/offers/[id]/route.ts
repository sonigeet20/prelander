import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      brand: true,
      keywords: { orderBy: { createdAt: "desc" } },
      generatedPages: { orderBy: { createdAt: "desc" } },
      _count: { select: { clickLogs: true, conversions: true } },
    },
  });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  return NextResponse.json({ offer });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const offer = await prisma.offer.update({ where: { id }, data: body });
  return NextResponse.json({ offer });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.offer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
