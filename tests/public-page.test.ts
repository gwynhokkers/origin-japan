import { expect, test } from "vitest";
import type { Vehicle } from "../src/catalogue";
import { inMemoryCatalogue } from "../src/in-memory-catalogue";
import { requestPublicPage } from "../src/public-site";

type EnquiryMail = { to: string; subject: string; text: string };

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

test("priced for-sale vehicles appear before in-prep and on-water vehicles", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        ...forSaleVehicle(),
        id: "mx5-on-water",
        slug: "mazda-mx-5-on-water",
        title: "Mazda MX-5 2019",
        make: "Mazda",
        model: "MX-5",
        year: 2019,
        pricePounds: undefined,
        photos: ["https://photos.example/mx5.jpg"],
        availability: "on water",
      },
      {
        ...forSaleVehicle(),
        id: "s2000-in-prep",
        slug: "honda-s2000-in-prep",
        title: "Honda S2000 2004",
        make: "Honda",
        model: "S2000",
        year: 2004,
        pricePounds: undefined,
        photos: ["https://photos.example/s2000.jpg"],
        availability: "in prep",
      },
      forSaleVehicle(),
    ],
  });

  const response = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);
  const slugs = stockSlugs(await response.text());

  expect(response.status).toBe(200);
  expect(slugs.indexOf("subaru-levorg-2-0-gt-s")).toBeLessThan(slugs.indexOf("mazda-mx-5-on-water"));
  expect(slugs.indexOf("subaru-levorg-2-0-gt-s")).toBeLessThan(slugs.indexOf("honda-s2000-in-prep"));
});

test("a group with no order from Adam is newest published first, not newest model year", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        ...forSaleVehicle(),
        id: "yaris",
        slug: "toyota-gr-yaris",
        title: "Toyota GR Yaris 2024",
        make: "Toyota",
        model: "GR Yaris",
        year: 2024,
        pricePounds: 36995,
        photos: ["https://photos.example/yaris.jpg"],
        publishedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        publishedAt: "2026-06-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "s2000-in-prep",
        slug: "honda-s2000-in-prep",
        title: "Honda S2000 2004",
        make: "Honda",
        model: "S2000",
        year: 2004,
        pricePounds: undefined,
        photos: ["https://photos.example/s2000.jpg"],
        availability: "in prep",
        publishedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "mx5-on-water",
        slug: "mazda-mx-5-on-water",
        title: "Mazda MX-5 2019",
        make: "Mazda",
        model: "MX-5",
        year: 2019,
        pricePounds: undefined,
        photos: ["https://photos.example/mx5.jpg"],
        availability: "on water",
        publishedAt: "2026-08-01T00:00:00.000Z",
      },
    ],
  });

  const response = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);

  expect(response.status).toBe(200);
  expect(stockSlugs(await response.text())).toEqual([
    "subaru-levorg-2-0-gt-s",
    "toyota-gr-yaris",
    "mazda-mx-5-on-water",
    "honda-s2000-in-prep",
  ]);
});

test("Adam's order is kept inside the priced group and inside in-prep and on-water", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        ...forSaleVehicle(),
        order: 2,
        publishedAt: "2026-06-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "yaris",
        slug: "toyota-gr-yaris",
        title: "Toyota GR Yaris 2024",
        make: "Toyota",
        model: "GR Yaris",
        year: 2024,
        pricePounds: 36995,
        photos: ["https://photos.example/yaris.jpg"],
        order: 1,
        publishedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "mx5-on-water",
        slug: "mazda-mx-5-on-water",
        title: "Mazda MX-5 2019",
        make: "Mazda",
        model: "MX-5",
        year: 2019,
        pricePounds: undefined,
        photos: ["https://photos.example/mx5.jpg"],
        availability: "on water",
        order: 2,
        publishedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "s2000-in-prep",
        slug: "honda-s2000-in-prep",
        title: "Honda S2000 2004",
        make: "Honda",
        model: "S2000",
        year: 2004,
        pricePounds: undefined,
        photos: ["https://photos.example/s2000.jpg"],
        availability: "in prep",
        order: 1,
        publishedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
  });

  const response = await requestPublicPage(new Request("http://originjapan.test/stock"), catalogue);

  expect(response.status).toBe(200);
  expect(stockSlugs(await response.text())).toEqual([
    "toyota-gr-yaris",
    "subaru-levorg-2-0-gt-s",
    "honda-s2000-in-prep",
    "mazda-mx-5-on-water",
  ]);
});

