import { expect, test } from "vitest";
import type { Vehicle } from "../src/catalogue";
import { inMemoryCatalogue } from "../src/in-memory-catalogue";
import { bannerNarrowMedia, bannerWideMedia, featurePhoto, gradeExhibit, pageBanners, staticPicture } from "../src/public/site-photos";
import { requestPublicPage } from "./buyer-page";

type EnquiryMail = { to: string; subject: string; text: string };

test("storybook is not a public page", async () => {
  const response = await requestPublicPage(new Request("http://originjapan.test/storybook"), inMemoryCatalogue());

  expect(response.status).toBe(404);
});

test("a buyer receives a response from the public site", async () => {
  const response = await requestPublicPage(
    new Request("http://originjapan.test/"),
    inMemoryCatalogue(),
  );

  expect(response.status).toBe(200);
  expect(await response.text()).toContain("Origin Japan");
});

test("old addresses open the current pages", async () => {
  const cases = [
    ["/stocklist/", "/stock"],
    ["/stock/", "/stock"],
    ["/stocklist/sold-stock/", "/sold"],
    ["/personal-import-service/", "/personal-import"],
    ["/personal-import-gallery/", "/personal-import"],
    ["/gradesheets/", "/grade-sheets"],
  ] as const;

  for (const [from, to] of cases) {
    const response = await requestPublicPage(new Request(`http://originjapan.test${from}`), inMemoryCatalogue());
    expect(response.status, from).toBe(301);
    expect(response.headers.get("location"), from).toBe(to);
  }

  const contact = await requestPublicPage(new Request("http://originjapan.test/contact/"), inMemoryCatalogue());
  expect(contact.status).toBe(200);
  expect(contact.headers.get("location")).toBeNull();
  expect(await contact.text()).toContain("info@originjapan.co.uk");
});

test("on a small screen the sort sits in a panel the buyer opens", async () => {
  const html = await pageText(inMemoryCatalogue({ vehicles: [forSaleVehicle()] }), "/stock");
  const panel = html.slice(html.indexOf("<details"), html.indexOf("</details>"));

  expect(panel).toContain("<summary>Sort</summary>");
  expect(panel).toContain('href="/stock?sort=price"');
  expect(panel).toContain('href="/stock?sort=model-year"');
  expect(panel).toContain('href="/stock?sort=mileage"');
  expect(panel).toContain('href="/stock?sort=newest"');
  expect(html).toContain("prefers-reduced-motion: reduce");
  expect(panel).not.toContain('tabindex="-1"');
});

test("personal import explains the service and shows photos Adam adds and removes", async () => {
  const withPhotos = inMemoryCatalogue({
    vehicles: [forSaleVehicle()],
    site: {
      importPhotos: [
        { src: "https://photos.example/dock.jpg", alt: "A car at the Japanese agent" },
        { src: "https://photos.example/yard.jpg", alt: "Prep in the Newport workshop" },
      ],
    },
  });
  const removed = inMemoryCatalogue({
    vehicles: [forSaleVehicle()],
    site: {
      importPhotos: [{ src: "https://photos.example/dock.jpg", alt: "A car at the Japanese agent" }],
    },
  });

  const explained = await pageText(inMemoryCatalogue(), "/personal-import");
  const shown = await pageText(withPhotos, "/personal-import");
  const afterRemoval = await pageText(removed, "/personal-import");

  expect(explained).toContain("Sourcing");
  expect(explained).toContain("Inspection");
  expect(explained).toContain("before bidding");
  expect(explained).not.toContain('aria-labelledby="import-photos"');

  expect(imageSources(sectionContaining(shown, 'aria-labelledby="import-photos"'))).toEqual([
    "https://photos.example/dock.jpg",
    "https://photos.example/yard.jpg",
  ]);
  expect(shown).toContain('src="https://photos.example/dock.jpg"');
  expect(shown).toContain('src="https://photos.example/yard.jpg"');
  expect(shown).toContain('alt="A car at the Japanese agent"');
  expect(shown).not.toContain("levorg-front.jpg");
  expect(shown).not.toContain("Subaru Levorg");

  expect(afterRemoval).toContain('src="https://photos.example/dock.jpg"');
  expect(afterRemoval).not.toContain("yard.jpg");
});

