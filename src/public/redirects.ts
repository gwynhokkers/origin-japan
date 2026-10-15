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

export function legacyDestination(pathname: string): string | undefined {
  return legacyDestinations[pathname];
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