test("a buyer sort reorders inside each stock group and stays in the page address", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        ...forSaleVehicle(),
        year: 2012,
        mileageMiles: 10000,
        pricePounds: 20000,
        order: 1,
        publishedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "yaris",
        slug: "toyota-gr-yaris",
        title: "Toyota GR Yaris 2018",
        make: "Toyota",
        model: "GR Yaris",
        year: 2018,
        mileageMiles: 90000,
        pricePounds: 10000,
        photos: ["https://photos.example/yaris.jpg"],
        order: 2,
        publishedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "v40",
        slug: "volvo-v40",
        title: "Volvo V40 2022",
        make: "Volvo",
        model: "V40",
        year: 2022,
        mileageMiles: 40000,
        pricePounds: 30000,
        photos: ["https://photos.example/v40.jpg"],
        order: 3,
        publishedAt: "2026-04-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "s2000-in-prep",
        slug: "honda-s2000-in-prep",
        title: "Honda S2000 2004",
        make: "Honda",
        model: "S2000",
        year: 2004,
        mileageMiles: 70000,
        pricePounds: undefined,
        photos: ["https://photos.example/s2000.jpg"],
        availability: "in prep",
        order: 1,
        publishedAt: "2026-09-01T00:00:00.000Z",
      },
      {
        ...forSaleVehicle(),
        id: "mx5-on-water",
        slug: "mazda-mx-5-on-water",
        title: "Mazda MX-5 2019",
        make: "Mazda",
        model: "MX-5",
        year: 2019,
        mileageMiles: 20000,
        pricePounds: undefined,
        photos: ["https://photos.example/mx5.jpg"],
        availability: "on water",
        order: 2,
        publishedAt: "2024-01-01T00:00:00.000Z",
      },
    ],
  });

  const orders = {
    "/stock?sort=price": [
      "toyota-gr-yaris",
      "subaru-levorg-2-0-gt-s",
      "volvo-v40",
      "honda-s2000-in-prep",
      "mazda-mx-5-on-water",
    ],
    "/stock?sort=model-year": [
      "volvo-v40",
      "toyota-gr-yaris",
      "subaru-levorg-2-0-gt-s",
      "mazda-mx-5-on-water",
      "honda-s2000-in-prep",
    ],
    "/stock?sort=mileage": [
      "subaru-levorg-2-0-gt-s",
      "volvo-v40",
      "toyota-gr-yaris",
      "mazda-mx-5-on-water",
      "honda-s2000-in-prep",
    ],
    "/stock?sort=newest": [
      "toyota-gr-yaris",
      "volvo-v40",
      "subaru-levorg-2-0-gt-s",
      "honda-s2000-in-prep",
      "mazda-mx-5-on-water",
    ],
  } as const;

  for (const [path, slugs] of Object.entries(orders)) {
    const response = await requestPublicPage(new Request(`http://originjapan.test${path}`), catalogue);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(stockSlugs(html)).toEqual(slugs);
    expect(html).toContain(`href="${path}"`);
    expect(html).toContain(`href="${path}" aria-current="true"`);
  }
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

test("a for-sale vehicle offers Enquire about this car", async () => {
  const html = await vehicleHtml(forSaleVehicle());

  expect(html).toContain("Enquire about this car");
  expect(html).toContain("<form");
});

test("an in-prep vehicle offers Enquire about this car", async () => {
  const html = await vehicleHtml({
    ...forSaleVehicle(),
    pricePounds: undefined,
    availability: "in prep",
  });

  expect(html).toContain("Enquire about this car");
  expect(html).toContain("<form");
  expect(html).not.toContain("£");
});

test("a saved vehicle enquiry is confirmed and emailed to info@originjapan.co.uk", async () => {
  const catalogue = inMemoryCatalogue({ vehicles: [forSaleVehicle()] });
  const sent: EnquiryMail[] = [];

  const response = await requestPublicPage(
    enquiryRequest({
      "first-name": "Ada",
      email: "ada@example.com",
      message: "Is this Levorg still available?",
      "cf-turnstile-response": "pass",
    }),
    catalogue,
    {
      checkSpam: async (token) => token === "pass",
      sendEmail: async (mail) => {
        sent.push(mail);
      },
    },
  );
  const html = await response.text();
  const leads = await catalogue.leads();

  expect(response.status).toBe(200);
  expect(html).toContain("Your enquiry has been sent.");
  expect(leads).toEqual([
    {
      id: "lead-1",
      vehicle: "Subaru Levorg 2.0 GT-S 2016",
      firstName: "Ada",
      email: "ada@example.com",
      message: "Is this Levorg still available?",
    },
  ]);
  expect(sent).toEqual([
    {
      to: "info@originjapan.co.uk",
      subject: "Vehicle enquiry: Subaru Levorg 2.0 GT-S 2016",
      text: [
        "Vehicle: Subaru Levorg 2.0 GT-S 2016",
        "First name: Ada",
        "Email: ada@example.com",
        "Message:",
        "Is this Levorg still available?",
      ].join("\n"),
    },
  ]);
});

