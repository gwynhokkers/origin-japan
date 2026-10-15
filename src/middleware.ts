import { defineMiddleware } from "astro:middleware";
import { adminBlocksStyle } from "./admin-blocks";
import { emdashCatalogue } from "./emdash-catalogue";
import { liveEnquiryServices } from "./live-enquiry";
import { legacyDestination } from "./public/redirects";

export const onRequest = defineMiddleware(async (context, next) => {
  const destination = legacyDestination(context.url.pathname);
  if (destination) return context.redirect(destination, 301);
  context.locals.catalogue = emdashCatalogue;
  context.locals.enquiry = await liveEnquiryServices();
  const response = await next();
  if (!context.url.pathname.startsWith("/_emdash/admin")) return response;
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html") || !response.body) return response;
  const html = await response.text();
  if (html.includes("origin-admin-blocks") || !html.includes("</head>")) return new Response(html, response);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html.replace("</head>", `${adminBlocksStyle}</head>`), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
