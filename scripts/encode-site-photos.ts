import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { backgroundPhotos, sitePhotos, sitePhotoVariants } from "../src/public/site-photos.ts";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));
const avif = { quality: 55, effort: 6 };
const webp = { quality: 78, effort: 6 };

async function encode(from: string, to: string, format: "avif" | "webp", resize?: { width: number; height: number }) {
  let image = sharp(`${publicDir}${from}`);
  if (resize) image = image.resize({ ...resize, fit: "cover", position: "centre" });
  await (format === "avif" ? image.avif(avif) : image.webp(webp)).toFile(`${publicDir}${to}`);
  console.log(`${to}  ${Math.round(statSync(`${publicDir}${to}`).size / 1024)} KB`);
}

for (const photo of sitePhotos) {
  for (const variant of sitePhotoVariants(photo)) {
    await encode(photo.source, variant.path, variant.format, { width: variant.width, height: variant.height });
  }
}

for (const path of backgroundPhotos) {
  await encode(`${path}.jpg`, `${path}.avif`, "avif");
  await encode(`${path}.jpg`, `${path}.webp`, "webp");
}
