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
