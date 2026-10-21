/** Rewrite the AVIF and WebP variants after a source JPEG changes. Run: bun run encode-photos */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  avifEffort,
  bannerEncode,
  carbonTexture,
  framedPhotos,
  pageBanners,
  variantPath,
  type RasterFormat,
} from "../src/public/site-photos.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

function diskPath(urlPath: string): string {
  return join(root, "public", urlPath.replace(/^\//, ""));
}

function coverExtract(width: number, height: number, aspect: number) {
  if (width / height > aspect) {
    const cropWidth = Math.round(height * aspect);
    return { left: Math.floor((width - cropWidth) / 2), top: 0, width: cropWidth, height };
  }
  const cropHeight = Math.round(width / aspect);
  return { left: 0, top: Math.floor((height - cropHeight) / 2), width, height: cropHeight };
}

async function prepared(
  source: string,
  options: { width?: number; height?: number; crop?: { width: number; height: number } },
): Promise<sharp.Sharp> {
  const input = diskPath(source);
  let image = sharp(input);
  if (options.crop) {
    const meta = await sharp(input).metadata();
    if (!meta.width || !meta.height) throw new Error(`${source} has no dimensions`);
    image = image.extract(coverExtract(meta.width, meta.height, options.crop.width / options.crop.height));
  }
  if (options.width) {
    image = image.resize({
      width: options.width,
      height: options.height,
      fit: "cover",
      withoutEnlargement: true,
    });
  }
  return image;
}

async function writeVariant(source: string, target: string, bytes: Buffer) {
  if (target === source) throw new Error(`refusing to overwrite source ${source}`);
  await writeFile(diskPath(target), bytes);
  console.log(`${target}  ${(bytes.length / 1024).toFixed(1)} KB`);
}

async function encodeFormats(
  image: sharp.Sharp,
  source: string,
  outputs: { path: string; format: RasterFormat; quality: number }[],
) {
  for (const output of outputs) {
    const pipeline = image.clone();
    const bytes = await (output.format === "avif"
      ? pipeline.avif({ quality: output.quality, effort: avifEffort })
      : output.format === "webp"
        ? pipeline.webp({ quality: output.quality })
        : pipeline.jpeg({ quality: output.quality, mozjpeg: true })
    ).toBuffer();
    await writeVariant(source, output.path, bytes);
  }
}

for (const photo of framedPhotos) {
  for (const width of photo.widths) {
    const height = photo.crop ? Math.round((width * photo.crop.height) / photo.crop.width) : undefined;
    const image = await prepared(photo.source, { width, height, crop: photo.crop });
    await encodeFormats(image, photo.source, [
      { path: variantPath(photo.name, width, "avif"), format: "avif", quality: photo.avifQuality },
      { path: variantPath(photo.name, width, "webp"), format: "webp", quality: photo.webpQuality },
      { path: variantPath(photo.name, width, "jpg"), format: "jpg", quality: photo.jpegQuality },
    ]);
  }
}

for (const banner of Object.values(pageBanners)) {
  for (const slot of [banner.narrow, banner.wide]) {
    const image = await prepared(slot.jpg, {});
    await encodeFormats(image, slot.jpg, [
      { path: slot.avif, format: "avif", quality: bannerEncode.avifQuality },
      { path: slot.webp, format: "webp", quality: bannerEncode.webpQuality },
    ]);
  }
}

const carbon = await prepared(carbonTexture.source, {});
await encodeFormats(carbon, carbonTexture.source, [
  { path: carbonTexture.avif, format: "avif", quality: carbonTexture.avifQuality },
  { path: carbonTexture.webp, format: "webp", quality: carbonTexture.webpQuality },
]);
