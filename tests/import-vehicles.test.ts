import { expect, test } from "vitest";
import { inMemoryCatalogue } from "../src/in-memory-catalogue";
import { importVehicles } from "../src/import-vehicles";
import { requestPublicPage } from "../src/public-site";

const vehiclesFile = "tests/fixtures/vehicles.json";
const updatedVehiclesFile = "tests/fixtures/vehicles-updated.json";

test("a buyer sees an imported for-sale vehicle on stock and on its page", async () => {
  const catalogue = inMemoryCatalogue();
  await importVehicles(vehiclesFile, catalogue);

  const stock = await pageText(catalogue, "/stock");
  const listing = await pageText(catalogue, "/listings/subaru-levorg-2-0-gt-s");

  expect(stock).toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(stock).toContain("£11,495");
  expect(stock).toContain('href="/listings/subaru-levorg-2-0-gt-s"');
  expect(stock).toContain("https://photos.example/levorg-front.jpg");
  expect(stock).not.toContain("https://photos.example/levorg-rear.jpg");

  expect(listing).toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(listing).toContain("£11,495");
  expect(listing).toContain("Subaru");
  expect(listing).toContain("Levorg 2.0 GT-S");
  expect(listing).toContain("Estate");
  expect(listing).toContain("2016");
  expect(listing).toContain("Automatic");
  expect(listing).toContain("42,000 miles");
  expect(listing).toContain("One owner from Osaka, with a full service history.");
  expect(listing.indexOf("https://photos.example/levorg-front.jpg")).toBeLessThan(
    listing.indexOf("https://photos.example/levorg-rear.jpg"),
  );
});

test("imported in-prep and on-water vehicles are on stock with no public price", async () => {
  const catalogue = inMemoryCatalogue();
  await importVehicles(vehiclesFile, catalogue);

  const stock = await pageText(catalogue, "/stock");
  const inPrep = await pageText(catalogue, "/listings/honda-stepwgn-spada-2014");
  const onWater = await pageText(catalogue, "/listings/toyota-alphard-2018");

  expect(stock).toContain("Honda Stepwgn Spada 2014");
  expect(stock).toContain('href="/listings/honda-stepwgn-spada-2014"');
  expect(stock).toContain("https://photos.example/stepwgn-front.jpg");
  expect(card(stock, "honda-stepwgn-spada-2014")).toContain("In prep");
  expect(card(stock, "honda-stepwgn-spada-2014")).not.toContain("£");

  expect(stock).toContain("Toyota Alphard 2018");
  expect(stock).toContain('href="/listings/toyota-alphard-2018"');
  expect(card(stock, "toyota-alphard-2018")).toContain("On water");
  expect(card(stock, "toyota-alphard-2018")).not.toContain("£");

  expect(inPrep).toContain("In prep");
  expect(inPrep).toContain("In the workshop for a service before it goes on sale.");
  expect(inPrep.indexOf("https://photos.example/stepwgn-front.jpg")).toBeLessThan(
    inPrep.indexOf("https://photos.example/stepwgn-cabin.jpg"),
  );
  expect(inPrep).not.toContain("£");

  expect(onWater).toContain("On water");
  expect(onWater).toContain("On the ship from Yokohama, due in Newport next month.");
  expect(onWater).toContain("https://photos.example/alphard-front.jpg");
  expect(onWater).not.toContain("In prep");
  expect(onWater).not.toContain("£");
});

test("an imported sold vehicle keeps its photos and stays off stock without a public price", async () => {
  const catalogue = inMemoryCatalogue();
  await importVehicles(vehiclesFile, catalogue);

  const stock = await pageText(catalogue, "/stock");
  const sold = await pageText(catalogue, "/sold");
  const listing = await pageText(catalogue, "/listings/subaru-legacy-2011");

  expect(stock).not.toContain("subaru-legacy-2011");
  expect(stock).not.toContain("Subaru Legacy 2011");
  expect(stock).not.toContain("£8,250");
  expect(stock).not.toContain("legacy-front.jpg");

  expect(sold).toContain("Subaru Legacy 2011");
  expect(sold).toContain('<p class="badge">Sold</p>');
  expect(sold).toContain('href="/listings/subaru-legacy-2011"');
  expect(sold).toContain("https://photos.example/legacy-front.jpg");
  expect(sold).not.toContain("£");

  expect(listing).toContain('<p class="badge">Sold</p>');
  expect(listing.indexOf("https://photos.example/legacy-front.jpg")).toBeLessThan(
    listing.indexOf("https://photos.example/legacy-rear.jpg"),
  );
  expect(listing).toContain("Sold last spring, kept here for the record.");
  expect(listing).toContain("57,100 miles");
  expect(listing).not.toContain("£");
  expect(listing).not.toContain("<form");
  expect(listing).not.toContain("Enquire");
});

test("a second import updates the same vehicle page and does not add a duplicate", async () => {
  const catalogue = inMemoryCatalogue();
  await importVehicles(vehiclesFile, catalogue);
  await importVehicles(updatedVehiclesFile, catalogue);

  const stock = await pageText(catalogue, "/stock");
  const sold = await pageText(catalogue, "/sold");
  const listing = await pageText(catalogue, "/listings/subaru-levorg-2-0-gt-s");
  const soldListing = await pageText(catalogue, "/listings/subaru-legacy-2011");

  expect(stock.match(/href="\/listings\/subaru-levorg-2-0-gt-s"/g)).toHaveLength(1);
  expect(stock.match(/href="\/listings\/honda-stepwgn-spada-2014"/g)).toHaveLength(1);
  expect(stock.match(/href="\/listings\/toyota-alphard-2018"/g)).toHaveLength(1);
  expect(stock).toContain("Subaru Levorg 2.0 GT-S Eyesight 2016");
  expect(stock).toContain("£10,995");
  expect(stock).toContain("https://photos.example/levorg-eyesight.jpg");
  expect(stock).not.toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(stock).not.toContain("£11,495");
  expect(stock).not.toContain("levorg-front.jpg");
  expect(stock).not.toContain("subaru-legacy-2011");

  expect(listing).toContain("Subaru Levorg 2.0 GT-S Eyesight 2016");
  expect(listing).toContain("£10,995");
  expect(listing.indexOf("https://photos.example/levorg-eyesight.jpg")).toBeLessThan(
    listing.indexOf("https://photos.example/levorg-rear.jpg"),
  );
  expect(listing).not.toContain("levorg-front.jpg");

  expect(sold.match(/href="\/listings\/subaru-legacy-2011"/g)).toHaveLength(1);
  expect(sold).not.toContain("£");
  expect(soldListing.indexOf("https://photos.example/legacy-side.jpg")).toBeLessThan(
    soldListing.indexOf("https://photos.example/legacy-boot.jpg"),
  );
  expect(soldListing).toContain("Extra photos added on the second import.");
  expect(soldListing).not.toContain("legacy-front.jpg");
  expect(soldListing).not.toContain("legacy-rear.jpg");
  expect(soldListing).not.toContain("£");
  expect(soldListing).not.toContain("<form");
});

function card(html: string, slug: string): string {
  const marker = `href="/listings/${slug}"`;
  const start = html.lastIndexOf("<li", html.indexOf(marker));
  const end = html.indexOf("</li>", start);
  return start === -1 || end === -1 ? "" : html.slice(start, end);
}

async function pageText(catalogue: ReturnType<typeof inMemoryCatalogue>, path: string): Promise<string> {
  const response = await requestPublicPage(new Request(`http://originjapan.test${path}`), catalogue);
  expect(response.status).toBe(200);
  return response.text();
}
