import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Kysely, sql } from "kysely";
import { ContentRepository } from "emdash";
import { runMigrations } from "emdash/db";
import { createDialect } from "emdash/db/sqlite";
import { applySeed } from "emdash/seed";
import { importVehicles } from "../src/import-vehicles.ts";
import { upsertVehicle } from "../src/save-vehicle.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run import-vehicles -- <vehicles.json>");
  process.exit(1);
}

const sqlitePath = await localD1Path(root);
const db = new Kysely({ dialect: createDialect({ url: `file:${sqlitePath}` }) });
try {
  await runMigrations(db);
  await ensureVehicleCollection(db, root);
  const repo = new ContentRepository(db);
  await importVehicles(file, {
    async saveVehicle(vehicle) {
      await upsertVehicle(repo, vehicle);
    },
  });
  const rows = await sql<{ slug: string }>`SELECT slug FROM ec_vehicles ORDER BY slug`.execute(db);
  const slugs = rows.rows.map((row) => row.slug);
  console.log(`Wrote ${slugs.length} vehicle${slugs.length === 1 ? "" : "s"} to ${sqlitePath}`);
  for (const slug of slugs) console.log(`  /listings/${slug}`);
} finally {
  await db.destroy();
}

async function ensureVehicleCollection(db: Kysely<unknown>, projectRoot: string): Promise<void> {
  const tables = await sql<{ name: string }>`
    SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ec_vehicles'
  `.execute(db);
  if (tables.rows.length > 0) return;
  const seed = JSON.parse(readFileSync(join(projectRoot, "seed/seed.json"), "utf8")) as unknown;
  await applySeed(db, seed, { onConflict: "skip", includeContent: true });
}

async function localD1Path(projectRoot: string): Promise<string> {
  const found = d1SqliteFiles(projectRoot);
  if (found.length === 1) return found[0];
  if (found.length > 1) {
    throw new Error(`Found more than one local D1 database:\n${found.join("\n")}`);
  }
  const { getPlatformProxy } = await import("wrangler");
  const proxy = await getPlatformProxy({
    configPath: join(projectRoot, "wrangler.jsonc"),
    persist: { path: join(projectRoot, ".wrangler/state/v3") },
    remoteBindings: false,
    envFiles: [],
  });
  await proxy.dispose();
  const created = d1SqliteFiles(projectRoot);
  if (created.length !== 1) {
    throw new Error("Could not find the local D1 database the site reads.");
  }
  return created[0];
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
