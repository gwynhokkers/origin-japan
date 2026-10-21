import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import { featurePhoto, staticPicture } from "../../../public/site-photos";
import { renderPublicStory } from "../render-public-story";
import * as stories from "./Feature.stories";

const { WithImage, TextOnly } = composeStories(stories);
const picture = staticPicture(featurePhoto);

test("a feature story renders the heading, the picture, and the link", async () => {
  await renderPublicStory(stories.default.component, WithImage);

  expect(document.body.textContent).toContain("Personal imports");
  expect(document.querySelector("img")?.getAttribute("alt")).toBe("A row of imported cars at dusk");
  expect(document.querySelector("a")?.getAttribute("href")).toBe("/personal-import");
});

test("a feature photograph that is not a site photo keeps its url and is declared at 3:2", async () => {
  await renderPublicStory(stories.default.component, WithImage);

  const img = document.querySelector("img");
  expect(img?.getAttribute("src")).toBe("/images/home-dusk-row-2000.jpg");
  expect(img?.hasAttribute("srcset")).toBe(false);
  expect(img?.getAttribute("width")).toBe(String(featurePhoto.width));
  expect(img?.getAttribute("height")).toBe(String(featurePhoto.height));
  expect(Number(img?.getAttribute("width")) / Number(img?.getAttribute("height"))).toBeCloseTo(3 / 2);
});

test("the bundled feature photograph uses AVIF and WebP variants at the cropped 3:2 size", async () => {
  await renderPublicStory(stories.default.component, {
    args: {
      ...WithImage.args,
      image: { src: featurePhoto.source, alt: "A white Suzuki Carry kei truck at sunset" },
    },
  });

  const img = document.querySelector("img");
  expect(img?.getAttribute("src")).toBe(picture.src);
  expect(img?.getAttribute("srcset")).toBe(picture.jpeg);
  expect(img?.getAttribute("width")).toBe("1350");
  expect(img?.getAttribute("height")).toBe("900");
  expect(document.querySelector('source[type="image/avif"]')?.getAttribute("srcset")).toBe(picture.avif);
  expect(document.querySelector('source[type="image/webp"]')?.getAttribute("srcset")).toBe(picture.webp);
  expect(picture.avif).toContain("960w");
  expect(picture.avif).toContain("1350w");
});

test("a feature photograph stored in EmDash media loads resized WebP variants", async () => {
  await renderPublicStory(stories.default.component, {
    args: {
      ...WithImage.args,
      image: { src: "/_emdash/api/media/file/01CARRY.jpg", alt: "A kei truck" },
    },
  });

  const img = document.querySelector("img");
  expect(img?.getAttribute("src")).toBe("/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01CARRY.jpg&w=960&f=webp");
  expect(img?.getAttribute("srcset")).toContain("&w=480&f=webp 480w");
  expect(img?.getAttribute("srcset")).toContain("&w=960&f=webp 960w");
  expect(img?.getAttribute("srcset")).toContain("&w=1600&f=webp 1600w");
  expect(img?.getAttribute("sizes")).toBe(featurePhoto.sizes);
  expect(img?.getAttribute("width")).toBe("1350");
  expect(img?.getAttribute("height")).toBe("900");
});

test("a feature without a picture renders the copy only", async () => {
  await renderPublicStory(stories.default.component, TextOnly);

  expect(document.body.textContent).toContain("Personal imports");
  expect(document.querySelector("img")).toBeNull();
});
