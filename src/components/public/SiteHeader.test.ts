import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as stories from "./SiteHeader.stories";
import { renderPublicStory } from "./render-public-story";

const { Stock } = composeStories(stories);

test("the public header names Origin Japan and the Newport reach", async () => {
  await renderPublicStory(stories.default.component, Stock);

  expect(document.body.textContent).toContain("Origin Japan");
  const marks = [...document.querySelectorAll("header img")];
  expect(marks[0]?.getAttribute("alt")).toBe("Origin Japan");
  expect(marks.map((img) => img.getAttribute("src"))).toEqual(["/images/origin-japan-lockup.webp"]);
  expect(document.body.textContent).not.toContain("originjapanimports");
  expect(document.body.textContent).toContain("Unit D2, Langland Park West, Newport, NP19 4ED");
  expect(document.body.textContent).toContain("07454621101");
  expect(document.body.textContent).toContain("info@originjapan.co.uk");
  expect(document.body.textContent).toContain("Showroom");
  expect(document.body.textContent).not.toContain("Current Stock");
  expect(document.body.textContent).toContain("Personal Import Service");
  expect(document.body.textContent).toContain("Grade Sheets");
  expect(document.body.textContent).toContain("Contact");
  expect(document.body.textContent).toContain("Sold Stock");
  expect(document.body.querySelector("a[aria-current='page']")?.textContent).toBe("Showroom");
  const buttons = [...document.querySelectorAll("header button")];
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual(["Open menu"]);
});

test("small screens get a closed menu that holds the pages and contact details", async () => {
  await renderPublicStory(stories.default.component, Stock);

  const button = document.body.querySelector("[data-menu-toggle]");
  expect(button?.getAttribute("aria-expanded")).toBe("false");
  expect(button?.getAttribute("aria-label")).toBe("Open menu");
  const menu = document.getElementById(button?.getAttribute("aria-controls") ?? "");
  expect(menu?.hasAttribute("inert")).toBe(true);
  expect(menu?.textContent).toContain("Personal Import Service");
  expect(menu?.textContent).toContain("07454621101");
  expect(menu?.textContent).toContain("info@originjapan.co.uk");
  expect(menu?.textContent).toContain("Unit D2, Langland Park West, Newport, NP19 4ED");
  expect(menu?.querySelector("a[aria-current='page']")?.textContent?.trim()).toBe("Showroom");
});

test("stories load the public theme, with #F29559 as the accent", () => {
  const theme = readFileSync(join(process.cwd(), "src/styles/public.css"), "utf8");
  const preview = readFileSync(join(process.cwd(), ".storybook/preview.ts"), "utf8");

  expect(theme).toContain("--color-accent: #f29559");
  expect(theme).toContain("Syncopate");
  expect(theme).toContain("Poppins");
  expect(preview).toContain("../src/styles/public.css");
});
