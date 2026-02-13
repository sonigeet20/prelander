import "server-only";
import { randomUUID } from "crypto";
import { readDb, writeDb } from "@/lib/storage";
import { ClickSession } from "@/lib/types";

export async function recordClickSession(input: {
  campaignId: string;
  clusterId: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<ClickSession> {
  const db = await readDb();
  const session: ClickSession = {
    id: randomUUID(),
    campaignId: input.campaignId,
    clusterId: input.clusterId,
    gclid: input.gclid,
    gbraid: input.gbraid,
    wbraid: input.wbraid,
    ip: input.ip ?? undefined,
    userAgent: input.userAgent ?? undefined,
    createdAt: new Date().toISOString(),
  };
  db.clickSessions.push(session);
  await writeDb(db);
  return session;
}
