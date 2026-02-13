import "server-only";
import { randomUUID } from "crypto";
import { Campaign, CampaignStatus } from "@/lib/types";
import { readDb, writeDb } from "@/lib/storage";

export async function listCampaigns(): Promise<Campaign[]> {
  const db = await readDb();
  return [...db.campaigns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const db = await readDb();
  return db.campaigns.find((campaign) => campaign.id === id) ?? null;
}

export async function createCampaign(input: {
  offerName: string;
  description?: string;
  researchUrls?: string[];
  brandUrls?: string[];
  destinationUrl?: string;
  trackingUrls?: string[];
  geos?: string[];
  languages?: string[];
  popunderEnabled?: boolean;
  silentFetchEnabled?: boolean;
}): Promise<Campaign> {
  const db = await readDb();
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: randomUUID(),
    offerName: input.offerName.trim(),
    description: input.description?.trim() ?? "",
    status: "draft",
    researchUrls: input.researchUrls ?? [],
    brandUrls: input.brandUrls ?? [],
    destinationUrl: input.destinationUrl ?? "",
    trackingUrls: input.trackingUrls ?? [],
    geos: input.geos ?? [],
    languages: input.languages ?? [],
    popunderEnabled: input.popunderEnabled ?? false,
    silentFetchEnabled: input.silentFetchEnabled ?? false,
    createdAt: now,
    updatedAt: now,
  };
  db.campaigns.push(campaign);
  await writeDb(db);
  return campaign;
}

export async function updateCampaign(
  id: string,
  updates: Partial<
    Pick<
      Campaign,
      | "description"
      | "status"
      | "researchUrls"
      | "brandUrls"
      | "destinationUrl"
      | "trackingUrls"
      | "geos"
      | "languages"
      | "popunderEnabled"
      | "silentFetchEnabled"
      | "subdomain"
      | "metadata"
      | "lastResearchedAt"
      | "autoTriggerOnInaction"
      | "autoTriggerDelay"
      | "autoRedirectDelay"
    >
  >,
): Promise<Campaign | null> {
  const db = await readDb();
  const campaign = db.campaigns.find((item) => item.id === id);
  if (!campaign) {
    return null;
  }
  if (updates.description !== undefined) {
    campaign.description = updates.description;
  }
  if (updates.status !== undefined) {
    campaign.status = updates.status as CampaignStatus;
  }
  if (updates.researchUrls !== undefined) {
    campaign.researchUrls = updates.researchUrls;
  }
  if (updates.brandUrls !== undefined) {
    campaign.brandUrls = updates.brandUrls;
  }
  if (updates.destinationUrl !== undefined) {
    campaign.destinationUrl = updates.destinationUrl;
  }
  if (updates.trackingUrls !== undefined) {
    campaign.trackingUrls = updates.trackingUrls;
  }
  if (updates.geos !== undefined) {
    campaign.geos = updates.geos;
  }
  if (updates.languages !== undefined) {
    campaign.languages = updates.languages;
  }
  if (updates.metadata !== undefined) {
    campaign.metadata = updates.metadata;
  }
  if (updates.lastResearchedAt !== undefined) {
    campaign.lastResearchedAt = updates.lastResearchedAt;
  }
  if (updates.popunderEnabled !== undefined) {
    campaign.popunderEnabled = updates.popunderEnabled;
  }
  if (updates.silentFetchEnabled !== undefined) {
    campaign.silentFetchEnabled = updates.silentFetchEnabled;
  }
  if (updates.subdomain !== undefined) {
    campaign.subdomain = updates.subdomain;
  }
  if (updates.autoTriggerOnInaction !== undefined) {
    campaign.autoTriggerOnInaction = updates.autoTriggerOnInaction;
    if (campaign.metadata) {
      campaign.metadata.autoTriggerOnInaction = updates.autoTriggerOnInaction;
    }
  }
  if (updates.autoTriggerDelay !== undefined) {
    campaign.autoTriggerDelay = updates.autoTriggerDelay;
    if (campaign.metadata) {
      campaign.metadata.autoTriggerDelay = updates.autoTriggerDelay;
    }
  }
  if (updates.autoRedirectDelay !== undefined) {
    campaign.autoRedirectDelay = updates.autoRedirectDelay;
    if (campaign.metadata) {
      campaign.metadata.autoRedirectDelay = updates.autoRedirectDelay;
    }
  }
  campaign.updatedAt = new Date().toISOString();
  await writeDb(db);
  return campaign;
}
