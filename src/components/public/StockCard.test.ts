import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as stories from "./StockCard.stories";
import { renderPublicStory } from "./render-public-story";

const { ForSale, InPrep, OnWater, Sold } = composeStories(stories);

test("a for-sale stock card shows the first photo, the title, and the price", async () => {
  await renderPublicStory(stories.default.component, ForSale);

  expect(document.body.textContent).toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(document.body.textContent).toContain("£11,495");
  expect(document.querySelector("img")?.getAttribute("src")).toBe("https://photos.example/levorg-front.jpg");
  expect(document.body.innerHTML).not.toContain("levorg-rear.jpg");
  expect(document.body.textContent).not.toContain("In prep");
  expect(document.body.textContent).not.toContain("On water");
  expect(document.body.textContent).not.toContain("Sold");
});

test("a stock card photo stored in EmDash media loads resized WebP variants sized to the stock grid", async () => {
  const vehicle = { ...ForSale.args.vehicle, photos: ["/_emdash/api/media/file/01ABC.jpg"] };
  await renderPublicStory(stories.default.component, { args: { vehicle } });

  const img = document.querySelector("img");
  expect(img?.getAttribute("src")).toBe("/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01ABC.jpg&w=960&f=webp");
  expect(img?.getAttribute("srcset")).toContain("&w=480&f=webp 480w");
  expect(img?.getAttribute("srcset")).toContain("&w=1600&f=webp 1600w");
  expect(img?.getAttribute("sizes")).toContain("(min-width: 1024px)");
});

test("a stock card photo that is not EmDash media has no srcset", async () => {
  await renderPublicStory(stories.default.component, ForSale);

  expect(document.querySelector("img")?.hasAttribute("srcset")).toBe(false);
  expect(document.querySelector("img")?.hasAttribute("sizes")).toBe(false);
});

test("an in-prep stock card shows the label and no price", async () => {
  await renderPublicStory(stories.default.component, InPrep);

  expect(document.body.textContent).toContain("In prep");
  expect(document.body.textContent).not.toContain("£");
});

test("an on-water stock card shows the label and no price", async () => {
  await renderPublicStory(stories.default.component, OnWater);

  expect(document.body.textContent).toContain("On water");
  expect(document.body.textContent).not.toContain("£");
  expect(document.body.textContent).not.toContain("In prep");
});

test("a sold stock card shows Sold and no price", async () => {
  await renderPublicStory(stories.default.component, Sold);

  expect(document.body.innerHTML).toMatch(/<p class="badge"[^>]*>Sold<\/p>/);
  expect(document.body.textContent).not.toContain("£");
});
