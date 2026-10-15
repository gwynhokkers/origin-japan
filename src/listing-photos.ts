import { createHash } from "node:crypto";

export type PhotoStore = {
  has(key: string): Promise<boolean>;
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
};

export type FetchedPhoto =
  | { ok: false; status: number }
  | {
      ok: true;
      status: number;
      contentType: string | null;
      bytes: () => Promise<Uint8Array>;
    };

/** Listing gallery images in page order. Logo and similar-car photos are outside that gallery. */
export function listingGalleryUrls(html: string): string[] {
  const start = html.search(
    /motors-elementor-single-listing-gallery-mosaic|elementor-widget-motors-single-listing-gallery-mosaic/,
  );
  if (start === -1) return [];
  const similar = html.indexOf("stm-car-similar", start);
  const gallery = html.slice(start, similar === -1 ? undefined : similar);
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const tag of gallery.match(/<img\b[^>]*>/gi) ?? []) {
    const url = imageUrl(tag);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

/** Copy listing photos into storage. A file already stored for that url is not downloaded again. */
export async function storeListingPhotos(input: {
  slug: string;
  urls: readonly string[];
  store: PhotoStore;
  fetchPhoto: (url: string) => Promise<FetchedPhoto>;
}): Promise<{ paths: string[]; failed: string[] }> {
  const paths: string[] = [];
  const failed: string[] = [];
  for (const url of input.urls) {
    const key = storageKey(input.slug, url);
    const path = `/_emdash/api/media/file/${key}`;
    if (await input.store.has(key)) {
      paths.push(path);
      continue;
    }
    const response = await input.fetchPhoto(url);
    if (!response.ok || (response.contentType !== null && !response.contentType.startsWith("image/"))) {
      failed.push(url);
      continue;
    }
    await input.store.put(key, await response.bytes(), response.contentType ?? "image/jpeg");
    paths.push(path);
  }
  return { paths, failed };
}

function imageUrl(tag: string): string | undefined {
  const dataSrc = attribute(tag, "data-src");
  if (isHttp(dataSrc)) return dataSrc;
  const src = attribute(tag, "src");
  if (isHttp(src)) return src;
  return undefined;
}

function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1];
}

function isHttp(url: string | undefined): url is string {
  return url !== undefined && (url.startsWith("https://") || url.startsWith("http://"));
}

function storageKey(slug: string, url: string): string {
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
  return `import-${slug}-${hash}${extension(url)}`;
}

function extension(url: string): string {
  const path = url.split("?")[0] ?? url;
  const match = path.match(/\.(jpe?g|png|webp|gif|avif)$/i);
  if (!match?.[1]) return ".jpg";
  return match[1].toLowerCase() === "jpeg" ? ".jpg" : `.${match[1].toLowerCase()}`;
}
