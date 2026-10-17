import { IMMUTABLE_IMAGE_CACHE, matchInternalMediaKey } from "emdash/media/image-endpoint";

const MEDIA_FILE_PREFIX = "/_emdash/api/media/file/";
const IMAGE_ENDPOINT = "/_image";
/** Keys from `storeListingPhotos`: named by a hash of the source url, so their bytes never change. */
const IMPORTED_PHOTO_KEY = /^import-[A-Za-z0-9._-]+-[0-9a-f]{16}\.[a-z]+$/;

/**
 * Cache-Control for an imported vehicle photo or a resized variant of one, or null to keep
 * EmDash's policy. Editor uploads stay revalidated because Replace original rewrites their bytes.
 */
export function photoCacheControl(
  url: URL,
  response: { status: number; contentType: string | null },
): string | null {
  const key = url.pathname === IMAGE_ENDPOINT
    ? matchInternalMediaKey(url.searchParams.get("href"))
    : url.pathname.startsWith(MEDIA_FILE_PREFIX) ? url.pathname.slice(MEDIA_FILE_PREFIX.length) : null;
  if (!key || !IMPORTED_PHOTO_KEY.test(key)) return null;
  const servedImage = response.status === 200 && (response.contentType ?? "").startsWith("image/");
  return servedImage || response.status === 304 ? IMMUTABLE_IMAGE_CACHE : null;
}
