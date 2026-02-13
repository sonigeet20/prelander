import { NextResponse } from "next/server";
import { createLander } from "@/lib/landers";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    campaignId?: string;
    title?: string;
    body?: string;
    cta?: string;
  };

  if (!body.campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }
  if (!body.title || !body.body || !body.cta) {
    return NextResponse.json(
      { error: "title, body, and cta are required" },
      { status: 400 },
    );
  }

  const lander = await createLander({
    campaignId: body.campaignId,
    title: body.title,
    body: body.body,
    cta: body.cta,
  });

  return NextResponse.json({ lander }, { status: 201 });
}