test("grade sheets explains how to read a grade sheet", async () => {
  const html = await pageText(inMemoryCatalogue(), "/grade-sheets");

  expect(html).toContain("auction grade sheet");
  expect(html).toContain("top right");
  expect(html).toContain("U1");
  expect(html).toContain("A to E");
  expect(html).not.toContain("/listings/");
});

test("contact shows the address, phone, and email", async () => {
  const html = await pageText(inMemoryCatalogue(), "/contact");

  expect(html).toContain("Unit D2, Langland Park West, Newport, NP19 4ED");
  expect(html).toContain("07454621101");
  expect(html).toContain("info@originjapan.co.uk");
  expect(html).not.toContain("<form");
});

test("a heading Adam adds to the contact copy reads as a heading", async () => {
  const catalogue = inMemoryCatalogue({
    site: {
      pages: [{ slug: "contact", title: "Contact", body: "Ask us anything.\n\nOpening hours\n\nWe are at the unit most weekdays." }],
    },
  });

  const html = await pageText(catalogue, "/contact");

  expect(html).toMatch(/<h2[^>]*>Opening hours<\/h2>/);
});

test("Adam's edited copy is what a buyer reads", async () => {
  const catalogue = inMemoryCatalogue({
    site: {
      pages: [
        { slug: "home", title: "Edited home headline", body: "Edited home: the parts offer is a short line." },
        { slug: "personal-import", title: "Edited import", body: "Edited import: we source a car to order." },
        { slug: "grade-sheets", title: "Edited grades", body: "Edited grades: the number in the corner is only a guide." },
        { slug: "contact", title: "Edited contact", body: "Edited contact: ask us about a car in stock." },
        { slug: "privacy", title: "Edited privacy", body: "Edited privacy: we keep your message so we can reply." },
      ],
      reviews: [{ name: "Pat Example", quote: "An edited review from the catalogue." }],
      googleReviewsUrl: "https://share.google/edited-reviews",
    },
  });

  const home = await pageText(catalogue, "/");
  const personalImport = await pageText(catalogue, "/personal-import");
  const gradeSheets = await pageText(catalogue, "/grade-sheets");
  const contact = await pageText(catalogue, "/contact");
  const privacy = await pageText(catalogue, "/privacy");

  expect(home).toContain("Edited home headline");
  expect(home).toContain("Edited home: the parts offer is a short line.");
  expect(home).toContain("Pat Example");
  expect(home).toContain("An edited review from the catalogue.");
  expect(home).toContain('href="https://share.google/edited-reviews"');
  expect(home).toContain('href="/stock"');
  expect(home).not.toContain("Yahoo Japan");
  expect(home).not.toContain("Badeshi");

  expect(personalImport).toContain("Edited import: we source a car to order.");
  expect(gradeSheets).toContain("Edited grades: the number in the corner is only a guide.");
  expect(contact).toContain("Edited contact: ask us about a car in stock.");
  expect(privacy).toContain("Edited privacy: we keep your message so we can reply.");
});

