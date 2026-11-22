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

/** a three-tier fountain, for private garden */
export function Fountain({ seed }: { seed: number }) {
  const pen = { seed, roughness: 0.8, stroke: INK, strokeWidth: 1.5 };
  return (
    <svg
      className="sign"
      viewBox="0 0 34 32"
      style={{ width: `${34 / 32}em` }}
      aria-hidden="true"
    >
      <Paths
        shapes={[
          // the jet, then three bowls widening downwards, on a stem
          gen.path("M17 2 C14 4 14 7 17 8 C20 7 20 4 17 2", {
            ...pen,
            stroke: "#1f4fff",
            strokeWidth: 1.3,
          }),
          gen.path("M12 10 C13 14 21 14 22 10 Z", { ...pen, seed: seed + 1 }),
          gen.path("M8 17 C10 22 24 22 26 17 Z", { ...pen, seed: seed + 2 }),
          gen.path("M3 25 C6 31 28 31 31 25 Z", { ...pen, seed: seed + 3 }),
          gen.line(17, 13, 17, 17, { ...pen, seed: seed + 4 }),
          gen.line(17, 21, 17, 25, { ...pen, seed: seed + 5 }),
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
export type SocialKind = "x" | "linkedin" | "github" | "cosmos" | "scholar";

export function SocialSign({ kind, seed }: { kind: SocialKind; seed: number }) {
  const pen = { seed, roughness: 0.8, stroke: INK, strokeWidth: 1.7 };
  const bold = { ...pen, strokeWidth: 2.8, roughness: 0.6 };
  const inked = { ...pen, fill: INK, fillStyle: "solid" as const };

  let shapes: Drawable[];
  if (kind === "x") {
    // a small bird, looking right: body and tail, head, beak, wing, legs
    shapes = [
      gen.path(
        "M19 13 C12 12 7 16 6 23 L2.5 26.5 L9 24.5 C15 26.5 22 23 23 15",
        {
          ...pen,
          seed: seed + 1,
        },
      ),
      gen.circle(22, 11, 8.5, { ...pen, seed: seed + 2 }),
      gen.linearPath(
        [
          [25.8, 9.6],
          [30, 11.4],
          [25.8, 13],
        ],
        { ...pen, seed: seed + 3 },
      ),
      gen.path("M11 18 C13.5 20.5 17 19.5 18.5 16", {
        ...pen,
        seed: seed + 4,
        strokeWidth: 1.3,
      }),
      gen.circle(23, 10.2, 1.5, { ...inked, seed: seed + 5 }),
      gen.line(13, 24.5, 12.2, 29.5, {
        ...pen,
        seed: seed + 6,
        strokeWidth: 1.3,
      }),
      gen.line(16.5, 24.5, 16.5, 29.5, {
        ...pen,
        seed: seed + 7,
        strokeWidth: 1.3,
      }),
    ];
  } else if (kind === "linkedin") {
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
  } else if (kind === "github") {
    // a branch leaving the main line and joining it again
    shapes = [
      gen.line(10, 10.5, 10, 21.5, { ...pen, seed: seed + 1, strokeWidth: 2 }),
      gen.path("M23 15.5 C23 21 10 16.5 10 21.5", {
        ...pen,
        seed: seed + 2,
        strokeWidth: 2,
      }),
      gen.circle(10, 7, 6.5, { ...pen, seed: seed + 3 }),
      gen.circle(10, 25, 6.5, { ...pen, seed: seed + 4 }),
      gen.circle(23, 12, 6.5, { ...pen, seed: seed + 5 }),
    ];
  } else if (kind === "cosmos") {
    shapes = [];
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
      {/* a ring of six dots; plain circles, since tiny ones go ragged when
          the pen wobbles them */}
      {kind === "cosmos"
        ? Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + 0.26;
            const r = 2.9 + ((seed + i * 5) % 3) * 0.25;
            return (
              <circle
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed drawing
                key={i}
                cx={(16 + Math.cos(a) * 8.6).toFixed(2)}
                cy={(16 + Math.sin(a) * 8.6).toFixed(2)}
                r={r}
                fill={INK}
              />
            );
          })
        : null}
    </svg>
  );
}
