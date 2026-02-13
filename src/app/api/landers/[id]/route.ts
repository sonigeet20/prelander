import { NextResponse } from "next/server";
import { getLanderById } from "@/lib/landers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lander = await getLanderById(id);
  if (!lander) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ lander });
}