test("brochure pages follow the section order Adam saved", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [forSaleVehicle()],
    site: {
      reviews: [{ name: "Pat Example", quote: "An edited review from the catalogue." }],
      googleReviewsUrl: "https://share.google/edited-reviews",
      importPhotos: [{ src: "https://photos.example/dock.jpg", alt: "A car at the Japanese agent" }],
      pages: [
        {
          slug: "home",
          title: "Home title",
          blocks: [
            { kind: "reviews" },
            { kind: "section", heading: "Trusted partners", body: "Two agents in Japan." },
            { kind: "opening", body: "Cars already in the UK.", linkLabel: "Current Stock", linkHref: "/stock" },
            { kind: "stock" },
          ],
        },
        {
          slug: "personal-import",
          title: "Import title",
          blocks: [
            { kind: "photos", heading: "Previous personal imports" },
            { kind: "section", heading: "Shipping", body: "Insured shipping to the UK." },
            { kind: "section", heading: "Sourcing", body: "We search the auctions." },
          ],
        },
        {
          slug: "grade-sheets",
          title: "Grades title",
          blocks: [
            { kind: "exhibit" },
            { kind: "section", heading: "Marks on the plan", body: "U1 is a small dent." },
            { kind: "section", heading: "Grades", body: "4.5 is a strong grade." },
          ],
        },
        {
          slug: "contact",
          title: "Contact title",
          blocks: [
            { kind: "details" },
            { kind: "opening", body: "Ask us about a car in stock." },
          ],
        },
        {
          slug: "privacy",
          title: "Privacy title",
          blocks: [
            { kind: "section", heading: "What we keep", body: "We keep your message so we can reply." },
            { kind: "opening", body: "This page says what happens to a lead." },
          ],
        },
      ],
    },
  });

  const home = await pageText(catalogue, "/");
  expect(at(home, "Pat Example")).toBeLessThan(at(home, "Trusted partners"));
  expect(at(home, "Trusted partners")).toBeLessThan(at(home, "Cars already in the UK."));
  expect(at(home, "Cars already in the UK.")).toBeLessThan(at(home, "Subaru Levorg"));
  expect(home).toContain('href="https://share.google/edited-reviews"');
  expect(home).not.toContain("Yahoo Japan");

  const personalImport = await pageText(catalogue, "/personal-import");
  expect(at(personalImport, "dock.jpg")).toBeLessThan(at(personalImport, "Shipping"));
  expect(at(personalImport, "Shipping")).toBeLessThan(at(personalImport, "Sourcing"));
  expect(personalImport).not.toContain("before bidding");

  const gradeSheets = await pageText(catalogue, "/grade-sheets");
  expect(at(gradeSheets, "grade-sheet-v70")).toBeLessThan(at(gradeSheets, "Marks on the plan"));
  expect(at(gradeSheets, "Marks on the plan")).toBeLessThan(at(gradeSheets, "4.5 is a strong grade."));
  expect(gradeSheets).not.toContain("A to E");

  const contact = await pageText(catalogue, "/contact");
  expect(at(contact, "What3Words")).toBeLessThan(at(contact, "Ask us about a car in stock."));

  const privacy = await pageText(catalogue, "/privacy");
  expect(at(privacy, "What we keep")).toBeLessThan(at(privacy, "This page says what happens to a lead."));
});

test("the picture stays on the block Adam attached it to", async () => {
  const catalogue = inMemoryCatalogue({
    site: {
      pages: [
        {
          slug: "home",
          blocks: [
            { kind: "section", heading: "New and used parts", body: "Yahoo Japan and Up Garage." },
            {
              kind: "feature",
              heading: "Personal imports",
              body: "We inspect these vehicles before purchase.",
              image: { src: "/images/dock.jpg", alt: "A car at the dock" },
              linkLabel: "Personal Import Service",
              linkHref: "/personal-import",
            },
          ],
        },
      ],
    },
  });

  const html = await pageText(catalogue, "/");

  expect(at(html, "New and used parts")).toBeLessThan(at(html, "/images/dock.jpg"));
  expect(html).toContain('alt="A car at the dock"');
  expect(html).not.toContain("suzuki-carry-sunset");
  const picture = html.slice(at(html, "/images/dock.jpg"));
  expect(picture).toContain("Personal imports");
  expect(picture).toContain('href="/personal-import"');
});

