import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { Catalogue } from "../src/catalogue";
import type { LeadServices } from "../src/lead-services";
import Contact from "../src/pages/contact.astro";
import GradeSheets from "../src/pages/grade-sheets.astro";
import Index from "../src/pages/index.astro";
import Listing from "../src/pages/listings/[slug].astro";
import PersonalImport from "../src/pages/personal-import.astro";
import Privacy from "../src/pages/privacy.astro";
import Sold from "../src/pages/sold.astro";
import Showroom from "../src/pages/showroom.astro";
import { legacyDestination, listingSlug } from "../src/public/redirects";

const closedLeads: LeadServices = {
  async checkSpam() {
    return false;
  },
  async sendEmail() {
    throw new Error("Email is not configured");
  },
};

const pages = {
  "/": Index,
  "/showroom": Showroom,
  "/sold": Sold,
  "/personal-import": PersonalImport,
  "/grade-sheets": GradeSheets,
  "/contact": Contact,
  "/contact/": Contact,
  "/privacy": Privacy,
} as const;

let container: Promise<AstroContainer> | undefined;

function pageContainer() {
  container ??= AstroContainer.create();
  return container;
}

/** A buyer request, answered by the Astro page for that URL. */
export async function requestPublicPage(
  request: Request,
  catalogue: Catalogue,
  services: LeadServices = closedLeads,
): Promise<Response> {
  const url = new URL(request.url);
  const destination = legacyDestination(url);
  if (destination) {
    return new Response(null, { status: 301, headers: { location: destination } });
  }

  const slug = listingSlug(url.pathname);
  const page = slug === undefined ? pages[url.pathname as keyof typeof pages] : Listing;
  if (!page) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return (await pageContainer()).renderToResponse(page, {
    request,
    params: slug === undefined ? undefined : { slug },
    locals: { catalogue, leadServices: services } as App.Locals,
    partial: false,
  });
}
