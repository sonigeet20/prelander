import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    offerName?: string;
    description?: string;
    tone?: string;
  };

  if (!body.offerName) {
    return NextResponse.json({ error: "offerName is required" }, { status: 400 });
  }

  const tone = body.tone?.trim() || "clear and helpful";

  const draft = {
    title: `${body.offerName} — Fast start guide`,
    body: `Discover why ${body.offerName} stands out. This draft uses a ${tone} tone and is intended as a safe placeholder until you connect a real AI model. Update the copy to match your compliance and brand requirements.`,
    cta: "Get the details",
  };

  return NextResponse.json({ draft });
}
