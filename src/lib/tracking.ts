import "server-only";
import { randomUUID } from "crypto";
import { TrackingEvent } from "@/lib/types";
import { isBotUserAgent } from "@/lib/bot";
import { readDb, writeDb } from "@/lib/storage";

export async function recordEvent(input: {
  campaignId?: string;
  type: TrackingEvent["type"];
  url?: string;
  userAgent?: string | null;
  ip?: string | null;
  consent: boolean;
}): Promise<{ recorded: boolean; event?: TrackingEvent }> {
  if (!input.consent) {
    return { recorded: false };
  }
  if (isBotUserAgent(input.userAgent)) {
    return { recorded: false };
  }

  const db = await readDb();
  const event: TrackingEvent = {
    id: randomUUID(),
    campaignId: input.campaignId,
    type: input.type,
    url: input.url,
    userAgent: input.userAgent ?? undefined,
    ip: input.ip ?? undefined,
    consent: input.consent,
    createdAt: new Date().toISOString(),
  };
  db.events.push(event);
  await writeDb(db);
  return { recorded: true, event };
}
