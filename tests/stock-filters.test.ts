import { expect, test } from "vitest";
import type { Vehicle } from "../src/catalogue";
import { inMemoryCatalogue } from "../src/in-memory-catalogue";
import { requestPublicPage } from "./buyer-page";

const levorg = vehicle({ slug: "levorg", make: "Subaru", model: "Levorg 2.0 GT-S", body: "Estate", year: 2016, transmission: "Automatic", mileageMiles: 42000, pricePounds: 11495, grade: "4" });
const brz = vehicle({ slug: "brz", make: "Subaru", model: "BRZ", body: "Coupe", year: 2013, transmission: "Manual", mileageMiles: 61000, pricePounds: 9995, grade: "4.5" });
const supra = vehicle({ slug: "supra", make: "Toyota", model: "Supra RZ", body: "Coupe", year: 1997, transmission: "Manual", mileageMiles: 88000, pricePounds: 42000 });
const estima = vehicle({ slug: "estima", make: "Toyota", model: "Estima Aeras", body: "MPV", year: 2008, transmission: "Automatic", mileageMiles: 70500, pricePounds: undefined, availability: "in prep", grade: "4" });
const hiace = vehicle({ slug: "hiace", make: "Toyota", model: "Hiace", body: "MPV", year: 2010, transmission: "Automatic", mileageMiles: 99000, pricePounds: undefined, availability: "on water" });
const soldMx5 = vehicle({ slug: "mx5", make: "Mazda", model: "MX-5", body: "Convertible", year: 1991, transmission: "Manual", mileageMiles: 57100, pricePounds: 6000, availability: "sold", grade: "3.5" });
const soldLegacy = vehicle({ slug: "legacy", make: "Subaru", model: "Legacy GT", body: "Estate", year: 2011, transmission: "Automatic", mileageMiles: 64000, pricePounds: undefined, availability: "sold" });

const catalogue = () => inMemoryCatalogue({ vehicles: [levorg, brz, supra, estima, hiace, soldMx5, soldLegacy] });

test("stock filters by make, body, one model year, and transmission", async () => {
  expect(await shownSlugs("/showroom?make=Subaru")).toEqual(["brz", "levorg"]);
  expect(await shownSlugs("/showroom?body=MPV")).toEqual(["estima", "hiace"]);
  expect(await shownSlugs("/showroom?year=1997")).toEqual(["supra"]);
  expect(await shownSlugs("/showroom?transmission=Manual")).toEqual(["brz", "supra"]);
});

test("stock filters by model within the chosen make", async () => {
  expect(await shownSlugs("/showroom?make=Toyota&model=Supra+RZ")).toEqual(["supra"]);
});

test("a model left over from another make is dropped when the buyer changes make", async () => {
  const html = await pageText("/showroom?make=Subaru&model=Supra+RZ");

  expect(await shownSlugs("/showroom?make=Subaru&model=Supra+RZ")).toEqual(["brz", "levorg"]);
  expect(selected(html, "model")).toBeUndefined();
});

test("stock filters mileage and price by a minimum and a maximum", async () => {
  expect(await shownSlugs("/showroom?mileage-min=60000&mileage-max=90000")).toEqual(["brz", "supra", "estima"]);
  expect(await shownSlugs("/showroom?price-min=10000")).toEqual(["levorg", "supra"]);
  expect(await shownSlugs("/showroom?price-max=12000")).toEqual(["brz", "levorg"]);
});

test("a price filter hides in-prep and on-water vehicles, and clearing it shows them again", async () => {
  const filtered = await shownSlugs("/showroom?body=MPV&price-max=50000");
  const cleared = await shownSlugs("/showroom?body=MPV");

  expect(filtered).toEqual([]);
  expect(cleared).toEqual(["estima", "hiace"]);
});

test("a grade filter on stock matches the grade Adam recorded", async () => {
  expect(await shownSlugs("/showroom?grade=4")).toEqual(["levorg", "estima"]);
  expect(await shownSlugs("/showroom?grade=4.5")).toEqual(["brz"]);
});

test("several filters apply together", async () => {
  expect(await shownSlugs("/showroom?make=Toyota&body=Coupe&mileage-max=90000")).toEqual(["supra"]);
});

test("filter choices are values present in the current view", async () => {
  const showroom = await pageText("/showroom");
  const sold = await pageText("/sold");

  expect(options(showroom, "make")).toEqual(["Subaru", "Toyota"]);
  expect(options(showroom, "body")).toEqual(["Coupe", "MPV", "Estate"]);
  expect(options(showroom, "year")).toEqual(["2016", "2013", "2010", "2008", "1997"]);
  expect(options(showroom, "transmission")).toEqual(["Manual", "Automatic"]);
  expect(options(showroom, "grade")).toEqual(["4.5", "4"]);

  expect(options(sold, "make")).toEqual(["Mazda", "Subaru"]);
  expect(options(sold, "body")).toEqual(["Convertible", "Estate"]);
});

