import { ContentRepository, getEmDashCollection, getMenu } from "emdash";
import { getDb } from "emdash/runtime";
import type {
  BlockImage,
  BrochureBlock,
  Catalogue,
  ImportPhoto,
  Lead,
  NavLink,
  PageCopy,
  Review,
  SiteContent,
  SiteNavigation,
  Vehicle,
  VehicleEnquiryInput,
} from "./catalogue";
import { upsertVehicle } from "./save-vehicle";

export const emdashCatalogue: Catalogue = {
  vehicles: listVehicles,
  leads: listLeads,
  saveVehicle,
  saveVehicleEnquiry,
  siteContent,
  navigation,
};

async function navigation(): Promise<SiteNavigation> {
  const [primary, footer] = await Promise.all([menuLinks("primary"), menuLinks("footer")]);
  const site: SiteNavigation = {};
  if (primary) site.primary = primary;
  if (footer) site.footer = footer;
  return site;
}

async function menuLinks(name: string): Promise<readonly NavLink[] | undefined> {
  try {
    const menu = await getMenu(name);
    if (!menu) return undefined;
    return menu.items.flatMap((item) => {
      if (!item.label || !item.url) return [];
      const link: NavLink = { label: item.label, href: item.url };
      if (item.target) link.target = item.target;
      return [link];
    });
  } catch {
    return undefined;
  }
}

async function listVehicles(): Promise<readonly Vehicle[]> {
  const { entries, error } = await getEmDashCollection("vehicles");
  if (error) throw error;
  return entries.map(vehicleFromEntry);
}

async function listLeads(): Promise<readonly Lead[]> {
  const { entries, error } = await getEmDashCollection("leads");
  if (error) throw error;
  return entries.map((entry) => ({
    id: entry.id,
    vehicle: stringValue(entry.data.vehicle),
    firstName: stringValue(entry.data.first_name),
    email: stringValue(entry.data.email),
    message: stringValue(entry.data.message),
  }));
}

async function siteContent(): Promise<SiteContent> {
  const [pageEntries, reviewEntries, photoEntries] = await Promise.all([
    publishedEntries("pages"),
    publishedEntries("reviews"),
    publishedEntries("import_photos"),
  ]);
  const content: SiteContent = {};
  if (pageEntries) {
    const ordered = [...pageEntries].sort(byOrder);
    content.pages = ordered.flatMap(pageFromEntry);
    const home = ordered.find((entry) => pageSlug(entry) === "home");
    const google = stringValue(recordData(home).google_reviews_url)?.trim();
    if (google) content.googleReviewsUrl = google;
  }
  if (reviewEntries) content.reviews = [...reviewEntries].sort(byOrder).flatMap(reviewFromEntry);
  if (photoEntries) content.importPhotos = [...photoEntries].sort(byOrder).flatMap(importPhotoFromEntry);
  return content;
}

type SiteEntry = { id: string; status?: string; data: object };

async function publishedEntries(collection: string): Promise<readonly SiteEntry[] | undefined> {
  try {
    const { entries, error } = await getEmDashCollection(collection);
    if (error || !entries) return undefined;
    return (entries as unknown as readonly SiteEntry[]).filter(
      (entry) => entry.status === undefined || entry.status === "published",
    );
  } catch {
    return undefined;
  }
}

function pageFromEntry(entry: SiteEntry): PageCopy[] {
  const data = recordData(entry);
  const slug = pageSlug(entry);
  if (!slug) return [];
  const blocks = blocksFrom(data.sections);
  const page: PageCopy = { slug, title: stringValue(data.title), body: stringValue(data.body) };
  if (blocks.length > 0) page.blocks = blocks;
  return [page];
}

function blocksFrom(value: unknown): BrochureBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(blockFrom);
}

