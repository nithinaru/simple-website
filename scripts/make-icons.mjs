/**
 * Draws the site's icon, the hand-drawn Golden Gate from the location line,
 * and writes every size a browser, phone or search engine asks for.
 *
 * The bridge is drawn with rough.js on a fixed seed, so it comes out the same
 * every run. The small sizes use a plainer, heavier drawing: at 16 pixels the
 * hangers and thin cable of the full one turn to mush.
 *
 * Run with: node scripts/make-icons.mjs
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import rough from "roughjs";
import sharp from "sharp";

const PUBLIC = join(import.meta.dirname, "../public");
const ORANGE = "#c8432b"; // international orange, near enough
const gen = rough.generator();

const tidy = (d) => d.replace(/-?\d+\.\d+/g, (n) => Number(n).toFixed(2));

/** the bridge on a 64-unit square, as svg path elements */
const bridge = ({ small, colour = ORANGE }) => {
  const pen = { seed: 43, roughness: small ? 0.35 : 0.7, stroke: colour };
  const k = small ? 1.55 : 1; // heavier lines for the small sizes
  const shapes = [
    // deck, two towers, the cable slung between them
    gen.line(3, 45, 61, 45, { ...pen, strokeWidth: 4 * k }),
    gen.line(20, 11, 20, 55, { ...pen, seed: 44, strokeWidth: 5 * k }),
    gen.line(44, 11, 44, 55, { ...pen, seed: 45, strokeWidth: 5 * k }),
    gen.path("M3 41 Q13 38 20 13 Q32 47 44 13 Q51 38 61 41", {
      ...pen,
      seed: 46,
      strokeWidth: 3 * k,
    }),
  ];
  if (!small) {
    // the hangers, and a brace across each tower
    for (const [i, x] of [26, 32, 38].entries()) {
      shapes.push(
        gen.line(x, x === 32 ? 31 : 26, x, 45, {
          ...pen,
          seed: 47 + i,
          strokeWidth: 2,
        }),
      );
    }
    shapes.push(
      gen.line(17, 22, 23, 22, { ...pen, seed: 51, strokeWidth: 2.5 }),
      gen.line(41, 22, 47, 22, { ...pen, seed: 52, strokeWidth: 2.5 }),
    );
  }
  return shapes
    .flatMap((s) => gen.toPaths(s))
    .map(
      (p) =>
        `<path d="${tidy(p.d)}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
};

const svg = (inner, background = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${background}${inner}</svg>`;

const full = svg(bridge({ small: false }));
const plain = svg(bridge({ small: true }));

const png = (source, size) =>
  sharp(Buffer.from(source), { density: 72 * (size / 64) * 4 })
    .resize(size, size)
    .png()
    .toBuffer();

// no background: the tab, the bookmark bar or the search result shows through
const files = {
  "favicon-16x16.png": [plain, 16],
  "favicon-32x32.png": [plain, 32],
  "favicon-48x48.png": [plain, 48],
  "favicon-96x96.png": [full, 96],
  "android-chrome-144x144.png": [full, 144],
  "mstile-150x150.png": [full, 150],
  "icon-192.png": [full, 192],
  "icon-512.png": [full, 512],
};

for (const [name, [source, size]] of Object.entries(files)) {
  writeFileSync(join(PUBLIC, name), await png(source, size));
  console.log(name);
}

// iphones paint a transparent home-screen icon black, so this one alone sits
// on white, with a little room round it
const padded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 80 80"><rect x="-8" y="-8" width="80" height="80" fill="#fff"/>${bridge({ small: false })}</svg>`;
writeFileSync(
  join(PUBLIC, "apple-touch-icon.png"),
  await sharp(Buffer.from(padded), { density: 600 }).resize(180, 180).png().toBuffer(),
);
console.log("apple-touch-icon.png");

writeFileSync(join(PUBLIC, "favicon.svg"), full);
// safari's pinned tabs want one flat colour, which it then tints itself
writeFileSync(
  join(PUBLIC, "safari-pinned-tab.svg"),
  svg(bridge({ small: true, colour: "#000" })),
);
console.log("favicon.svg, safari-pinned-tab.svg");

// favicon.ico: an old container that can simply hold pngs, one per size
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(plain, s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = images.map((image, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i], 0);
  entry.writeUInt8(sizes[i], 1);
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  return entry;
});
writeFileSync(
  join(PUBLIC, "favicon.ico"),
  Buffer.concat([header, ...entries, ...images]),
);
console.log("favicon.ico");
