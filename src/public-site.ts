import type { Catalogue, Vehicle } from "./catalogue";

export type EnquiryMail = {
  to: string;
  subject: string;
  text: string;
};

export type EnquiryServices = {
  /** Present when the page should show the Turnstile widget. */
  siteKey?: string;
  checkSpam: (token: string) => Promise<boolean>;
  sendEmail: (mail: EnquiryMail) => Promise<void>;
};

const enquiryInbox = "info@originjapan.co.uk";

const closedEnquiry: EnquiryServices = {
  async checkSpam() {
    return false;
  },
  async sendEmail() {
    throw new Error("Email is not configured");
  },
};

const siteCss = `
@font-face {
  font-family: Syncopate;
  src: url("/fonts/syncopate-400.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: Syncopate;
  src: url("/fonts/syncopate-700.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: Poppins;
  src: url("/fonts/poppins-400.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: Poppins;
  src: url("/fonts/poppins-600.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
:root {
  color-scheme: light dark;
  --bg: #f3f4f2;
  --text: #1c2630;
  --line: #d5d8dc;
  --field-line: #5c6770;
  --surface: #e7e9ea;
  --display: Syncopate, "Avenir Next", sans-serif;
  --body: Poppins, "Segoe UI", sans-serif;
  --radius: 4px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #141a20;
    --text: #e6eaee;
    --line: #2c3844;
    --field-line: #8b98a6;
    --surface: #1c252e;
  }
}
*,
*::before,
*::after { box-sizing: border-box; }
html { color-scheme: light dark; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--body);
  font-size: 1rem;
  line-height: 1.5;
}
a { color: inherit; }
a:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
.vehicle:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 4px;
}
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.5rem;
  padding: 0 1.25rem;
  border-bottom: 1px solid var(--line);
}
.wordmark,
.site-nav a {
  font-family: var(--display);
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}
.wordmark { font-size: 0.8rem; }
.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.25rem 1.25rem;
}
.site-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  font-size: 0.68rem;
}
.site-nav a[aria-current="page"] { text-decoration: underline; text-underline-offset: 0.3em; }
.wrap {
  width: min(100% - 2rem, 80rem);
  margin-inline: auto;
  padding-block: 2rem 4rem;
}
h1 {
  margin: 0;
  font-family: var(--display);
  font-size: clamp(1.35rem, 2vw, 1.85rem);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
}
.stock {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem 1.25rem;
}
.vehicle {
  display: grid;
  gap: 0.75rem;
  align-content: start;
  text-decoration: none;
}
.vehicle img {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--surface);
}
.vehicle h2 {
  margin: 0;
  font-family: var(--body);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.3;
  text-transform: none;
}
.price {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}
.badge {
  margin: 0;
  justify-self: start;
  font-family: var(--display);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}
.specs {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  margin: 0;
  font-size: 0.875rem;
}
.specs dt,
.specs dd { margin: 0; }
.empty { margin: 1.5rem 0 0; max-width: 65ch; }
.stock-sort {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
  margin: 1rem 0 0;
  font-size: 0.875rem;
}
.stock-sort a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  text-decoration: none;
}
.stock-sort a[aria-current="true"] {
  text-decoration: underline;
  text-underline-offset: 0.3em;
}
.vehicle-page { display: flex; flex-direction: column; gap: 0.75rem; }
.vehicle-facts { display: contents; }
.vehicle-title { order: 1; }
.vehicle-page .badge { order: 2; }
.vehicle-page .price { order: 2; }
.vehicle-page .gallery { order: 3; }
.vehicle-specs { order: 4; }
.notes { order: 5; }
.enquiry,
.enquiry-confirmation { order: 6; }
.vehicle-title {
  font-family: var(--body);
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.2;
  text-transform: none;
}
.gallery {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.gallery li:first-child { grid-column: 1 / -1; }
.gallery img {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--surface);
}
.vehicle-specs {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 1.25rem;
  margin: 1.75rem 0 0;
}
.vehicle-specs dt,
.vehicle-specs dd { margin: 0; }
.vehicle-specs dt { font-size: 0.875rem; font-weight: 600; }
.notes { margin-top: 2rem; max-width: 65ch; }
.notes h2 {
  margin: 0 0 0.5rem;
  font-family: var(--body);
  font-size: 1.05rem;
  font-weight: 600;
}
.enquiry {
  display: grid;
  gap: 1rem;
  margin-top: 0.5rem;
  max-width: 65ch;
}
.field { display: grid; gap: 0.35rem; }
.field label { font-size: 0.875rem; font-weight: 600; }
.field input,
.field textarea {
  width: 100%;
  margin: 0;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--field-line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font: inherit;
}
.field textarea { min-height: 8rem; resize: vertical; }
.field input:focus-visible,
.field textarea:focus-visible,
.enquiry button:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
.field-error {
  margin: 0;
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 600;
}
.enquiry button {
  justify-self: start;
  min-height: 2.75rem;
  padding: 0.65rem 1.1rem;
  border: 1px solid var(--text);
  border-radius: var(--radius);
  background: var(--text);
  color: var(--bg);
  font-family: var(--body);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
}
.enquiry-confirmation { margin: 0.5rem 0 0; max-width: 65ch; font-weight: 600; }
@media (max-width: 1023px) {
  .stock { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 767px) {
  .site-header {
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
  }
  .site-nav { width: 100%; justify-content: flex-start; }
  .wrap { width: 100%; padding: 1.5rem 1rem 3rem; }
  .stock { grid-template-columns: 1fr; }
  .gallery { grid-template-columns: 1fr; }
  .gallery li:first-child { grid-column: auto; }
}
@media (min-width: 768px) {
  .vehicle-specs {
    grid-template-columns: auto 1fr auto 1fr;
    column-gap: 2.5rem;
  }
}
@media (min-width: 1024px) {
  .vehicle-page {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(18rem, 2fr);
    column-gap: 2.5rem;
    align-items: start;
  }
  .vehicle-page .gallery {
    order: 0;
    grid-column: 1;
    grid-row: 1;
    margin-top: 0;
  }
  .vehicle-facts {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    grid-column: 2;
    grid-row: 1;
  }
  .vehicle-title,
  .vehicle-page .badge,
  .vehicle-page .price,
  .vehicle-specs,
  .notes,
  .enquiry,
  .enquiry-confirmation { order: 0; }
  .vehicle-page .vehicle-specs { grid-template-columns: auto 1fr; margin-top: 0.5rem; }
  .vehicle-page .notes { margin-top: 0.5rem; }
}
@media (prefers-reduced-motion: no-preference) {
  .vehicle img,
  .enquiry button {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .vehicle:hover img,
  .vehicle:focus-visible img { transform: scale(1.03); }
  .vehicle:active,
  .enquiry button:active { transform: scale(0.98); }
}
`;

