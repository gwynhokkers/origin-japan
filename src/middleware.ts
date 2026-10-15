import { defineMiddleware } from "astro:middleware";
import { emdashCatalogue } from "./emdash-catalogue";
import { liveEnquiryServices } from "./live-enquiry";
import { legacyDestination } from "./public/redirects";

export const onRequest = defineMiddleware(async (context, next) => {
  const destination = legacyDestination(context.url.pathname);
  if (destination) return context.redirect(destination, 301);
  context.locals.catalogue = emdashCatalogue;
  context.locals.enquiry = await liveEnquiryServices();
  return next();
});
