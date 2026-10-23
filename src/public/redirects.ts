const legacyDestinations: Record<string, string> = {
  "/stocklist": "/showroom",
  "/stocklist/": "/showroom",
  "/stock": "/showroom",
  "/stock/": "/showroom",
  "/stocklist/sold-stock": "/sold",
  "/stocklist/sold-stock/": "/sold",
  "/personal-import-service": "/personal-import",
  "/personal-import-service/": "/personal-import",
  "/personal-import-gallery": "/personal-import",
  "/personal-import-gallery/": "/personal-import",
  "/gradesheets": "/grade-sheets",
  "/gradesheets/": "/grade-sheets",
};

/** Where an old address now lives. The query is kept so a shared sort or page still applies. */
export function legacyDestination(url: URL): string | undefined {
  const destination = legacyDestinations[url.pathname];
  return destination && `${destination}${url.search}`;
}

export function listingSlug(pathname: string): string | undefined {
  const match = pathname.match(/^\/listings\/([^/]+)$/);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}
