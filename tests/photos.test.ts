import { expect, test } from "vitest";
import { photoWidths, resizedPhotoUrl, responsivePhoto } from "../src/public/photos";

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
