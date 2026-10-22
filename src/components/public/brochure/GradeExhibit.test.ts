import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as stories from "./GradeExhibit.stories";
import { renderPublicStory } from "../render-public-story";

const { DefaultCaption } = composeStories(stories);

const image = () => document.querySelector("figure picture img");
const source = (type: string) => document.querySelector(`figure picture source[type="${type}"]`);

test("the exhibit sheet offers AVIF and WebP variants, with the JPEG as fallback", async () => {
  await renderPublicStory(stories.default.component, DefaultCaption);

  expect(source("image/avif")?.getAttribute("srcset")).toContain("/images/grade-sheet-v70-480.avif 480w");
  expect(source("image/webp")?.getAttribute("srcset")).toContain("/images/grade-sheet-v70-960.webp 960w");
  expect(source("image/avif")?.getAttribute("sizes")).toContain("(min-width: 768px)");
  expect(image()?.getAttribute("src")).toBe("/images/grade-sheet-v70-1400.jpg");
  expect(image()?.getAttribute("loading")).toBe("lazy");
});

test("the exhibit sheet declares the size of its largest variant, in the sheet's own shape", async () => {
  await renderPublicStory(stories.default.component, DefaultCaption);

  expect(image()?.getAttribute("width")).toBe("960");
  expect(image()?.getAttribute("height")).toBe("1164");
});

test("an exhibit on its own is sized to its narrow frame rather than the grade sheet column", async () => {
  await renderPublicStory(stories.default.component, DefaultCaption);
  const inColumn = source("image/avif")?.getAttribute("sizes");

  await renderPublicStory(stories.default.component, { args: { ...DefaultCaption.args, alone: true } });

  expect(source("image/avif")?.getAttribute("sizes")).not.toBe(inColumn);
});
