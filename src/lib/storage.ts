import fs from "fs/promises";
import path from "path";
import { DatabaseSchema } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dbFile = path.join(dataDir, "db.json");

const defaultDb: DatabaseSchema = {
  campaigns: [],
  landers: [],
  events: [],
  researchJobs: [],
  subdomainRequests: [],
  clickSessions: [],
};

async function ensureDbFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbFile);
  } catch {
    await fs.writeFile(dbFile, JSON.stringify(defaultDb, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  await ensureDbFile();
  const raw = await fs.readFile(dbFile, "utf-8");
  return JSON.parse(raw) as DatabaseSchema;
}

export async function writeDb(db: DatabaseSchema): Promise<void> {
  await ensureDbFile();
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2), "utf-8");
}
