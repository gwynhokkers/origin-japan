import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as stories from "./ImportPhotos.stories";
import { renderPublicStory } from "../render-public-story";

const { SeveralPhotos } = composeStories(stories);

const images = () => [...document.querySelectorAll("li img")];

const renderMediaPhotos = (count: number) =>
  renderPublicStory(stories.default.component, {
    args: {
      ...SeveralPhotos.args,
      photos: Array.from({ length: count }, (_, index) => ({
        src: `/_emdash/api/media/file/0${index}ABC.jpg`,
        alt: `Import ${index}`,
      })),
    },
  });

test("import photos stored in EmDash media load resized WebP variants at 3:2", async () => {
  await renderMediaPhotos(3);

  for (const [index, img] of images().entries()) {
    expect(img.getAttribute("src")).toBe(`/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F0${index}ABC.jpg&w=960&f=webp`);
    expect(img.getAttribute("srcset")).toContain("&w=480&f=webp 480w");
    expect(img.getAttribute("alt")).toBe(`Import ${index}`);
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(Number(img.getAttribute("width")) / Number(img.getAttribute("height"))).toBe(1.5);
  }
});

test("the first import photo, which spans two columns, is sized larger than the rest", async () => {
  await renderMediaPhotos(3);

  const [first, second, third] = images().map((img) => img.getAttribute("sizes"));
  expect(first).toContain("(min-width: 1280px) 37rem");
  expect(second).toContain("(min-width: 1280px) 18rem");
  expect(third).toBe(second);
});

test("a lone import photo is sized to the full frame", async () => {
  await renderMediaPhotos(1);

  expect(images()[0]?.getAttribute("sizes")).toContain("(min-width: 1280px) 75rem");
});

test("import photos that are not EmDash media keep their url and have no srcset", async () => {
  await renderPublicStory(stories.default.component, SeveralPhotos);

  const photos: readonly { src: string }[] = SeveralPhotos.args.photos;
  expect(images().map((img) => img.getAttribute("src"))).toEqual(photos.map((photo) => photo.src));
  for (const img of images()) expect(img.hasAttribute("srcset")).toBe(false);
});
