import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    campaignId?: string;
    clickSessionId?: string;
    value?: number;
    currency?: string;
    orderId?: string;
  };

  if (!body.campaignId || !body.clickSessionId) {
    return NextResponse.json(
      { error: "campaignId and clickSessionId are required" },
      { status: 400 },
    );
  }

  return NextResponse.json({ status: "queued", conversion: body }, { status: 201 });
}
