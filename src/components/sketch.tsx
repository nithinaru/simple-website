import rough from "roughjs";
import type { Drawable } from "roughjs/bin/core";
import { LABEL_FAMILY } from "@/components/options";

/*
 * everything hand-drawn on the page. rough.js works out the wobbly strokes;
 * every shape has its own seed, so each one is drawn differently but comes
 * out the same on the server and in the browser.
 */

const gen = rough.generator();

const INK = "#141414";
const PEN = "#9c9c9c"; // the lines under links: pencil, not ink

// node and the browser disagree in the last decimal place of sines and
// cosines, which is enough to trip react's hydration check; two places is
// plenty for a drawing
const tidy = (d: string) =>
  d.replace(/-?\d+\.\d+/g, (n) => Number(n).toFixed(2));

function Paths({
  shapes,
  fixedWeight,
}: {
  shapes: Drawable[];
  /** keep the stroke the same weight when the drawing is stretched */
  fixedWeight?: boolean;
}) {
  return (
    <>
      {shapes.flatMap((shape, s) =>
        gen.toPaths(shape).map((p, i) => (
          <path
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed drawing
            key={`${s}-${i}`}
            d={tidy(p.d)}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            fill={p.fill ?? "none"}
            strokeLinecap="round"
            vectorEffect={fixedWeight ? "non-scaling-stroke" : undefined}
          />
        )),
      )}
    </>
  );
}

