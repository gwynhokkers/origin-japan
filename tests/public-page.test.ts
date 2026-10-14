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

test("an in-prep vehicle is on stock with an In prep badge and no price", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [{ ...forSaleVehicle(), pricePounds: undefined, availability: "in prep" }],
  });

  const response = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain("In prep");
  expect(html).toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(html).toContain('href="/listings/subaru-levorg-2-0-gt-s"');
  expect(html).not.toContain("£");
});

test("an on-water vehicle is on stock with an On water badge and no price", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [{ ...forSaleVehicle(), pricePounds: undefined, availability: "on water" }],
  });

  const response = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain("On water");
  expect(html).toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(html).toContain('href="/listings/subaru-levorg-2-0-gt-s"');
  expect(html).not.toContain("£");
  expect(html).not.toContain("In prep");
});

test("a sold vehicle is only on sold stock, and its page shows Sold with no price or enquiry", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      forSaleVehicle(),
      {
        ...forSaleVehicle(),
        id: "legacy-2011",
        slug: "subaru-legacy-2011",
        title: "Subaru Legacy 2011",
        model: "Legacy",
        year: 2011,
        mileageMiles: 57100,
        pricePounds: 8250,
        photos: [
          "https://photos.example/legacy-front.jpg",
          "https://photos.example/legacy-rear.jpg",
        ],
        sellersNotes: "Sold last spring, kept here for the record.",
        availability: "sold",
      },
    ],
  });

  const stock = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const soldStock = await requestPublicPage(new Request("http://originjapan.test/sold"), catalogue);
  const page = await requestPublicPage(
    new Request("http://originjapan.test/listings/subaru-legacy-2011"),
    catalogue,
  );
  const stockHtml = await stock.text();
  const soldHtml = await soldStock.text();
  const html = await page.text();

  expect(stock.status).toBe(200);
  expect(stockHtml).toContain("£11,495");
  expect(stockHtml).toContain('href="/sold"');
  expect(stockHtml).not.toContain("subaru-legacy-2011");
  expect(stockHtml).not.toContain("£8,250");

  expect(soldStock.status).toBe(200);
  expect(soldHtml).toContain("Subaru Legacy 2011");
  expect(soldHtml).toContain('<p class="badge">Sold</p>');
  expect(soldHtml).toContain('href="/listings/subaru-legacy-2011"');
  expect(soldHtml).not.toContain("subaru-levorg-2-0-gt-s");
  expect(soldHtml).not.toContain("£");

  expect(page.status).toBe(200);
  expect(html).toContain('<p class="badge">Sold</p>');
  expect(html).toContain("https://photos.example/legacy-front.jpg");
  expect(html).toContain("https://photos.example/legacy-rear.jpg");
  expect(html).toContain("Subaru");
  expect(html).toContain("Legacy");
  expect(html).toContain("Estate");
  expect(html).toContain("2011");
  expect(html).toContain("Automatic");
  expect(html).toContain("57,100 miles");
  expect(html).toContain("Sold last spring, kept here for the record.");
  expect(html).not.toContain("£");
  expect(html).not.toContain("<form");
  expect(html).not.toContain("Enquire");
});

test("a draft is absent from stock, sold stock, and its page", async () => {
  const note = "Still being written, so it stays off the site.";
  const catalogue = inMemoryCatalogue({
    vehicles: [
      forSaleVehicle(),
      {
        ...forSaleVehicle(),
        id: "draft-beat",
        slug: "honda-beat-1993",
        title: "Honda Beat 1993",
        make: "Honda",
        model: "Beat",
        year: 1993,
        pricePounds: 7995,
        photos: ["https://photos.example/beat.jpg"],
        sellersNotes: note,
        availability: "sold",
        draft: true,
      },
    ],
  });

  const stock = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const soldStock = await requestPublicPage(new Request("http://originjapan.test/sold"), catalogue);
  const page = await requestPublicPage(
    new Request("http://originjapan.test/listings/honda-beat-1993"),
    catalogue,
  );
  const stockHtml = await stock.text();
  const soldHtml = await soldStock.text();

  expect(stock.status).toBe(200);
  expect(stockHtml).toContain("subaru-levorg-2-0-gt-s");
  expect(stockHtml).not.toContain("honda-beat-1993");
  expect(stockHtml).not.toContain("Honda Beat 1993");
  expect(stockHtml).not.toContain("https://photos.example/beat.jpg");
  expect(stockHtml).not.toContain(note);
  expect(stockHtml).not.toContain("£7,995");

  expect(soldStock.status).toBe(200);
  expect(soldHtml).not.toContain("honda-beat-1993");
  expect(soldHtml).not.toContain("Honda Beat 1993");
  expect(soldHtml).not.toContain(note);

  expect(page.status).toBe(404);
});

test("a public price on an in-prep or on-water vehicle makes it for sale", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        ...forSaleVehicle(),
        id: "prep-priced",
        slug: "volvo-v40-in-prep",
        title: "Volvo V40 D4 R-Design 2016",
        make: "Volvo",
        model: "V40 D4 R-Design",
        pricePounds: 9995,
        photos: ["https://photos.example/v40.jpg"],
        availability: "in prep",
      },
      {
        ...forSaleVehicle(),
        id: "water-priced",
        slug: "toyota-gr-yaris-on-water",
        title: "Toyota GR Yaris 2025",
        make: "Toyota",
        model: "GR Yaris",
        year: 2025,
        pricePounds: 36995,
        photos: ["https://photos.example/yaris.jpg"],
        availability: "on water",
      },
    ],
  });

  const stock = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const prep = await requestPublicPage(
    new Request("http://originjapan.test/listings/volvo-v40-in-prep"),
    catalogue,
  );
  const water = await requestPublicPage(
    new Request("http://originjapan.test/listings/toyota-gr-yaris-on-water"),
    catalogue,
  );
  const stockHtml = await stock.text();
  const prepHtml = await prep.text();
  const waterHtml = await water.text();

  expect(stock.status).toBe(200);
  expect(stockHtml).toContain("£9,995");
  expect(stockHtml).toContain("£36,995");
  expect(stockHtml).not.toContain("In prep");
  expect(stockHtml).not.toContain("On water");

  expect(prep.status).toBe(200);
  expect(prepHtml).toContain("£9,995");
  expect(prepHtml).not.toContain("In prep");

  expect(water.status).toBe(200);
  expect(waterHtml).toContain("£36,995");
  expect(waterHtml).not.toContain("On water");
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
