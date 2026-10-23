import type { BlockImage, BrochureBlock, ImportPhoto, SiteContent, Vehicle } from "../catalogue";
import { isOnStock, listStock } from "./vehicles";

export type CopyBlock = { kind: "heading" | "paragraph"; text: string };
export type CopySection = { heading: string; paragraphs: string[] };

const defaultGoogleReviewsUrl = "https://share.google/gV9fNc1szaKmE150R";

const defaultPersonalImportImage: BlockImage = {
  src: "/images/suzuki-carry-sunset-1400.jpg",
  alt: "A white Suzuki Carry kei truck at sunset",
};

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

export const defaultHomeBody = `Here at Origin, we have a large selection of imported vehicles in stock, already in the UK.

Personal imports

We provide a personal import service to help you find and secure a car from Japan. With access to many trade only auctions, we inspect these vehicles before purchase.

New and used parts

With access to Yahoo Japan and Up Garage, Origin can help you find the parts you are looking for, new or used.

Trusted partners

In the import trade, partners in Japan are essential. With two trusted agents in Japan, both English speaking, Origin has the people to provide an efficient service.`;

export const defaultHomeHeadline = "So, you're looking for a car from Japan?";

export const defaultPersonalImport = `At Origin, we can help import most cars from Japan to order, working with two agents in Japan. From kei cars to sports cars, trucks and MPVs, we source Japanese and European models from auctions, dealers, and online auctions across Japan.

We understand that many people are nervous about importing a vehicle. It is a lot of money to spend on something you have never seen. We help you understand the process, and get your requirements, budget and expectations in place.

Sourcing

On your instruction, we search Japanese auctions, dealers and online auctions with dealer level software the public do not have. Once we find a car you want, we price it all in to the UK and give you a breakdown. Then we book an inspection.

Inspection

We inspect personal imports before bidding. You get the pictures before the bid, so you can decide before we place it.

Shipping

Once the car is secured, the Japan costs are due. Our agent collects the car, photographs it again, and organises insured shipping to the UK.

Prep

When the vehicle arrives, we collect it from the port and bring it to Newport. We MOT it, or IVA it if needed, register it, service it, detail it, and carry out any other work agreed. Then we can deliver it, or you can collect it.`;

