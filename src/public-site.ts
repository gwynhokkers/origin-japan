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

const baseCss = `
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
  --bg: #f4f5f6;
  --text: #15181c;
  --muted: #565d66;
  --line: #d9dde1;
  --surface: #e8ebee;
  --field: #fbfbfc;
  --field-line: #69717b;
  --accent: #f29559;
  --on-accent: #15181c;
  --display: Syncopate, "Avenir Next", sans-serif;
  --body: Poppins, "Segoe UI", sans-serif;
  --radius: 4px;
  --gutter: clamp(1rem, 4vw, 2.5rem);
  --section: clamp(2.5rem, 6vw, 4.5rem);
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121417;
    --text: #eceef1;
    --muted: #a4abb3;
    --line: #2b3036;
    --surface: #1c2025;
    --field: #171a1e;
    --field-line: #8c949e;
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
  line-height: 1.6;
}
img { display: block; max-width: 100%; }
a {
  color: inherit;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.25em;
}
a:hover { text-decoration-color: currentColor; }
a:focus-visible,
button:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
  border-radius: 2px;
}
.inner {
  width: min(100% - 2 * var(--gutter), 80rem);
  margin-inline: auto;
}

/* Header */
.site-strip {
  border-top: 4px solid var(--accent);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.8125rem;
  line-height: 1.4;
}
.site-strip .inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.2rem 1.5rem;
  padding-block: 0.5rem;
}
.site-strip p { margin: 0; }
.site-strip a { color: var(--text); text-decoration: none; }
.site-strip a:hover { text-decoration: underline; text-decoration-color: var(--accent); }
.site-strip .reach { display: flex; flex-wrap: wrap; gap: 0.2rem 1.25rem; }
.site-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 2rem;
  min-height: 4.5rem;
}
.site-header { border-bottom: 1px solid var(--line); }
.wordmark {
  font-family: var(--display);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}
.site-nav {
  display: flex;
  gap: 0 1.5rem;
}
.site-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  font-family: var(--display);
  font-size: 0.66rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.6em;
  white-space: nowrap;
}
.site-nav a:hover,
.site-nav a[aria-current="page"] { text-decoration-color: var(--accent); }
.site-nav a[aria-current="page"] { font-weight: 700; }

/* Type */
h1,
h2,
h3 { margin: 0; }
.title {
  font-family: var(--display);
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.25;
  text-transform: uppercase;
}
.heading {
  font-family: var(--display);
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.4;
  text-transform: uppercase;
}
.lede {
  margin: 1.25rem 0 0;
  max-width: 46ch;
  color: var(--muted);
  font-size: clamp(1.05rem, 1.4vw, 1.2rem);
}
.button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.7rem 1.25rem;
  border: 0;
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--body);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}
.button:hover { background: color-mix(in srgb, var(--accent) 86%, #000); }
.badge {
  margin: 0;
  justify-self: start;
  align-self: start;
  display: inline-block;
  padding: 0.35rem 0.55rem 0.3rem;
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--display);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}
.price {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}
.photo {
  border-radius: var(--radius);
  background-color: var(--surface);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

/* Home */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
  align-items: center;
  gap: 2rem clamp(1.5rem, 4vw, 3.5rem);
  padding-block: clamp(1.5rem, 4vw, 3.5rem) var(--section);
}
.hero-title {
  font-family: var(--body);
  font-size: clamp(2rem, 3.1vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.12;
}
.hero-cta { margin: 2rem 0 0; }
.hero .photo { aspect-ratio: 4 / 3; }
.home-intro {
  max-width: 65ch;
  padding-bottom: var(--section);
}
.home-intro p { margin: 0 0 0.75rem; }
.band {
  padding-block: var(--section);
  border-top: 1px solid var(--line);
}
.band-head { margin-bottom: 1.75rem; }
.reviews-more { margin: 1.75rem 0 0; }
.mosaic {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: clamp(1.25rem, 2.5vw, 2rem);
}
.mosaic[data-count="1"] { grid-template-columns: minmax(0, 1fr); }
.mosaic[data-count="3"] > li:first-child { grid-row: span 2; }
.car {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 0.85rem;
  height: 100%;
  text-decoration: none;
}
.car-photo {
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--surface);
}
.car-photo img {
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}
.mosaic[data-count="3"] > li:first-child .car-photo img { aspect-ratio: auto; min-height: 20rem; }
.car-facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 1rem;
}
.car-facts h3 {
  flex: 1 1 14rem;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.35;
}
.car-meta {
  flex-basis: 100%;
  margin: 0;
  color: var(--muted);
  font-size: 0.875rem;
}
.feature {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: center;
  gap: 2rem clamp(1.5rem, 5vw, 4.5rem);
}
.feature img {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--surface);
}
.feature p { margin: 1rem 0 0; max-width: 46ch; }
.feature .more { margin-top: 1.5rem; }
.sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem clamp(1.5rem, 5vw, 4.5rem);
}
.sections > section::before {
  content: "";
  display: block;
  width: 2.5rem;
  height: 3px;
  margin-bottom: 1.1rem;
  background: var(--accent);
}
.sections > section:last-child:nth-child(odd) { grid-column: 1 / -1; }
.sections p { margin: 0.75rem 0 0; max-width: 60ch; }
.feature + .sections { margin-top: var(--section); }
.reviews-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem clamp(1.5rem, 5vw, 4.5rem);
}
.reviews-list > li:first-child,
.reviews-list > li:last-child:nth-child(even) { grid-column: 1 / -1; }
.reviews-list figure { margin: 0; }
.reviews-list blockquote { margin: 0; }
.reviews-list blockquote p {
  margin: 0;
  max-width: 48ch;
  font-size: 1.05rem;
  line-height: 1.55;
}
.reviews-list > li:first-child blockquote p {
  max-width: 34ch;
  font-size: clamp(1.35rem, 2.3vw, 1.85rem);
  font-weight: 600;
  line-height: 1.35;
}
.reviews-list figcaption {
  margin-top: 0.85rem;
  font-weight: 600;
}
.reviews-list figcaption span {
  display: block;
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 400;
}
/* Inner pages */
.page-hero { padding-top: clamp(1rem, 3vw, 2rem); }
.page-hero .photo { aspect-ratio: 5 / 2; }
.page-hero-title {
  position: relative;
  display: inline-block;
  max-width: calc(100% - var(--gutter));
  margin-top: -3.25rem;
  padding: 1.25rem 1.75rem 0 0;
  border-top-right-radius: var(--radius);
  background: var(--bg);
}
.intro {
  max-width: 65ch;
  padding-block: 1.25rem var(--section);
}
.intro p { margin: 0 0 1rem; font-size: 1.1rem; }
.intro p:first-child { font-size: clamp(1.15rem, 1.6vw, 1.3rem); }
.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem 2rem;
  padding-block: clamp(1.5rem, 3.5vw, 2.75rem) 1.25rem;
  border-bottom: 1px solid var(--line);
}
.page-head p { margin: 0.5rem 0 0; color: var(--muted); }
.copy { max-width: 65ch; padding-block: 1.25rem var(--section); }
.copy p { margin: 0 0 1rem; }
.copy h2 { margin: 2rem 0 0.75rem; }
.import-photos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  gap: 1rem;
}
.import-photos li:first-child { grid-column: span 2; grid-row: span 2; }
.import-photos li:only-child { grid-column: 1 / -1; }
.import-photos img {
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--surface);
}
.reading {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: start;
  gap: 2.5rem clamp(1.5rem, 5vw, 4.5rem);
  padding-block: 1.25rem var(--section);
}
.reading article > section + section { margin-top: 2.75rem; }
.reading article p { margin: 0.75rem 0 0; max-width: 65ch; }
.reading figure {
  position: sticky;
  top: 1.5rem;
  margin: 0;
}
.reading figure img {
  width: 100%;
  height: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  /* The scan is a white paper sheet, so it stays on paper in dark mode. */
  background: #fbfbfc;
}
.reading figcaption {
  margin-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
}
.contact {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 2.5rem clamp(1.5rem, 5vw, 4.5rem);
  align-items: start;
  padding-block: clamp(1.5rem, 4vw, 3.5rem) var(--section);
}
.contact .photo { aspect-ratio: 4 / 5; }
.contact-copy p { margin: 1rem 0 0; max-width: 48ch; color: var(--muted); font-size: 1.1rem; }
.contact-details {
  display: grid;
  gap: 1.5rem;
  margin: 2.25rem 0 0;
  padding-top: 1.75rem;
  border-top: 1px solid var(--line);
  font-style: normal;
}
.contact-details p { margin: 0; color: var(--text); font-size: 1rem; }
.contact-details .reach a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  font-weight: 600;
}
.contact-details .label {
  display: block;
  color: var(--muted);
  font-size: 0.875rem;
}

/* Stock */
.stock-controls summary { display: none; }
.stock-sort {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.25rem;
  font-size: 0.875rem;
}
.stock-sort a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  text-decoration-color: transparent;
}
.stock-sort a:hover,
.stock-sort a[aria-current="true"] { text-decoration-color: var(--accent); }
.stock-sort a[aria-current="true"] { font-weight: 600; }
.stock {
  list-style: none;
  margin: 0;
  padding: 2rem 0 var(--section);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.75rem clamp(1rem, 2vw, 1.75rem);
}
.vehicle {
  display: grid;
  gap: 0.7rem;
  align-content: start;
  text-decoration: none;
}
.vehicle .car-photo img { aspect-ratio: 3 / 2; }
.vehicle h2 {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.35;
}
.specs {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 1rem;
  margin: 0.15rem 0 0;
  font-size: 0.875rem;
}
.specs dt { color: var(--muted); }
.specs dt,
.specs dd { margin: 0; }
.empty {
  margin: 0;
  padding-block: 2rem var(--section);
  max-width: 65ch;
  color: var(--muted);
}

/* Vehicle */
.back { margin: 0; padding-top: 1.25rem; font-size: 0.875rem; }
.back a { display: inline-flex; align-items: center; min-height: 2.75rem; }
.vehicle-page {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-block: 0.75rem var(--section);
}
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
  font-size: clamp(1.6rem, 2.6vw, 2.2rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.vehicle-page .price { font-size: clamp(1.5rem, 2.2vw, 1.85rem); }
.gallery {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.gallery li:first-child,
.gallery li:last-child:nth-child(even) { grid-column: 1 / -1; }
.gallery img {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--surface);
}
.vehicle-specs {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.45rem 1.5rem;
  margin: 0.75rem 0 0;
  padding-block: 1.25rem;
  border-block: 1px solid var(--line);
}
.vehicle-specs dt,
.vehicle-specs dd { margin: 0; }
.vehicle-specs dt { color: var(--muted); font-size: 0.875rem; }
.vehicle-specs dd { font-weight: 600; }
.notes { margin-top: 0.75rem; max-width: 65ch; }
.notes p { margin: 0.6rem 0 0; }
.enquiry {
  display: grid;
  gap: 1.1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
  max-width: 65ch;
}
.field { display: grid; gap: 0.4rem; }
.field label { font-size: 0.875rem; font-weight: 600; }
.field input,
.field textarea {
  width: 100%;
  margin: 0;
  min-height: 2.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--field-line);
  border-radius: var(--radius);
  background: var(--field);
  color: var(--text);
  font: inherit;
}
.field textarea { min-height: 8rem; resize: vertical; }
.field input:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
  border-color: var(--text);
}
.field-error {
  margin: 0;
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 600;
}
.field-error::before {
  content: "";
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  margin-right: 0.45rem;
  border-radius: 1px;
  background: var(--accent);
}
.enquiry button { justify-self: start; }
.enquiry-confirmation {
  margin: 1rem 0 0;
  padding: 1rem 1.1rem;
  max-width: 65ch;
  border-left: 3px solid var(--accent);
  background: var(--surface);
  font-weight: 600;
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--line);
  background: var(--surface);
  font-size: 0.875rem;
}
.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem clamp(1.5rem, 4vw, 3rem);
  padding-block: 2.5rem 3rem;
}
.site-footer p { margin: 0 0 0.35rem; }
.site-footer .wordmark { display: inline-block; margin-bottom: 0.75rem; }
.site-footer a { text-decoration: none; }
.site-footer a:hover { text-decoration: underline; text-decoration-color: var(--accent); }

@media (max-width: 1023px) {
  .stock { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .site-bar { flex-wrap: wrap; padding-block: 0.5rem; }
  .site-nav { overflow-x: auto; scrollbar-width: thin; }
}
@media (min-width: 768px) {
  .stock-controls::details-content { content-visibility: visible; display: contents; }
  .stock-controls:not([open]) > .stock-sort { display: flex; }
  .vehicle-specs { grid-template-columns: auto 1fr auto 1fr; column-gap: 2.5rem; }
}
@media (max-width: 767px) {
  .site-strip .address { flex-basis: 100%; }
  .site-bar { gap: 0; min-height: 0; padding-top: 0.75rem; }
  .site-nav {
    width: 100%;
    gap: 0 1.25rem;
    overflow-x: auto;
    scroll-snap-type: x proximity;
  }
  .site-nav a { scroll-snap-align: start; }
  .hero,
  .feature,
  .reading,
  .contact,
  .mosaic,
  .footer-grid { grid-template-columns: minmax(0, 1fr); }
  .hero .photo { order: -1; aspect-ratio: 16 / 10; }
  .mosaic[data-count="3"] > li:first-child { grid-row: auto; }
  .mosaic[data-count="3"] > li:first-child .car-photo img { aspect-ratio: 16 / 10; min-height: 0; }
  .page-hero .photo { aspect-ratio: 16 / 10; }
  .page-hero-title { margin-top: -1.75rem; padding: 0.9rem 1rem 0 0; }
  .contact .photo { order: -1; aspect-ratio: 16 / 10; }
  .reading figure { position: static; }
  .reviews-list,
  .sections { grid-template-columns: minmax(0, 1fr); }
  .import-photos li:first-child { grid-column: auto; grid-row: auto; }
  .stock-controls summary {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    font-weight: 600;
    cursor: pointer;
  }
  .stock-controls:not([open]) > .stock-sort { display: none; }
  .stock { grid-template-columns: minmax(0, 1fr); }
  .gallery { grid-template-columns: minmax(0, 1fr); }
  .gallery li:first-child,
  .gallery li:last-child:nth-child(even) { grid-column: auto; }
}
@media (min-width: 1024px) {
  .site-nav { flex-wrap: nowrap; }
  .vehicle-page {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(19rem, 5fr);
    column-gap: clamp(2rem, 4vw, 3.5rem);
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
    gap: 0.85rem;
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
  .vehicle-page .vehicle-specs { grid-template-columns: auto 1fr; }
}
@media (prefers-reduced-motion: no-preference) {
  .car-photo img,
  .button,
  .site-nav a,
  .stock-sort a,
  a {
    transition:
      transform 0.45s var(--ease),
      background-color 0.2s var(--ease),
      text-decoration-color 0.2s var(--ease);
  }
  .car:hover .car-photo img,
  .car:focus-visible .car-photo img,
  .vehicle:hover .car-photo img,
  .vehicle:focus-visible .car-photo img { transform: scale(1.03); }
  .button:active,
  .car:active,
  .vehicle:active { transform: scale(0.98); }
  .rise {
    animation: rise 0.7s var(--ease) both;
  }
  .rise:nth-child(2) { animation-delay: 70ms; }
  .rise:nth-child(3) { animation-delay: 140ms; }
  .photo.rise { animation-name: settle; animation-duration: 0.9s; }
  @keyframes rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes settle {
    from { opacity: 0; transform: scale(1.02); }
    to { opacity: 1; transform: none; }
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0s !important;
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
    if (pathname === "/") return html(homePage(content, (await catalogue.vehicles()).filter(isOnStock)));
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

function homePage(content: SiteContent, stock: readonly Vehicle[]): string {
  const edited = pageCopy(content, "home");
  const headline = edited?.title?.trim() || "So, you're looking for a car from Japan?";
  const { intro, sections } = copySections(edited?.body?.trim() || defaultHomeBody);
  const [lede, ...moreIntro] = intro;
  const main = `
    <section class="hero inner" aria-labelledby="home-title">
      <div>
        <h1 class="hero-title rise" id="home-title">${escapeHtml(headline)}</h1>
        ${lede ? `<p class="lede rise">${escapeHtml(lede)}</p>` : ""}
        <p class="hero-cta rise"><a class="button" href="/stock">Current Stock</a></p>
      </div>
      ${pagePhoto("home")}
    </section>
    ${moreIntro.length ? `<div class="inner"><div class="home-intro">${moreIntro.map(paragraph).join("")}</div></div>` : ""}
    ${homeStock(stock)}
    ${homeServices(sections)}
    ${reviewsSection(content)}
  `;
  return document({
    title: "Origin Japan",
    current: undefined,
    main,
    preload: "home",
  });
}

function homeStock(stock: readonly Vehicle[]): string {
  const cars = listStock(stock).filter((vehicle) => vehicle.slug).slice(0, 3);
  if (cars.length === 0) return "";
  return `<section class="band inner" aria-labelledby="home-stock">
      <div class="band-head">
        <h2 class="heading" id="home-stock">In stock</h2>
      </div>
      <ul class="mosaic" data-count="${cars.length}">${cars.map(homeCar).join("")}</ul>
    </section>`;
}

function homeCar(vehicle: Vehicle): string {
  const title = vehicle.title?.trim() ?? "";
  const photo = photosOf(vehicle)[0];
  const price = isForSale(vehicle) ? formatPounds(vehicle.pricePounds) : "";
  const meta = [vehicle.year, formatMiles(vehicle.mileageMiles)].filter(Boolean).join(" · ");
  return `<li>
      <a class="car" href="/listings/${escapeHtml(encodeURIComponent(vehicle.slug ?? ""))}">
        <div class="car-photo">${photo ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(title || "Vehicle photo")}" width="900" height="600" loading="lazy">` : ""}</div>
        <div class="car-facts">
          <h3>${escapeHtml(title)}</h3>
          ${price ? `<p class="price">${price}</p>` : availabilityBadge(vehicle)}
          ${meta ? `<p class="car-meta">${escapeHtml(meta)}</p>` : ""}
        </div>
      </a>
    </li>`;
}

function homeServices(sections: readonly CopySection[]): string {
  if (sections.length === 0) return "";
  const [first, ...rest] = sections;
  const importLink = /import/i.test(first.heading)
    ? `<p class="more"><a href="/personal-import">Personal Import Service</a></p>`
    : "";
  return `<section class="band inner" aria-label="What Origin does">
      <div class="feature">
        <img src="/images/suzuki-carry-sunset-1400.jpg" alt="A white Suzuki Carry kei truck at sunset" width="1400" height="1092" loading="lazy">
        <div>
          <h2 class="heading">${escapeHtml(first.heading)}</h2>
          ${first.paragraphs.map(paragraph).join("")}
          ${importLink}
        </div>
      </div>
      ${rest.length ? `<div class="sections">${rest.map(copySection).join("")}</div>` : ""}
    </section>`;
}

type CopySection = { heading: string; paragraphs: string[] };

/** Paragraphs before the first short heading line are the intro. Each heading owns the paragraphs after it. */
function copySections(body: string): { intro: string[]; sections: CopySection[] } {
  const intro: string[] = [];
  const sections: CopySection[] = [];
  for (const block of copyBlocks(body)) {
    if (isHeading(block)) sections.push({ heading: block, paragraphs: [] });
    else if (sections.length === 0) intro.push(block);
    else sections[sections.length - 1].paragraphs.push(block);
  }
  return { intro, sections };
}

function isHeading(block: string): boolean {
  return !block.includes("\n") && block.length <= 60 && !/[.!?]$/.test(block);
}

function copySection(section: CopySection): string {
  return `<section><h2 class="heading">${escapeHtml(section.heading)}</h2>${section.paragraphs.map(paragraph).join("")}</section>`;
}

function paragraph(text: string): string {
  return `<p>${escapeHtml(text)}</p>`;
}

function personalImportPage(content: SiteContent): string {
  const edited = pageCopy(content, "personal-import");
  const title = edited?.title?.trim() || "Personal Import Service";
  const { intro, sections } = copySections(edited?.body?.trim() || defaultPersonalImport);
  const photos = importPhotoList(content.importPhotos ?? []);
  return document({
    title,
    current: "personal-import",
    preload: "import",
    main: `
      ${pageHero(title, "import")}
      ${intro.length ? `<div class="inner"><div class="intro">${intro.map(paragraph).join("")}</div></div>` : ""}
      ${sections.length ? `<div class="band inner"><div class="sections">${sections.map(copySection).join("")}</div></div>` : ""}
      ${photos ? `<section class="band inner" aria-labelledby="import-photos"><div class="band-head"><h2 class="heading" id="import-photos">Previous personal imports</h2></div>${photos}</section>` : ""}
    `,
  });
}

function gradeSheetsPage(content: SiteContent): string {
  const edited = pageCopy(content, "grade-sheets");
  const title = edited?.title?.trim() || "Grade Sheets";
  const { intro, sections } = copySections(edited?.body?.trim() || defaultGradeSheets);
  return document({
    title,
    current: "grade-sheets",
    preload: "grades",
    main: `
      ${pageHero(title, "grades")}
      <div class="reading inner">
        <article>
          ${intro.length ? `<section>${intro.map(paragraph).join("")}</section>` : ""}
          ${sections.map(copySection).join("")}
        </article>
        <figure>
          <img src="/images/grade-sheet-v70-1400.jpg" alt="A Japanese auction exhibit sheet for a Volvo V70, overall grade 3.5, interior grade C, with damage marked on a plan of the car" width="1155" height="1400" loading="lazy">
          <figcaption>An exhibit sheet for a Volvo V70. The grade, 3.5, is in the box at the top right, with the interior grade, C, below it.</figcaption>
        </figure>
      </div>
    `,
  });
}

function contactPage(content: SiteContent): string {
  const edited = pageCopy(content, "contact");
  const title = edited?.title?.trim() || "Contact";
  const body = edited?.body?.trim() || defaultContact;
  return document({
    title,
    current: "contact",
    preload: "contact",
    main: `
      <section class="contact inner" aria-labelledby="page-title">
        <div class="contact-copy">
          <h1 class="title rise" id="page-title">${escapeHtml(title)}</h1>
          <div class="rise">${renderCopy(body)}</div>
          ${contactDetails()}
        </div>
        ${pagePhoto("contact")}
      </section>
    `,
  });
}

function privacyPage(content: SiteContent): string {
  const edited = pageCopy(content, "privacy");
  const title = edited?.title?.trim() || "Privacy";
  const body = edited?.body?.trim() || defaultPrivacy;
  return document({
    title,
    current: undefined,
    main: `<div class="inner"><div class="page-head"><h1 class="title">${escapeHtml(title)}</h1></div><div class="copy">${renderCopy(body)}</div></div>`,
  });
}

function pageCopy(content: SiteContent, slug: string): { title?: string; body?: string } | undefined {
  return content.pages?.find((page) => page.slug === slug);
}

type PagePhoto = "home" | "import" | "grades" | "contact";

/** Decorative banners, so they are backgrounds rather than images in the page content. */
const pagePhotos: Record<PagePhoto, { wide: string; narrow: string; position: string }> = {
  home: { wide: "/images/home-dusk-row-2000.jpg", narrow: "/images/home-dusk-row-1000.jpg", position: "60% 70%" },
  import: { wide: "/images/import-skylines-fuji-1300.jpg", narrow: "/images/import-skylines-fuji-1000.jpg", position: "50% 62%" },
  grades: { wide: "/images/grade-trueno-2000.jpg", narrow: "/images/grade-trueno-1000.jpg", position: "50% 55%" },
  contact: { wide: "/images/contact-supra-gtr-1600.jpg", narrow: "/images/contact-supra-gtr-900.jpg", position: "60% 60%" },
};

const photoCss = Object.entries(pagePhotos)
  .map(
    ([name, photo]) => `.photo-${name} { background-image: url("${photo.wide}"); background-position: ${photo.position}; }
