import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/tracking";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    campaignId?: string;
    type?: "view" | "click" | "custom";
    url?: string;
    consent?: boolean;
  };

  if (!body.type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();

  const result = await recordEvent({
    campaignId: body.campaignId,
    type: body.type,
    url: body.url,
    userAgent,
    ip,
    consent: Boolean(body.consent),
  });

  return NextResponse.json({ recorded: result.recorded });
}