test("clearing a block's picture removes it from the page", async () => {
  const catalogue = inMemoryCatalogue({
    site: {
      pages: [
        {
          slug: "home",
          blocks: [
            {
              kind: "feature",
              heading: "Personal imports",
              body: "We inspect these vehicles before purchase.",
            },
          ],
        },
      ],
    },
  });

  const html = await pageText(catalogue, "/");

  expect(html).toContain("Personal imports");
  expect(html).toContain("We inspect these vehicles before purchase.");
  expect(html).not.toContain("carbon-mat");
  expect(imageSources(sectionContaining(html, "We inspect these vehicles before purchase."))).toEqual([]);
});

test("home offers current stock, parts, partners, and named reviews", async () => {
  const response = await requestPublicPage(new Request("http://originjapan.test/"), inMemoryCatalogue());
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain("So, you're looking for a car from Japan?");
  expect(html).toContain('src="/images/home-dusk-row-2000.jpg"');
  expect(html).toContain('href="/stock"');
  expect(html).toContain(">Current Stock<");
  expect(html).toContain("Yahoo Japan");
  expect(html).toContain("Up Garage");
  expect(html).toContain("two trusted agents in Japan");
  expect(html).toContain("Badeshi");
  expect(html).toContain("Jacob Dean");
  expect(html).toContain("Emily Renshaw");
  expect(html).toContain('href="https://share.google/gV9fNc1szaKmE150R"');
  expect(html).toContain("Google reviews");

  const emptied = await pageText(inMemoryCatalogue({ site: { reviews: [] } }), "/");
  expect(emptied).toContain("Badeshi");
  expect(emptied).toContain("Jacob Dean");
  expect(emptied).toContain("Emily Renshaw");
});

test("home preloads its hero photo with the same choice of file as the hero image", async () => {
  const html = await pageText(inMemoryCatalogue(), "/");
  const preloads = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*>/g)].map((match) => match[0]);
  const hero = html.match(/<img\b[^>]*class="home-hero-still"[^>]*>/)?.[0] ?? "";
  const attribute = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

  expect(preloads).toHaveLength(1);
  expect(attribute(preloads[0], "imagesrcset")).toBe(attribute(hero, "srcset"));
  expect(attribute(preloads[0], "imagesizes")).toBe(attribute(hero, "sizes"));
  expect(attribute(preloads[0], "fetchpriority")).toBe("high");
  expect(attribute(preloads[0], "media")).toBeUndefined();
});

test("banner pages preload the AVIF file the stylesheet chooses for that breakpoint", async () => {
  const cases = [
    ["/personal-import", pageBanners.import],
    ["/grade-sheets", pageBanners.grades],
    ["/contact", pageBanners.contact],
  ] as const;

  for (const [path, banner] of cases) {
    const html = await pageText(inMemoryCatalogue(), path);
    expect(html).toContain(
      `<link rel="preload" as="image" href="${banner.narrow.avif}" type="image/avif" media="${bannerNarrowMedia}">`,
    );
    expect(html).toContain(
      `<link rel="preload" as="image" href="${banner.wide.avif}" type="image/avif" media="${bannerWideMedia}">`,
    );
    expect(html).not.toContain("imagesrcset");
    expect(html).not.toContain(`href="${banner.narrow.jpg}"`);
    expect(html).not.toContain(`href="${banner.wide.jpg}"`);
  }
});

test("the home feature photograph is a 3:2 picture of modern-format variants", async () => {
  const html = await pageText(inMemoryCatalogue(), "/");
  const picture = staticPicture(featurePhoto);
  const img = html.match(/<img\b[^>]*suzuki-carry-sunset[^>]*>/)?.[0] ?? "";

  expect(img).toContain(`src="${picture.src}"`);
  expect(img).toContain(`srcset="${picture.jpeg}"`);
  expect(img).toContain('width="1350"');
  expect(img).toContain('height="900"');
  expect(html).toContain(`<source type="image/avif" srcset="${picture.avif}" sizes="${picture.sizes}">`);
  expect(html).toContain(`<source type="image/webp" srcset="${picture.webp}" sizes="${picture.sizes}">`);
});