export async function requestPublicPage(
  request: Request,
  catalogue: Catalogue,
  services: EnquiryServices = closedEnquiry,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === "/") {
    await catalogue.vehicles();
    await catalogue.leads();
    return html(homePage());
  }

  if (pathname === "/stock") {
    const vehicles = await catalogue.vehicles();
    return html(stockPage(vehicles.filter(isOnStock), readStockSort(url)));
  }

  if (pathname === "/sold") {
    const vehicles = await catalogue.vehicles();
    return html(soldPage(vehicles.filter(isSold)));
  }

  const slug = listingSlug(pathname);
  if (slug !== undefined) {
    const vehicles = await catalogue.vehicles();
    const vehicle = vehicles.find((item) => item.slug === slug && isPublic(item));
    if (!vehicle) return text("Not found", 404);
    if (request.method === "POST") return submitVehicleEnquiry(request, vehicle, catalogue, services);
    return html(vehiclePage(vehicle, services.siteKey));
  }

  return text("Not found", 404);
}

const bodies = new Set(["Convertible", "Pickup", "Coupe", "MPV", "Hatchback", "Estate"]);
const transmissions = new Set(["Manual", "Automatic", "DSG"]);

function photosOf(vehicle: Vehicle): string[] {
  return (vehicle.photos ?? []).map((photo) => photo.trim()).filter(Boolean);
}

function isOnStock(vehicle: Vehicle): boolean {
  return isForSale(vehicle) || unpricedBadge(vehicle) !== undefined;
}

function isPublic(vehicle: Vehicle): boolean {
  return isOnStock(vehicle) || isSold(vehicle);
}

function isForSale(vehicle: Vehicle): boolean {
  return !vehicle.draft && isPresentable(vehicle) && hasPublicPrice(vehicle) && vehicle.availability !== "sold";
}

function isSold(vehicle: Vehicle): boolean {
  return !vehicle.draft && vehicle.availability === "sold" && isPresentable(vehicle);
}

function unpricedBadge(vehicle: Vehicle): "In prep" | "On water" | undefined {
  if (vehicle.draft || !isPresentable(vehicle) || hasPublicPrice(vehicle)) return undefined;
  if (vehicle.availability === "in prep") return "In prep";
  if (vehicle.availability === "on water") return "On water";
  return undefined;
}

