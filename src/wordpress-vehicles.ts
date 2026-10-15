import { parseWxrString, type WxrPost } from "emdash";
import type { Availability, Vehicle } from "./catalogue";
import { fieldsMissingToShow } from "./public/vehicles.ts";

export type WordpressVehicleReport = {
  slug: string;
  message: string;
};

/** Read Motors listings from a WordPress export into the vehicle catalogue's words. */
export async function vehiclesFromWordpress(xml: string): Promise<{
  vehicles: Vehicle[];
  reports: WordpressVehicleReport[];
}> {
  const wxr = await parseWxrString(xml);
  const attachments = new Map<string, string>();
  for (const attachment of wxr.attachments) {
    if (attachment.id !== undefined && attachment.url?.trim()) {
      attachments.set(String(attachment.id), attachment.url.trim());
    }
  }

  const vehicles: Vehicle[] = [];
  const reports: WordpressVehicleReport[] = [];
  for (const post of wxr.posts) {
    if (post.postType !== "listings" || post.status !== "publish") continue;
    const slug = post.postName?.trim();
    if (!slug) continue;
    const vehicle = vehicleFromListing(post, attachments, slug);
    const missing = fieldsMissingToShow(vehicle);
    if (missing.length > 0) {
      vehicle.draft = true;
      reports.push({ slug, message: draftMessage(missing) });
    }
    if (isImportedForSale(vehicle) && /still in prep/i.test(vehicle.sellersNotes ?? "")) {
      reports.push({
        slug,
        message: "Seller's notes say this car is still in prep. It is imported for sale.",
      });
    }
    vehicles.push(vehicle);
  }
  return { vehicles, reports };
}

function vehicleFromListing(post: WxrPost, attachments: Map<string, string>, slug: string): Vehicle {
  const availability = availabilityOf(post);
  const recordedPrice = positiveInteger(meta(post, "price")) ?? positiveInteger(meta(post, "stm_genuine_price"));
  const keepPrice = availability !== "in prep" && availability !== "on water";
  return omitEmpty({
    id: slug,
    slug,
    title: decoded(post.title),
    make: termLabel(post, "make"),
    model: termLabel(post, "serie"),
    body: termLabel(post, "body"),
    year: wholeNumber(termLabel(post, "ca-year")),
    transmission: termLabel(post, "transmission"),
    mileageMiles: wholeNumber(termLabel(post, "mileage")) ?? wholeNumber(meta(post, "mileage")),
    pricePounds: keepPrice ? recordedPrice : undefined,
    photos: photoUrls(post, attachments),
    sellersNotes: sellersNotesFromHtml(post.content ?? ""),
    availability,
    publishedAt: publishedAt(post),
  });
}

function availabilityOf(post: WxrPost): Availability | undefined {
  if (meta(post, "car_mark_as_sold") === "on") return "sold";
  const badge = meta(post, "badge_text").toUpperCase();
  if (badge === "ON WATER") return "on water";
  if (badge === "IN PREP") return "in prep";
  return undefined;
}

function photoUrls(post: WxrPost, attachments: Map<string, string>): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const add = (id: string) => {
    const url = attachments.get(id);
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };
  add(meta(post, "_thumbnail_id"));
  for (const id of galleryIds(meta(post, "gallery"))) add(id);
  return urls;
}

function galleryIds(serialized: string): string[] {
  const quoted = [...serialized.matchAll(/s:\d+:"(\d+)"/g)].map((match) => match[1] ?? "");
  if (quoted.length > 0) return quoted.filter(Boolean);
  return [...serialized.matchAll(/i:\d+;i:(\d+);/g)].map((match) => match[1] ?? "").filter(Boolean);
}

function termLabel(post: WxrPost, domain: string): string | undefined {
  const slugs = post.customTaxonomies?.get(domain) ?? [];
  for (const slug of slugs) {
    const label = post.taxonomyLabels?.get(`${domain}\u0000${slug}`)?.trim() || slug.trim();
    if (label) return decoded(label);
  }
  return undefined;
}

function meta(post: WxrPost, key: string): string {
  return post.meta.get(key)?.trim() ?? "";
}

/** Turn listing HTML into paragraphs separated by a blank line. */
export function sellersNotesFromHtml(html: string): string | undefined {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n");
  const text = decodeEntities(withBreaks.replace(/<[^>]+>/g, " "));
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return lines.length > 0 ? lines.join("\n\n") : undefined;
}

function publishedAt(post: WxrPost): string | undefined {
  const raw = post.postDateGmt?.trim() || post.postDate?.trim();
  if (!raw) return undefined;
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const dated = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`;
  const time = Date.parse(dated);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

function positiveInteger(value: string): number | undefined {
  const digits = value.replace(/,/g, "").trim();
  if (!/^\d+$/.test(digits)) return undefined;
  const number = Number(digits);
  return number > 0 ? number : undefined;
}

function wholeNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const digits = value.replace(/,/g, "").trim();
  if (!/^\d+$/.test(digits)) return undefined;
  return Number(digits);
}

function decoded(value: string | undefined): string | undefined {
  const text = decodeEntities(value)?.replace(/\s+/g, " ").trim();
  return text ? text : undefined;
}

function decodeEntities(value: string | undefined): string {
  return (value ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&rsquo;|&#8217;|&lsquo;|&#8216;/gi, "'")
    .replace(/&rdquo;|&ldquo;|&#8220;|&#8221;/gi, '"')
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/gi, "-")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function omitEmpty(vehicle: Vehicle): Vehicle {
  return Object.fromEntries(Object.entries(vehicle).filter(([, value]) => value !== undefined)) as Vehicle;
}

function isImportedForSale(vehicle: Vehicle): boolean {
  return vehicle.availability === undefined && typeof vehicle.pricePounds === "number" && vehicle.pricePounds > 0;
}

export function draftMessage(fields: readonly string[]): string {
  if (fields.length === 1) return `Draft, missing ${fields[0]}.`;
  const last = fields[fields.length - 1];
  return `Draft, missing ${fields.slice(0, -1).join(", ")}, and ${last}.`;
}
