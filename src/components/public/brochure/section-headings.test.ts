import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as feature from "./Feature.stories";
import * as importPhotos from "./ImportPhotos.stories";
import * as sectionGroup from "./SectionGroup.stories";
import * as stockPreview from "./StockPreview.stories";
import * as reviews from "../Reviews.stories";
import { renderPublicStory } from "../render-public-story";

const { WithImage } = composeStories(feature);
const { SeveralPhotos } = composeStories(importPhotos);
const { HomeColumns, DocumentPage } = composeStories(sectionGroup);
const { InStock } = composeStories(stockPreview);
const { TwoReviews } = composeStories(reviews);

const cases = [
  ["section group columns", sectionGroup.default.component, HomeColumns],
  ["section group document", sectionGroup.default.component, DocumentPage],
  ["feature", feature.default.component, WithImage],
  ["reviews", reviews.default.component, TwoReviews],
  ["import photos", importPhotos.default.component, SeveralPhotos],
  ["stock preview", stockPreview.default.component, InStock],
] as const;

test.each(cases)("the %s section heading is the accent colour", async (_name, component, story) => {
  await renderPublicStory(component, story);

  const headings = [...document.querySelectorAll("h2")].filter((heading) => heading.classList.contains("font-display"));
  expect(headings.length).toBeGreaterThan(0);
  for (const heading of headings) expect(heading.classList.contains("text-accent"), heading.textContent ?? "").toBe(true);
});

test("the car title in the stock preview stays ink", async () => {
  await renderPublicStory(stockPreview.default.component, InStock);

  const title = [...document.querySelectorAll("li h2, li h3")];
  expect(title.length).toBeGreaterThan(0);
  for (const heading of title) expect(heading.classList.contains("text-accent")).toBe(false);
});