function hasPublicPrice(vehicle: Vehicle): boolean {
  const price = vehicle.pricePounds;
  return typeof price === "number" && Number.isInteger(price) && price > 0;
}

function isPresentable(vehicle: Vehicle): boolean {
  const photos = photosOf(vehicle);
  const year = vehicle.year;
  const mileage = vehicle.mileageMiles;
  return Boolean(
    present(vehicle.slug) &&
      present(vehicle.title) &&
      present(vehicle.make) &&
      present(vehicle.model) &&
      bodies.has(present(vehicle.body) ?? "") &&
      typeof year === "number" &&
      Number.isInteger(year) &&
      year >= 1900 &&
      year <= 2100 &&
      transmissions.has(present(vehicle.transmission) ?? "") &&
      typeof mileage === "number" &&
      Number.isInteger(mileage) &&
      mileage >= 0 &&
      photos.length > 0 &&
      present(vehicle.sellersNotes),
  );
}

function present(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

function listingSlug(pathname: string): string | undefined {
  const match = pathname.match(/^\/listings\/([^/]+)$/);
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}

function homePage(): string {
  return document({
    title: "Origin Japan",
    current: undefined,
    main: `<h1>Origin Japan</h1>`,
  });
}

function stockPage(vehicles: readonly Vehicle[], sort?: StockSort): string {
  const cards = listStock(vehicles, sort).filter((vehicle) => vehicle.slug).map(stockCard).join("");
  const main = `
    <h1>Current Stock</h1>
    ${sortNav(sort)}
    ${cards ? `<ul class="stock">${cards}</ul>` : `<p class="empty">No vehicles in stock.</p>`}
  `;
  return document({
    title: "Current Stock",
    current: "stock",
    main,
  });
}

type StockSort = "price" | "model-year" | "mileage" | "newest";

const stockSorts = ["price", "model-year", "mileage", "newest"] as const satisfies readonly StockSort[];

const stockSortLabels: Record<StockSort, string> = {
  price: "Price",
  "model-year": "Model year",
  mileage: "Mileage",
  newest: "Newest",
};

function readStockSort(url: URL): StockSort | undefined {
  const value = url.searchParams.get("sort");
  return stockSorts.find((sort) => sort === value);
}

function sortNav(current: StockSort | undefined): string {
  const links = stockSorts
    .map((sort) => {
      const currentAttr = sort === current ? ` aria-current="true"` : "";
      return `<a href="/stock?sort=${sort}"${currentAttr}>${stockSortLabels[sort]}</a>`;
    })
    .join("");
  return `<nav class="stock-sort" aria-label="Sort">${links}</nav>`;
}

/** Priced for-sale vehicles, then in-prep and on-water. A buyer sort stays inside each group. */
function listStock(vehicles: readonly Vehicle[], sort?: StockSort): Vehicle[] {
  return [
    ...orderGroup(vehicles.filter(isForSale), sort),
    ...orderGroup(vehicles.filter((vehicle) => !isForSale(vehicle)), sort),
  ];
}

function orderGroup(vehicles: readonly Vehicle[], sort?: StockSort): Vehicle[] {
  const adamSetAnOrder = vehicles.some((vehicle) => vehicle.order !== undefined);
  const ordered = [...vehicles].sort((a, b) => compareDefault(a, b, adamSetAnOrder));
  if (!sort) return ordered;
  return ordered.sort((a, b) => compareBuyerSort(a, b, sort));
}

function compareDefault(a: Vehicle, b: Vehicle, adamSetAnOrder: boolean): number {
  if (adamSetAnOrder) {
    const aHasOrder = a.order !== undefined;
    const bHasOrder = b.order !== undefined;
    if (aHasOrder && bHasOrder && a.order !== b.order) return (a.order ?? 0) - (b.order ?? 0);
    if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;
  }
  return publishedTime(b) - publishedTime(a) || (a.slug ?? "").localeCompare(b.slug ?? "");
}

function compareBuyerSort(a: Vehicle, b: Vehicle, sort: StockSort): number {
  if (sort === "price") return compareNumber(a.pricePounds, b.pricePounds, "low");
  if (sort === "model-year") return compareNumber(a.year, b.year, "high");
  if (sort === "mileage") return compareNumber(a.mileageMiles, b.mileageMiles, "low");
  return publishedTime(b) - publishedTime(a);
}

function compareNumber(a: number | undefined, b: number | undefined, direction: "low" | "high"): number {
  const aOk = typeof a === "number";
  const bOk = typeof b === "number";
  if (!aOk && !bOk) return 0;
  if (!aOk) return 1;
  if (!bOk) return -1;
  return direction === "low" ? a - b : b - a;
}

function publishedTime(vehicle: Vehicle): number {
  if (!vehicle.publishedAt) return Number.NEGATIVE_INFINITY;
  const time = Date.parse(vehicle.publishedAt);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function soldPage(vehicles: readonly Vehicle[]): string {
  const cards = vehicles.filter((vehicle) => vehicle.slug).map(stockCard).join("");
  const main = `
    <h1>Sold Stock</h1>
    ${cards ? `<ul class="stock">${cards}</ul>` : `<p class="empty">No sold vehicles.</p>`}
  `;
  return document({
    title: "Sold Stock",
    current: "sold",
    main,
  });
}

function stockCard(vehicle: Vehicle): string {
  const slug = vehicle.slug ?? "";
  const title = vehicle.title?.trim() ?? "";
  const photo = photosOf(vehicle)[0];
  const price = isForSale(vehicle) ? formatPounds(vehicle.pricePounds) : "";
  const mileage = formatMiles(vehicle.mileageMiles);
  const image = photo
    ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(title || "Vehicle photo")}" width="900" height="600">`
    : "";

  return `<li>
    <a class="vehicle" href="/listings/${escapeHtml(encodeURIComponent(slug))}">
      ${image}
      ${title ? `<h2>${escapeHtml(title)}</h2>` : ""}
      ${price ? `<p class="price">${price}</p>` : availabilityBadge(vehicle)}
      <dl class="specs">
        ${spec("Make", vehicle.make)}
        ${spec("Model", vehicle.model)}
        ${spec("Year", vehicle.year)}
        ${spec("Mileage", mileage)}
        ${spec("Transmission", vehicle.transmission)}
      </dl>
    </a>
  </li>`;
}

type EnquiryView = {
  confirmed?: boolean;
  spamRejected?: boolean;
  values?: { firstName: string; email: string; message: string };
  errors?: { firstName?: string; email?: string; message?: string };
};

function vehiclePage(vehicle: Vehicle, siteKey?: string, enquiry?: EnquiryView): string {
  const title = vehicle.title?.trim() || "Vehicle";
  const price = isForSale(vehicle) ? formatPounds(vehicle.pricePounds) : "";
  const photos = photosOf(vehicle);
  const gallery = photos
    .map((photo, index) => {
      const priority = index === 0 ? ` fetchpriority="high"` : ` loading="lazy"`;
      return `<li><img src="${escapeHtml(photo)}" alt="${escapeHtml(title)}" width="900" height="600"${priority}></li>`;
    })
    .join("");

  const notes = vehicle.sellersNotes?.trim()
    ? `<section class="notes"><h2>Seller's notes</h2><p>${escapeHtml(vehicle.sellersNotes.trim())}</p></section>`
    : "";
  const main = `
    <article class="vehicle-page">
      ${gallery ? `<ul class="gallery">${gallery}</ul>` : ""}
      <div class="vehicle-facts">
        <h1 class="vehicle-title">${escapeHtml(title)}</h1>
        ${availabilityBadge(vehicle)}
        ${price ? `<p class="price">${price}</p>` : ""}
        <dl class="vehicle-specs">
          ${spec("Make", vehicle.make)}
          ${spec("Model", vehicle.model)}
          ${spec("Body", vehicle.body)}
          ${spec("Year", vehicle.year)}
          ${spec("Transmission", vehicle.transmission)}
          ${spec("Mileage", formatMiles(vehicle.mileageMiles))}
        </dl>
        ${notes}
        ${enquiryForm(vehicle, siteKey, enquiry)}
      </div>
    </article>
  `;

  return document({
    title,
    current: undefined,
    main,
  });
}

function document(page: { title: string; current: "stock" | "sold" | undefined; main: string }): string {
  const stockCurrent = page.current === "stock" ? ` aria-current="page"` : "";
  const soldCurrent = page.current === "sold" ? ` aria-current="page"` : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.title)}</title>
    <style>${siteCss}</style>
  </head>
  <body>
    <header class="site-header">
      <a class="wordmark" href="/">Origin Japan</a>
      <nav class="site-nav" aria-label="Pages">
        <a href="/stock"${stockCurrent}>Current Stock</a>
        <a href="/sold"${soldCurrent}>Sold Stock</a>
      </nav>
    </header>
    <main class="wrap">
      ${page.main}
    </main>
  </body>
