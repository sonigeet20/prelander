import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanCompliance } from "@/lib/services/compliance-scanner";
import type { GeneratedPageContent } from "@/types";

export async function POST(req: NextRequest) {
  const { pageId } = await req.json();
  if (!pageId) return NextResponse.json({ error: "pageId required" }, { status: 400 });

  const page = await prisma.generatedPage.findUnique({ where: { id: pageId } });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const content = page.content as unknown as GeneratedPageContent;
  const result = scanCompliance(content);

  await prisma.complianceLog.create({
    data: {
      pageId: page.id,
      scanType: "manual",
      passed: result.passed,
      violations: result.violations as any,
    },
  });

  await prisma.generatedPage.update({
    where: { id: page.id },
    data: {
      complianceScore: result.score,
      status: result.passed ? "compliant" : "review",
    },
  });

  return NextResponse.json({ result });
}
