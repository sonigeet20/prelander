import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ id: string }> }

const VALID_INTENTS = [
  "transactional", "comparison", "validation", "pricing",
  "route_specific", "destination_specific", "use_case",
  "problem_solution", "informational",
];

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();

  const keyword = await prisma.keyword.findUnique({ where: { id } });
  if (!keyword) return NextResponse.json({ error: "Keyword not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};

  // Intent type override
  if (body.intentType !== undefined) {
    if (body.intentType === null) {
      // Clear classification
      updateData.intentType = null;
      updateData.classifiedAt = null;
      updateData.metadata = {};
    } else if (VALID_INTENTS.includes(body.intentType)) {
      updateData.intentType = body.intentType;
      updateData.classifiedAt = new Date();
      // If overriding to non-destination intent, clear hallucinated cities from metadata
      if (!["destination_specific", "route_specific"].includes(body.intentType)) {
        const existingMeta = (keyword.metadata as Record<string, unknown>) || {};
        updateData.metadata = { ...existingMeta, cities: undefined };
      }
    } else {
      return NextResponse.json({ error: `Invalid intentType: ${body.intentType}` }, { status: 400 });
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.keyword.update({
    where: { id },
    data: updateData,
    include: { _count: { select: { generatedPages: true } } },
  });

  return NextResponse.json({ keyword: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.keyword.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