</html>`;
}

async function submitVehicleEnquiry(
  request: Request,
  vehicle: Vehicle,
  catalogue: Catalogue,
  services: EnquiryServices,
): Promise<Response> {
  if (!isOnStock(vehicle)) return html(vehiclePage(vehicle, services.siteKey), 400);

  const form = await request.formData();
  const values = {
    firstName: fieldText(form, "first-name"),
    email: fieldText(form, "email"),
    message: fieldText(form, "message"),
  };
  const errors = enquiryErrors(values);
  if (errors) return html(vehiclePage(vehicle, services.siteKey, { values, errors }), 400);

  let accepted = false;
  try {
    accepted = await services.checkSpam(fieldText(form, "cf-turnstile-response"));
  } catch {
    accepted = false;
  }
  if (!accepted) {
    return html(vehiclePage(vehicle, services.siteKey, { values, spamRejected: true }), 400);
  }

  const lead = await catalogue.saveVehicleEnquiry({
    vehicle: vehicle.title?.trim() ?? "",
    ...values,
  });
  try {
    await services.sendEmail({
      to: enquiryInbox,
      subject: `Vehicle enquiry: ${lead.vehicle ?? ""}`,
      text: [
        `Vehicle: ${lead.vehicle ?? ""}`,
        `First name: ${lead.firstName ?? ""}`,
        `Email: ${lead.email ?? ""}`,
        "Message:",
        lead.message ?? "",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Vehicle enquiry email failed after the lead was saved", error);
  }
  return html(vehiclePage(vehicle, services.siteKey, { confirmed: true }));
}

function enquiryErrors(values: { firstName: string; email: string; message: string }): EnquiryView["errors"] | undefined {
  const errors: NonNullable<EnquiryView["errors"]> = {};
  if (!values.firstName) errors.firstName = "Enter your first name.";
  if (!values.email) errors.email = "Enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.message) errors.message = "Enter a message.";
  return errors.firstName || errors.email || errors.message ? errors : undefined;
}

function fieldText(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function enquiryForm(vehicle: Vehicle, siteKey?: string, enquiry?: EnquiryView): string {
  if (!isOnStock(vehicle)) return "";
  if (enquiry?.confirmed) {
    return `<p class="enquiry-confirmation" role="status">Your enquiry has been sent.</p>`;
  }
  const slug = vehicle.slug ?? "";
  const values = enquiry?.values;
  const errors = enquiry?.errors;
  const turnstile = siteKey
    ? `<div class="cf-turnstile" data-sitekey="${escapeHtml(siteKey)}"></div>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
    : "";
  const spam = enquiry?.spamRejected
    ? `<p class="field-error" role="alert">The spam check was not accepted. Submit the form again.</p>`
    : "";
  return `<form class="enquiry" method="post" action="/listings/${escapeHtml(encodeURIComponent(slug))}" aria-label="Enquire about this car" novalidate>
        ${fieldBlock("first-name", "First name", "text", values?.firstName, errors?.firstName, `autocomplete="given-name"`)}
        ${fieldBlock("email", "Email", "email", values?.email, errors?.email, `autocomplete="email" inputmode="email"`)}
        ${fieldBlock("message", "Message", "textarea", values?.message, errors?.message)}
        ${turnstile}
        ${spam}
        <button type="submit">Enquire about this car</button>
      </form>`;
}