test("a vehicle enquiry rejects a missing first name, email, or message under that field", async () => {
  const catalogue = inMemoryCatalogue({ vehicles: [forSaleVehicle()] });
  const services = {
    checkSpam: async () => true,
    sendEmail: async () => {
      throw new Error("email should not be sent");
    },
  };
  const cases = [
    {
      fields: { email: "ada@example.com", message: "Hello" },
      error: "Enter your first name.",
      field: "first-name",
      next: "email",
    },
    {
      fields: { "first-name": "Ada", message: "Hello" },
      error: "Enter your email.",
      field: "email",
      next: "message",
    },
    {
      fields: { "first-name": "Ada", email: "ada@example.com" },
      error: "Enter a message.",
      field: "message",
      next: "Enquire about this car",
    },
    {
      fields: { "first-name": "Ada", email: "not-an-email", message: "Hello" },
      error: "Enter a valid email address.",
      field: "email",
      next: "message",
    },
  ];

  for (const item of cases) {
    const response = await requestPublicPage(
      enquiryRequest({ ...item.fields, "cf-turnstile-response": "pass" }),
      catalogue,
      services,
    );
    const html = await response.text();
    const fieldAt = html.indexOf(`id="${item.field}"`);
    const errorAt = html.indexOf(item.error);
    const nextAt = html.indexOf(item.next, fieldAt + 1);

    expect(response.status).toBe(400);
    expect(html).not.toContain("Your enquiry has been sent.");
    expect(fieldAt).toBeGreaterThan(-1);
    expect(errorAt).toBeGreaterThan(fieldAt);
    expect(nextAt).toBeGreaterThan(errorAt);
  }

  expect(await catalogue.leads()).toEqual([]);
});

test("a failed Turnstile check is rejected and does not save a lead", async () => {
  const catalogue = inMemoryCatalogue({ vehicles: [forSaleVehicle()] });
  let emailed = false;

  const response = await requestPublicPage(
    enquiryRequest({
      "first-name": "Ada",
      email: "ada@example.com",
      message: "Is this Levorg still available?",
      "cf-turnstile-response": "fail",
    }),
    catalogue,
    {
      checkSpam: async (token) => token === "pass",
      sendEmail: async () => {
        emailed = true;
      },
    },
  );
  const html = await response.text();

  expect(response.status).toBe(400);
  expect(html).toContain("The spam check was not accepted.");
  expect(html).not.toContain("Your enquiry has been sent.");
  expect(await catalogue.leads()).toEqual([]);
  expect(emailed).toBe(false);
});

test("a sold vehicle has no vehicle enquiry", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [{ ...forSaleVehicle(), availability: "sold" }],
  });

  const page = await requestPublicPage(
    new Request("http://originjapan.test/listings/subaru-levorg-2-0-gt-s"),
    catalogue,
  );
  const posted = await requestPublicPage(
    enquiryRequest({
      "first-name": "Ada",
      email: "ada@example.com",
      message: "Is this Levorg still available?",
      "cf-turnstile-response": "pass",
    }),
    catalogue,
    {
      checkSpam: async () => true,
      sendEmail: async () => {
        throw new Error("email should not be sent");
      },
    },
  );

  expect(page.status).toBe(200);
  expect(await page.text()).not.toContain("Enquire");
  expect(posted.status).toBe(400);
  expect(await posted.text()).not.toContain("<form");
  expect(await catalogue.leads()).toEqual([]);
});

test("a failed email still confirms the enquiry and keeps the lead", async () => {
  const catalogue = inMemoryCatalogue({ vehicles: [forSaleVehicle()] });

  const response = await requestPublicPage(
    enquiryRequest({
      "first-name": "Ada",
      email: "ada@example.com",
      message: "Is this Levorg still available?",
      "cf-turnstile-response": "pass",
    }),
    catalogue,
    {
      checkSpam: async () => true,
      sendEmail: async () => {
        throw new Error("mailbox unavailable");
      },
    },
  );
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain("Your enquiry has been sent.");
  expect(await catalogue.leads()).toEqual([
    {
      id: "lead-1",
      vehicle: "Subaru Levorg 2.0 GT-S 2016",
      firstName: "Ada",
      email: "ada@example.com",
      message: "Is this Levorg still available?",
    },
  ]);
});

test("an on-water vehicle offers Enquire about this car", async () => {
  const html = await vehicleHtml({
    ...forSaleVehicle(),
    pricePounds: undefined,
    availability: "on water",
  });

  expect(html).toContain("Enquire about this car");
  expect(html).toContain("<form");
  expect(html).not.toContain("£");
});

function enquiryRequest(fields: Record<string, string>): Request {
  return new Request("http://originjapan.test/listings/subaru-levorg-2-0-gt-s", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
  });
}

async function vehicleHtml(vehicle: Vehicle): Promise<string> {
  const response = await requestPublicPage(
    new Request(`http://originjapan.test/listings/${vehicle.slug}`),
    inMemoryCatalogue({ vehicles: [vehicle] }),
  );
  expect(response.status).toBe(200);
  return response.text();
}

function stockSlugs(html: string): string[] {
  return [...html.matchAll(/href="\/listings\/([^"]+)"/g)].map((match) => match[1]);
}

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
