import { expect, test } from "vitest";
import { listingGalleryUrls, storeListingPhotos, type PhotoStore } from "../src/listing-photos";

test("gallery urls are the listing photos in page order, without the logo or similar cars", () => {
  const html = `
    <img src="https://originjapan.co.uk/wp-content/uploads/logo.png" alt="Origin Japan">
    <div class="elementor-widget-motors-single-listing-gallery-mosaic">
      <div class="mosaic-gallery">
        <img src="https://originjapan.co.uk/wp-content/uploads/front.webp" class="wp-post-image" alt="Front">
        <img src="data:image/png;base64,aaaa" data-src="https://originjapan.co.uk/wp-content/uploads/rear.webp" alt="Rear">
        <img src="https://originjapan.co.uk/wp-content/uploads/front.webp" alt="Front again">
      </div>
    </div>
    <div class="stm-car-similar">
      <img src="https://originjapan.co.uk/wp-content/uploads/other-car.jpg" alt="Another car">
    </div>
  `;

  expect(listingGalleryUrls(html)).toEqual([
    "https://originjapan.co.uk/wp-content/uploads/front.webp",
    "https://originjapan.co.uk/wp-content/uploads/rear.webp",
  ]);
});

test("a page without a listing gallery has no photo urls", () => {
  expect(listingGalleryUrls("<img src=\"https://originjapan.co.uk/logo.png\">")).toEqual([]);
});

test("a photo that is already stored is reused, and a failed download is reported", async () => {
  const stored = new Map<string, Uint8Array>();
  const store: PhotoStore = {
    async has(key) {
      return stored.has(key);
    },
    async put(key, bytes) {
      stored.set(key, bytes);
    },
  };
  const calls: string[] = [];
  const fetchPhoto = async (url: string) => {
    calls.push(url);
    if (url.endsWith("missing.jpg")) return { ok: false as const, status: 404 };
    return {
      ok: true as const,
      status: 200,
      contentType: "image/jpeg",
      bytes: async () => new Uint8Array([1, 2, 3]),
    };
  };

  const first = await storeListingPhotos({
    slug: "2688",
    urls: ["https://originjapan.co.uk/front.jpg", "https://originjapan.co.uk/missing.jpg"],
    store,
    fetchPhoto,
  });
  const second = await storeListingPhotos({
    slug: "2688",
    urls: ["https://originjapan.co.uk/front.jpg"],
    store,
    fetchPhoto,
  });

  expect(first.paths).toHaveLength(1);
  expect(first.paths[0]).toMatch(/^\/_emdash\/api\/media\/file\/import-2688-[a-f0-9]+\.jpg$/);
  expect(first.failed).toEqual(["https://originjapan.co.uk/missing.jpg"]);
  expect(second.paths).toEqual(first.paths);
  expect(calls).toEqual([
    "https://originjapan.co.uk/front.jpg",
    "https://originjapan.co.uk/missing.jpg",
  ]);
});
