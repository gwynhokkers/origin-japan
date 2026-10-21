import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import { importPhotoSizes } from "../../../public/site-photos";
import { renderPublicStory } from "../render-public-story";
import * as stories from "./ImportPhotos.stories";

const { SeveralPhotos } = composeStories(stories);

const images = () => [...document.querySelectorAll("img")];

test("the import photos story renders each photograph", async () => {
  await renderPublicStory(stories.default.component, SeveralPhotos);

  expect(document.body.textContent).toContain("Previous personal imports");
  expect(images().map((img) => img.getAttribute("alt"))).toEqual(SeveralPhotos.args.photos.map((photo) => photo.alt));
});

test("import photos that are not EmDash media keep their url, with a 3:2 box", async () => {
  await renderPublicStory(stories.default.component, SeveralPhotos);

  expect(images().map((img) => img.getAttribute("src"))).toEqual(SeveralPhotos.args.photos.map((photo) => photo.src));
  for (const img of images()) {
    expect(img.hasAttribute("srcset")).toBe(false);
    expect(img.hasAttribute("sizes")).toBe(false);
    expect(img.getAttribute("width")).toBe("900");
    expect(img.getAttribute("height")).toBe("600");
  }
});

test("import photos stored in EmDash media load a WebP srcset sized to the grid slot", async () => {
  const photos = [
    { src: "/_emdash/api/media/file/01DOCK.jpg", alt: "A white estate at the docks" },
    { src: "/_emdash/api/media/file/02YARD.jpg", alt: "A dark coupe on the trailer" },
    { src: "/_emdash/api/media/file/03SHOP.jpg", alt: "A silver saloon in the yard" },
  ];
  await renderPublicStory(stories.default.component, { args: { ...SeveralPhotos.args, photos } });

  const [lead, ...tiles] = images();
  expect(lead?.getAttribute("src")).toBe("/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01DOCK.jpg&w=960&f=webp");
  expect(lead?.getAttribute("srcset")).toContain("&w=480&f=webp 480w");
  expect(lead?.getAttribute("srcset")).toContain("&w=960&f=webp 960w");
  expect(lead?.getAttribute("srcset")).toContain("&w=1600&f=webp 1600w");
  expect(lead?.getAttribute("sizes")).toBe(importPhotoSizes.lead);
  expect(lead?.getAttribute("width")).toBe("900");
  expect(lead?.getAttribute("height")).toBe("600");
  for (const tile of tiles) expect(tile.getAttribute("sizes")).toBe(importPhotoSizes.tile);
});

test("a single import photo is sized to the whole row", async () => {
  await renderPublicStory(stories.default.component, {
    args: {
      photos: [{ src: "/_emdash/api/media/file/01DOCK.jpg", alt: "A white estate at the docks" }],
    },
  });

  expect(images()[0]?.getAttribute("sizes")).toBe(importPhotoSizes.sole);
});
