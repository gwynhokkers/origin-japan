# Storybook public components implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every public UI component a colocated Storybook story, including a story-only view of the existing `.btn` and `.btn-ghost` classes.

**Architecture:** One `*.stories.ts` file sits next to each component under `src/components/public`. Storybook already loads that glob. `Buttons.astro` exists only as the story target for the button classes. Sample props live in the story file. Sections inherit the fullscreen preview. Buttons and atoms set `parameters.layout` to `centered`.

**Tech Stack:** Astro components, Storybook 10 with `@storybook-astro/framework`, existing `src/styles/public.css`.

## Global Constraints

- No page imports `Buttons.astro`.
- No new Vitest files. The site header, stock card, and vehicle enquiry tests stay unchanged.
- The three existing story titles stay `Public/Site header`, `Public/Stock card`, and `Public/Vehicle enquiry`.
- Do not change `.storybook/main.ts`, `.storybook/preview.ts`, `src/styles/public.css`, or any page.
- Do not add a `Button` component that pages use.
- Stories pass real component props as `args`. They do not call the catalogue, the brochure loader, or the network.
- Button and atom stories set `parameters.layout` to `centered`. Section stories do not set `layout`, so they stay fullscreen.
- Do not add stories for empty lists that render nothing.
- Do not add error-state stories.
- Storybook is `bun storybook` at `http://localhost:6006`. If it is already running, leave it running. New story files are picked up by the existing glob.

---

### Task 1: Buttons

**Files:**
- Create: `src/components/public/Buttons.astro`
- Create: `src/components/public/Buttons.stories.ts`

**Interfaces:**
- Consumes: CSS classes `.btn` and `.btn-ghost` from `src/styles/public.css`.
- Produces: `Buttons.astro` props `{ variant: "solid" | "ghost" }`. Stories `Solid` and `Ghost`. No later task imports this component.

- [ ] **Step 1: Write the story-only component**

```astro
---
type Props = { variant: "solid" | "ghost" };
const { variant } = Astro.props;
const className = variant === "solid" ? "btn" : "btn-ghost";
---

<p class="flex flex-wrap items-center gap-4">
  <a class={className} href="/stock">Current stock</a>
  <button class={className} type="button">Send enquiry</button>
</p>
```

- [ ] **Step 2: Write the stories**

```ts
import Buttons from "./Buttons.astro";

export default {
  title: "Public/Buttons",
  component: Buttons,
  parameters: { layout: "centered" },
};

export const Solid = { args: { variant: "solid" } };

export const Ghost = { args: { variant: "ghost" } };
```

- [ ] **Step 3: Check Storybook**

Open `http://localhost:6006/?path=/story/public-buttons--solid`. The canvas shows a filled accent link and button reading "Current stock" and "Send enquiry".

Open `http://localhost:6006/?path=/story/public-buttons--ghost`. The same words appear as outlined ghost controls.

Confirm no page file imports `Buttons.astro`.

- [ ] **Step 4: Commit**

```bash
git add src/components/public/Buttons.astro src/components/public/Buttons.stories.ts
git commit -m "$(cat <<'EOF'
Show the public button classes in Storybook.

EOF
)"
```

### Task 2: Badge

**Files:**
- Create: `src/components/public/Badge.stories.ts`

**Interfaces:**
- Consumes: `Badge.astro` prop `{ label: string }`.
- Produces: story `Default`.

- [ ] **Step 1: Write the story**

```ts
import Badge from "./Badge.astro";

export default {
  title: "Public/Atoms/Badge",
  component: Badge,
  parameters: { layout: "centered" },
};

export const Default = { args: { label: "Sold" } };
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-atoms-badge--default`. The canvas shows the word Sold.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/Badge.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for the public badge.

EOF
)"
```

### Task 3: Brand lockup

**Files:**
- Create: `src/components/public/BrandLockup.stories.ts`

**Interfaces:**
- Consumes: `BrandLockup.astro` prop `tone?: "ground" | "carbon"`.
- Produces: stories `Carbon` and `Ground`.

- [ ] **Step 1: Write the stories**

```ts
import BrandLockup from "./BrandLockup.astro";

