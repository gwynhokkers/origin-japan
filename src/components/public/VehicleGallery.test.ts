import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as stories from "./VehicleGallery.stories";
import { renderPublicStory } from "./render-public-story";

const { SeveralPhotos } = composeStories(stories);

const mediaPhotos = (count: number) =>
  Array.from({ length: count }, (_, index) => `/_emdash/api/media/file/0${index}ABC.jpg`);

const images = () => [...document.querySelectorAll("img")];

const renderMediaPhotos = (count: number) =>
  renderPublicStory(stories.default.component, { args: { ...SeveralPhotos.args, photos: mediaPhotos(count) } });

const sizesOf = () => images().map((img) => img.getAttribute("sizes"));

test("the first gallery photo loads eagerly at high priority and the rest load lazily", async () => {
  await renderPublicStory(stories.default.component, SeveralPhotos);

  const [first, ...rest] = images();
  expect(first?.getAttribute("fetchpriority")).toBe("high");
  expect(first?.hasAttribute("loading")).toBe(false);
  expect(rest).toHaveLength(2);
  for (const img of rest) {
    expect(img.hasAttribute("fetchpriority")).toBe(false);
    expect(img.getAttribute("loading")).toBe("lazy");
  }
});

test("gallery photos that are not EmDash media keep their url and have no srcset", async () => {
  await renderPublicStory(stories.default.component, SeveralPhotos);

  expect(images().map((img) => img.getAttribute("src"))).toEqual(SeveralPhotos.args.photos);
  for (const img of images()) {
    expect(img.hasAttribute("srcset")).toBe(false);
    expect(img.hasAttribute("sizes")).toBe(false);
  }
});

test("gallery photos stored in EmDash media load resized WebP variants", async () => {
  await renderMediaPhotos(3);

  for (const [index, img] of images().entries()) {
    expect(img.getAttribute("src")).toBe(`/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F0${index}ABC.jpg&w=960&f=webp`);
    expect(img.getAttribute("srcset")).toContain("&w=480&f=webp 480w");
    expect(img.getAttribute("srcset")).toContain("&w=1600&f=webp 1600w");
  }
});

test("the first gallery photo is sized to the full gallery width and later photos to half from the medium breakpoint", async () => {
  await renderMediaPhotos(3);

  const [first, second, third] = sizesOf();
  expect(first).toContain("(min-width: 1280px) 42rem");
  expect(first).not.toContain("(min-width: 768px)");
  expect(second).toContain("(min-width: 768px)");
  expect(third).toBe(second);
});

test("a lone last gallery photo is sized to the full gallery width", async () => {
  await renderMediaPhotos(4);

  const sizes = sizesOf();
  expect(sizes[3]).toBe(sizes[0]);
  expect(sizes[1]).not.toBe(sizes[0]);
  expect(sizes[2]).toBe(sizes[1]);
});

test("a single EmDash media photo is sized to the full gallery width", async () => {
  await renderMediaPhotos(1);

  expect(sizesOf()[0]).toContain("(min-width: 1280px) 42rem");
});
