import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import * as stories from "./VehicleEnquiry.stories";
import { renderPublicStory } from "./render-public-story";

const { Empty, FieldError, Confirmation } = composeStories(stories);

test("an empty vehicle enquiry asks the buyer to enquire and does not save a lead", async () => {
  await renderPublicStory(stories.default.component, Empty);

  expect(document.querySelector("form")?.getAttribute("aria-label")).toBe("Enquire about this car");
  expect(document.body.textContent).toContain("Enquire about this car");
  expect(document.querySelector("input")?.getAttribute("value")).toBe("");
  expect(document.body.textContent).not.toContain("Your enquiry has been sent.");
});

test("a vehicle enquiry shows a missing first name under that field", async () => {
  await renderPublicStory(stories.default.component, FieldError);
  const html = document.body.innerHTML;
  const fieldAt = html.indexOf('id="first-name"');
  const errorAt = html.indexOf("Enter your first name.");

  expect(fieldAt).toBeGreaterThan(-1);
  expect(errorAt).toBeGreaterThan(fieldAt);
  expect(document.querySelector("form")).not.toBeNull();
  expect(document.body.textContent).not.toContain("Your enquiry has been sent.");
});

test("a confirmed vehicle enquiry shows the confirmation and no form", async () => {
  await renderPublicStory(stories.default.component, Confirmation);

  expect(document.body.textContent).toContain("Your enquiry has been sent.");
  expect(document.querySelector("form")).toBeNull();
});
