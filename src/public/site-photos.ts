/**
 * Photographs shipped in public/images, with AVIF and WebP files encoded beside them by
 * `bun run encode-photos`. Rerun it after replacing a source JPEG. No imports, so the script
 * can load this file with Node's type stripping.
 */
export type SitePhoto = {
  /** The original JPEG, which is also the fallback for browsers without AVIF or WebP. */
  source: string;
  /** Variants are named `/images/{name}-{width}.{avif,webp}`. */
  name: string;
  widths: readonly number[];
  /** Variants are cropped to this width:height, centred, as `object-cover` shows them. */
  aspect: readonly [number, number];
};

export type SitePhotoVariant = { path: string; format: "avif" | "webp"; width: number; height: number };

export const sitePhotos: readonly SitePhoto[] = [
  { source: "/images/suzuki-carry-sunset-1400.jpg", name: "suzuki-carry-sunset", widths: [640, 960, 1350], aspect: [3, 2] },
  { source: "/images/grade-sheet-v70-1400.jpg", name: "grade-sheet-v70", widths: [480, 720, 960], aspect: [1155, 1400] },
];

export type PictureSource = { type: "image/avif" | "image/webp"; srcset: string };

const formats = ["avif", "webp"] as const;

function heightAt(photo: SitePhoto, width: number): number {
  return Math.round((width * photo.aspect[1]) / photo.aspect[0]);
}

export function sitePhotoVariants(photo: SitePhoto): SitePhotoVariant[] {
  return formats.flatMap((format) =>
    photo.widths.map((width) => ({
      path: `/images/${photo.name}-${width}.${format}`,
      format,
      width,
      height: heightAt(photo, width),
    })),
  );
}

/** The `<picture>` sources for a site photo, AVIF first, and the size of its largest variant. */
export function sitePhotoSources(photo: SitePhoto): { sources: PictureSource[]; width: number; height: number } {
  const variants = sitePhotoVariants(photo);
  const width = Math.max(...photo.widths);
  return {
    sources: formats.map((format) => ({
      type: `image/${format}`,
      srcset: variants
        .filter((variant) => variant.format === format)
        .map((variant) => `${variant.path} ${variant.width}w`)
        .join(", "),
    })),
    width,
    height: heightAt(photo, width),
  };
}

/** Page banners, as JPEG paths without the extension. Each has an AVIF and WebP of the same size. */
export const banners = {
  home: { narrow: "/images/home-dusk-row-1000", wide: "/images/home-dusk-row-2000" },
  import: { narrow: "/images/import-skylines-fuji-1000", wide: "/images/import-skylines-fuji-1300" },
  grades: { narrow: "/images/grade-trueno-1000", wide: "/images/grade-trueno-2000" },
  contact: { narrow: "/images/contact-supra-gtr-900", wide: "/images/contact-supra-gtr-1600" },
} as const;

export type BannerName = keyof typeof banners;

/** Every CSS background photo, as a JPEG path without the extension: the banners and the carbon fibre texture. */
export const backgroundPhotos: readonly string[] = [
  ...Object.values(banners).flatMap((banner) => [banner.narrow, banner.wide]),
  "/images/carbon-fibre-detail",
];
