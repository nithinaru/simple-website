/**
 * Compresses the raw screenshots from fetch-previews.ts into committed WebPs.
 *
 * Microlink hands back ~2560x1600 PNGs (1-3 MB each). The hover preview renders
 * them at 320px wide, so shipping the originals would be ~19 MB of images for
 * something displayed smaller than a business card. This converts them to WebP
 * at 800px — plenty for a 2x display — which is what actually gets committed.
 *
 * The .png originals stay gitignored; only the .webp output is tracked.
 *
 * Run with: node scripts/optimize-previews.mjs
 */

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = join(import.meta.dirname, "../public/images/previews");
const WIDTH = 800;
const QUALITY = 78;

const pngs = readdirSync(DIR).filter((f) => f.endsWith(".png"));

if (pngs.length === 0) {
  console.log("no .png screenshots to optimize — run `npm run prebuild` first");
}

let before = 0;
let after = 0;

for (const png of pngs) {
  const src = join(DIR, png);
  const out = join(DIR, png.replace(/\.png$/, ".webp"));

  await sharp(src)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);

  const b = statSync(src).size;
  const a = statSync(out).size;
  before += b;
  after += a;

  const kb = (n) => `${Math.round(n / 1024)}kb`;
  console.log(`${png.padEnd(30)} ${kb(b)} -> ${kb(a)}`);
}

if (pngs.length > 0) {
  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}mb`;
  console.log(`\ntotal ${mb(before)} -> ${mb(after)}`);
}
