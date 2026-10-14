import { expect, test } from "vitest";
import { inMemoryCatalogue } from "../src/in-memory-catalogue";
import { requestPublicPage } from "../src/public-site";

test("a buyer receives a response from the public site", async () => {
  const response = await requestPublicPage(
    new Request("http://originjapan.test/"),
    inMemoryCatalogue(),
  );

  expect(response.status).toBe(200);
  expect(await response.text()).toContain("Origin Japan");
});
