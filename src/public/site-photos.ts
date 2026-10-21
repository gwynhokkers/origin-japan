/** Photographs encoded ahead of time. Editor uploads still go through `/_image`. */

export const bannerNarrowMedia = "(max-width: 767px)";
export const bannerWideMedia = "(min-width: 768px)";

export const avifEffort = 6;

export type RasterFormat = "avif" | "webp" | "jpg";

const rasterFormats = ["avif", "webp", "jpg"] as const;

export function variantPath(name: string, width: number, format: RasterFormat): string {
  return `/images/${name}-${width}.${format}`;
}

export function formatSrcset(name: string, widths: readonly number[], format: RasterFormat): string {
  return widths.map((width) => `${variantPath(name, width, format)} ${width}w`).join(", ");
}

export type StaticPicture = {
  avif: string;
  webp: string;
  jpeg: string;
  src: string;
  sizes: string;
  width: number;
  height: number;
};

type FramedPhoto = {
  source: string;
  name: string;
  widths: readonly number[];
  sizes: string;
  width: number;
  height: number;
  /** Crop to this aspect before scaling. Omit to keep the source frame. */
  crop?: { width: number; height: number };
  avifQuality: number;
  webpQuality: number;
  jpegQuality: number;
};

export function staticPicture(photo: FramedPhoto): StaticPicture {
  const largest = photo.widths.at(-1);
  if (largest === undefined) throw new Error(`${photo.name} has no widths`);
  return {
    avif: formatSrcset(photo.name, photo.widths, "avif"),
    webp: formatSrcset(photo.name, photo.widths, "webp"),
    jpeg: formatSrcset(photo.name, photo.widths, "jpg"),
    src: variantPath(photo.name, largest, "jpg"),
    sizes: photo.sizes,
    width: photo.width,
    height: photo.height,
  };
}

/**
 * Default feature photograph. It is shown at 3:2, so the encoder crops to that
 * before scaling. 480 covers a phone at 1×, 960 the desktop column at 1×, and
 * 1350 that column at 2× or a phone at 3×.
 */
export const featurePhoto = {
  source: "/images/suzuki-carry-sunset-1400.jpg",
  name: "suzuki-carry-sunset",
  widths: [480, 960, 1350],
  crop: { width: 3, height: 2 },
  sizes: "(min-width: 1280px) 42rem, (min-width: 768px) calc(58vw - 4rem), calc(100vw - 2rem)",
  width: 1350,
  height: 900,
  avifQuality: 55,
  webpQuality: 75,
  jpegQuality: 80,
} as const satisfies FramedPhoto;

/**
 * Auction sheet on the grade sheets page, shown at its own 1155×1400 ratio.
 * 480 is the desktop column, 960 that column at 2×, and 1155 the source width,
 * which a phone at 3× needs.
 */
export const gradeExhibit = {
  source: "/images/grade-sheet-v70-1400.jpg",
  name: "grade-sheet-v70",
  widths: [480, 960, 1155],
  sizes: "(min-width: 1280px) 30rem, (min-width: 768px) calc(42vw - 3rem), calc(100vw - 2rem)",
  width: 1155,
  height: 1400,
  avifQuality: 60,
  webpQuality: 80,
  jpegQuality: 82,
} as const satisfies FramedPhoto;

export const framedPhotos = [featurePhoto, gradeExhibit] as const;

export function bannerSlot(basename: string) {
  return {
    avif: `/images/${basename}.avif`,
    webp: `/images/${basename}.webp`,
    jpg: `/images/${basename}.jpg`,
  };
}

export type BannerSlot = ReturnType<typeof bannerSlot>;

export const pageBanners = {
  home: {
    narrow: bannerSlot("home-dusk-row-1000"),
    wide: bannerSlot("home-dusk-row-2000"),
  },
  import: {
    narrow: bannerSlot("import-skylines-fuji-1000"),
    wide: bannerSlot("import-skylines-fuji-1300"),
  },
  grades: {
    narrow: bannerSlot("grade-trueno-1000"),
    wide: bannerSlot("grade-trueno-2000"),
  },
  contact: {
    narrow: bannerSlot("contact-supra-gtr-900"),
    wide: bannerSlot("contact-supra-gtr-1600"),
  },
} as const;

export type BannerName = keyof typeof pageBanners;

export const bannerEncode = { avifQuality: 55, webpQuality: 75 } as const;

/** Carbon twill used on the header, footer, and the contact mat. One frame for every band. */
export const carbonTexture = {
  source: "/images/carbon-fibre-detail.jpg",
  avif: "/images/carbon-fibre-detail.avif",
  webp: "/images/carbon-fibre-detail.webp",
  jpg: "/images/carbon-fibre-detail.jpg",
  avifQuality: 55,
  webpQuality: 75,
} as const;

/** Import-photo slots. The lead spans two tracks, a tile takes one, and a lone photo spans the row. */
export const importPhotoSizes = {
  lead: "(min-width: 1280px) 37rem, (min-width: 768px) 46rem, calc(100vw - 2rem)",
  tile: "(min-width: 1280px) 18rem, (min-width: 768px) 22rem, calc(100vw - 2rem)",
  sole: "(min-width: 1280px) 75rem, (min-width: 768px) calc(100vw - 5rem), calc(100vw - 2rem)",
} as const;

export function encodedSitePhotoPaths(): string[] {
  const paths = new Set<string>();
  for (const photo of framedPhotos) {
    for (const width of photo.widths) {
      for (const format of rasterFormats) paths.add(variantPath(photo.name, width, format));
    }
  }
  for (const banner of Object.values(pageBanners)) {
    paths.add(banner.narrow.avif);
    paths.add(banner.narrow.webp);
    paths.add(banner.wide.avif);
    paths.add(banner.wide.webp);
  }
  paths.add(carbonTexture.avif);
  paths.add(carbonTexture.webp);
  return [...paths];
}