@media (max-width: 767px) { .photo-${name} { background-image: url("${photo.narrow}"); } }`,
  )
  .join("\n");

function pagePhoto(name: PagePhoto): string {
  return `<div class="photo photo-${name} rise" aria-hidden="true"></div>`;
}

function preloadPhoto(name: PagePhoto): string {
  const photo = pagePhotos[name];
  return `<link rel="preload" as="image" href="${photo.narrow}" media="(max-width: 767px)">
    <link rel="preload" as="image" href="${photo.wide}" media="(min-width: 768px)">`;
}

function pageHero(title: string, photo: PagePhoto): string {
  return `<section class="page-hero inner" aria-labelledby="page-title">
      ${pagePhoto(photo)}
      <h1 class="title page-hero-title" id="page-title">${escapeHtml(title)}</h1>
    </section>`;
}

function reviewsSection(content: SiteContent): string {
  const provided = content.reviews?.filter((review) => review.name.trim() && review.quote.trim());
  const reviews = provided && provided.length > 0 ? provided : defaultReviews;
  const google = content.googleReviewsUrl?.trim() || googleReviewsUrl;
  const items = reviews
    .map(
      (review: Review) => `<li>
        <figure>
          <blockquote><p>“${escapeHtml(review.quote.trim())}”</p></blockquote>
          <figcaption>${escapeHtml(review.name.trim())}<span>Google review</span></figcaption>
        </figure>
      </li>`,
    )
    .join("");
  return `<section class="band inner" aria-labelledby="reviews">
      <div class="band-head">
        <h2 class="heading" id="reviews">Brilliant reviews</h2>
      </div>
      <ul class="reviews-list">${items}</ul>
      <p class="reviews-more"><a href="${escapeHtml(google)}">Google reviews</a></p>
    </section>`;
}

function importPhotoList(photos: readonly ImportPhoto[]): string {
  const items = photos
    .filter((photo) => photo.src.trim())
    .map((photo) => {
      const alt = photo.alt?.trim() || "Personal import";
      return `<li><img src="${escapeHtml(photo.src.trim())}" alt="${escapeHtml(alt)}" width="900" height="600" loading="lazy"></li>`;
    })
    .join("");
  if (!items) return "";
  return `<ul class="import-photos">${items}</ul>`;
}

function contactDetails(): string {
  return `<address class="contact-details">
      <p><span class="label">Address</span>Origin Japan Ltd<br>${postalAddress}<br>What3Words ///pens.search.goal</p>
      <p class="reach"><span class="label">Phone</span><a href="tel:${phone}">${phone}</a></p>
      <p class="reach"><span class="label">Email</span><a href="mailto:${email}">${email}</a></p>
    </address>`;
}

function copyBlocks(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function renderCopy(body: string): string {
  return copyBlocks(body)
    .map((block) => (isHeading(block) ? `<h2 class="heading">${escapeHtml(block)}</h2>` : paragraph(block)))
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
    <div class="inner">
      <div class="page-head">
        <h1 class="title">Current Stock</h1>
        ${sortNav(sort)}
      </div>
      ${cards ? `<ul class="stock">${cards}</ul>` : `<p class="empty">No vehicles in stock.</p>`}
    </div>
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
    <div class="inner">
      <div class="page-head">
        <h1 class="title">Sold Stock</h1>
      </div>
      ${cards ? `<ul class="stock">${cards}</ul>` : `<p class="empty">No sold vehicles.</p>`}
    </div>
  `;
  return document({
    title: "Sold Stock",
    current: "sold",
    main,
  });
}