test("the grade sheet exhibit keeps the sheet's ratio and offers an AVIF srcset", async () => {
  const html = await pageText(inMemoryCatalogue(), "/grade-sheets");
  const picture = staticPicture(gradeExhibit);

  expect(html).toContain(`<source type="image/avif" srcset="${picture.avif}" sizes="${picture.sizes}">`);
  expect(html).toContain(`width="${picture.width}"`);
  expect(html).toContain(`height="${picture.height}"`);
});

test("import photos stored in EmDash media use a WebP srcset sized to their grid slot", async () => {
  const html = await pageText(
    inMemoryCatalogue({
      site: {
        importPhotos: [
          { src: "/_emdash/api/media/file/01DOCK.jpg", alt: "A car at the Japanese agent" },
          { src: "/_emdash/api/media/file/02YARD.jpg", alt: "Prep in the Newport workshop" },
        ],
      },
    }),
    "/personal-import",
  );
  const section = sectionContaining(html, 'aria-labelledby="import-photos"');
  const images = [...section.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

  expect(images).toHaveLength(2);
  expect(images[0]).toContain("/_image?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F01DOCK.jpg&amp;w=960&amp;f=webp");
  expect(images[0]).toContain("w=480&amp;f=webp 480w");
  expect(images[0]).toContain("w=1600&amp;f=webp 1600w");
  expect(images[0]).toContain('width="900"');
  expect(images[0]).toContain('height="600"');
  expect(images[0]).toContain("(min-width: 1280px) 37rem");
  expect(images[1]).toContain("(min-width: 1280px) 18rem");
});

test("home shows the first three vehicles in stock with their own photos, and no sold vehicle or draft", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        ...forSaleVehicle(),
        id: "s2000-in-prep",
        slug: "honda-s2000-in-prep",
        title: "Honda S2000 2004",
        pricePounds: undefined,
        photos: ["https://photos.example/s2000.jpg"],
        availability: "in prep",
      },
      forSaleVehicle(),
      {
        ...forSaleVehicle(),
        id: "yaris",
        slug: "toyota-gr-yaris",
        title: "Toyota GR Yaris 2024",
        pricePounds: 36995,
        photos: ["https://photos.example/yaris.jpg", "https://photos.example/yaris-rear.jpg"],
        order: 1,
      },
      {
        ...forSaleVehicle(),
        id: "legacy-sold",
        slug: "subaru-legacy-2011",
        title: "Subaru Legacy 2011",
        photos: ["https://photos.example/legacy-front.jpg"],
        availability: "sold",
      },
      {
        ...forSaleVehicle(),
        id: "draft-beat",
        slug: "honda-beat-1993",
        title: "Honda Beat 1993",
        photos: ["https://photos.example/beat.jpg"],
        draft: true,
      },
      {
        ...forSaleVehicle(),
        id: "mx5-on-water",
        slug: "mazda-mx-5-on-water",
        title: "Mazda MX-5 2019",
        pricePounds: undefined,
        photos: ["https://photos.example/mx5.jpg"],
        availability: "on water",
      },
    ],
  });

  const html = await pageText(catalogue, "/");

  expect(stockSlugs(html)).toEqual(["toyota-gr-yaris", "subaru-levorg-2-0-gt-s", "honda-s2000-in-prep"]);
  expect(html).toContain('src="https://photos.example/yaris.jpg"');
  expect(html).not.toContain("yaris-rear.jpg");
  expect(html).toContain("£36,995");
  expect(html).toContain("In prep");
  expect(html).not.toContain("subaru-legacy-2011");
  expect(html).not.toContain("honda-beat-1993");
  expect(html).not.toContain("mazda-mx-5-on-water");
  expect(html).toContain('href="/stock"');

  const empty = await pageText(inMemoryCatalogue(), "/");
  expect(empty).not.toContain("/listings/");
  expect(empty).toContain('href="/stock"');
});

