import { sitePhotoHeight, sitePhotos, sitePhotoVariants, type SitePhotoVariant } from "./site-photos";

const mediaPrefix = "/_emdash/api/media/file/";

/** Kept to three so every photo stays within the Cloudflare Images free tier of unique transforms. */
export const photoWidths = [480, 960, 1600] as const;

export type PhotoWidth = (typeof photoWidths)[number];

export type ResponsivePhoto = { src: string; srcset?: string; sizes?: string };

function mediaPath(url: string): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(url, "http://localhost").pathname;
  } catch {
    return undefined;
  }
  return pathname.startsWith(mediaPrefix) && pathname.length > mediaPrefix.length ? pathname : undefined;
}

/** EmDash media resized to `width` as WebP; any other url is returned as it is. */
export function resizedPhotoUrl(url: string, width: PhotoWidth): string {
  const path = mediaPath(url);
  return path ? `/_image?href=${encodeURIComponent(path)}&w=${width}&f=webp` : url;
}

/** `sizes` describes the space the photo fills, as in the `<img sizes>` attribute. */
export function responsivePhoto(url: string, sizes: string): ResponsivePhoto {
  if (!mediaPath(url)) return { src: url };
  return {
    src: resizedPhotoUrl(url, 960),
    srcset: photoWidths.map((width) => `${resizedPhotoUrl(url, width)} ${width}w`).join(", "),
    sizes,
  };
}

export type PictureSource = { type: "image/avif" | "image/webp"; srcset: string };

/** A `<picture>`: `sources` come before the `<img>`, and share its `sizes`. */
export type Picture = ResponsivePhoto & { sources: PictureSource[]; width?: number; height?: number };

/**
 * A photo in a brochure block. Site photos get their pre-encoded AVIF and WebP variants,
 * EmDash media gets resized WebP from `/_image`, and any other url is returned as it is.
 */
export function brochurePicture(url: string, sizes: string): Picture {
  const photo = sitePhotos.find((candidate) => candidate.source === url);
  if (!photo) return { ...responsivePhoto(url, sizes), sources: [] };
  const variants = sitePhotoVariants(photo);
  const srcset = (format: SitePhotoVariant["format"]) =>
    variants
      .filter((variant) => variant.format === format)
      .map((variant) => `${variant.path} ${variant.width}w`)
      .join(", ");
  const largest = Math.max(...photo.widths);
  return {
    src: photo.source,
    sizes,
    sources: [
      { type: "image/avif", srcset: srcset("avif") },
      { type: "image/webp", srcset: srcset("webp") },
    ],
    width: largest,
    height: sitePhotoHeight(photo, largest),
  };
}