export default {
  title: "Public/Atoms/Brand lockup",
  component: BrandLockup,
  parameters: { layout: "centered" },
};

export const Carbon = { args: { tone: "carbon", class: "h-16" } };

export const Ground = { args: { tone: "ground", class: "h-16" } };
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-atoms-brand-lockup--carbon`. The canvas shows the lockup image with alt text Origin Japan.

Open `http://localhost:6006/?path=/story/public-atoms-brand-lockup--ground`. The canvas shows the theme-aware lockup, also alt text Origin Japan.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/BrandLockup.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the brand lockup.

EOF
)"
```

### Task 4: Pagination

**Files:**
- Create: `src/components/public/Pagination.stories.ts`

**Interfaces:**
- Consumes: `Pagination.astro` props `{ base: "/stock" | "/sold"; page: number; pages: number; sort?: StockSort }`.
- Produces: stories `FirstPage`, `MiddlePage`, `LastPage`, and `ManyPages`.

- [ ] **Step 1: Write the stories**

```ts
import Pagination from "./Pagination.astro";

export default {
  title: "Public/Atoms/Pagination",
  component: Pagination,
  parameters: { layout: "centered" },
};

export const FirstPage = { args: { base: "/stock", page: 1, pages: 5 } };

export const MiddlePage = { args: { base: "/stock", page: 3, pages: 5 } };

export const LastPage = { args: { base: "/stock", page: 5, pages: 5 } };

export const ManyPages = { args: { base: "/stock", page: 6, pages: 12 } };
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-atoms-pagination--first-page`. The nav shows 1 through 5 and Next, and does not show Previous.

Open `http://localhost:6006/?path=/story/public-atoms-pagination--middle-page`. The nav shows Previous, 1 through 5, and Next.

Open `http://localhost:6006/?path=/story/public-atoms-pagination--last-page`. The nav shows Previous and 1 through 5, and does not show Next.

Open `http://localhost:6006/?path=/story/public-atoms-pagination--many-pages`. The nav shows Previous, 1, an ellipsis, 5, 6, 7, an ellipsis, 12, and Next.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/Pagination.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for stock pagination.

EOF
)"
```

### Task 5: Sort controls

**Files:**
- Create: `src/components/public/SortControls.stories.ts`

**Interfaces:**
- Consumes: `SortControls.astro` props `{ base: "/stock" | "/sold"; current?: StockSort }`. `current: "price"` is one value of `stockSorts`.
- Produces: stories `Unsorted` and `SortSelected`.

- [ ] **Step 1: Write the stories**

```ts
import SortControls from "./SortControls.astro";

export default {
  title: "Public/Atoms/Sort controls",
  component: SortControls,
  parameters: { layout: "centered" },
};

export const Unsorted = { args: { base: "/stock" } };

export const SortSelected = { args: { base: "/stock", current: "price" } };
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-atoms-sort-controls--unsorted`. The summary reads Sort, and the links read Price, Model year, Mileage, and Newest. None of them is `aria-current="true"`.

Open `http://localhost:6006/?path=/story/public-atoms-sort-controls--sort-selected`. The Price link is `aria-current="true"`.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/SortControls.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the stock sort controls.

EOF
)"
```

### Task 6: Site footer

**Files:**
- Create: `src/components/public/SiteFooter.stories.ts`

**Interfaces:**
- Consumes: `SiteFooter.astro`, which takes no props and reads `src/public/contact.ts`.
- Produces: story `Default`.

- [ ] **Step 1: Write the story**

```ts
import SiteFooter from "./SiteFooter.astro";

export default {
  title: "Public/Atoms/Site footer",
  component: SiteFooter,
  parameters: { layout: "centered" },
};

