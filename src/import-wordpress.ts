import type { Vehicle } from "./catalogue";
import { listingGalleryUrls } from "./listing-photos.ts";
import { fieldsMissingToShow } from "./public/vehicles.ts";
import { draftMessage, vehiclesFromWordpress, type WordpressVehicleReport } from "./wordpress-vehicles.ts";

export type WordpressImportDeps = {
  fetchPage: (slug: string) => Promise<string | undefined>;
  storePhotos: (slug: string, urls: readonly string[]) => Promise<{ paths: string[]; failed: string[] }>;
  save: (vehicle: Vehicle) => Promise<void>;
};

/** Map a WordPress export, copy each listing's photos, and save the vehicles. */
export async function importWordpressListings(
  xml: string,
  deps: WordpressImportDeps,
): Promise<WordpressVehicleReport[]> {
  const { vehicles, reports } = await vehiclesFromWordpress(xml);
  const kept = reports.filter((report) => !report.message.startsWith("Draft,"));
  const finalReports = [...kept];
  for (const vehicle of vehicles) {
    const slug = vehicle.slug ?? "";
    const page = await deps.fetchPage(slug);
    const live = page ? listingGalleryUrls(page) : [];
    const source = live.length > 0 ? live : [...(vehicle.photos ?? [])];
    const stored = await deps.storePhotos(slug, source);
    vehicle.photos = stored.paths;
    if (stored.failed.length > 0) {
      const count = stored.failed.length;
      finalReports.push({
        slug,
        message: `Could not download ${count} photo${count === 1 ? "" : "s"}.`,
      });
    }
    const missing = fieldsMissingToShow(vehicle);
    if (missing.length > 0) {
      vehicle.draft = true;
      finalReports.push({ slug, message: draftMessage(missing) });
    } else {
      delete vehicle.draft;
    }
    await deps.save(vehicle);
  }
  return finalReports;
}
