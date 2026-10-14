import { expect, test } from "vitest";
import type { Vehicle } from "../src/catalogue";
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

test("a buyer sees a for-sale vehicle on stock and can open its page", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        id: "levorg-2016",
        slug: "subaru-levorg-2-0-gt-s",
        title: "Subaru Levorg 2.0 GT-S 2016",
        make: "Subaru",
        model: "Levorg 2.0 GT-S",
        body: "Estate",
        year: 2016,
        transmission: "Automatic",
        mileageMiles: 42000,
        pricePounds: 11495,
        photos: [
          "https://photos.example/levorg-front.jpg",
          "https://photos.example/levorg-rear.jpg",
        ],
        sellersNotes: "One owner from Osaka, with a full service history.",
      },
    ],
  });

  const response = await requestPublicPage(
    new Request("http://originjapan.test/stock"),
    catalogue,
  );
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain("£11,495");
  expect(html).toContain("https://photos.example/levorg-front.jpg");
  expect(html).not.toContain("https://photos.example/levorg-rear.jpg");
  expect(html).toContain("Subaru");
  expect(html).toContain("Levorg 2.0 GT-S");
  expect(html).toContain("2016");
  expect(html).toContain("42,000 miles");
  expect(html).toContain("Automatic");
  expect(html).toContain('href="/listings/subaru-levorg-2-0-gt-s"');
});

test("a buyer sees the vehicle, its price, and photos in Adam's order", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        id: "levorg-2016",
        slug: "subaru-levorg-2-0-gt-s",
        title: "Subaru Levorg 2.0 GT-S 2016",
        make: "Subaru",
        model: "Levorg 2.0 GT-S",
        body: "Estate",
        year: 2016,
        transmission: "Automatic",
        mileageMiles: 42000,
        pricePounds: 11495,
        photos: [
          "https://photos.example/levorg-front.jpg",
          "https://photos.example/levorg-rear.jpg",
        ],
        sellersNotes: "One owner from Osaka, with a full service history.",
      },
    ],
  });

  const stock = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const page = await requestPublicPage(
    new Request("http://originjapan.test/listings/subaru-levorg-2-0-gt-s"),
    catalogue,
  );
  const stockHtml = await stock.text();
  const html = await page.text();
  const stockPhoto = stockHtml.match(/<img[^>]*src="([^"]+)"/)?.[1];
  const pagePhotos = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map((match) => match[1]);

  expect(page.status).toBe(200);
  expect(html).toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(html).toContain("Subaru");
  expect(html).toContain("Levorg 2.0 GT-S");
  expect(html).toContain("Estate");
  expect(html).toContain("2016");
  expect(html).toContain("Automatic");
  expect(html).toContain("42,000 miles");
  expect(html).toContain("One owner from Osaka, with a full service history.");
  expect(html).toContain("£11,495");
  expect(pagePhotos).toEqual([
    "https://photos.example/levorg-front.jpg",
    "https://photos.example/levorg-rear.jpg",
  ]);
  expect(stockPhoto).toBe("https://photos.example/levorg-front.jpg");
  expect(pagePhotos[0]).toBe(stockPhoto);
});

test("a vehicle missing a required field is absent, and the VIN stays off the page", async () => {
  const vin = "JF1VMFLH5H9123456";
  const catalogue = inMemoryCatalogue({
    vehicles: [{ ...forSaleVehicle(), vin }],
  });
  const stock = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const page = await requestPublicPage(
    new Request("http://originjapan.test/listings/subaru-levorg-2-0-gt-s"),
    catalogue,
  );

  expect(stock.status).toBe(200);
  expect(page.status).toBe(200);
  expect(await stock.text()).not.toContain(vin);
  expect(await page.text()).not.toContain(vin);

  const required = [
    "title",
    "make",
    "model",
    "body",
    "year",
    "transmission",
    "mileageMiles",
    "pricePounds",
    "photos",
    "sellersNotes",
  ] as const;

  for (const field of required) {
    const slug = `missing-${field}`;
    const photo = `https://photos.example/${field}.jpg`;
    const note = `Note for ${field} stays off the site.`;
    const incomplete = forSaleVehicle();
    incomplete.slug = slug;
    incomplete.photos = [photo];
    incomplete.sellersNotes = note;
    if (field === "photos") incomplete.photos = [];
    else if (field === "sellersNotes") incomplete.sellersNotes = " ";
    else if (field === "title" || field === "make" || field === "model" || field === "body" || field === "transmission") {
      incomplete[field] = " ";
    } else {
      delete incomplete[field];
    }

    const hidden = inMemoryCatalogue({ vehicles: [incomplete] });
    const hiddenStock = await requestPublicPage(new Request("http://originjapan.test/stock"), hidden);
    const hiddenPage = await requestPublicPage(
      new Request(`http://originjapan.test/listings/${slug}`),
      hidden,
    );
    const hiddenHtml = await hiddenStock.text();

    expect(hiddenStock.status).toBe(200);
    expect(hiddenHtml).not.toContain(slug);
    expect(hiddenHtml).not.toContain(photo);
    expect(hiddenHtml).not.toContain(note);
    expect(hiddenPage.status).toBe(404);
  }
});

function forSaleVehicle(): Vehicle {
  return {
    id: "levorg-2016",
    slug: "subaru-levorg-2-0-gt-s",
    title: "Subaru Levorg 2.0 GT-S 2016",
    make: "Subaru",
    model: "Levorg 2.0 GT-S",
    body: "Estate",
    year: 2016,
    transmission: "Automatic",
    mileageMiles: 42000,
    pricePounds: 11495,
    photos: [
      "https://photos.example/levorg-front.jpg",
      "https://photos.example/levorg-rear.jpg",
    ],
    sellersNotes: "One owner from Osaka, with a full service history.",
  };
}