export const Default = {};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-atoms-site-footer--default`. The canvas shows Origin Japan Ltd, the Newport address, 07454621101, info@originjapan.co.uk, Sold Stock, and Privacy.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/SiteFooter.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for the site footer.

EOF
)"
```

### Task 7: Page banner

**Files:**
- Create: `src/components/public/PageBanner.stories.ts`

**Interfaces:**
- Consumes: `PageBanner.astro` prop `{ name: "home" | "import" | "grades" | "contact" }`.
- Produces: stories `Home`, `Import`, `Grades`, and `Contact`.

- [ ] **Step 1: Write the stories**

```ts
import PageBanner from "./PageBanner.astro";

export default {
  title: "Public/Sections/Page banner",
  component: PageBanner,
};

export const Home = { args: { name: "home", class: "aspect-[16/10] w-[40rem] max-w-full" } };

export const Import = { args: { name: "import", class: "aspect-[16/10] w-[40rem] max-w-full" } };

export const Grades = { args: { name: "grades", class: "aspect-[16/10] w-[40rem] max-w-full" } };

export const Contact = { args: { name: "contact", class: "aspect-[16/10] w-[40rem] max-w-full" } };
```

- [ ] **Step 2: Check Storybook**

Open each of these and confirm a wide cover image fills the banner, with no heading text:

- `http://localhost:6006/?path=/story/public-sections-page-banner--home`
- `http://localhost:6006/?path=/story/public-sections-page-banner--import`
- `http://localhost:6006/?path=/story/public-sections-page-banner--grades`
- `http://localhost:6006/?path=/story/public-sections-page-banner--contact`

The banner element is `aria-hidden="true"`.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/PageBanner.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the page banners.

EOF
)"
```

### Task 8: Copy blocks

**Files:**
- Create: `src/components/public/CopyBlocks.stories.ts`

**Interfaces:**
- Consumes: `CopyBlocks.astro` prop `{ blocks: readonly CopyBlock[] }` where `CopyBlock` is `{ kind: "heading" | "paragraph"; text: string }` from `src/public/copy.ts`.
- Produces: story `HeadingAndParagraph`.

- [ ] **Step 1: Write the story**

```ts
import CopyBlocks from "./CopyBlocks.astro";

export default {
  title: "Public/Sections/Copy blocks",
  component: CopyBlocks,
};

export const HeadingAndParagraph = {
  args: {
    blocks: [
      { kind: "heading", text: "How buying works" },
      { kind: "paragraph", text: "We find the car in Japan, then ship it to Newport." },
    ],
  },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-copy-blocks--heading-and-paragraph`. The canvas shows the heading How buying works and the sentence about Newport.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/CopyBlocks.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for copy blocks.

EOF
)"
```

### Task 9: Reviews

**Files:**
- Create: `src/components/public/Reviews.stories.ts`

**Interfaces:**
- Consumes: `Reviews.astro` props `{ reviews: readonly { name: string; quote: string }[]; googleHref: string; heading?: string }`.
- Produces: story `TwoReviews`.

- [ ] **Step 1: Write the story**

```ts
import Reviews from "./Reviews.astro";

export default {
  title: "Public/Sections/Reviews",
  component: Reviews,
};

export const TwoReviews = {
  args: {
    heading: "Brilliant reviews",
    googleHref: "https://www.google.com/search?q=Origin+Japan",
    reviews: [
      { name: "Ada Lovelace", quote: "Straightforward from the first call." },
      { name: "Grace Hopper", quote: "The car arrived as described." },
    ],
  },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-reviews--two-reviews`. The canvas shows Brilliant reviews, both quotes, both names, and a Google reviews link.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/Reviews.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for the reviews section.

EOF
)"
```

### Task 10: Vehicle gallery

**Files:**
- Create: `src/components/public/VehicleGallery.stories.ts`

**Interfaces:**
- Consumes: `VehicleGallery.astro` props `{ photos: readonly string[]; title: string }`.
- Produces: stories `SeveralPhotos` and `OnePhoto`.

- [ ] **Step 1: Write the stories**

```ts
import VehicleGallery from "./VehicleGallery.astro";

