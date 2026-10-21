import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import { gradeExhibit, staticPicture } from "../../../public/site-photos";
import { renderPublicStory } from "../render-public-story";
import * as stories from "./GradeExhibit.stories";

const { DefaultCaption, CustomCaption } = composeStories(stories);
const picture = staticPicture(gradeExhibit);

test("the grade exhibit story renders the sheet and its caption", async () => {
  await renderPublicStory(stories.default.component, DefaultCaption);

  expect(document.body.textContent).toContain("Volvo V70");
  const img = document.querySelector("img");
  expect(img?.getAttribute("width")).toBe(String(gradeExhibit.width));
  expect(img?.getAttribute("height")).toBe(String(gradeExhibit.height));
  expect(img?.getAttribute("srcset")).toBe(picture.jpeg);
  expect(document.querySelector('source[type="image/avif"]')?.getAttribute("srcset")).toBe(picture.avif);
  expect(document.querySelector('source[type="image/webp"]')?.getAttribute("srcset")).toBe(picture.webp);
  expect(picture.avif).toContain("480w");
  expect(picture.avif).toContain("960w");
  expect(picture.avif).toContain("1155w");
});

test("a custom grade exhibit caption replaces the default", async () => {
  await renderPublicStory(stories.default.component, CustomCaption);

  expect(document.body.textContent).toContain("A custom caption for the Volvo V70 exhibit sheet.");
});
