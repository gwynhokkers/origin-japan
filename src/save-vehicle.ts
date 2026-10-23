import { ContentRepository } from "emdash";
import type { Vehicle } from "./catalogue";

/** Insert a vehicle, or replace the one that already has this listing slug. */
export async function upsertVehicle(repo: ContentRepository, vehicle: Vehicle): Promise<void> {
  const slug = vehicle.slug?.trim();
  if (!slug) throw new Error("A vehicle needs a slug");
  const existing = await repo.findBySlug("vehicles", slug);
  const input = {
    slug,
    status: vehicle.draft ? "draft" : "published",
    data: vehicleRecord(vehicle),
    ...(vehicle.publishedAt ? { publishedAt: vehicle.publishedAt } : {}),
  };
  if (existing) {
    await repo.update("vehicles", existing.id, input);
    return;
  }
  await repo.create({
    type: "vehicles",
    publishedAt: vehicle.publishedAt ?? new Date().toISOString(),
    ...input,
  });
}

function vehicleRecord(vehicle: Vehicle): Record<string, unknown> {
  const data: Record<string, unknown> = {
    title: vehicle.title ?? null,
    make: vehicle.make ?? null,
    model: vehicle.model ?? null,
    body: vehicle.body ?? null,
    year: vehicle.year ?? null,
    transmission: vehicle.transmission ?? null,
    mileage: vehicle.mileageMiles ?? null,
    price: vehicle.pricePounds ?? null,
    photos: (vehicle.photos ?? []).map((photo) => ({ photo })),
    sellers_notes: vehicle.sellersNotes ?? null,
    availability: storedAvailability(vehicle.availability),
  };
  if (vehicle.vin !== undefined) data.vin = vehicle.vin;
  if (vehicle.grade !== undefined) data.grade = vehicle.grade;
  if (vehicle.order !== undefined) data.order = vehicle.order;
  return data;
}

function storedAvailability(availability: Vehicle["availability"]): string | null {
  if (availability === "in prep") return "In prep";
  if (availability === "on water") return "On water";
  if (availability === "sold") return "Sold";
  return null;
}
