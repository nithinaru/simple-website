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
 * marks for the name in the heading. the text box is plain css; the next
 * three are drawn over the word itself and stretch to fit it; the rest are
 * small signs that sit after it.
 */
export const NAME_MARKS = [
  { id: "box", label: "Text box" },
  { id: "circle", label: "Circled" },
  { id: "underline", label: "Underlined" },
  { id: "bracket", label: "Bracketed" },
  { id: "spark", label: "Spark" },
  { id: "smile", label: "Smile" },
  { id: "pot", label: "Pot" },
  { id: "none", label: "Nothing" },
] as const;

export type NameMark = (typeof NAME_MARKS)[number]["id"];

export function NameMarkDrawing({
  mark,
  style,
}: {
  mark: NameMark;
  style?: React.CSSProperties;
}) {
  const pen = { roughness: 1.3, stroke: INK, strokeWidth: 2 };

  if (mark === "none") return null;

  // not drawn by hand: a cobalt selection box with a handle at each corner
  // and its size underneath, as a design tool shows a selected text box
  if (mark === "box") {
    return (
      <span className="name-box ink" style={style} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  // drawn round or under the word: stretched over it, so the stroke weight
  // is held fixed
  if (mark === "circle" || mark === "underline" || mark === "bracket") {
    const shapes =
      mark === "circle"
        ? [gen.ellipse(100, 40, 190, 72, { ...pen, seed: 41, roughness: 1.6 })]
        : mark === "underline"
          ? [
              gen.linearPath(
                [
                  [4, 62],
                  [196, 58],
                  [22, 72],
                  [150, 69],
                ],
                { ...pen, seed: 17 },
              ),
            ]
          : [
              gen.linearPath(
                [
                  [14, 8],
                  [4, 10],
                  [5, 70],
                  [15, 72],
                ],
                { ...pen, seed: 23 },
              ),
              gen.linearPath(
                [
                  [186, 8],
                  [196, 10],
                  [195, 70],
                  [185, 72],
                ],
                { ...pen, seed: 29 },
              ),
            ];
    return (
      <svg
        className="name-over ink"
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        style={style}
        aria-hidden="true"
      >
        <Paths shapes={shapes} fixedWeight />
      </svg>
    );
  }

  const small = { ...pen, strokeWidth: 1.7, roughness: 1 };
  const shapes =
    mark === "spark"
      ? [
          gen.line(16, 3, 16, 29, { ...small, seed: 3 }),
          gen.line(3, 16, 29, 16, { ...small, seed: 5 }),
          gen.line(7, 7, 25, 25, { ...small, seed: 7 }),
          gen.line(25, 7, 7, 25, { ...small, seed: 9 }),
        ]
      : mark === "smile"
        ? [
            gen.circle(16, 16, 27, { ...small, seed: 13 }),
            gen.circle(11.5, 12.5, 2.2, {
              ...small,
              seed: 15,
              fill: INK,
              fillStyle: "solid",
            }),
            gen.circle(20.5, 12.5, 2.2, {
              ...small,
              seed: 19,
              fill: INK,
              fillStyle: "solid",
            }),
            gen.arc(16, 15, 15, 14, 0.35, Math.PI - 0.35, false, {
              ...small,
              seed: 21,
            }),
          ]
        : [
            // a thrown pot: lip, belly, foot
            gen.path(
              "M10 5 H22 M12 5 C11 9 4 13 5 20 C6 26 10 28 12 29 H20 C22 28 26 26 27 20 C28 13 21 9 20 5",
              { ...small, seed: 33 },
            ),
            gen.line(8, 17, 24, 17, { ...small, seed: 35, strokeWidth: 1.1 }),
          ];
  return (
    <svg
      className="sign ink"
      viewBox="0 0 32 32"
      style={{ ...style, width: "1em" }}
      aria-hidden="true"
    >
      <Paths shapes={shapes} />
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
