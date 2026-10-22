import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { brochurePicture, photoWidths, resizedPhotoUrl, responsivePhoto } from "../src/public/photos";
import { backgroundPhotos, sitePhotos, sitePhotoVariants } from "../src/public/site-photos";

const sizes = "(min-width: 768px) 50vw, 100vw";

test("a media photo gets a mid-size WebP src, a srcset of every width, and the caller's sizes", () => {
  const photo = responsivePhoto("/_emdash/api/media/file/01ABC.jpg", sizes);

  expect(photo).toEqual({
    src: "/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01ABC.jpg&w=960&f=webp",
    srcset: [
      "/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01ABC.jpg&w=480&f=webp 480w",
      "/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01ABC.jpg&w=960&f=webp 960w",
      "/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01ABC.jpg&w=1600&f=webp 1600w",
    ].join(", "),
    sizes,
  });
});

test("photos are resized to three widths", () => {
  expect(photoWidths).toEqual([480, 960, 1600]);
});

test("an absolute media url is resized by its path", () => {
  expect(resizedPhotoUrl("https://originjapan.co.uk/_emdash/api/media/file/01ABC.jpg?v=2", 480)).toBe(
    "/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01ABC.jpg&w=480&f=webp",
  );
});

test("the media href is url-encoded", () => {
  const src = resizedPhotoUrl("/_emdash/api/media/file/a b&c.jpg", 960);

  expect(new URL(src, "https://site").searchParams.get("href")).toBe("/_emdash/api/media/file/a%20b&c.jpg");
  expect(src).not.toContain("&c.jpg");
});

test("a photo that is not EmDash media is left as it is, with no srcset", () => {
  expect(responsivePhoto("https://photos.example/levorg-front.jpg", sizes)).toEqual({
    src: "https://photos.example/levorg-front.jpg",
  });
  expect(resizedPhotoUrl("https://photos.example/levorg-front.jpg", 480)).toBe("https://photos.example/levorg-front.jpg");
});

test("the media route with no file is left as it is", () => {
  expect(responsivePhoto("/_emdash/api/media/file/", sizes)).toEqual({ src: "/_emdash/api/media/file/" });
});

test("a site photo is offered as AVIF and WebP at each width, with its JPEG as the fallback", () => {
  expect(brochurePicture("/images/suzuki-carry-sunset-1400.jpg", sizes)).toEqual({
    src: "/images/suzuki-carry-sunset-1400.jpg",
    sizes,
    sources: [
      {
        type: "image/avif",
        srcset:
          "/images/suzuki-carry-sunset-640.avif 640w, /images/suzuki-carry-sunset-960.avif 960w, /images/suzuki-carry-sunset-1350.avif 1350w",
      },
      {
        type: "image/webp",
        srcset:
          "/images/suzuki-carry-sunset-640.webp 640w, /images/suzuki-carry-sunset-960.webp 960w, /images/suzuki-carry-sunset-1350.webp 1350w",
      },
    ],
    width: 1350,
    height: 900,
  });
});

test("an EmDash media photo in a brochure block loads resized WebP variants", () => {
  expect(brochurePicture("/_emdash/api/media/file/01ABC.jpg", sizes)).toEqual({
    ...responsivePhoto("/_emdash/api/media/file/01ABC.jpg", sizes),
    sources: [],
  });
});

test("a brochure photo from anywhere else is left as it is", () => {
  expect(brochurePicture("https://photos.example/import-1.jpg", sizes)).toEqual({
    src: "https://photos.example/import-1.jpg",
    sources: [],
  });
});

test("every AVIF and WebP file a site photo, banner or texture names is in public", () => {
  const files = [
    ...sitePhotos.flatMap((photo) => sitePhotoVariants(photo).map((variant) => variant.path)),
    ...backgroundPhotos.flatMap((path) => [`${path}.avif`, `${path}.webp`]),
  ];

  expect(files.length).toBeGreaterThan(0);
  for (const file of files) expect(existsSync(fileURLToPath(new URL(`../public${file}`, import.meta.url))), file).toBe(true);
});
