import { readFileSync } from "node:fs";
import type { Availability, Catalogue, Vehicle } from "./catalogue";

const unpricedAvailability = ["in prep", "on water"] as const satisfies readonly Availability[];

/** Read vehicles already described in the project's words and save each one by slug. */
export async function importVehicles(file: string, catalogue: Catalogue): Promise<void> {
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("Vehicle import must be a list of vehicles");
  for (const [index, row] of parsed.entries()) {
    await catalogue.saveVehicle(vehicleFromImport(row, index));
  }
}

function vehicleFromImport(row: unknown, index: number): Vehicle {
  const record = objectRecord(row, index);
  const availability = record.availability;
  const forSale = availability === "for sale";
  const sold = availability === "sold";
  const inPrepOrOnWater = unpricedAvailability.find((value) => value === availability);
  if (!forSale && !sold && !inPrepOrOnWater) {
    throw new Error(`Vehicle ${index + 1} needs an availability of in prep, on water, for sale, or sold`);
  }
  const slug = requiredString(record, "slug", index);
  const pricePounds = forSale
    ? requiredInteger(record, "price", index)
    : sold
      ? optionalInteger(record, "price", index)
      : undefined;
  return {
    id: slug,
    slug,
    title: requiredString(record, "title", index),
    make: requiredString(record, "make", index),
    model: requiredString(record, "model", index),
    body: requiredString(record, "body", index),
    year: requiredInteger(record, "year", index),
    transmission: requiredString(record, "transmission", index),
    mileageMiles: requiredInteger(record, "mileage", index),
    pricePounds,
    photos: requiredPhotos(record, index),
    sellersNotes: requiredString(record, "sellersNotes", index),
    availability: sold ? "sold" : inPrepOrOnWater,
  };
}

function objectRecord(row: unknown, index: number): Record<string, unknown> {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new Error(`Vehicle ${index + 1} is not a record`);
  }
  return row as Record<string, unknown>;
}

function requiredString(record: Record<string, unknown>, key: string, index: number): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Vehicle ${index + 1} needs a ${key}`);
  }
  return value.trim();
}

function requiredInteger(record: Record<string, unknown>, key: string, index: number): number {
  const value = integerField(record, key, index);
  if (value === undefined) throw new Error(`Vehicle ${index + 1} needs a ${key}`);
  return value;
}

function optionalInteger(record: Record<string, unknown>, key: string, index: number): number | undefined {
  return integerField(record, key, index);
}

function integerField(record: Record<string, unknown>, key: string, index: number): number | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`Vehicle ${index + 1} needs a ${key}`);
  }
  return value;
}

function requiredPhotos(record: Record<string, unknown>, index: number): string[] {
  const value = record.photos;
  if (!Array.isArray(value) || value.length === 0 || value.some((photo) => typeof photo !== "string" || !photo.trim())) {
    throw new Error(`Vehicle ${index + 1} needs photos`);
  }
  return value.map((photo) => photo.trim());
}