test("the nav uses the current labels and the header and footer show the Newport address and phone", async () => {
  const response = await requestPublicPage(
    new Request("http://originjapan.test/stock"),
    inMemoryCatalogue(),
  );
  const html = await response.text();
  const header = region(html, "header");
  const footer = region(html, "footer");

  expect(response.status).toBe(200);
  expect(header).toContain(">Current Stock<");
  expect(header).toContain('href="/personal-import"');
  expect(header).toContain(">Personal Import Service<");
  expect(header).toContain('href="/grade-sheets"');
  expect(header).toContain(">Grade Sheets<");
  expect(header).toContain('href="/contact"');
  expect(header).toContain(">Contact<");
  expect(header).toContain('href="/sold"');
  expect(header).toContain(">Sold Stock<");
  expect(header).toContain('alt="Origin Japan"');
  expect(header).toContain("/images/origin-japan-lockup.png");
  expect(header).not.toContain("originjapanimports");
  expect(header).toContain("Origin Japan Ltd");
  expect(header).toContain("Unit D2, Langland Park West, Newport, NP19 4ED");
  expect(header).toContain("07454621101");
  expect(footer).toContain('alt="Origin Japan"');
  expect(footer).toContain("/images/origin-japan-lockup.png");
  expect(footer).not.toContain("originjapanimports");
  expect(footer).toContain("Origin Japan Ltd");
  expect(footer).toContain("Unit D2, Langland Park West, Newport, NP19 4ED");
  expect(footer).toContain("07454621101");
  expect(footer).toContain("info@originjapan.co.uk");
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
  const crumb = html.match(/<nav[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/)?.[0] ?? "";
  expect(crumb).toContain('href="/sold"');
  expect(crumb).toContain(">Sold Stock<");
  expect(crumb).toContain("Subaru Legacy 2011");
  expect(crumb).toContain('aria-current="page"');
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

test("stock longer than one page shows the next page, and the page keeps the buyer's sort", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: Array.from({ length: 13 }, (_, index) => ({
      ...forSaleVehicle(),
      id: `car-${index}`,
      slug: `car-${String(index).padStart(2, "0")}`,
      title: `Car ${index}`,
      pricePounds: 20000 - index * 100,
      order: index,
    })),
  });

  const first = await pageText(catalogue, "/stock");
  const second = await pageText(catalogue, "/stock?page=2");
  const priced = await pageText(catalogue, "/stock?sort=price&page=2");
  const short = await pageText(inMemoryCatalogue({ vehicles: [forSaleVehicle()] }), "/stock");

  expect(stockSlugs(first)).toEqual(Array.from({ length: 12 }, (_, index) => `car-${String(index).padStart(2, "0")}`));
  expect(first).toContain('href="/stock?page=2"');
  expect(first).toContain('aria-label="Pagination"');
  expect(first).not.toContain("car-12");

  expect(stockSlugs(second)).toEqual(["car-12"]);
  expect(second).toContain('href="/stock?page=2" aria-current="page"');
  expect(second).toContain('href="/stock"');

  expect(stockSlugs(priced)).toEqual(["car-00"]);
  expect(priced).toContain('href="/stock?sort=price&amp;page=2" aria-current="page"');

  expect(short).not.toContain('aria-label="Pagination"');
});