function stockCard(vehicle: Vehicle, index: number): string {
  const slug = vehicle.slug ?? "";
  const title = vehicle.title?.trim() ?? "";
  const photo = photosOf(vehicle)[0];
  const price = isForSale(vehicle) ? formatPounds(vehicle.pricePounds) : "";
  const mileage = formatMiles(vehicle.mileageMiles);
  const image = photo
    ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(title || "Vehicle photo")}" width="900" height="600"${index < 3 ? "" : ` loading="lazy"`}>`
    : "";

  return `<li>
    <a class="vehicle" href="/listings/${escapeHtml(encodeURIComponent(slug))}">
      <div class="car-photo">${image}</div>
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
      const alt = photos.length > 1 ? `${title}, photo ${index + 1} of ${photos.length}` : title;
      return `<li><img src="${escapeHtml(photo)}" alt="${escapeHtml(alt)}" width="900" height="600"${priority}></li>`;
    })
    .join("");

  const notes = vehicle.sellersNotes?.trim()
    ? `<section class="notes"><h2 class="heading">Seller's notes</h2><p>${escapeHtml(vehicle.sellersNotes.trim())}</p></section>`
    : "";
  const back = isSold(vehicle)
    ? `<p class="back"><a href="/sold">Sold Stock</a></p>`
    : `<p class="back"><a href="/stock">Current Stock</a></p>`;
  const main = `
    <div class="inner">
    ${back}
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
    </div>
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

function document(page: { title: string; current: NavPage | undefined; main: string; preload?: PagePhoto }): string {
  const nav = navItems
    .map((item) => {
      const current = page.current === item.page ? ` aria-current="page"` : "";
      return `<a href="${item.href}"${current}>${item.label}</a>`;
    })
    .join("\n          ");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(page.title)}</title>
    <link rel="preload" href="/fonts/poppins-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/syncopate-700.woff2" as="font" type="font/woff2" crossorigin>
    ${page.preload ? preloadPhoto(page.preload) : ""}
    <style>${baseCss}${photoCss}</style>
  </head>
  <body>
    <header class="site-header">
      <div class="site-strip">
        <div class="inner">
          <p class="address">Origin Japan Ltd, ${postalAddress}</p>
          <p class="reach"><a href="tel:${phone}">${phone}</a><a href="mailto:${email}">${email}</a></p>
        </div>
      </div>
      <div class="site-bar inner">
        <a class="wordmark" href="/">Origin Japan</a>
        <nav class="site-nav" aria-label="Pages">
          ${nav}
        </nav>
      </div>
    </header>
    <main>
      ${page.main}
    </main>
    <footer class="site-footer">
      <div class="footer-grid inner">
        <div>
          <a class="wordmark" href="/">Origin Japan</a>
          <p>Origin Japan Ltd</p>
          <p>${postalAddress}</p>
        </div>
        <div>
          <p><a href="tel:${phone}">${phone}</a></p>
          <p><a href="mailto:${email}">${email}</a></p>
        </div>
        <div>
          <p><a href="/sold">Sold Stock</a></p>
          <p><a href="/privacy">Privacy</a></p>
        </div>
      </div>
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
        <button class="button" type="submit">Enquire about this car</button>
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