function fieldBlock(
  id: string,
  label: string,
  type: "text" | "email" | "textarea",
  value = "",
  error?: string,
  extra = "",
): string {
  const described = error ? ` aria-invalid="true" aria-describedby="${id}-error"` : "";
  const control =
    type === "textarea"
      ? `<textarea id="${id}" name="${id}"${described}>${escapeHtml(value)}</textarea>`
      : `<input id="${id}" name="${id}" type="${type}" value="${escapeHtml(value)}"${extra ? ` ${extra}` : ""}${described}>`;
  const message = error ? `<p id="${id}-error" class="field-error">${escapeHtml(error)}</p>` : "";
  return `<div class="field">
          <label for="${id}">${escapeHtml(label)}</label>
          ${control}
          ${message}
        </div>`;
}

function availabilityBadge(vehicle: Vehicle): string {
  const label = unpricedBadge(vehicle) ?? (isSold(vehicle) ? "Sold" : undefined);
  if (!label) return "";
  return `<p class="badge">${label}</p>`;
}

function spec(label: string, value: string | number | undefined): string {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return spec(label, String(value));
  }
  const text = value?.trim() ?? "";
  if (!text) return "";
  return `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(text)}</dd>`;
}

function formatPounds(pounds: number | undefined): string {
  if (typeof pounds !== "number" || !Number.isInteger(pounds)) return "";
  return `£${pounds.toLocaleString("en-GB")}`;
}

function formatMiles(miles: number | undefined): string {
  if (typeof miles !== "number" || !Number.isInteger(miles)) return "";
  return `${miles.toLocaleString("en-GB")} miles`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function text(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
