import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Kysely, sql } from "kysely";
import { ContentRepository } from "emdash";
import { runMigrations } from "emdash/db";
import { createDialect } from "emdash/db/sqlite";
import { applySeed } from "emdash/seed";
import { importWordpressListings } from "../src/import-wordpress.ts";
import { storeListingPhotos, type FetchedPhoto } from "../src/listing-photos.ts";
import { upsertVehicle } from "../src/save-vehicle.ts";

const browser = "Mozilla/5.0 (compatible; OriginJapanImporter/1.0)";

const root = fileURLToPath(new URL("..", import.meta.url));
const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run import-wordpress -- <export.xml>");
  process.exit(1);
}

const xml = readFileSync(file, "utf8");
const { getPlatformProxy } = await import("wrangler");
const proxy = await getPlatformProxy({
  configPath: join(root, "wrangler.jsonc"),
  persist: { path: join(root, ".wrangler/state/v3") },
  remoteBindings: false,
  envFiles: [],
});

const sqlitePath = await localD1Path(root, proxy.env);
const db = new Kysely({ dialect: createDialect({ url: `file:${sqlitePath}` }) });
try {
  await runMigrations(db);
  await ensureVehicleCollection(db, root);
  const repo = new ContentRepository(db);
  const bucket = mediaBucket(proxy.env);
  const saved: string[] = [];
  const reports = await importWordpressListings(xml, {
    fetchPage,
    storePhotos(slug, urls) {
      return storeListingPhotos({ slug, urls, store: bucket, fetchPhoto });
    },
    async save(vehicle) {
      await upsertVehicle(repo, vehicle);
      saved.push(vehicle.slug ?? "");
    },
  });
  console.log(`Wrote ${saved.length} vehicle${saved.length === 1 ? "" : "s"} to ${sqlitePath}`);
  for (const slug of saved) console.log(`  /listings/${slug}`);
  for (const report of reports) console.log(`${report.slug}: ${report.message}`);
} finally {
  await db.destroy();
  await proxy.dispose();
}

async function fetchPage(slug: string): Promise<string | undefined> {
  const response = await fetch(`https://originjapan.co.uk/listings/${encodeURIComponent(slug)}/`, {
    headers: { "user-agent": browser },
  });
  if (!response.ok) return undefined;
  return response.text();
}

async function fetchPhoto(url: string): Promise<FetchedPhoto> {
  const response = await fetch(url, { headers: { "user-agent": browser } });
  if (!response.ok) return { ok: false, status: response.status };
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? null;
  return {
    ok: true,
    status: response.status,
    contentType,
    bytes: async () => new Uint8Array(await response.arrayBuffer()),
  };
}

type MediaBucket = {
  head(key: string): Promise<unknown>;
  put(key: string, value: Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
};

function mediaBucket(env: unknown): { has(key: string): Promise<boolean>; put(key: string, bytes: Uint8Array, contentType: string): Promise<void> } {
  const bucket = (env as { MEDIA?: MediaBucket }).MEDIA;
  if (!bucket) throw new Error("The local MEDIA bucket is not available.");
  return {
    async has(key) {
      return (await bucket.head(key)) != null;
    },
    async put(key, bytes, contentType) {
      await bucket.put(key, bytes, { httpMetadata: { contentType } });
    },
  };
}

async function ensureVehicleCollection(db: Kysely<unknown>, projectRoot: string): Promise<void> {
  const tables = await sql<{ name: string }>`
    SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ec_vehicles'
  `.execute(db);
  if (tables.rows.length > 0) return;
  const seed = JSON.parse(readFileSync(join(projectRoot, "seed/seed.json"), "utf8")) as unknown;
  await applySeed(db, seed, { onConflict: "skip", includeContent: true });
}

async function localD1Path(projectRoot: string, env: unknown): Promise<string> {
  const ready = d1SqliteFiles(projectRoot);
  if (ready.length === 1) return ready[0];
  if (ready.length > 1) {
    throw new Error(`Found more than one local D1 database:\n${ready.join("\n")}`);
  }
  const database = (env as { DB?: { prepare: (query: string) => { all: () => Promise<unknown> } } }).DB;
  await database?.prepare("SELECT 1").all();
  const created = d1SqliteFiles(projectRoot);
  if (created.length === 1) return created[0];
  throw new Error("Could not find the local D1 database the site reads.");
}

function d1SqliteFiles(projectRoot: string): string[] {
  const dir = join(projectRoot, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
  try {
    return readdirSync(dir)
      .filter((name) => name.endsWith(".sqlite") && name !== "metadata.sqlite")
      .map((name) => join(dir, name));
  } catch {
    return [];
  }
}
