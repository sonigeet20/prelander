import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readDb, writeDb } from "@/lib/storage";
import { updateCampaign } from "@/lib/campaigns";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    campaignId?: string;
    offerName?: string;
  };

  if (!body.campaignId || !body.offerName) {
    return NextResponse.json(
      { error: "campaignId and offerName are required" },
      { status: 400 },
    );
  }

  const safeSlug = slugify(body.offerName, 32);
  const desiredSubdomain = safeSlug || `offer-${body.campaignId.slice(0, 8)}`;

  const db = await readDb();
  const now = new Date().toISOString();
  const requestRecord = {
    id: randomUUID(),
    campaignId: body.campaignId,
    offerName: body.offerName,
    desiredSubdomain,
    status: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };
  db.subdomainRequests.push(requestRecord);
  await writeDb(db);

  await updateCampaign(body.campaignId, { subdomain: desiredSubdomain });

  return NextResponse.json({ request: requestRecord }, { status: 201 });
}
