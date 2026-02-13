import "server-only";
import { randomUUID } from "crypto";
import { Lander } from "@/lib/types";
import { readDb, writeDb } from "@/lib/storage";

export async function listLandersByCampaign(campaignId: string): Promise<Lander[]> {
  const db = await readDb();
  return db.landers.filter((lander) => lander.campaignId === campaignId);
}

export async function getLanderById(id: string): Promise<Lander | null> {
  const db = await readDb();
  return db.landers.find((lander) => lander.id === id) ?? null;
}

export async function createLander(input: {
  campaignId: string;
  title: string;
  body: string;
  cta: string;
}): Promise<Lander> {
  const db = await readDb();
  const now = new Date().toISOString();
  const lander: Lander = {
    id: randomUUID(),
    campaignId: input.campaignId,
    title: input.title.trim(),
    body: input.body.trim(),
    cta: input.cta.trim(),
    createdAt: now,
    updatedAt: now,
  };
  db.landers.push(lander);
  await writeDb(db);
  return lander;
}
