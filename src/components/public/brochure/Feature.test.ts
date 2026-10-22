import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as stories from "./Feature.stories";
import { renderPublicStory } from "../render-public-story";

const { WithImage } = composeStories(stories);

const image = () => document.querySelector("picture img");
const source = (type: string) => document.querySelector(`picture source[type="${type}"]`);

test("the feature photo offers AVIF and WebP variants sized to its column, with the JPEG as fallback", async () => {
  await renderPublicStory(stories.default.component, WithImage);

  expect(source("image/avif")?.getAttribute("srcset")).toContain("/images/suzuki-carry-sunset-640.avif 640w");
  expect(source("image/webp")?.getAttribute("srcset")).toContain("/images/suzuki-carry-sunset-1350.webp 1350w");
  expect(source("image/avif")?.getAttribute("sizes")).toContain("(min-width: 768px)");
  expect(image()?.getAttribute("src")).toBe("/images/suzuki-carry-sunset-1400.jpg");
  expect(image()?.getAttribute("alt")).toBe("A white Suzuki Carry kei truck at sunset");
  expect(image()?.getAttribute("loading")).toBe("lazy");
});

test("the feature photo declares the 3:2 shape it is shown at", async () => {
  await renderPublicStory(stories.default.component, WithImage);

  expect(image()?.getAttribute("width")).toBe("1350");
  expect(image()?.getAttribute("height")).toBe("900");
});

test("a feature photo from EmDash media loads resized WebP variants at 3:2", async () => {
  await renderPublicStory(stories.default.component, {
    args: { ...WithImage.args, image: { src: "/_emdash/api/media/file/01ABC.jpg", alt: "A kei truck" } },
  });

  expect(document.querySelectorAll("picture source")).toHaveLength(0);
  expect(image()?.getAttribute("srcset")).toContain("/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01ABC.jpg&w=480&f=webp 480w");
  expect(image()?.getAttribute("sizes")).toContain("(min-width: 768px)");
  expect(Number(image()?.getAttribute("width")) / Number(image()?.getAttribute("height"))).toBe(1.5);
});
