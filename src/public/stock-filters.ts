import type { Vehicle } from "../catalogue";
import { isForSale, vehicleBodies, vehicleGrades, vehicleTransmissions, type StockSort } from "./vehicles";

export type StockBase = "/showroom" | "/sold";

export type StockFilters = {
  make?: string;
  model?: string;
  body?: string;
  year?: number;
  transmission?: string;
  grade?: string;
  mileageMin?: number;
  mileageMax?: number;
  priceMin?: number;
  priceMax?: number;
};

export type StockFilter = keyof StockFilters;

export type StockFilterChoices = {
  makes: string[];
  /** Empty until a make is chosen. */
  models: string[];
  bodies: string[];
  years: number[];
  transmissions: string[];
  grades: string[];
};

/** Address name for each filter, in the order a filtered link reads. */
export const stockFilterParams = {
  make: "make",
  model: "model",
  body: "body",
  year: "year",
  transmission: "transmission",
  grade: "grade",
  mileageMin: "mileage-min",
  mileageMax: "mileage-max",
  priceMin: "price-min",
  priceMax: "price-max",
} as const satisfies Record<StockFilter, string>;

const allFilters = Object.keys(stockFilterParams) as StockFilter[];
const numberFilters = new Set<StockFilter>(["year", "mileageMin", "mileageMax", "priceMin", "priceMax"]);

/** Sold stock has no grade filter, and no price filter because sold prices are not public. */
export function stockFiltersFor(base: StockBase): readonly StockFilter[] {
  if (base === "/showroom") return allFilters;
  return allFilters.filter((filter) => filter !== "grade" && filter !== "priceMin" && filter !== "priceMax");
}

/** A model only counts with its make, so a model left from another make is dropped. */
export function readStockFilters(url: URL, base: StockBase, inView: readonly Vehicle[]): StockFilters {
  const filters: Record<string, string | number> = {};
  for (const filter of stockFiltersFor(base)) {
    const value = url.searchParams.get(stockFilterParams[filter])?.trim() ?? "";
    if (numberFilters.has(filter)) {
      if (/^\d+$/.test(value)) filters[filter] = Number(value);
    } else if (value) {
      filters[filter] = value;
    }
  }
  const read = filters as StockFilters;
  if (read.model !== undefined && !modelsOf(inView, read.make).includes(read.model)) delete read.model;
  return read;
}

export function countStockFilters(filters: StockFilters): number {
  return allFilters.filter((filter) => filters[filter] !== undefined).length;
}

/** A price filter keeps only vehicles with a public price, so in-prep and on-water drop out. */
export function filterStock(vehicles: readonly Vehicle[], filters: StockFilters): Vehicle[] {
  const pricing = filters.priceMin !== undefined || filters.priceMax !== undefined;
  return vehicles.filter(
    (vehicle) =>
      matches(vehicle.make, filters.make) &&
      matches(vehicle.model, filters.model) &&
      matches(vehicle.body, filters.body) &&
      (filters.year === undefined || vehicle.year === filters.year) &&
      matches(vehicle.transmission, filters.transmission) &&
      matches(vehicle.grade, filters.grade) &&
      within(vehicle.mileageMiles, filters.mileageMin, filters.mileageMax) &&
      (!pricing || (isForSale(vehicle) && within(vehicle.pricePounds, filters.priceMin, filters.priceMax))),
  );
}

/** Choices come from the vehicles in this view, so a buyer never picks a value with no stock. */
export function stockFilterChoices(inView: readonly Vehicle[], filters: StockFilters): StockFilterChoices {
  return {
    makes: distinct(inView.map((vehicle) => vehicle.make)).sort(byText),
    models: modelsOf(inView, filters.make),
    bodies: inOrder(distinct(inView.map((vehicle) => vehicle.body)), vehicleBodies),
    years: [...new Set(inView.flatMap((vehicle) => (vehicle.year === undefined ? [] : [vehicle.year])))].sort((a, b) => b - a),
    transmissions: inOrder(distinct(inView.map((vehicle) => vehicle.transmission)), vehicleTransmissions),
    grades: inOrder(distinct(inView.map((vehicle) => vehicle.grade)), vehicleGrades),
  };
}

export function stockHref(base: StockBase, options?: { sort?: StockSort; filters?: StockFilters; page?: number }): string {
  const params = new URLSearchParams();
  if (options?.sort) params.set("sort", options.sort);
  for (const filter of allFilters) {
    const value = options?.filters?.[filter];
    if (value !== undefined) params.set(stockFilterParams[filter], String(value));
  }
  if (options?.page && options.page > 1) params.set("page", String(options.page));
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

function modelsOf(vehicles: readonly Vehicle[], make: string | undefined): string[] {
  if (make === undefined) return [];
  return distinct(vehicles.filter((vehicle) => matches(vehicle.make, make)).map((vehicle) => vehicle.model)).sort(byText);
}

function matches(value: string | undefined, wanted: string | undefined): boolean {
  return wanted === undefined || value?.trim() === wanted;
}

function within(value: number | undefined, min: number | undefined, max: number | undefined): boolean {
  if (min === undefined && max === undefined) return true;
  if (typeof value !== "number") return false;
  return (min === undefined || value >= min) && (max === undefined || value <= max);
}

function distinct(values: readonly (string | undefined)[]): string[] {
  return [...new Set(values.flatMap((value) => (value?.trim() ? [value.trim()] : [])))];
}

function inOrder(values: readonly string[], order: readonly string[]): string[] {
  const rank = (value: string) => (order.includes(value) ? order.indexOf(value) : order.length);
  return [...values].sort((a, b) => rank(a) - rank(b) || byText(a, b));
}

function byText(a: string, b: string): number {
  return a.localeCompare(b, "en-GB");
}
