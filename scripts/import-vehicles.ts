import { emdashCatalogue } from "../src/emdash-catalogue.ts";
import { importVehicles } from "../src/import-vehicles.ts";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run import-vehicles -- <vehicles.json>");
  process.exit(1);
}

await importVehicles(file, emdashCatalogue);
