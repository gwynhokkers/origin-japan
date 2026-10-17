import { expect, test } from "vitest";
import { photoCacheControl } from "../src/photo-cache";

const immutable = "public, max-age=31536000, immutable";
const imported = "/_emdash/api/media/file/import-2019-toyota-hiace-3f2a9c01b4e5d6f7.jpg";
const image = { status: 200, contentType: "image/jpeg" };

function url(path: string): URL {
  return new URL(path, "https://originjapan.co.uk");
}

function variant(href: string): URL {
  return url(`/_image?href=${encodeURIComponent(href)}&w=640&f=webp`);
}

test("an imported vehicle photo is cached for a year", () => {
  expect(photoCacheControl(url(imported), image)).toBe(immutable);
});

test("a resized variant of an imported vehicle photo is cached for a year", () => {
  expect(photoCacheControl(variant(imported), { status: 200, contentType: "image/webp" })).toBe(immutable);
});

test("a not-modified answer for an imported vehicle photo is cached for a year", () => {
  expect(photoCacheControl(url(imported), { status: 304, contentType: "image/jpeg" })).toBe(immutable);
  expect(photoCacheControl(variant(imported), { status: 304, contentType: null })).toBe(immutable);
});

test("an editor upload keeps the default policy", () => {
  const upload = "/_emdash/api/media/file/01JABCDEF0123456789XYZABCD.jpg";
  expect(photoCacheControl(url(upload), image)).toBeNull();
  expect(photoCacheControl(variant(upload), image)).toBeNull();
});

test("a failed or non-image answer keeps the default policy", () => {
  expect(photoCacheControl(url(imported), { status: 404, contentType: "application/json" })).toBeNull();
  expect(photoCacheControl(url(imported), { status: 206, contentType: "image/jpeg" })).toBeNull();
  expect(photoCacheControl(url(imported), { status: 200, contentType: "application/pdf" })).toBeNull();
  expect(photoCacheControl(variant(imported), { status: 500, contentType: "text/plain" })).toBeNull();
});

test("a variant of anything other than an imported vehicle photo keeps the default policy", () => {
  expect(photoCacheControl(variant("/images/hero.jpg"), image)).toBeNull();
  expect(photoCacheControl(url("/_image?w=640"), image)).toBeNull();
  expect(photoCacheControl(variant("/_emdash/api/media/file/import-x/../secret.jpg"), image)).toBeNull();
});

test("other paths keep their policy", () => {
  expect(photoCacheControl(url("/stock/import-2019-toyota-hiace-3f2a9c01b4e5d6f7.jpg"), image)).toBeNull();
  expect(photoCacheControl(url("/_emdash/api/media/file/import-"), image)).toBeNull();
});