const title = "Subaru Levorg 2.0 GT-S 2016";

export default {
  title: "Public/Sections/Vehicle gallery",
  component: VehicleGallery,
};

export const SeveralPhotos = {
  args: {
    title,
    photos: [
      "https://photos.example/levorg-front.jpg",
      "https://photos.example/levorg-rear.jpg",
      "https://photos.example/levorg-interior.jpg",
    ],
  },
};

export const OnePhoto = {
  args: {
    title,
    photos: ["https://photos.example/levorg-front.jpg"],
  },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-vehicle-gallery--several-photos`. Three images are shown. The first alt text is "Subaru Levorg 2.0 GT-S 2016, photo 1 of 3".

Open `http://localhost:6006/?path=/story/public-sections-vehicle-gallery--one-photo`. One image is shown. Its alt text is "Subaru Levorg 2.0 GT-S 2016".

- [ ] **Step 3: Commit**

```bash
git add src/components/public/VehicleGallery.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the vehicle gallery.

EOF
)"
```

### Task 11: Opening

**Files:**
- Create: `src/components/public/brochure/Opening.stories.ts`

**Interfaces:**
- Consumes: `Opening.astro` props `{ page: BrochurePage; title: string; body?: string; linkLabel?: string; linkHref?: string }`. `BrochurePage` includes `"home"` and `"personal-import"`.
- Produces: stories `Home`, `InteriorPage`, and `WithLink`.

- [ ] **Step 1: Write the stories**

```ts
import Opening from "./Opening.astro";

const title = "Japanese cars, bought properly";
const body = "Cars already in the UK, and personal imports from Japan.";

export default {
  title: "Public/Sections/Opening",
  component: Opening,
};

export const Home = {
  args: { page: "home", title, body },
};

export const InteriorPage = {
  args: { page: "personal-import", title, body },
};

export const WithLink = {
  args: {
    page: "personal-import",
    title,
    body,
    linkLabel: "Current stock",
    linkHref: "/stock",
  },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-opening--home`. The home hero shows the title and a Personal Import Service link.

Open `http://localhost:6006/?path=/story/public-sections-opening--interior-page`. The personal-import layout shows the title and the body, and does not show a Current stock link.

Open `http://localhost:6006/?path=/story/public-sections-opening--with-link`. The same interior layout shows a Current stock link to `/stock`.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/Opening.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the brochure opening.

EOF
)"
```

### Task 12: Feature

**Files:**
- Create: `src/components/public/brochure/Feature.stories.ts`

**Interfaces:**
- Consumes: `Feature.astro` props `{ heading: string; body?: string; image?: { src: string; alt?: string }; linkLabel?: string; linkHref?: string }`.
- Produces: stories `WithImage` and `TextOnly`.

- [ ] **Step 1: Write the stories**

```ts
import Feature from "./Feature.astro";

const heading = "Personal imports";
const body = "We bid at the Japanese auctions for you.";

export default {
  title: "Public/Sections/Feature",
  component: Feature,
};

export const WithImage = {
  args: {
    heading,
    body,
    image: { src: "/images/home-dusk-row-2000.jpg", alt: "A row of imported cars at dusk" },
    linkLabel: "Personal Import Service",
    linkHref: "/personal-import",
  },
};

export const TextOnly = {
  args: { heading, body },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-feature--with-image`. The section shows the heading, the body, the dusk image, and a Personal Import Service link.

Open `http://localhost:6006/?path=/story/public-sections-feature--text-only`. The section shows the heading and the body, and does not show an image or a link.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/Feature.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the feature section.

EOF
)"
```

### Task 13: Section group

**Files:**
- Create: `src/components/public/brochure/SectionGroup.stories.ts`

**Interfaces:**
- Consumes: `SectionGroup.astro` props `{ page: BrochurePage; sections: readonly { heading: string; paragraphs: string[] }[] }`.
- Produces: stories `HomeColumns` and `DocumentPage`.

- [ ] **Step 1: Write the stories**

```ts
import SectionGroup from "./SectionGroup.astro";