/** a pen line to sit under a link, as a css background image */
export function underline(seed: number) {
  const tilt = (seed % 5) - 2;
  const line = gen.line(3, 6 + tilt * 0.6, 197, 6 - tilt * 0.6, {
    seed,
    roughness: 1.1 + (seed % 3) * 0.35,
    bowing: 1.4,
  });
  const paths = gen
    .toPaths(line)
    .map(
      (p) =>
        `<path d='${tidy(p.d)}' stroke='${PEN}' stroke-width='1.5' fill='none' stroke-linecap='round' vector-effect='non-scaling-stroke'/>`,
    )
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 12' preserveAspectRatio='none'>${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** a small drawn sign with a letter or two inside */
export function Sign({
  shape,
  label,
  seed,
  style,
}: {
  shape: "diamond" | "box" | "circle";
  label: string;
  seed: number;
  style?: React.CSSProperties;
}) {
  const options = { seed, roughness: 0.9, stroke: INK, strokeWidth: 1.6 };
  const drawn =
    shape === "diamond"
      ? gen.polygon(
          [
            [3, 16],
            [28, 3],
            [53, 16],
            [28, 29],
          ],
          options,
        )
      : shape === "box"
        ? gen.rectangle(4, 4, 30, 24, options)
        : gen.circle(18, 16, 27, options);
  const width = shape === "diamond" ? 56 : shape === "box" ? 38 : 36;
  return (
    <svg
      className="sign ink"
      viewBox={`0 0 ${width} 32`}
      style={{ ...style, width: `${width / 32}em` }}
      aria-hidden="true"
    >
      <Paths shapes={[drawn]} />
      <text
        x={shape === "diamond" ? 28 : shape === "box" ? 19 : 18}
        y="20.5"
        textAnchor="middle"
        fontFamily={`"${LABEL_FAMILY}", sans-serif`}
        fontWeight="700"
        fontSize="11"
        fill={INK}
      >
        {label}
      </text>
    </svg>
  );
}

/** a quick globe, for "the internet" */
export function Globe({
  seed,
  style,
}: {
  seed: number;
  style?: React.CSSProperties;
}) {
  const options = { seed, roughness: 0.9, stroke: INK, strokeWidth: 1.5 };
  return (
    <svg
      className="sign ink"
      viewBox="0 0 34 32"
      style={{ ...style, width: `${34 / 32}em` }}
      aria-hidden="true"
    >
      <Paths
        shapes={[
          gen.circle(17, 16, 27, options),
          gen.ellipse(17, 16, 12, 27, { ...options, seed: seed + 1 }),
          gen.line(4, 16, 30, 16, { ...options, seed: seed + 2 }),
          gen.arc(17, 4, 24, 12, 0.35, Math.PI - 0.35, false, {
            ...options,
            seed: seed + 3,
            strokeWidth: 1.2,
          }),
          gen.arc(17, 28, 24, 12, Math.PI + 0.35, 2 * Math.PI - 0.35, false, {
            ...options,
            seed: seed + 4,
            strokeWidth: 1.2,
          }),
        ]}
      />
    </svg>
  );
}

/*
 * private garden's fountain, after the drawing on that site: a wide fluted
 * basin on a plinth, a smaller bowl above it, and water falling from the jet
 * in a dome of broken lines.
 */
export function Fountain({ seed }: { seed: number }) {
  const pen = { seed, roughness: 0.7, stroke: INK, strokeWidth: 1.3 };
  const water = {
    fill: "none",
    stroke: "#1f4fff",
    strokeWidth: 1.1,
    strokeLinecap: "round" as const,
    strokeDasharray: "2.2 2",
  };
  return (
    <svg
      className="sign"
      viewBox="0 0 36 32"
      style={{ width: `${36 / 32}em` }}
      aria-hidden="true"
    >
      {/* the water first, so the stone is drawn over it: outer sheets from
          the jet to the basin, inner ones from the bowl */}
      <path d="M18 4.5 C9 5.5 5 13 4.5 21" {...water} />
      <path d="M18 4.5 C27 5.5 31 13 31.5 21" {...water} />
      <path d="M18 5.5 C13.5 6.5 11.5 9.5 11 13" {...water} />
      <path d="M18 5.5 C22.5 6.5 24.5 9.5 25 13" {...water} />
      <path d="M11.5 15.5 C9 17 8 19 7.5 21" {...water} />
      <path d="M24.5 15.5 C27 17 28 19 28.5 21" {...water} />
      <Paths
        shapes={[
          // plinth, basin and its rim
          gen.line(5, 30, 31, 30, { ...pen, strokeWidth: 1.5 }),
          gen.path("M3.5 21.5 L6.5 27.5 H29.5 L32.5 21.5", {
            ...pen,
            seed: seed + 1,
          }),
          gen.ellipse(18, 21.5, 29, 3.4, { ...pen, seed: seed + 2 }),
          // the fluting round the basin
          ...[11, 18, 25].map((x, i) =>
            gen.line(x, 24, x + (x - 18) * 0.06, 27, {
              ...pen,
              seed: seed + 3 + i,
              strokeWidth: 0.8,
            }),
          ),
          // stem, upper bowl, and the jet
          gen.line(18, 14.5, 18, 20.5, { ...pen, seed: seed + 11 }),
          gen.path("M11 12.5 C12.5 16 23.5 16 25 12.5", {
            ...pen,
            seed: seed + 12,
          }),
          gen.ellipse(18, 12.5, 14, 2.2, { ...pen, seed: seed + 13 }),
          gen.line(18, 7, 18, 12, { ...pen, seed: seed + 14 }),
        ]}
      />
    </svg>
  );
}

/** the golden gate, in its own orange: san francisco's emblem in the byline */
export function Bridge({ seed }: { seed: number }) {
  const pen = { seed, roughness: 0.7, stroke: "#c8432b", strokeWidth: 1.5 };
  return (
    <svg
      className="sign"
      viewBox="0 0 46 32"
      style={{ width: `${46 / 32}em` }}
      aria-hidden="true"
    >
      <Paths
        shapes={[
          // deck, two towers, the cable slung between them, a few hangers
          gen.line(2, 23, 44, 23, pen),
          gen.line(14, 4, 14, 29, { ...pen, seed: seed + 1, strokeWidth: 1.9 }),
          gen.line(32, 4, 32, 29, { ...pen, seed: seed + 2, strokeWidth: 1.9 }),
          gen.path("M2 21 Q9 19 14 5 Q23 27 32 5 Q37 19 44 21", {
            ...pen,
            seed: seed + 3,
            strokeWidth: 1.2,
          }),
          gen.line(19, 15, 19, 23, {
            ...pen,
            seed: seed + 4,
            strokeWidth: 0.9,
          }),
          gen.line(23, 17, 23, 23, {
            ...pen,
            seed: seed + 5,
            strokeWidth: 0.9,
          }),
          gen.line(27, 15, 27, 23, {
            ...pen,
            seed: seed + 6,
            strokeWidth: 0.9,
          }),
        ]}
      />
    </svg>
  );
}

/*
 * the socials, drawn in the same hand as the other signs: no frames, just a
 * simple mark each, on its own seed.
 */
export type SocialKind = "linkedin" | "cosmos" | "scholar";

export function SocialSign({ kind, seed }: { kind: SocialKind; seed: number }) {
  const pen = { seed, roughness: 0.8, stroke: INK, strokeWidth: 1.7 };
  const bold = { ...pen, strokeWidth: 2.8, roughness: 0.6 };
  const inked = { ...pen, fill: INK, fillStyle: "solid" as const };

  let shapes: Drawable[];
  if (kind === "linkedin") {
    // "in", lettered with a broad pen: the dot, the stem, then the n
    shapes = [
      gen.circle(8.5, 7.5, 3.6, { ...inked, seed: seed + 1 }),
      gen.line(8.5, 13.5, 8.5, 26, { ...bold, seed: seed + 2 }),
      gen.line(15.5, 13.5, 15.5, 26, { ...bold, seed: seed + 3 }),
      gen.path("M15.5 18.5 C16 12.5 25.5 12 25.5 18.5 V26", {
        ...bold,
        seed: seed + 4,
      }),
    ];
  } else if (kind === "cosmos") {
    // a ring of six dots, pen wobble and all
    shapes = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return gen.circle(16 + Math.cos(a) * 8.5, 16 + Math.sin(a) * 8.5, 4.6, {
        ...inked,
        seed: seed + 3 + i,
        roughness: 0.9,
        strokeWidth: 1.3,
      });
    });
  } else {
    // a mortarboard: the flat top, the cap under it, the tassel
    shapes = [
      gen.polygon(
        [
          [16, 7],
          [28, 13],
          [16, 19],
          [4, 13],
        ],
        { ...pen, seed: seed + 1 },
      ),
      gen.path("M9.5 16.5 V22 C12 26 20 26 22.5 22 V16.5", {
        ...pen,
        seed: seed + 2,
      }),
      gen.line(28, 13, 28, 22, { ...pen, seed: seed + 3 }),
    ];
  }

  return (
    <svg className="social" viewBox="0 0 32 32" aria-hidden="true">
      <Paths shapes={shapes} />
    </svg>
  );
}
