import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { transform } from "lightningcss";
import {
  bannerNarrowMedia,
  carbonTexture,
  encodedSitePhotoPaths,
  featurePhoto,
  gradeExhibit,
  pageBanners,
  type BannerName,
  type BannerSlot,
} from "../src/public/site-photos";

const css = readFileSync(join(process.cwd(), "src/styles/public.css"), "utf8");

test("every encoded site photograph is in public/images", () => {
  const missing = encodedSitePhotoPaths().filter((path) => !existsSync(join(process.cwd(), "public", path.replace(/^\//, ""))));
  expect(missing).toEqual([]);
});

test("the feature photograph is declared at 3:2 and the exhibit keeps the sheet's ratio", () => {
  expect(featurePhoto.width / featurePhoto.height).toBeCloseTo(3 / 2);
  expect(gradeExhibit.width / gradeExhibit.height).toBeCloseTo(1155 / 1400);
});

test("each banner preload names the first image-set candidate for that breakpoint", () => {
  const banners = between(css, "/* site-photo-banners:start */", "/* site-photo-banners:end */");
  const mediaAt = banners.indexOf(`@media ${bannerNarrowMedia}`);
  const desktop = banners.slice(0, mediaAt);
  const narrow = sliceBlock(banners, banners.indexOf("{", mediaAt));

  for (const name of Object.keys(pageBanners) as BannerName[]) {
    expect(firstImageSetUrl(ruleBody(desktop, `.banner-${name}`))).toBe(pageBanners[name].wide.avif);
    expect(firstImageSetUrl(ruleBody(narrow, `.banner-${name}`))).toBe(pageBanners[name].narrow.avif);
    expect(imageSetOrder(ruleBody(desktop, `.banner-${name}`))).toEqual(formatsOf(pageBanners[name].wide));
    expect(imageSetOrder(ruleBody(narrow, `.banner-${name}`))).toEqual(formatsOf(pageBanners[name].narrow));
  }
});

test("the carbon texture offers AVIF, then WebP, then the JPEG", () => {
  const body = ruleBody(css.slice(0, css.indexOf("@supports not")), ".carbon-band::before");
  expect(imageSetOrder(body)).toEqual([carbonTexture.avif, carbonTexture.webp, carbonTexture.jpg]);
});

test("browsers without image-set type() keep the JPEG banners and the carbon texture", () => {
  const fallback = sliceBlock(css, css.indexOf("{", css.indexOf("@supports not")));
  for (const banner of Object.values(pageBanners)) {
    expect(fallback).toContain(`url("${banner.wide.jpg}")`);
    expect(fallback).toContain(`url("${banner.narrow.jpg}")`);
  }
  expect(fallback).toContain(`url("${carbonTexture.jpg}")`);
  expect(fallback).not.toContain("image-set(");
});

test("Lightning CSS keeps the AVIF candidate first in each banner image-set", () => {
  const banners = between(css, "/* site-photo-banners:start */", "/* site-photo-banners:end */");
  const compiled = new TextDecoder().decode(
    transform({ filename: "public.css", code: new TextEncoder().encode(banners), minify: true }).code,
  );
  for (const banner of Object.values(pageBanners)) {
    expect(compiled.indexOf(banner.wide.avif)).toBeGreaterThan(-1);
    expect(compiled.indexOf(banner.wide.avif)).toBeLessThan(compiled.indexOf(banner.wide.webp));
    expect(compiled.indexOf(banner.narrow.avif)).toBeLessThan(compiled.indexOf(banner.narrow.webp));
  }
});

function formatsOf(slot: BannerSlot): string[] {
  return [slot.avif, slot.webp, slot.jpg];
}

function between(source: string, startMark: string, endMark: string): string {
  const start = source.indexOf(startMark);
  const end = source.indexOf(endMark, start + startMark.length);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

function sliceBlock(source: string, openBrace: number): string {
  let depth = 0;
  for (let index = openBrace; index < source.length; index++) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openBrace, index + 1);
    }
  }
  throw new Error("unbalanced css block");
}

function ruleBody(source: string, selector: string): string {
  const at = source.indexOf(selector);
  if (at < 0) throw new Error(`missing ${selector}`);
  return sliceBlock(source, source.indexOf("{", at)).slice(1, -1);
}

function imageSetBody(rule: string): string {
  const start = rule.indexOf("image-set(");
  if (start < 0) throw new Error("missing image-set");
  return sliceParens(rule, start + "image-set".length).slice(1, -1);
}

function sliceParens(source: string, openParen: number): string {
  let depth = 0;
  for (let index = openParen; index < source.length; index++) {
    if (source[index] === "(") depth += 1;
    else if (source[index] === ")") {
      depth -= 1;
      if (depth === 0) return source.slice(openParen, index + 1);
    }
  }
  throw new Error("unbalanced css parens");
}

function imageSetOrder(rule: string): string[] {
  return [...imageSetBody(rule).matchAll(/url\(\s*"([^"]+)"\s*\)/g)].map((match) => match[1] ?? "");
}

function firstImageSetUrl(rule: string): string {
  return imageSetOrder(rule)[0] ?? "";
}
