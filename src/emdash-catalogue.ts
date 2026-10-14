import { getEmDashCollection } from "emdash";
import type { Catalogue, Lead, Vehicle } from "./catalogue";

export const emdashCatalogue: Catalogue = {
  vehicles: listVehicles,
  leads: listLeads,
};

async function listVehicles(): Promise<readonly Vehicle[]> {
  const { entries, error } = await getEmDashCollection("vehicles");
  if (error) throw error;
  return entries.map(vehicleFromEntry);
}

async function listLeads(): Promise<readonly Lead[]> {
  const { entries, error } = await getEmDashCollection("leads");
  if (error) throw error;
  return entries.map((entry) => ({ id: entry.id }));
}

function vehicleFromEntry(entry: { id: string; status?: string; data: object }): Vehicle {
  const data = entry.data as Record<string, unknown>;
  return {
    id: stringValue(data.id) ?? entry.id,
    slug: stringValue(data.slug) ?? entry.id,
    title: stringValue(data.title),
    make: stringValue(data.make),
    model: stringValue(data.model),
    body: stringValue(data.body),
    year: integerValue(data.year),
    transmission: stringValue(data.transmission),
    mileageMiles: integerValue(data.mileage),
    pricePounds: integerValue(data.price),
    photos: photoSources(data.photos),
    sellersNotes: stringValue(data.sellers_notes),
    vin: stringValue(data.vin),
    availability: availabilityValue(data.availability),
    draft: entry.status !== undefined && entry.status !== "published",
    publishedAt: dateValue(data.publishedAt),
    order: integerValue(data.order),
  };
}

function availabilityValue(value: unknown): Vehicle["availability"] {
  if (typeof value !== "string") return undefined;
  const text = value.trim().toLowerCase();
  if (text === "in prep" || text === "on water" || text === "sold") return text;
  return undefined;
}

function photoSources(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const photo = recordValue(row)?.photo;
    if (typeof photo === "string" && photo.trim()) return [photo.trim()];
    const media = recordValue(photo);
    const src = stringValue(media?.src);
    if (src) return [src];
    const storageKey = stringValue(recordValue(media?.meta)?.storageKey);
    return storageKey ? [`/_emdash/api/media/file/${storageKey}`] : [];
  });
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function integerValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) return Number(value);
  return undefined;
}

function dateValue(value: unknown): string | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  if (typeof value === "string" && value.trim() && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  return undefined;
}