const sections = [
  { heading: "Already in the UK", paragraphs: ["These cars are here and ready to view."] },
  { heading: "Personal imports", paragraphs: ["We bid at the Japanese auctions for you."] },
];

export default {
  title: "Public/Sections/Section group",
  component: SectionGroup,
};

export const HomeColumns = { args: { page: "home", sections } };

export const DocumentPage = { args: { page: "grade-sheets", sections } };
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-section-group--home-columns`. Both headings and both paragraphs are visible in the home column layout.

Open `http://localhost:6006/?path=/story/public-sections-section-group--document-page`. The same copy is visible in the grade-sheets document layout.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/SectionGroup.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the brochure section group.

EOF
)"
```

### Task 14: Grade exhibit

**Files:**
- Create: `src/components/public/brochure/GradeExhibit.stories.ts`

**Interfaces:**
- Consumes: `GradeExhibit.astro` prop `{ caption?: string }`. Omitting `caption` uses the component's default caption.
- Produces: stories `DefaultCaption` and `CustomCaption`.

- [ ] **Step 1: Write the stories**

```ts
import GradeExhibit from "./GradeExhibit.astro";

export default {
  title: "Public/Sections/Grade exhibit",
  component: GradeExhibit,
};

export const DefaultCaption = {};

export const CustomCaption = {
  args: { caption: "A custom caption for the Volvo V70 exhibit sheet." },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-grade-exhibit--default-caption`. The figure shows the V70 exhibit image and a caption that mentions the grade 3.5.

Open `http://localhost:6006/?path=/story/public-sections-grade-exhibit--custom-caption`. The caption is "A custom caption for the Volvo V70 exhibit sheet."

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/GradeExhibit.stories.ts
git commit -m "$(cat <<'EOF'
Add Storybook stories for the grade exhibit.

EOF
)"
```

### Task 15: Contact details

**Files:**
- Create: `src/components/public/brochure/ContactDetails.stories.ts`

**Interfaces:**
- Consumes: `ContactDetails.astro`, which takes no props and reads `src/public/contact.ts`.
- Produces: story `Default`.

- [ ] **Step 1: Write the story**

```ts
import ContactDetails from "./ContactDetails.astro";

export default {
  title: "Public/Sections/Contact details",
  component: ContactDetails,
};

export const Default = {};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-contact-details--default`. The canvas shows Address, Origin Japan Ltd, the Newport address, What3Words ///pens.search.goal, Phone, 07454621101, Email, and info@originjapan.co.uk.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/ContactDetails.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for the contact details.

EOF
)"
```

### Task 16: Import photos

**Files:**
- Create: `src/components/public/brochure/ImportPhotos.stories.ts`

**Interfaces:**
- Consumes: `ImportPhotos.astro` props `{ heading?: string; photos: readonly { src: string; alt: string }[] }`.
- Produces: story `SeveralPhotos`.

- [ ] **Step 1: Write the story**

```ts
import ImportPhotos from "./ImportPhotos.astro";

export default {
  title: "Public/Sections/Import photos",
  component: ImportPhotos,
};

export const SeveralPhotos = {
  args: {
    heading: "Previous personal imports",
    photos: [
      { src: "https://photos.example/import-1.jpg", alt: "A white estate at the docks" },
      { src: "https://photos.example/import-2.jpg", alt: "A dark coupe on the trailer" },
      { src: "https://photos.example/import-3.jpg", alt: "A silver saloon in the yard" },
    ],
  },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-import-photos--several-photos`. The heading Previous personal imports is shown with three images and those three alt texts.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/ImportPhotos.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for previous import photos.

