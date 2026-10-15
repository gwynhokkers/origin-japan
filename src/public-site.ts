import type { Catalogue, ImportPhoto, Review, SiteContent, Vehicle } from "./catalogue";

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
  border-bottom: 1px solid var(--line);
}
.site-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  min-height: 4.5rem;
  padding: 0 1.25rem;
}
.site-address,
.site-footer p {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.4;
}
.site-address {
  padding: 0 1.25rem 0.85rem;
}
.site-footer {
  width: min(100% - 2rem, 80rem);
  margin: 0 auto;
  padding: 1.25rem 0 2.5rem;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 0.35rem;
}
.site-footer a {
  text-decoration: none;
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
.home-title {
  max-width: 22em;
  font-size: clamp(1.55rem, 2.6vw, 2.2rem);
  line-height: 1.15;
}
.lede,
.home-section p,
.reviews p {
  max-width: 65ch;
}
.lede { margin: 1rem 0 0; font-size: 1.125rem; }
.home-cta { margin: 1.25rem 0 0; }
.button {
  display: inline-flex;
  align-items: center;
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
  text-decoration: none;
  white-space: nowrap;
}
.button:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
.home-section { margin-top: 2.5rem; }
.home-section h2,
.reviews h2,
.copy h2 {
  margin: 0 0 0.5rem;
  font-family: var(--body);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.3;
  text-transform: none;
}
.home-offer {
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
  max-width: 42rem;
}
.home-section p.partners {
  margin: 0;
  max-width: 28rem;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.35;
}
.reviews { margin-top: 3rem; }
.reviews ul {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
}
.reviews blockquote {
  margin: 0;
  padding-top: 0.85rem;
  border-top: 1px solid var(--line);
}
.reviews blockquote p { margin: 0; }
.reviews blockquote footer {
  margin-top: 0.45rem;
  font-weight: 600;
}
.copy { display: grid; gap: 0.25rem; max-width: 65ch; }
.copy p { margin: 0.75rem 0 0; }
.contact-details {
  margin: 1.5rem 0 0;
  font-style: normal;
  line-height: 1.6;
}
.import-photos {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.import-photos img {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--surface);
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
.stock-controls summary {
  display: none;
}
.stock-controls summary:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
@media (min-width: 768px) {
  .stock-controls:not([open]) > .stock-sort { display: flex; }
}
@media (max-width: 767px) {
  .stock-controls summary {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    font-weight: 600;
    cursor: pointer;
  }
  .stock-controls:not([open]) > .stock-sort { display: none; }
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
@media (min-width: 1024px) {
  .site-nav { flex-wrap: nowrap; }
}
@media (max-width: 767px) {
  .site-bar {
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 0.75rem 1rem 0;
  }
  .site-address { padding: 0.35rem 1rem 0.85rem; }
  .site-nav { width: 100%; justify-content: flex-start; }
  .wrap { width: 100%; padding: 1.5rem 1rem 3rem; }
  .site-footer { width: 100%; padding-inline: 1rem; }
  .stock { grid-template-columns: 1fr; }
  .gallery { grid-template-columns: 1fr; }
  .gallery li:first-child { grid-column: auto; }
  .import-photos { grid-template-columns: 1fr; }
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
  .enquiry button:active,
  .button:active { transform: scale(0.98); }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export async function requestPublicPage(
  request: Request,
  catalogue: Catalogue,
  services: EnquiryServices = closedEnquiry,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const redirectTo = legacyDestination(pathname);
  if (redirectTo) return redirect(redirectTo);

  if (pathname === "/" || pathname === "/personal-import" || pathname === "/grade-sheets" || pathname === "/contact" || pathname === "/contact/" || pathname === "/privacy") {
    const content = await catalogue.siteContent();
    if (pathname === "/") return html(homePage(content));
    if (pathname === "/personal-import") return html(personalImportPage(content));
    if (pathname === "/grade-sheets") return html(gradeSheetsPage(content));
    if (pathname === "/contact" || pathname === "/contact/") return html(contactPage(content));
    return html(privacyPage(content));
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

const legacyDestinations: Record<string, string> = {
  "/stocklist": "/stock",
  "/stocklist/": "/stock",
  "/stock/": "/stock",
  "/stocklist/sold-stock": "/sold",
  "/stocklist/sold-stock/": "/sold",
  "/personal-import-service": "/personal-import",
  "/personal-import-service/": "/personal-import",
  "/personal-import-gallery": "/personal-import",
  "/personal-import-gallery/": "/personal-import",
  "/gradesheets": "/grade-sheets",
  "/gradesheets/": "/grade-sheets",
};

function legacyDestination(pathname: string): string | undefined {
  return legacyDestinations[pathname];
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 301,
    headers: { location },
  });
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

const googleReviewsUrl = "https://share.google/gV9fNc1szaKmE150R";

const defaultReviews: readonly { name: string; quote: string }[] = [
  {
    name: "Badeshi",
    quote: "Bought a nice clean car. Easy purchase, low pressure sale. Recommended seller of JDM and imported cars.",
  },
  {
    name: "Jacob Dean",
    quote: "Adam was brilliant, transparent and very helpful. If I purchase another import it will definitely be through Origin Japan.",
  },
  {
    name: "Emily Renshaw",
    quote: "Adam has been excellent throughout the whole importing process, making it seamless and stress free for me.",
  },
];

const defaultHomeBody = `Here at Origin, we have a large selection of imported vehicles in stock, already in the UK.

Personal imports

We provide a personal import service to help you find and secure a car from Japan. With access to many trade only auctions, we inspect these vehicles before purchase.

New and used parts

With access to Yahoo Japan and Up Garage, Origin can help you find the parts you are looking for, new or used.

Trusted partners

In the import trade, partners in Japan are essential. With two trusted agents in Japan, both English speaking, Origin has the people to provide an efficient service.`;

function homePage(content: SiteContent): string {
  const edited = pageCopy(content, "home");
  const headline = edited?.title?.trim() || "So, you're looking for a car from Japan?";
  const main = `
    <h1 class="home-title">${escapeHtml(headline)}</h1>
    ${homeStory(edited?.body?.trim() || defaultHomeBody)}
    ${reviewsSection(content)}
  `;
  return document({
    title: "Origin Japan",
    current: undefined,
    main,
  });
}

function homeStory(body: string): string {
  const blocks = body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
  let html = "";
  let heading = "";
  let opened = false;
  for (const block of blocks) {
    if (isHeading(block)) {
      heading = block;
      continue;
    }
    if (!opened && !heading) {
      html += `<p class="lede">${escapeHtml(block)}</p><p class="home-cta"><a class="button" href="/stock">Current Stock</a></p>`;
      opened = true;
      continue;
    }
    const offer = heading === "New and used parts" ? " home-offer" : "";
    const textClass = heading === "Trusted partners" ? ` class="partners"` : "";
    html += `<section class="home-section${offer}">${heading ? `<h2>${escapeHtml(heading)}</h2>` : ""}<p${textClass}>${escapeHtml(block)}</p></section>`;
    heading = "";
    opened = true;
  }
  if (!html.includes('href="/stock"')) {
    html += `<p class="home-cta"><a class="button" href="/stock">Current Stock</a></p>`;
  }
  return html;
}

function isHeading(block: string): boolean {
  return !block.includes("\n") && block.length <= 60 && !/[.!?]$/.test(block);
}

function personalImportPage(content: SiteContent): string {
  const edited = pageCopy(content, "personal-import");
  const title = edited?.title?.trim() || "Personal Import Service";
  const body = edited?.body?.trim() || defaultPersonalImport;
  return document({
    title,
    current: "personal-import",
    main: `<h1>${escapeHtml(title)}</h1><div class="copy">${renderCopy(body)}</div>${importPhotoList(content.importPhotos ?? [])}`,
  });
}

function gradeSheetsPage(content: SiteContent): string {
  const edited = pageCopy(content, "grade-sheets");
  const title = edited?.title?.trim() || "Grade Sheets";
  const body = edited?.body?.trim() || defaultGradeSheets;
  return document({
    title,
    current: "grade-sheets",
    main: `<h1>${escapeHtml(title)}</h1><div class="copy">${renderCopy(body)}</div>`,
  });
}

function contactPage(content: SiteContent): string {
  const edited = pageCopy(content, "contact");
  const title = edited?.title?.trim() || "Contact";
  const body = edited?.body?.trim() || defaultContact;
  return document({
    title,
    current: "contact",
    main: `<h1>${escapeHtml(title)}</h1><div class="copy">${renderCopy(body)}</div>${contactDetails()}`,
  });
}

function privacyPage(content: SiteContent): string {
  const edited = pageCopy(content, "privacy");
  const title = edited?.title?.trim() || "Privacy";
  const body = edited?.body?.trim() || defaultPrivacy;
  return document({
    title,
    current: undefined,
    main: `<h1>${escapeHtml(title)}</h1><div class="copy">${renderCopy(body)}</div>`,
  });
}

function pageCopy(content: SiteContent, slug: string): { title?: string; body?: string } | undefined {
  return content.pages?.find((page) => page.slug === slug);
}

function reviewsSection(content: SiteContent): string {
  const provided = content.reviews?.filter((review) => review.name.trim() && review.quote.trim());
  const reviews = provided && provided.length > 0 ? provided : defaultReviews;
  const google = content.googleReviewsUrl?.trim() || googleReviewsUrl;
  const items = reviews
    .map(
      (review: Review) => `<li>
        <blockquote>
          <p>${escapeHtml(review.quote.trim())}</p>
          <footer>${escapeHtml(review.name.trim())}</footer>
        </blockquote>
      </li>`,
    )
    .join("");
  return `<section class="reviews" aria-label="Reviews">
      <h2>Brilliant reviews</h2>
      <ul>${items}</ul>
      <p><a href="${escapeHtml(google)}">Google reviews</a></p>
    </section>`;
}

function importPhotoList(photos: readonly ImportPhoto[]): string {
  const items = photos
    .filter((photo) => photo.src.trim())
    .map((photo) => {
      const alt = photo.alt?.trim() || "Personal import";
      return `<li><img src="${escapeHtml(photo.src.trim())}" alt="${escapeHtml(alt)}" width="900" height="600"></li>`;
    })
    .join("");
  if (!items) return "";
  return `<ul class="import-photos">${items}</ul>`;
}

function contactDetails(): string {
  return `<address class="contact-details">
      Origin Japan Ltd<br>
      ${postalAddress}<br>
      <a href="tel:${phone}">${phone}</a><br>
      <a href="mailto:${email}">${email}</a><br>
      What3Words ///pens.search.goal
    </address>`;
}

function renderCopy(body: string): string {
  return body
    .trim()
    .split(/\n\n+/)
    .map((block) => {
      const text = block.trim();
      if (!text) return "";
      const heading = !text.includes("\n") && text.length <= 60 && !/[.!?]$/.test(text);
      return heading ? `<h2>${escapeHtml(text)}</h2>` : `<p>${escapeHtml(text)}</p>`;
    })
    .join("");
}

const defaultPersonalImport = `At Origin, we can help import most cars from Japan to order, working with two agents in Japan. From kei cars to sports cars, trucks and MPVs, we source Japanese and European models from auctions, dealers, and online auctions across Japan.

We understand that many people are nervous about importing a vehicle. It is a lot of money to spend on something you have never seen. We help you understand the process, and get your requirements, budget and expectations in place.

Sourcing

On your instruction, we search Japanese auctions, dealers and online auctions with dealer level software the public do not have. Once we find a car you want, we price it all in to the UK and give you a breakdown. Then we book an inspection.

Inspection

We inspect personal imports before bidding. You get the pictures before the bid, so you can decide before we place it.

Shipping

Once the car is secured, the Japan costs are due. Our agent collects the car, photographs it again, and organises insured shipping to the UK.

Prep

When the vehicle arrives, we collect it from the port and bring it to Newport. We MOT it, or IVA it if needed, register it, service it, detail it, and carry out any other work agreed. Then we can deliver it, or you can collect it.`;

const defaultGradeSheets = `What the grade means

An auction grade sheet is the inspector's note that comes with almost every car sold at a Japanese auction. Inspectors at each auction house look over the car before the sale and mark scratches, dents, and anything obvious. The overall grade is usually in a box at the top right of the sheet.

Importers talk about a grade 4.5 car, or a grade 4 car. Treat that number as a guide. Different inspectors, and different auctions, are stricter or looser. A grade 3.5 at one auction may not match a grade 3.5 at another. The comments on the sheet are often more useful than the number. A grade sheet is not a full inspection. Origin can arrange a closer look before the auction, which matters more on an older car.

Grades

S or 6 means a car under 12 months old, in pristine condition inside and out. 5 is almost perfect, and hard to find. 4.5 is a strong grade, with only minor blemishes. 4 may have minor scratches or dents, and often has maintenance records.

3.5 is the common grade, and it covers a wide range, so a pre-bid inspection is worth it. 3 needs bodywork or paint. RA has been repaired after minor accident damage. R has accident history, repaired or not. 2 has significant corrosion.

A blank grade, 0, or a mark of three stars means the car was not inspected, has major damage, will not run, or is sold as it is.

Interior

Interior grades sit near the auction grade and run from A to E. A is the best.

Marks on the plan

The inspector also marks damage on a small plan of the car, bonnet at the top of the sheet. A mark on the top right of that plan is the front right wing. U is a dent: U1 the size of a thumb, U2 a palm, U3 larger. A is a scratch. Y is a tear, S is rust, C is corrosion, W is a repair, X means the panel needs replacing, and XX means it has been replaced.`;

const defaultContact = "Please feel free to ask any questions about a stock car or importing a vehicle. We will get back to you as soon as possible.";

const defaultPrivacy = "Origin Japan Ltd keeps the details you send when you ask about a vehicle or a personal import. We use your name, email, and message to reply to you. We do not sell those details. To ask for a copy, or to ask us to delete them, email info@originjapan.co.uk.";

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
  return `<details class="stock-controls"><summary>Sort</summary><nav class="stock-sort" aria-label="Sort">${links}</nav></details>`;
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

type NavPage = "stock" | "personal-import" | "grade-sheets" | "contact" | "sold";

const navItems: readonly { href: string; label: string; page: NavPage }[] = [
  { href: "/stock", label: "Current Stock", page: "stock" },
  { href: "/personal-import", label: "Personal Import Service", page: "personal-import" },
  { href: "/grade-sheets", label: "Grade Sheets", page: "grade-sheets" },
  { href: "/contact", label: "Contact", page: "contact" },
  { href: "/sold", label: "Sold Stock", page: "sold" },
];

const postalAddress = "Unit D2, Langland Park West, Newport, NP19 4ED";
const phone = "07454621101";
const email = "info@originjapan.co.uk";

function document(page: { title: string; current: NavPage | undefined; main: string }): string {
  const nav = navItems
    .map((item) => {
      const current = page.current === item.page ? ` aria-current="page"` : "";
      return `<a href="${item.href}"${current}>${item.label}</a>`;
    })
    .join("\n        ");
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
      <div class="site-bar">
        <a class="wordmark" href="/">Origin Japan</a>
        <nav class="site-nav" aria-label="Pages">
        ${nav}
        </nav>
      </div>
      <p class="site-address">Origin Japan Ltd, ${postalAddress}, <a href="tel:${phone}">${phone}</a>, <a href="mailto:${email}">${email}</a></p>
    </header>
    <main class="wrap">
      ${page.main}
    </main>
    <footer class="site-footer">
      <p>Origin Japan Ltd</p>
      <p>${postalAddress}</p>
      <p><a href="tel:${phone}">${phone}</a></p>
      <p><a href="mailto:${email}">${email}</a></p>
      <p><a href="/privacy">Privacy</a></p>
    </footer>
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