test("sold stock does not offer a price sort, and a price query leaves the order alone", async () => {
  const catalogue = inMemoryCatalogue({
    vehicles: [
      {
        ...forSaleVehicle(),
        id: "older",
        slug: "older-expensive",
        title: "Older Expensive",
        year: 1998,
        pricePounds: 20000,
        order: 1,
        availability: "sold",
      },
      {
        ...forSaleVehicle(),
        id: "newer",
        slug: "newer-cheap",
        title: "Newer Cheap",
        year: 2020,
        pricePounds: 2000,
        order: 2,
        availability: "sold",
      },
    ],
  });

  const html = await pageText(catalogue, "/sold?sort=price");
  const byYear = await pageText(catalogue, "/sold?sort=model-year");

  expect(stockSlugs(html)).toEqual(["older-expensive", "newer-cheap"]);
  expect(html).not.toContain("sort=price");
  expect(html).toContain('href="/sold?sort=model-year"');
  expect(html).toContain('href="/sold?sort=mileage"');
  expect(html).toContain('href="/sold?sort=newest"');
  expect(html).not.toContain('aria-label="Pagination"');

  expect(stockSlugs(byYear)).toEqual(["newer-cheap", "older-expensive"]);
  expect(byYear).toContain('href="/sold?sort=model-year" aria-current="true"');
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
  const stockPhoto = imageSources(stockHtml, /^Subaru Levorg 2\.0 GT-S 2016$/)[0];
  const pagePhotos = imageSources(html, /^Subaru Levorg 2\.0 GT-S 2016, photo \d+ of \d+$/);

  expect(page.status).toBe(200);
  const crumb = html.match(/<nav[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/)?.[0] ?? "";
  expect(crumb).toContain('href="/stock"');
  expect(crumb).toContain(">Current Stock<");
  expect(crumb).toContain("Subaru Levorg 2.0 GT-S 2016");
  expect(crumb).toContain('aria-current="page"');
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

test("vehicle page photos stored in EmDash media load resized WebP variants, the first at high priority", async () => {
  const html = await vehicleHtml({
    ...forSaleVehicle(),
    photos: ["/_emdash/api/media/file/01FRONT.jpg", "/_emdash/api/media/file/02REAR.jpg"],
  });
  const photos = [...html.matchAll(/<img\b[^>]*alt="Subaru Levorg 2\.0 GT-S 2016, photo \d+ of 2"[^>]*>/g)].map(
    (match) => match[0],
  );

  expect(photos).toHaveLength(2);
  for (const photo of photos) {
    expect(photo).toMatch(/\bsrc="\/_image\?href=%2F_emdash%2Fapi%2Fmedia%2Ffile%2F0\d\w+\.jpg&amp;w=960&amp;f=webp"/);
    expect(photo).toContain("&amp;w=1600&amp;f=webp 1600w");
    expect(photo).toMatch(/\bsizes="[^"]+"/);
  }
  expect(photos[0]).toContain('fetchpriority="high"');
  expect(photos[1]).toContain('loading="lazy"');
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

test("seller's notes with a blank line are separate paragraphs", async () => {
  const html = await vehicleHtml({
    ...forSaleVehicle(),
    sellersNotes: "One owner from Osaka.\n\nFull service history.",
  });

  expect(html).toContain('<p class="mt-2">One owner from Osaka.</p>');
  expect(html).toContain('<p class="mt-2">Full service history.</p>');
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

async function pageText(
  catalogue: ReturnType<typeof inMemoryCatalogue>,
  path: string,
): Promise<string> {
  const response = await requestPublicPage(new Request(`http://originjapan.test${path}`), catalogue);
  expect(response.status).toBe(200);
  return response.text();
}

function at(html: string, needle: string): number {
  const found = html.indexOf(needle);
  expect(found, needle).toBeGreaterThan(-1);
  return found;
}

function region(html: string, tag: string): string {
  const start = html.indexOf(`<${tag}`);
  const end = html.indexOf(`</${tag}>`);
  return start === -1 || end === -1 ? "" : html.slice(start, end);
}

function sectionContaining(html: string, needle: string): string {
  const found = at(html, needle);
  return html.slice(html.lastIndexOf("<section", found), html.indexOf("</section>", found));
}

function imageSources(html: string, alt?: RegExp): string[] {
  return [...html.matchAll(/<img\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => !alt || alt.test(tag.match(/\balt="([^"]*)"/)?.[1] ?? ""))
    .map((tag) => tag.match(/\bsrc="([^"]+)"/)?.[1] ?? "");
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