EOF
)"
```

### Task 17: Stock preview

**Files:**
- Create: `src/components/public/brochure/StockPreview.stories.ts`

**Interfaces:**
- Consumes: `StockPreview.astro` props `{ heading?: string; stock: readonly Vehicle[] }` and the `Vehicle` type from `src/catalogue.ts`.
- Produces: story `InStock`. The Levorg object is local to this file.

- [ ] **Step 1: Write the story**

```ts
import type { Vehicle } from "../../../catalogue";
import StockPreview from "./StockPreview.astro";

const levorg: Vehicle = {
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
  photos: ["https://photos.example/levorg-front.jpg"],
  sellersNotes: "One owner from Osaka, with a full service history.",
};

export default {
  title: "Public/Sections/Stock preview",
  component: StockPreview,
};

export const InStock = {
  args: { heading: "In stock", stock: [levorg] },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-stock-preview--in-stock`. The section shows In stock, Subaru Levorg 2.0 GT-S 2016, and £11,495.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/StockPreview.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for the stock preview.

EOF
)"
```

### Task 18: Brochure

**Files:**
- Create: `src/components/public/brochure/Brochure.stories.ts`

**Interfaces:**
- Consumes: `Brochure.astro` props `{ page: BrochurePage; title: string; blocks: readonly BrochureBlock[]; stock: readonly Vehicle[]; reviews: readonly { name: string; quote: string }[]; googleHref: string; photos: readonly { src: string; alt: string }[] }`.
- Produces: story `Home`. The Levorg object is local to this file and is not imported from the stock preview story.

- [ ] **Step 1: Write the story**

```ts
import type { BrochureBlock, Vehicle } from "../../../catalogue";
import Brochure from "./Brochure.astro";

const levorg: Vehicle = {
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
  photos: ["https://photos.example/levorg-front.jpg"],
  sellersNotes: "One owner from Osaka, with a full service history.",
};

const blocks: BrochureBlock[] = [
  {
    kind: "opening",
    body: "Cars already in the UK, and personal imports from Japan.",
    linkLabel: "Current stock",
    linkHref: "/stock",
  },
  {
    kind: "section",
    heading: "Already in the UK",
    body: "These cars are here, inspected, and ready to view.",
  },
  {
    kind: "feature",
    heading: "Personal imports",
    body: "We bid at the Japanese auctions for you.",
    image: { src: "/images/home-dusk-row-2000.jpg", alt: "A row of imported cars at dusk" },
    linkLabel: "Personal Import Service",
    linkHref: "/personal-import",
  },
  { kind: "stock", heading: "In stock" },
  { kind: "reviews", heading: "Brilliant reviews" },
];

export default {
  title: "Public/Sections/Brochure",
  component: Brochure,
};

export const Home = {
  args: {
    page: "home",
    title: "Japanese cars, bought properly",
    blocks,
    stock: [levorg],
    reviews: [
      { name: "Ada Lovelace", quote: "Straightforward from the first call." },
      { name: "Grace Hopper", quote: "The car arrived as described." },
    ],
    googleHref: "https://www.google.com/search?q=Origin+Japan",
    photos: [],
  },
};
```

- [ ] **Step 2: Check Storybook**

Open `http://localhost:6006/?path=/story/public-sections-brochure--home`. The page shows the home title, the opening body, Already in the UK, Personal imports, In stock with the Levorg and £11,495, and both review quotes.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/brochure/Brochure.stories.ts
git commit -m "$(cat <<'EOF'
Add a Storybook story for the home brochure.

EOF
)"
```

### Task 19: Typecheck

**Files:**
- Modify: none

**Interfaces:**
- Consumes: every story file from Tasks 1–18.
- Produces: a passing `bun typecheck`.

- [ ] **Step 1: Run the project typecheck**

Run: `bun typecheck`

Expected: exit code 0. `astro check` and `tsc --noEmit` both succeed.

- [ ] **Step 2: Confirm the existing stories are untouched**

Run: `git diff -- src/components/public/SiteHeader.stories.ts src/components/public/StockCard.stories.ts src/components/public/VehicleEnquiry.stories.ts .storybook/main.ts .storybook/preview.ts`

Expected: no diff.
