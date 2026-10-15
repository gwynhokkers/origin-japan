import type { Vehicle } from "../catalogue";

const bodies = new Set(["Convertible", "Pickup", "Coupe", "MPV", "Hatchback", "Estate"]);
const transmissions = new Set(["Manual", "Automatic", "DSG"]);

export type StockSort = "price" | "model-year" | "mileage" | "newest";

export const stockSorts = ["price", "model-year", "mileage", "newest"] as const satisfies readonly StockSort[];

export const stockSortLabels: Record<StockSort, string> = {
  price: "Price",
  "model-year": "Model year",
  mileage: "Mileage",
  newest: "Newest",
};

export function photosOf(vehicle: Vehicle): string[] {
  return (vehicle.photos ?? []).map((photo) => photo.trim()).filter(Boolean);
}

export function isOnStock(vehicle: Vehicle): boolean {
  return isForSale(vehicle) || unpricedBadge(vehicle) !== undefined;
}

export function isPublic(vehicle: Vehicle): boolean {
  return isOnStock(vehicle) || isSold(vehicle);
}

export function isForSale(vehicle: Vehicle): boolean {
  return !vehicle.draft && isPresentable(vehicle) && hasPublicPrice(vehicle) && vehicle.availability !== "sold";
}

export function isSold(vehicle: Vehicle): boolean {
  return !vehicle.draft && vehicle.availability === "sold" && isPresentable(vehicle);
}

export function unpricedBadge(vehicle: Vehicle): "In prep" | "On water" | undefined {
  if (vehicle.draft || !isPresentable(vehicle) || hasPublicPrice(vehicle)) return undefined;
  if (vehicle.availability === "in prep") return "In prep";
  if (vehicle.availability === "on water") return "On water";
  return undefined;
}

export function availabilityLabel(vehicle: Vehicle): "In prep" | "On water" | "Sold" | undefined {
  return unpricedBadge(vehicle) ?? (isSold(vehicle) ? "Sold" : undefined);
}

function hasPublicPrice(vehicle: Vehicle): boolean {
  const price = vehicle.pricePounds;
  return typeof price === "number" && Number.isInteger(price) && price > 0;
}

/** Fields a buyer must be able to read. An empty list is a vehicle that can be on the site. */
export function fieldsMissingToShow(vehicle: Vehicle): string[] {
  const missing: string[] = [];
  const year = vehicle.year;
  const mileage = vehicle.mileageMiles;
  if (!present(vehicle.slug)) missing.push("slug");
  if (!present(vehicle.title)) missing.push("title");
  if (!present(vehicle.make)) missing.push("make");
  if (!present(vehicle.model)) missing.push("model");
  if (!bodies.has(present(vehicle.body) ?? "")) missing.push("body");
  if (typeof year !== "number" || !Number.isInteger(year) || year < 1900 || year > 2100) missing.push("year");
  if (!transmissions.has(present(vehicle.transmission) ?? "")) missing.push("transmission");
  if (typeof mileage !== "number" || !Number.isInteger(mileage) || mileage < 0) missing.push("mileage");
  if (photosOf(vehicle).length === 0) missing.push("photos");
  if (!present(vehicle.sellersNotes)) missing.push("seller's notes");
  return missing;
}

function isPresentable(vehicle: Vehicle): boolean {
  return fieldsMissingToShow(vehicle).length === 0;
}

function present(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

export function readStockSort(url: URL): StockSort | undefined {
  const value = url.searchParams.get("sort");
  return stockSorts.find((sort) => sort === value);
}

/** Priced for-sale vehicles, then in-prep and on-water. A buyer sort stays inside each group. */
export function listStock(vehicles: readonly Vehicle[], sort?: StockSort): Vehicle[] {
  return [
    ...orderGroup(vehicles.filter(isForSale), sort),
    ...orderGroup(
      vehicles.filter((vehicle) => !isForSale(vehicle)),
      sort,
    ),
  ];
}

function orderGroup(vehicles: readonly Vehicle[], sort?: StockSort): Vehicle[] {
  const adamSetAnOrder = vehicles.some((vehicle) => vehicle.order !== undefined);
  const ordered = [...vehicles].sort((a, b) => compareDefault(a, b, adamSetAnOrder));
  if (!sort) return ordered;
  return ordered.sort((a, b) => compareBuyerSort(a, b, sort));
}

function compareDefault(a: Vehicle, b: Vehicle, adamSetAnOrder: boolean): number {
  if (adamSetAnOrder) {
    const aHasOrder = a.order !== undefined;
    const bHasOrder = b.order !== undefined;
    if (aHasOrder && bHasOrder && a.order !== b.order) return (a.order ?? 0) - (b.order ?? 0);
    if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;
  }
  return publishedTime(b) - publishedTime(a) || (a.slug ?? "").localeCompare(b.slug ?? "");
}

function compareBuyerSort(a: Vehicle, b: Vehicle, sort: StockSort): number {
  if (sort === "price") return compareNumber(a.pricePounds, b.pricePounds, "low");
  if (sort === "model-year") return compareNumber(a.year, b.year, "high");
  if (sort === "mileage") return compareNumber(a.mileageMiles, b.mileageMiles, "low");
  return publishedTime(b) - publishedTime(a);
}

function compareNumber(a: number | undefined, b: number | undefined, direction: "low" | "high"): number {
  const aOk = typeof a === "number";
  const bOk = typeof b === "number";
  if (!aOk && !bOk) return 0;
  if (!aOk) return 1;
  if (!bOk) return -1;
  return direction === "low" ? a - b : b - a;
}

function publishedTime(vehicle: Vehicle): number {
  if (!vehicle.publishedAt) return Number.NEGATIVE_INFINITY;
  const time = Date.parse(vehicle.publishedAt);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

export function formatPounds(pounds: number | undefined): string {
  if (typeof pounds !== "number" || !Number.isInteger(pounds)) return "";
  return `£${pounds.toLocaleString("en-GB")}`;
}

export function formatMiles(miles: number | undefined): string {
  if (typeof miles !== "number" || !Number.isInteger(miles)) return "";
  return `${miles.toLocaleString("en-GB")} miles`;
}

export function vehicleHref(slug: string | undefined): string {
  return `/listings/${encodeURIComponent(slug ?? "")}`;
}