function blockFrom(value: unknown): BrochureBlock[] {
  const block = recordValue(value);
  const type = stringValue(block?._type);
  if (!block || !type) return [];
  const heading = stringValue(block.heading)?.trim();
  const body = stringValue(block.body);
  switch (type) {
    case "opening":
      return [{
        kind: "opening",
        body,
        linkLabel: stringValue(block.link_label)?.trim() || undefined,
        linkHref: stringValue(block.link_url)?.trim() || undefined,
      }];
    case "section":
      return heading ? [{ kind: "section", heading, body }] : [];
    case "feature":
      return heading
        ? [{
            kind: "feature",
            heading,
            body,
            image: blockImage(block.image),
            linkLabel: stringValue(block.link_label)?.trim() || undefined,
            linkHref: stringValue(block.link_url)?.trim() || undefined,
          }]
        : [];
    case "stock":
      return [{ kind: "stock", heading: heading || undefined }];
    case "reviews":
      return [{ kind: "reviews", heading: heading || undefined }];
    case "photos":
      return [{ kind: "photos", heading: heading || undefined }];
    case "details":
      return [{ kind: "details" }];
    case "exhibit":
      return [{ kind: "exhibit", caption: stringValue(block.caption)?.trim() || undefined }];
    default:
      return [];
  }
}

function pageSlug(entry: SiteEntry): string | undefined {
  const data = recordData(entry);
  return (
    stringValue(data.key)?.trim() ||
    stringValue(data.slug)?.trim() ||
    stringValue(data.id)?.trim() ||
    entry.id
  );
}

function reviewFromEntry(entry: SiteEntry): Review[] {
  const data = recordData(entry);
  const name = stringValue(data.name)?.trim();
  const quote = stringValue(data.quote)?.trim();
  if (!name || !quote) return [];
  return [{ name, quote }];
}

function importPhotoFromEntry(entry: SiteEntry): ImportPhoto[] {
  const data = recordData(entry);
  const src = imageSource(data.photo);
  if (!src) return [];
  const alt = stringValue(data.alt)?.trim();
  return [alt ? { src, alt } : { src }];
}

function recordData(entry: SiteEntry | undefined): Record<string, unknown> {
  return recordValue(entry?.data) ?? {};
}

function byOrder(a: SiteEntry, b: SiteEntry): number {
  const aOrder = integerValue(recordData(a).order);
  const bOrder = integerValue(recordData(b).order);
  if (aOrder !== undefined && bOrder !== undefined && aOrder !== bOrder) return aOrder - bOrder;
  if (aOrder !== undefined && bOrder === undefined) return -1;
  if (aOrder === undefined && bOrder !== undefined) return 1;
  return a.id.localeCompare(b.id);
}

function blockImage(value: unknown): BlockImage | undefined {
  const src = imageSource(value);
  if (!src) return undefined;
  const media = recordValue(value);
  const alt = stringValue(media?.alt)?.trim() || stringValue(recordValue(media?.asset)?.alt)?.trim();
  return alt ? { src, alt } : { src };
}

function imageSource(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  const media = recordValue(value);
  if (!media) return undefined;
  const src = stringValue(media.src)?.trim() || stringValue(media.url)?.trim();
  if (src) return src;
  const storageKey = stringValue(recordValue(media.meta)?.storageKey);
  if (storageKey) return `/_emdash/api/media/file/${storageKey}`;
  return media.asset ? imageSource(media.asset) : undefined;
}

async function saveVehicle(vehicle: Vehicle): Promise<void> {
  await upsertVehicle(new ContentRepository(await getDb()), vehicle);
}

async function saveVehicleEnquiry(input: VehicleEnquiryInput): Promise<Lead> {
  const repo = new ContentRepository(await getDb());
  const item = await repo.create({
    type: "leads",
    status: "published",
    publishedAt: new Date().toISOString(),
    data: {
      vehicle: input.vehicle,
      first_name: input.firstName,
      email: input.email,
      message: input.message,
    },
  });
  return { id: item.id, ...input };
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
    const src = imageSource(recordValue(row)?.photo);
    return src ? [src] : [];
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