export const defaultGradeSheets = `What the grade means

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

export const defaultContact = "Please feel free to ask any questions about a stock car or importing a vehicle. We will get back to you as soon as possible.";

export const defaultPrivacy = "Origin Japan Ltd keeps the details you send when you ask about a vehicle or a personal import. We use your name, email, and message to reply to you. We do not sell those details. To ask for a copy, or to ask us to delete them, email info@originjapan.co.uk.";

export function pageCopy(content: SiteContent, slug: string) {
  return content.pages?.find((page) => page.slug === slug);
}

export type BrochurePage = "home" | "personal-import" | "grade-sheets" | "contact" | "privacy";

/** Blocks Adam saved, or the page's current copy arranged as those same components. */
export function pageBlocks(
  slug: BrochurePage,
  page: { body?: string; blocks?: readonly BrochureBlock[] } | undefined,
): BrochureBlock[] {
  if (page?.blocks && page.blocks.length > 0) return [...page.blocks];
  const { intro, sections } = copySections(page?.body?.trim() || defaultBody(slug));
  const opening: BrochureBlock = { kind: "opening", body: intro.join("\n\n") || undefined };
  const sectionBlocks: BrochureBlock[] = sections.map((section) => sectionBlock(section));
  switch (slug) {
    case "home":
      return [
        { kind: "opening", body: opening.body, linkLabel: "Showroom", linkHref: "/stock" },
        { kind: "stock", heading: "In the showroom" },
        ...(page?.body?.trim() ? sectionBlocks : defaultHomeBlocks(sections)),
        { kind: "reviews", heading: "Brilliant reviews" },
      ];
    case "personal-import":
      return [opening, ...sectionBlocks, { kind: "photos", heading: "Previous personal imports" }];
    case "grade-sheets":
      return [opening, ...sectionBlocks, { kind: "exhibit" }];
    case "contact":
      return [opening, ...sectionBlocks, { kind: "details" }];
    case "privacy":
      return [opening, ...sectionBlocks];
  }
}

export function stockPreview(vehicles: readonly Vehicle[]): Vehicle[] {
  return listStock(vehicles.filter(isOnStock))
    .filter((vehicle) => vehicle.slug)
    .slice(0, 3);
}

export type BrochureRun =
  | { kind: "opening"; body?: string; linkLabel?: string; linkHref?: string; withDetails?: boolean }
  | { kind: "sections"; sections: CopySection[] }
  | {
      kind: "feature";
      heading: string;
      body?: string;
      image?: BlockImage;
      linkLabel?: string;
      linkHref?: string;
    }
  | { kind: "stock"; heading?: string }
  | { kind: "reviews"; heading?: string }
  | { kind: "photos"; heading?: string }
  | { kind: "details" }
  | { kind: "exhibit"; caption?: string };

/** Consecutive section blocks stay together so a grid does not split them. */
export function brochureRuns(blocks: readonly BrochureBlock[]): BrochureRun[] {
  const runs: BrochureRun[] = [];
  for (const block of blocks) {
    if (block.kind === "section") {
      const section: CopySection = { heading: block.heading, paragraphs: copyParagraphs(block.body) };
      const last = runs.at(-1);
      if (last?.kind === "sections") last.sections.push(section);
      else runs.push({ kind: "sections", sections: [section] });
      continue;
    }
    if (block.kind === "opening") {
      runs.push({ kind: "opening", body: block.body, linkLabel: block.linkLabel, linkHref: block.linkHref });
      continue;
    }
    runs.push(block);
  }
  return runs;
}

export function copyParagraphs(body: string | undefined): string[] {
  return (body ?? "")
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function sectionBlock(section: CopySection): BrochureBlock {
  return { kind: "section", heading: section.heading, body: section.paragraphs.join("\n\n") };
}

/** The built-in home page. Saved blocks are left as Adam arranged them. */
function defaultHomeBlocks(sections: readonly CopySection[]): BrochureBlock[] {
  return sections.map((section) => {
    if (section.heading !== "Personal imports") return sectionBlock(section);
    return {
      kind: "feature",
      heading: section.heading,
      body: section.paragraphs.join("\n\n"),
      image: defaultPersonalImportImage,
      linkLabel: "Personal Import Service",
      linkHref: "/personal-import",
    };
  });
}

function defaultBody(slug: BrochurePage): string {
  switch (slug) {
    case "home":
      return defaultHomeBody;
    case "personal-import":
      return defaultPersonalImport;
    case "grade-sheets":
      return defaultGradeSheets;
    case "contact":
      return defaultContact;
    case "privacy":
      return defaultPrivacy;
  }
}

export function copyBlocks(body: string): CopyBlock[] {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((text) => ({ kind: isHeading(text) ? "heading" : "paragraph", text }));
}

/** Paragraphs before the first short heading line are the intro. Each heading owns the paragraphs after it. */
export function copySections(body: string): { intro: string[]; sections: CopySection[] } {
  const intro: string[] = [];
  const sections: CopySection[] = [];
  for (const block of copyBlocks(body)) {
    if (block.kind === "heading") sections.push({ heading: block.text, paragraphs: [] });
    else if (sections.length === 0) intro.push(block.text);
    else sections[sections.length - 1]?.paragraphs.push(block.text);
  }
  return { intro, sections };
}

function isHeading(block: string): boolean {
  return !block.includes("\n") && block.length <= 60 && !/[.!?]$/.test(block);
}

export function reviewsFor(content: SiteContent): { name: string; quote: string }[] {
  const provided = content.reviews?.filter((review) => review.name.trim() && review.quote.trim());
  const reviews = provided && provided.length > 0 ? provided : defaultReviews;
  return reviews.map((review) => ({ name: review.name.trim(), quote: review.quote.trim() }));
}

export function googleReviewsHref(content: SiteContent): string {
  return content.googleReviewsUrl?.trim() || defaultGoogleReviewsUrl;
}

export function visibleImportPhotos(photos: readonly ImportPhoto[] | undefined): { src: string; alt: string }[] {
  return (photos ?? [])
    .filter((photo) => photo.src.trim())
    .map((photo) => ({ src: photo.src.trim(), alt: photo.alt?.trim() || "Personal import" }));
}