test("model only offers models of the chosen make that are in the current view", async () => {
  const noMake = await pageText("/showroom");
  const toyota = await pageText("/showroom?make=Toyota");
  const soldSubaru = await pageText("/sold?make=Subaru");

  expect(options(noMake, "model")).toEqual([]);
  expect(options(toyota, "model")).toEqual(["Estima Aeras", "Hiace", "Supra RZ"]);
  expect(options(soldSubaru, "model")).toEqual(["Legacy GT"]);
});

test("the chosen filters stay in the page address for sort and pages", async () => {
  const html = await pageText("/showroom?make=Subaru&mileage-max=70000&sort=price");

  expect(selected(html, "make")).toBe("Subaru");
  expect(inputValue(html, "mileage-max")).toBe("70000");
  expect(html).toContain('href="/showroom?sort=model-year&amp;make=Subaru&amp;mileage-max=70000"');
  expect(html).toMatch(/<input type="hidden" name="sort" value="price"/);
  expect(await shownSlugs("/showroom?make=Subaru&mileage-max=70000&sort=price")).toEqual(["brz", "levorg"]);
});

test("filters reach the next page of stock", async () => {
  const many = Array.from({ length: 14 }, (_, index) =>
    vehicle({ slug: `subaru-${index + 1}`, make: "Subaru", model: `Model ${index + 1}`, pricePounds: 5000 + index }),
  );
  const html = await pageText("/showroom?make=Subaru", inMemoryCatalogue({ vehicles: [...many, supra] }));

  expect(html).toContain('href="/showroom?make=Subaru&amp;page=2"');
});

test("sold stock has the same filters and sorts, without grade or price", async () => {
  const sold = await pageText("/sold");

  for (const field of ["make", "model", "body", "year", "transmission", "mileage-min", "mileage-max"]) {
    expect(sold, field).toContain(`id="${field}"`);
  }
  expect(sold).not.toContain('id="grade"');
  expect(sold).not.toContain('id="price-min"');
  expect(await shownSlugs("/sold?make=Subaru")).toEqual(["legacy"]);
  expect(await shownSlugs("/sold?grade=3.5")).toEqual(["legacy", "mx5"]);
  expect(await shownSlugs("/sold?price-max=7000")).toEqual(["legacy", "mx5"]);
});

test("no matches explains that the filters excluded everything", async () => {
  const html = await pageText("/showroom?make=Subaru&body=MPV");

  expect(html).toContain("No vehicles match these filters.");
  expect(html).toMatch(/<a [^>]*href="\/showroom"[^>]*>Clear filters<\/a>/);
});

test("on a small screen the filters sit in a panel the buyer opens", async () => {
  const html = await pageText("/showroom");
  const panel = html.slice(html.indexOf('<details class="stock-controls stock-filters"'), html.indexOf("</details>", html.indexOf("stock-filters")));

  expect(panel).toContain("<summary>Filters</summary>");
  expect(panel).toContain('id="make"');
  expect(panel).toContain("Apply filters");
});

test("a closed filter panel says how many filters are on", async () => {
  const html = await pageText("/showroom?make=Toyota&mileage-max=90000");

  expect(html).toContain("<summary>Filters (2)</summary>");
});

test("a grade is shown on the vehicle page when Adam recorded one, and a vehicle is public without one", async () => {
  const graded = await pageText("/listings/levorg");
  const ungraded = await pageText("/listings/supra");

  expect(graded).toMatch(/<dt[^>]*>Grade<\/dt>\s*<dd[^>]*>4<\/dd>/);
  expect(ungraded).not.toContain(">Grade<");
});

function vehicle(overrides: Partial<Vehicle> & { slug: string }): Vehicle {
  return {
    id: overrides.slug,
    title: `${overrides.make ?? "Subaru"} ${overrides.model ?? "Levorg"} ${overrides.year ?? 2016}`,
    make: "Subaru",
    model: "Levorg",
    body: "Estate",
    year: 2016,
    transmission: "Automatic",
    mileageMiles: 42000,
    photos: [`https://photos.example/${overrides.slug}.jpg`],
    sellersNotes: "One owner from Osaka.",
    ...overrides,
  };
}

async function pageText(path: string, source = catalogue()): Promise<string> {
  const response = await requestPublicPage(new Request(`http://originjapan.test${path}`), source);
  expect(response.status, path).toBe(200);
  return response.text();
}

async function shownSlugs(path: string): Promise<string[]> {
  const html = await pageText(path);
  const grid = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  return [...new Set([...grid.matchAll(/href="\/listings\/([^"]+)"/g)].map((match) => match[1] ?? ""))];
}

function selectHtml(html: string, id: string): string {
  const start = html.indexOf(`<select id="${id}"`);
  if (start === -1) return "";
  return html.slice(start, html.indexOf("</select>", start));
}

function options(html: string, id: string): string[] {
  return [...selectHtml(html, id).matchAll(/<option value="([^"]+)"/g)].map((match) => match[1] ?? "");
}

function selected(html: string, id: string): string | undefined {
  return selectHtml(html, id).match(/<option value="([^"]+)" selected/)?.[1];
}

function inputValue(html: string, id: string): string | undefined {
  const tag = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))?.[0] ?? "";
  return tag.match(/\bvalue="([^"]*)"/)?.[1];
}
