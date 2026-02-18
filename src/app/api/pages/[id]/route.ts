import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const page = await prisma.generatedPage.findUnique({
    where: { id },
    include: {
      offer: { include: { brand: true }, },
      keyword: true,
      complianceLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();

  // Handle publish action
  if (body.action === "publish") {
    const page = await prisma.generatedPage.findUnique({
      where: { id },
      include: { offer: { include: { brand: true } } },
    });
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    const brandSlug = page.offer.brand.domain.replace(/\.\w+$/, "").replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const publishedUrl = `/guides/${brandSlug}/${page.slug}`;

    const updated = await prisma.generatedPage.update({
      where: { id },
      data: {
        status: "published",
        publishedAt: new Date(),
        publishedUrl,
      },
      include: {
        offer: { include: { brand: true } },
        keyword: true,
        complianceLogs: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    return NextResponse.json({ page: updated });
  }

  const updated = await prisma.generatedPage.update({
    where: { id },
    data: body,
    include: {
      offer: { include: { brand: true } },
      keyword: true,
      complianceLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  return NextResponse.json({ page: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.generatedPage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
