import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/deals/[id] — get a single deal
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { campaign: { select: { id: true, offerName: true, brandName: true, destinationUrl: true } } },
  });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  return NextResponse.json({ deal });
}

// PATCH /api/deals/[id] — update a deal
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await req.json();
    const deal = await prisma.deal.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.code !== undefined && { code: body.code || null }),
        ...(body.discountLabel !== undefined && { discountLabel: body.discountLabel }),
        ...(body.discountPercent !== undefined && { discountPercent: body.discountPercent ? parseFloat(body.discountPercent) : null }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.destinationUrl !== undefined && { destinationUrl: body.destinationUrl }),
        ...(body.verified !== undefined && { verified: body.verified }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
      },
    });
    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Failed to update deal:", error);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

// DELETE /api/deals/[id] — delete a deal
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    await prisma.deal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete deal:", error);
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}
