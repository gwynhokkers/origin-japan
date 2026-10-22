import { expect, test } from "vitest";
import { composeStories } from "@storybook-astro/framework/testing";
import { renderPublicStory } from "./render-public-story";
import * as stories from "./PageBanner.stories";

const { Home, Import, Grades, Contact } = composeStories(stories);

test("page banner stories render the banner for each page", async () => {
  for (const story of [Home, Import, Grades, Contact]) {
    await renderPublicStory(stories.default.component, story);
    expect(document.querySelector(`.banner-${story.args.name}`)).toBeTruthy();
  }
});
