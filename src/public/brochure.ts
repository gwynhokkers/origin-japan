import type { Catalogue } from "../catalogue";
import {
  googleReviewsHref,
  pageBlocks,
  pageCopy,
  reviewsFor,
  stockPreview,
  visibleImportPhotos,
  type BrochurePage,
} from "./copy";

export async function brochurePage(catalogue: Catalogue, slug: BrochurePage, fallbackTitle: string) {
  const content = await catalogue.siteContent();
  const edited = pageCopy(content, slug);
  const title = edited?.title?.trim() || fallbackTitle;
  const blocks = pageBlocks(slug, edited);
  const stock = blocks.some((block) => block.kind === "stock") ? stockPreview(await catalogue.vehicles()) : [];
  return {
    title,
    blocks,
    stock,
    reviews: reviewsFor(content),
    googleHref: googleReviewsHref(content),
    photos: visibleImportPhotos(content.importPhotos),
  };
}
