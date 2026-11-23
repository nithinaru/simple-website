import { useEffect, useMemo, useRef, useState } from "react";
import type { Drawable } from "roughjs/bin/core";
import { WIDE as FLOWER, draw as flower } from "@/components/meadow";
import { gen, Paths } from "@/components/sketch";

/*
 * somewhere for the horse to run, along the bottom of the window. sallie
 * gardner (eadweard muybridge's "the horse in motion", palo alto, 19 june
 * 1878, long in the public domain) gallops on the spot while the scene goes
 * by behind her, far things slowly and the ground at exactly the pace of her
 * legs, which is how she can run for ever without getting anywhere.
 *
 * ten scenes; the front page uses the golden gate, and ?scene=name there
 * shows another. each is a few strips that repeat end to end.
 *
 * drawn in the browser only: how much of it there is depends on the window.
 */

const GALLOP = 11; // frames in her stride; the one after them is standing
const STRIDE = 2.7; // ground covered in one stride, in horse lengths
const PACE = 1; // strides a second
const INKS = 3; // how many different printings of the ink she cycles through

const BLUE = "#1f4fff";
const ORANGE = "#c8432b";
const YELLOW = "#fdb515";
const PINK = "#ef6aa5";
const VIOLET = "#7c4ddb";
const GREEN = "#2f8f5b";
const PENCIL = "#9c9c9c";
const BRIGHT = [BLUE, ORANGE, YELLOW, PINK, VIOLET];
const MONO = "var(--font-mono), ui-monospace, monospace";

const WAVE = Math.PI * 2;

const dice = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const n = (v: number) => Math.round(v * 100) / 100;

// scribbled in with colour, the way the flowers are
const hatch = (colour: string, seed: number, gap = 2.2) => ({
  seed,
  roughness: 0.9,
  strokeWidth: 1.1,
  stroke: colour,
  fill: colour,
  fillStyle: "hachure",
  hachureGap: gap,
  fillWeight: 0.7,
  hachureAngle: -41 + (seed % 5) * 20,
});

const pen = (colour: string, seed: number, weight = 1.2) => ({
  seed,
  roughness: 0.9,
  stroke: colour,
  strokeWidth: weight,
});

/** one stroke along the top of some hills, a little past both ends */
const ridge = (
  wide: number,
  tall: number,
  at: (x: number) => number,
  colour: string,
  seed: number,
) => {
  const top: [number, number][] = [];
  for (let x = -30; x <= wide + 30; x += 46) top.push([x, n(tall - at(x))]);
  return gen.curve(top, pen(colour, seed, 1.3));
};

type Strip = {
  wide: number; // the drawing repeats every this far
  drift: number; // how fast it goes by, as a share of the ground's speed
  art: React.ReactNode;
  front?: boolean; // in front of the horse
  blend?: boolean; // let its colour mix with what's behind
};

type Built = {
  tall: number; // every strip is drawn in a box this tall
  ground: number; // how far up from the bottom she runs
  strips: Strip[];
  still?: React.ReactNode; // something that doesn't move
  over?: "speed" | "frame"; // a cobalt label that rides with her
};

export type SceneName =
  | "track"
  | "plate"
  | "dots"
  | "bridge"
  | "grass"
  | "west"
  | "world"
  | "city"
  | "moon"
  | "garden";

export const SCENES: { name: SceneName; title: string; note: string }[] = [
  {
    name: "track",
    title: "The measured track",
    note: "Nothing but a cobalt ruler sliding under her, like the guides in the intro, with her speed on a chip.",
  },
  {
    name: "plate",
    title: "Muybridge's wall",
    note: "The numbered lines behind the track in the 1878 photographs, in pencil, with her framed like a selected layer and the frame counted.",
  },
  {
    name: "dots",
    title: "Dot hills",
    note: "Hills built from cobalt and orange dots that overlap as they pass, after the dots on the share image.",
  },
  {
    name: "bridge",
    title: "Across the Golden Gate",
    note: "The bridge from beside San Francisco, drawn long: towers, cables and water going by.",
  },
  {
    name: "grass",
    title: "Tall grass",
    note: "Only grass, a row behind her and a shorter one in front, with a few coloured seed heads.",
  },
  {
    name: "west",
    title: "Out west",
    note: "Mesas a long way off, cactus nearer, a scribbled sun that stays put.",
  },
  {
    name: "world",
    title: "Round the world",
    note: "Fifty countries in one gallop: the pyramids, the Eiffel Tower, a torii gate, Big Ben, a windmill, the Taj Mahal, palms, and a balloon overhead.",
  },
  {
    name: "city",
    title: "Through San Francisco",
    note: "Painted ladies, the Transamerica Pyramid, Coit and Sutro towers, the Campanile across the bay, and a cable car coming the other way.",
  },
  {
    name: "moon",
    title: "On the moon",
    note: "Craters underfoot, coloured stars, a lander, a flag, a rocket, and the Earth hanging where the sun would be.",
  },
  {
    name: "garden",
    title: "The private garden",
    note: "Clipped hedges, topiary, an arch of roses and the fountain from your Private Garden mark, with the meadow's flowers along the path.",
  },
];

const BUILD: Record<SceneName, () => Built> = {
  track() {
    const tall = 86;
    const ground = 21;
    const floor = tall - ground;
    const wide = 1200;
    const ticks = [];
    for (let x = 0; x < wide; x += 12) {
      const long = x % 120 === 0 ? 9 : x % 60 === 0 ? 6 : 3.5;
      ticks.push(
        <line key={x} x1={x + 0.5} y1={floor} x2={x + 0.5} y2={floor + long} />,
      );
    }
    const labels = [];
    for (let x = 0; x < wide; x += 120) {
      labels.push(
        <text
          key={x}
          x={x + 4}
          y={floor + 17}
          fontSize="7.5"
          fontFamily={MONO}
          fill={BLUE}
        >
          {x / 120}
        </text>,
      );
    }
    return {
      tall,
      ground,
      over: "speed",
      strips: [
        {
          wide,
          drift: 1,
          art: (
            <>
              <g stroke={BLUE} strokeWidth="1">
                <line x1="-1" y1={floor} x2={wide + 1} y2={floor} />
                {ticks}
              </g>
              {labels}
            </>
          ),
        },
      ],
    };
  },

  plate() {
    const tall = 98;
    const ground = 7;
    const floor = tall - ground;
    const gap = 27; // his lines were twenty-seven inches apart
    const wide = gap * 45;
    const lines: Drawable[] = [];
    const numbers = [];
    for (let i = 0; i < 45; i++) {
      const x = i * gap + 13;
      lines.push(
        gen.line(x, 12, x, floor, {
          ...pen(PENCIL, i + 1, 0.8),
          roughness: 0.5,
        }),
      );
      numbers.push(
        <text
          key={i}
          x={x}
          y="8"
          textAnchor="middle"
          fontSize="6"
          fontFamily={MONO}
          fill={PENCIL}
        >
          {i + 1}
        </text>,
      );
    }
    // and the ones along the ground marked every four inches of height
    for (let i = 0; i < 3; i++) {
      lines.push(
        gen.line(-12, floor - i * 4, wide + 12, floor - i * 4, {
          ...pen(PENCIL, 60 + i, i ? 0.7 : 1.1),
          roughness: 0.6,
          bowing: 0.2,
        }),
      );
    }
    return {
      tall,
      ground,
      over: "frame",
      strips: [
        {
          wide,
          drift: 1,
          art: (
            <>
              <Paths shapes={lines} />
              {numbers}
            </>
          ),
        },
      ],
    };
  },

  dots() {
    const tall = 92;
    const ground = 7;
    const floor = tall - ground;
    const hill = (
      wide: number,
      at: (x: number) => number,
      colour: string,
      big: number,
    ) => {
      const out = [];
      for (let x = 4.5; x < wide; x += 9) {
        const top = tall - at(x);
        for (let row = 0; top + row * 8 < tall + 4 && row < 7; row++) {
          // biggest along the ridge, thinning out below it like a halftone
          const r = Math.max(0.7, big - row * 0.52);
          out.push(
            <circle
              key={`${x}-${row}`}
              cx={x}
              cy={n(top + row * 8)}
              r={n(r)}
              fill={colour}
            />,
          );
        }
      }
      return out;
    };
    const roll = dice(12);
    const stones = [];
    for (let x = 30; x < 1200; x += 50 + roll() * 110) {
      const r = 1.8 + roll() * 2.2;
      stones.push(
        <circle
          key={x}
          cx={n(x)}
          cy={n(floor - r)}
          r={n(r)}
          fill={roll() < 0.5 ? YELLOW : PINK}
        />,
      );
    }
    return {
      tall,
      ground,
      strips: [
        {
          wide: 801,
          drift: 0.05,
          art: hill(
            801,
            (x) =>
              54 +
              16 * Math.sin((WAVE * x) / 801 + 1) +
              8 * Math.sin((WAVE * x) / 400.5 + 2.2),
            BLUE,
            3.5,
          ),
        },
        {
          wide: 702,
          drift: 0.17,
          blend: true,
          art: hill(
            702,
            (x) =>
              16 +
              5 * Math.sin((WAVE * x) / 702 + 0.5) +
              3 * Math.sin((WAVE * x) / 351 + 4),
            ORANGE,
            3.1,
          ),
        },
        {
          wide: 1200,
          drift: 1,
          art: (
            <>
              <line
                x1="-1"
                y1={floor}
                x2="1201"
                y2={floor}
                stroke={PENCIL}
                strokeWidth="1"
              />
              {stones}
            </>
          ),
        },
      ],
    };
  },

  bridge() {
    const tall = 142;
    const ground = 37; // the roadway is a long way above the water
    const floor = tall - ground;
    const sea = tall - 5;
    const span = 860; // tower to tower
    const mid = span / 2;
    const top = 10;
    const low = floor - 6;
    // a hanging cable: flat in the middle of the span, steepest at the tower
    const cable = (x: number) =>
      low - (low - top) * (Math.min(x, span - x) / mid) ** 2;
    const paint = (seed: number, weight = 1.2) => pen(ORANGE, seed, weight);

    // the roadway, and the truss under it that keeps it stiff
    let zig = `M 0 ${floor + 7}`;
    for (let x = 0; x < span; x += 10) {
      zig += ` L ${x + 5} ${floor + 1.5} L ${x + 10} ${floor + 7}`;
    }
    const built: Drawable[] = [
      gen.line(-12, floor + 1, span + 12, floor + 1, paint(1, 1.7)),
      gen.line(-12, floor + 7, span + 12, floor + 7, paint(2, 1.1)),
      gen.path(zig, { ...paint(3, 0.7), roughness: 0.4 }),
    ];

    // a tower: two legs that step in as they climb, the way the real ones do
    const steps: [number, number, number][] = [
      [floor + 1, floor - 36, 7.4],
      [floor - 36, floor - 63, 6.4],
      [floor - 63, floor - 83, 5.4],
      [floor - 83, top, 4.6],
    ];
    for (const side of [-10, 10]) {
      const cx = mid + side;
      for (const [i, [from, to, w]] of steps.entries()) {
        built.push(
          gen.rectangle(
            n(cx - w / 2),
            to,
            w,
            from - to,
            hatch(ORANGE, 20 + i + side, 1.15),
          ),
        );
      }
      built.push(
        // below the road, down to the pier
        gen.rectangle(
          cx - 4.2,
          floor + 7,
          8.4,
          sea - 9 - (floor + 7),
          hatch(ORANGE, 30 + side, 1.15),
        ),
        // and the cap the cable sits on
        gen.rectangle(cx - 2.8, top - 4, 5.6, 4, paint(34 + side, 1.1)),
      );
    }
    // the four portals between the legs above the road
    // solid bands, deepest at the bottom, each with a rib across it
    for (const [i, [y, h]] of [
      [floor - 41, 10],
      [floor - 67, 8],
      [floor - 86, 6.5],
      [top + 0.5, 5.5],
    ].entries()) {
      built.push(
        gen.rectangle(mid - 7, y, 14, h, hatch(ORANGE, 40 + i, 1.3)),
        gen.line(mid - 7, n(y + h / 2), mid + 7, n(y + h / 2), {
          ...paint(44 + i, 0.6),
          roughness: 0.4,
        }),
      );
    }
    // the road passes through the tower under a last band
    built.push(gen.rectangle(mid - 7, floor - 5, 14, 5, paint(48, 1)));
    // crossed braces between them below it
    const under = (sea - 9 - (floor + 7)) / 2;
    for (let i = 0; i < 2; i++) {
      const y = floor + 7 + i * under;
      built.push(
        gen.line(mid - 6.5, y, mid + 6.5, n(y + under), paint(50 + i, 0.9)),
        gen.line(mid + 6.5, y, mid - 6.5, n(y + under), paint(52 + i, 0.9)),
      );
    }
    // the cable swings down from the tower to the middle of each span
    for (const [from, to] of [
      [0, mid],
      [mid, span],
    ]) {
      const along: [number, number][] = [];
      for (let x = from; x <= to + 0.1; x += mid / 20)
        along.push([n(x), n(cable(x))]);
      built.push(gen.curve(along, { ...paint(from + 5, 1.7), roughness: 0.5 }));
    }
    // and the ropes that hang the road from it
    for (let x = 10; x < span; x += 10) {
      if (Math.abs(x - mid) < 15 || floor + 1 - cable(x) < 3) continue;
      built.push(
        gen.line(x, n(cable(x)), x, floor + 1, {
          ...paint(x, 0.5),
          roughness: 0.35,
        }),
      );
    }
    // the pier it stands on in the water
    built.push(
      gen.rectangle(mid - 23, sea - 9, 46, 10, hatch(PENCIL, 60, 2.4)),
    );

    const roll = dice(41);
    const water: Drawable[] = [];
    for (let x = 20; x < 600; x += 34 + roll() * 50) {
      const y = sea - 2 + roll() * 6;
      water.push(
        gen.curve(
          [
            [n(x), n(y)],
            [n(x + 5), n(y - 1.6)],
            [n(x + 10), n(y)],
            [n(x + 15), n(y - 1.6)],
            [n(x + 20), n(y)],
          ],
          pen(BLUE, Math.round(x), 1),
        ),
      );
    }
    // a sailing boat out on the bay
    const boat = (x: number, seed: number) => [
      gen.path(
        `M ${x - 9} ${sea - 6} L ${x + 9} ${sea - 6} L ${x + 6} ${sea - 2} L ${x - 6} ${sea - 2} Z`,
        hatch(BLUE, seed, 1.6),
      ),
      gen.line(x, sea - 6, x, sea - 27, pen(PENCIL, seed + 1, 1)),
      gen.polygon(
        [
          [x + 1.5, sea - 26],
          [x + 11, sea - 9],
          [x + 1.5, sea - 9],
        ],
        pen(PENCIL, seed + 2, 1),
      ),
      gen.polygon(
        [
          [x - 1.5, sea - 22],
          [x - 8, sea - 9],
          [x - 1.5, sea - 9],
        ],
        pen(PENCIL, seed + 3, 1),
      ),
    ];
    // alcatraz, far out: the rock, the cell house, the lighthouse, the tank
    const rock = (x: number) => [
      gen.curve(
        [
          [x - 44, sea - 8],
          [x - 30, sea - 15],
          [x - 8, sea - 18],
          [x + 16, sea - 17],
          [x + 34, sea - 13],
          [x + 46, sea - 8],
        ],
        pen(PENCIL, 90, 1.1),
      ),
      gen.rectangle(x - 16, sea - 24, 30, 6.5, pen(PENCIL, 91, 1)),
      gen.line(x + 19, sea - 17, x + 19, sea - 33, pen(PENCIL, 92, 1.1)),
      gen.circle(x + 19, sea - 34, 2.6, hatch(YELLOW, 93, 1)),
      gen.line(x - 27, sea - 15, x - 27, sea - 25, pen(PENCIL, 94, 0.9)),
      gen.rectangle(x - 30, sea - 29, 6, 4, pen(PENCIL, 95, 0.9)),
    ];
    return {
      tall,
      ground,
      strips: [
        {
          // the headlands across the water
          wide: 1600,
          drift: 0.03,
          art: (
            <Paths
              shapes={[
                ridge(
                  1600,
                  tall,
                  (x) =>
                    50 +
                    13 * Math.sin((WAVE * x) / 800 + 1) +
                    7 * Math.sin((WAVE * x) / (1600 / 3) + 2.2),
                  PENCIL,
                  3,
                ),
              ]}
            />
          ),
        },
        {
          wide: 1300,
          drift: 0.1,
          art: (
            <Paths
              shapes={[...boat(300, 70), ...rock(640), ...boat(1040, 80)]}
            />
          ),
        },
        { wide: 600, drift: 0.3, art: <Paths shapes={water} /> },
        { wide: span, drift: 1, art: <Paths shapes={built} /> },
      ],
    };
  },

  grass() {
    const tall = 70;
    const ground = 7;
    const floor = tall - ground;
    const row = (
      wide: number,
      seed: number,
      every: number,
      short: number,
      long: number,
      heads: boolean,
    ) => {
      const roll = dice(seed);
      const blades: Drawable[] = [];
      for (let x = 4; x < wide - 2; x += every * (0.6 + roll() * 0.8)) {
        const high = short + roll() ** 1.6 * (long - short);
        const lean = (roll() - 0.5) * high * 0.7;
        const tip: [number, number] = [n(x + lean), n(floor - high)];
        blades.push(
          gen.curve(
            [
              [n(x), floor + 1],
              [n(x + lean * 0.3), n(floor - high * 0.55)],
              tip,
            ],
            pen(roll() < 0.3 ? "#256f49" : GREEN, Math.round(x * 3), 1.1),
          ),
        );
        if (heads && high > long * 0.6 && roll() < 0.3) {
          const colour = BRIGHT[Math.floor(roll() * BRIGHT.length)];
          blades.push(
            gen.ellipse(tip[0], tip[1], 3.4, 5.4, {
              ...hatch(colour, Math.round(x), 1.4),
              fillStyle: "solid",
            }),
          );
        }
      }
      return blades;
    };
    return {
      tall,
      ground,
      strips: [
        {
          wide: 1000,
          drift: 0.82,
          art: <Paths shapes={row(1000, 5, 7, 9, 34, true)} />,
        },
        {
          wide: 1200,
          drift: 1,
          art: (
            <Paths
              shapes={[
                gen.line(-12, floor, 1212, floor, {
                  ...pen(PENCIL, 6),
                  bowing: 0.3,
                }),
              ]}
            />
          ),
        },
        {
          wide: 900,
          drift: 1.22,
          front: true,
          art: <Paths shapes={row(900, 9, 10, 4, 14, false)} />,
        },
      ],
    };
  },

  west() {
    const tall = 112;
    const ground = 8;
    const floor = tall - ground;
    const horizon = tall - 30;
    const roll = dice(23);
    const pick = (from: number, to: number) => from + roll() * (to - from);

    const far: Drawable[] = [
      gen.line(-12, horizon, 1512, horizon, {
        ...pen(PENCIL, 2, 1),
        bowing: 0.2,
      }),
    ];
    for (const [i, x] of [140, 640, 1090].entries()) {
      const w = pick(120, 210);
      const top = horizon - pick(26, 44);
      far.push(
        gen.polygon(
          [
            [x, horizon],
            [n(x + 14), n(top + 9)],
            [n(x + 20), n(top)],
            [n(x + w - 22), n(top + 1)],
            [n(x + w - 13), n(top + 11)],
            [n(x + w), horizon],
          ],
          hatch(ORANGE, 30 + i, 3),
        ),
      );
      // a thin spire standing off to one side of it
      if (i !== 1) {
        const sx = x + w + pick(26, 50);
        far.push(
          gen.polygon(
            [
              [n(sx), horizon],
              [n(sx + 3), n(top + 14)],
              [n(sx + 9), n(top + 14)],
              [n(sx + 12), horizon],
            ],
            hatch(ORANGE, 40 + i, 3),
          ),
        );
      }
    }

    const mid: Drawable[] = [];
    for (let x = 70; x < 1040; x += pick(130, 260)) {
      const foot = tall - 15;
      const high = pick(22, 34);
      const seed = Math.round(x);
      const arm = (side: number, up: number, reach: number) =>
        gen.path(
          `M ${n(x + side * 3)} ${n(foot - up)} L ${n(x + side * reach)} ${n(foot - up)} L ${n(x + side * reach)} ${n(foot - up - 8)}`,
          pen(GREEN, seed + side, 2.4),
        );
      mid.push(
        gen.rectangle(
          n(x - 3.2),
          n(foot - high),
          6.4,
          n(high),
          hatch(GREEN, seed, 1.8),
        ),
        arm(-1, high * 0.42, 9),
        arm(1, high * 0.58, 8),
      );
    }

    const front: Drawable[] = [
      gen.line(-12, floor, 1212, floor, { ...pen(PENCIL, 7), bowing: 0.3 }),
    ];
    for (let x = 30; x < 1170; x += pick(60, 150)) {
      const seed = Math.round(x);
      if (roll() < 0.4) {
        front.push(
          gen.ellipse(n(x), floor - 1.6, pick(4, 8), 3.4, pen(PENCIL, seed, 1)),
        );
      } else {
        for (let i = 0; i < 3; i++) {
          const lean = pick(-5, 5);
          front.push(
            gen.line(
              n(x + i * 2.4),
              floor + 1,
              n(x + i * 2.4 + lean),
              n(floor - pick(5, 10)),
              pen(YELLOW, seed + i, 1.1),
            ),
          );
        }
      }
    }

    return {
      tall,
      ground,
      still: (
        <svg className="scene-still" viewBox="0 0 40 40" aria-hidden="true">
          <Paths shapes={[gen.circle(20, 20, 28, hatch(YELLOW, 4, 2.4))]} />
        </svg>
      ),
      strips: [
        { wide: 1500, drift: 0.04, art: <Paths shapes={far} /> },
        { wide: 1100, drift: 0.3, art: <Paths shapes={mid} /> },
        { wide: 1200, drift: 1, art: <Paths shapes={front} /> },
      ],
    };
  },

  world() {
    const tall = 120;
    const ground = 8;
    const floor = tall - ground;
    const foot = tall - 22; // where the sights stand, back from the road
    const far: Drawable[] = [
      gen.line(-12, foot, 2112, foot, { ...pen(PENCIL, 2, 1), bowing: 0.2 }),
    ];
    // the pyramids
    const pyramid = (x: number, w: number, h: number, seed: number) =>
      gen.polygon(
        [
          [x, foot],
          [x + w / 2, foot - h],
          [x + w, foot],
        ],
        hatch(YELLOW, seed, 2.6),
      );
    far.push(pyramid(170, 54, 33, 3), pyramid(110, 76, 47, 4));
    // the eiffel tower
    const e = 440;
    far.push(
      gen.path(
        `M ${e - 18} ${foot} Q ${e - 5} ${foot - 27} ${e - 1.6} ${foot - 68} L ${e + 1.6} ${foot - 68} Q ${e + 5} ${foot - 27} ${e + 18} ${foot}`,
        pen(BLUE, 5, 1.4),
      ),
      gen.line(e - 11.5, foot - 17, e + 11.5, foot - 17, pen(BLUE, 6, 1.4)),
      gen.line(e - 6, foot - 37, e + 6, foot - 37, pen(BLUE, 7, 1.3)),
      gen.path(
        `M ${e - 11} ${foot} Q ${e} ${foot - 17} ${e + 11} ${foot}`,
        pen(BLUE, 8, 1),
      ),
      gen.line(e, foot - 68, e, foot - 77, pen(BLUE, 9, 1)),
    );
    // a torii gate
    const t = 720;
    far.push(
      gen.line(t - 12, foot, t - 10, foot - 31, pen(ORANGE, 10, 2.3)),
      gen.line(t + 12, foot, t + 10, foot - 31, pen(ORANGE, 11, 2.3)),
      gen.path(
        `M ${t - 20} ${foot - 35} Q ${t} ${foot - 30} ${t + 20} ${foot - 35}`,
        pen(ORANGE, 12, 2.8),
      ),
      gen.line(t - 14, foot - 24, t + 14, foot - 24, pen(ORANGE, 13, 1.8)),
    );
    // big ben
    const b = 980;
    far.push(
      gen.rectangle(b - 6, foot - 52, 12, 52, hatch(VIOLET, 14, 2.6)),
      gen.rectangle(b - 7.5, foot - 67, 15, 15, pen(VIOLET, 15, 1.2)),
      gen.circle(b, foot - 59.5, 9.5, pen(VIOLET, 16, 1.1)),
      gen.polygon(
        [
          [b - 7.5, foot - 67],
          [b, foot - 84],
          [b + 7.5, foot - 67],
        ],
        hatch(VIOLET, 17, 2),
      ),
    );
    // a windmill
    const w = 1250;
    far.push(
      gen.polygon(
        [
          [w - 10, foot],
          [w - 6, foot - 34],
          [w + 6, foot - 34],
          [w + 10, foot],
        ],
        hatch(PINK, 18, 2.4),
      ),
      gen.polygon(
        [
          [w - 7, foot - 34],
          [w, foot - 43],
          [w + 7, foot - 34],
        ],
        pen(PINK, 19, 1.2),
      ),
    );
    for (let k = 0; k < 4; k++) {
      const a = 0.5 + (k * Math.PI) / 2;
      far.push(
        gen.line(
          w,
          foot - 38,
          n(w + Math.cos(a) * 25),
          n(foot - 38 + Math.sin(a) * 25),
          pen("#5a5a5a", 20 + k, 1.3),
        ),
      );
    }
    // the taj mahal
    const j = 1530;
    far.push(
      gen.rectangle(j - 22, foot - 20, 44, 20, pen(PENCIL, 30, 1.2)),
      gen.ellipse(j, foot - 30, 25, 27, hatch(BLUE, 31, 2.6)),
      gen.line(j, foot - 43, j, foot - 53, pen(BLUE, 32, 1)),
      gen.path(
        `M ${j - 5} ${foot} L ${j - 5} ${foot - 9} Q ${j} ${foot - 17} ${j + 5} ${foot - 9} L ${j + 5} ${foot}`,
        pen(PENCIL, 33, 1),
      ),
    );
    for (const side of [-33, 33]) {
      far.push(
        gen.line(
          j + side,
          foot,
          j + side,
          foot - 38,
          pen(PENCIL, 34 + side, 1.6),
        ),
        gen.circle(j + side, foot - 40, 5, hatch(BLUE, 35 + side, 1.6)),
      );
    }
    // and a couple of palms
    const palm = (x: number, h: number, seed: number) => {
      const out = [
        gen.curve(
          [
            [x, foot],
            [x + 4, n(foot - h * 0.5)],
            [x + 1, foot - h],
          ],
          pen("#8a6a3a", seed, 1.6),
        ),
      ];
      for (let k = 0; k < 6; k++) {
        const a = -2.9 + k * 0.56;
        out.push(
          gen.curve(
            [
              [x + 1, foot - h],
              [n(x + 1 + Math.cos(a) * 9), n(foot - h + Math.sin(a) * 8 - 2)],
              [n(x + 1 + Math.cos(a) * 16), n(foot - h + Math.sin(a) * 8 + 5)],
            ],
            pen(GREEN, seed + k, 1.3),
          ),
        );
      }
      return out;
    };
    far.push(...palm(1810, 38, 50), ...palm(1845, 28, 60));

    const roll = dice(29);
    const front: Drawable[] = [
      gen.line(-12, floor, 1212, floor, { ...pen(PENCIL, 7), bowing: 0.3 }),
    ];
    for (let x = 30; x < 1170; x += 60 + roll() * 110) {
      for (let i = 0; i < 3; i++) {
        front.push(
          gen.line(
            n(x + i * 2.4),
            floor + 1,
            n(x + i * 2.4 + (roll() - 0.5) * 9),
            n(floor - 5 - roll() * 6),
            pen(GREEN, Math.round(x) + i, 1.1),
          ),
        );
      }
    }
    return {
      tall,
      ground,
      // a hot air balloon, which hangs where it is
      still: (
        <svg className="scene-still" viewBox="0 0 40 40" aria-hidden="true">
          <Paths
            shapes={[
              gen.ellipse(20, 14, 24, 26, hatch(PINK, 4, 2.2)),
              gen.line(11, 22, 17, 33, pen(PENCIL, 5, 0.8)),
              gen.line(29, 22, 23, 33, pen(PENCIL, 6, 0.8)),
              gen.rectangle(17, 33, 6, 5, pen("#8a6a3a", 7, 1.1)),
            ]}
          />
        </svg>
      ),
      strips: [
        { wide: 2100, drift: 0.14, art: <Paths shapes={far} /> },
        { wide: 1200, drift: 1, art: <Paths shapes={front} /> },
      ],
    };
  },

  city() {
    const tall = 124;
    const ground = 9;
    const floor = tall - ground;
    const foot = tall - 21;
    const far: Drawable[] = [
      gen.line(-12, foot, 1812, foot, { ...pen(PENCIL, 2, 1), bowing: 0.2 }),
    ];
    // a row of painted ladies
    const houses = (x: number, count: number, seed: number) => {
      for (let i = 0; i < count; i++) {
        const hx = x + i * 21;
        const colour = BRIGHT[(i + seed) % BRIGHT.length];
        far.push(
          gen.rectangle(hx, foot - 25, 19, 25, hatch(colour, seed + i, 2.6)),
          gen.polygon(
            [
              [hx - 1, foot - 25],
              [hx + 9.5, foot - 38],
              [hx + 20, foot - 25],
            ],
            pen(colour, seed + i + 10, 1.2),
          ),
          gen.rectangle(
            hx + 6.5,
            foot - 9,
            6,
            9,
            pen("#5a5a5a", seed + i + 20, 0.9),
          ),
        );
      }
    };
    houses(70, 5, 1);
    // the transamerica pyramid
    const p = 330;
    far.push(
      gen.polygon(
        [
          [p - 13, foot],
          [p, foot - 80],
          [p + 13, foot],
        ],
        hatch(BLUE, 30, 3),
      ),
      gen.line(p, foot - 80, p, foot - 91, pen(BLUE, 31, 1)),
      gen.rectangle(p - 9.5, foot - 40, 3, 13, pen(BLUE, 32, 1)),
      gen.rectangle(p + 6.5, foot - 40, 3, 13, pen(BLUE, 33, 1)),
    );
    // salesforce tower, round at the top
    const sf = 440;
    far.push(
      gen.path(
        `M ${sf - 10} ${foot} L ${sf - 10} ${foot - 56} Q ${sf - 10} ${foot - 74} ${sf} ${foot - 74} Q ${sf + 10} ${foot - 74} ${sf + 10} ${foot - 56} L ${sf + 10} ${foot} Z`,
        hatch(VIOLET, 34, 3),
      ),
    );
    // some ordinary blocks downtown
    for (const [i, [x, w, h]] of [
      [500, 16, 34],
      [522, 20, 48],
      [548, 14, 28],
      [568, 18, 40],
    ].entries()) {
      far.push(gen.rectangle(x, foot - h, w, h, pen(PENCIL, 40 + i, 1.1)));
      for (let y = foot - h + 6; y < foot - 4; y += 7) {
        far.push(
          gen.line(x + 3, y, x + w - 3, y, {
            ...pen(PENCIL, 50 + i + y, 0.7),
            roughness: 0.4,
          }),
        );
      }
    }
    // coit tower on its hill
    const c = 780;
    far.push(
      gen.path(
        `M ${c - 70} ${foot} Q ${c} ${foot - 30} ${c + 70} ${foot}`,
        pen(GREEN, 60, 1.3),
      ),
      gen.rectangle(c - 4.5, foot - 49, 9, 34, hatch(YELLOW, 61, 2.4)),
      gen.rectangle(c - 5.5, foot - 55, 11, 6, pen(YELLOW, 62, 1.1)),
    );
    // sutro tower, three prongs
    const u = 1010;
    far.push(
      gen.path(
        `M ${u - 60} ${foot} Q ${u} ${foot - 22} ${u + 60} ${foot}`,
        pen(GREEN, 63, 1.3),
      ),
    );
    for (const side of [-1, 0, 1]) {
      far.push(
        gen.line(
          u + side * 8,
          foot - 11,
          u + side * 4,
          foot - 84,
          pen(ORANGE, 70 + side, 1.3),
        ),
      );
    }
    for (const [i, [y, half]] of [
      [foot - 30, 8],
      [foot - 52, 7],
      [foot - 70, 9],
    ].entries()) {
      far.push(gen.line(u - half, y, u + half, y, pen(ORANGE, 74 + i, 1.2)));
    }
    // the campanile, over in berkeley
    const k = 1240;
    far.push(
      gen.rectangle(k - 5, foot - 66, 10, 66, hatch(YELLOW, 80, 2.6)),
      gen.rectangle(k - 6, foot - 74, 12, 8, pen(BLUE, 81, 1.2)),
      gen.polygon(
        [
          [k - 6, foot - 74],
          [k, foot - 90],
          [k + 6, foot - 74],
        ],
        hatch(BLUE, 82, 1.8),
      ),
      gen.circle(k, foot - 58, 5.5, pen(BLUE, 83, 1)),
    );
    houses(1400, 6, 3);
    far.push(gen.rectangle(1600, foot - 44, 22, 44, pen(PENCIL, 90, 1.1)));
    far.push(gen.rectangle(1630, foot - 30, 18, 30, pen(PENCIL, 91, 1.1)));

    // a cable car coming the other way
    const road = tall - 11;
    const car = 320;
    const mid: Drawable[] = [
      gen.rectangle(car, road - 14, 36, 11, hatch(ORANGE, 100, 1.8)),
      gen.line(car - 2, road - 18, car + 38, road - 18, pen(ORANGE, 101, 1.6)),
      gen.circle(car + 8, road - 2, 4, pen("#5a5a5a", 102, 1.1)),
      gen.circle(car + 28, road - 2, 4, pen("#5a5a5a", 103, 1.1)),
    ];
    for (let i = 0; i < 5; i++) {
      mid.push(
        gen.line(car + 2 + i * 8, road - 18, car + 2 + i * 8, road - 14, {
          ...pen(ORANGE, 104 + i, 1),
          roughness: 0.4,
        }),
      );
    }
    // and street trees
    for (const [i, x] of [640, 930, 1180].entries()) {
      mid.push(
        gen.line(x, road, x + 0.5, road - 13, pen("#8a6a3a", 110 + i, 1.4)),
        gen.circle(x, road - 19, 15, hatch(GREEN, 113 + i, 2.2)),
      );
    }

    const front: Drawable[] = [
      gen.line(-12, floor, 1212, floor, { ...pen(PENCIL, 7), bowing: 0.3 }),
    ];
    // the line down the middle of the road
    for (let x = 10; x < 1200; x += 48) {
      front.push(
        gen.line(x, floor + 4.5, x + 20, floor + 4.5, {
          ...pen(YELLOW, x, 1.5),
          roughness: 0.5,
        }),
      );
    }
    return {
      tall,
      ground,
      strips: [
        { wide: 1800, drift: 0.12, art: <Paths shapes={far} /> },
        { wide: 1400, drift: 0.42, art: <Paths shapes={mid} /> },
        { wide: 1200, drift: 1, art: <Paths shapes={front} /> },
      ],
    };
  },

  moon() {
    const tall = 114;
    const ground = 10;
    const floor = tall - ground;
    const roll = dice(57);
    const pick = (from: number, to: number) => from + roll() * (to - from);

    const stars = [];
    for (let i = 0; i < 34; i++) {
      const x = n(pick(10, 890));
      const y = n(pick(4, 62));
      const colour = [BLUE, YELLOW, PINK, VIOLET][i % 4];
      if (i % 5 === 0) {
        // a few of them twinkle: four points
        const r = pick(3, 4.6);
        stars.push(
          <path
            key={i}
            d={`M ${x} ${n(y - r)} Q ${x} ${y} ${n(x + r)} ${y} Q ${x} ${y} ${x} ${n(y + r)} Q ${x} ${y} ${n(x - r)} ${y} Q ${x} ${y} ${x} ${n(y - r)} Z`}
            fill={YELLOW}
          />,
        );
      } else {
        stars.push(
          <circle key={i} cx={x} cy={y} r={n(pick(0.8, 1.6))} fill={colour} />,
        );
      }
    }
    const planet = [
      gen.circle(640, 26, 17, hatch(VIOLET, 3, 2)),
      gen.ellipse(640, 26, 32, 8, pen(ORANGE, 4, 1.1)),
    ];

    const base = tall - 16;
    const mid: Drawable[] = [];
    // the lander
    const l = 250;
    mid.push(
      gen.polygon(
        [
          [l - 9, base - 9],
          [l - 6, base - 19],
          [l + 6, base - 19],
          [l + 9, base - 9],
        ],
        hatch(YELLOW, 10, 1.8),
      ),
      gen.line(l - 8, base - 9, l - 14, base, pen(PENCIL, 11, 1.2)),
      gen.line(l + 8, base - 9, l + 14, base, pen(PENCIL, 12, 1.2)),
      gen.line(l + 3, base - 19, l + 9, base - 27, pen(PENCIL, 13, 1)),
      gen.circle(l + 10, base - 28, 5, pen(PENCIL, 14, 1)),
    );
    // a flag
    const f = 520;
    mid.push(
      gen.line(f, base, f, base - 26, pen(PENCIL, 20, 1.2)),
      gen.rectangle(f + 0.5, base - 26, 15, 9, hatch(PINK, 21, 1.8)),
    );
    // a rocket, standing ready
    const r = 880;
    mid.push(
      gen.path(
        `M ${r - 6} ${base - 6} L ${r - 6} ${base - 30} Q ${r} ${base - 46} ${r + 6} ${base - 30} L ${r + 6} ${base - 6} Z`,
        hatch(BLUE, 30, 2),
      ),
      gen.polygon(
        [
          [r - 6, base - 16],
          [r - 13, base],
          [r - 6, base - 5],
        ],
        hatch(ORANGE, 31, 1.6),
      ),
      gen.polygon(
        [
          [r + 6, base - 16],
          [r + 13, base],
          [r + 6, base - 5],
        ],
        hatch(ORANGE, 32, 1.6),
      ),
      gen.circle(r, base - 27, 5.5, pen("#ffffff", 33, 1.4)),
    );
    // and a rover
    const v = 1120;
    mid.push(
      gen.rectangle(v - 10, base - 10, 20, 6, hatch(ORANGE, 40, 1.8)),
      gen.circle(v - 7, base - 2.5, 5, pen("#5a5a5a", 41, 1.1)),
      gen.circle(v + 7, base - 2.5, 5, pen("#5a5a5a", 42, 1.1)),
      gen.line(v + 6, base - 10, v + 9, base - 18, pen(PENCIL, 43, 1)),
    );

    const front: Drawable[] = [
      gen.line(-12, floor, 1212, floor, { ...pen(PENCIL, 7), bowing: 0.4 }),
    ];
    for (let x = 30; x < 1170; x += pick(50, 130)) {
      front.push(
        gen.ellipse(
          n(x),
          floor + 3,
          n(pick(10, 26)),
          4.2,
          pen(PENCIL, Math.round(x), 1),
        ),
      );
    }
    return {
      tall,
      ground,
      // the earth, hanging in the sky
      still: (
        <svg className="scene-still" viewBox="0 0 40 40" aria-hidden="true">
          <Paths
            shapes={[
              gen.circle(20, 20, 30, hatch(BLUE, 4, 2)),
              gen.ellipse(15, 15, 11, 8, hatch(GREEN, 5, 1.6)),
              gen.ellipse(25, 26, 9, 6, hatch(GREEN, 6, 1.6)),
            ]}
          />
        </svg>
      ),
      strips: [
        {
          wide: 900,
          drift: 0.015,
          art: (
            <>
              {stars}
              <Paths shapes={planet} />
            </>
          ),
        },
        {
          wide: 1500,
          drift: 0.06,
          art: (
            <Paths
              shapes={[
                ridge(
                  1500,
                  tall,
                  (x) =>
                    26 +
                    6 * Math.sin((WAVE * x) / 500 + 1) +
                    4 * Math.sin((WAVE * x) / 300 + 2.2),
                  PENCIL,
                  3,
                ),
              ]}
            />
          ),
        },
        { wide: 1300, drift: 0.3, art: <Paths shapes={mid} /> },
        { wide: 1200, drift: 1, art: <Paths shapes={front} /> },
      ],
    };
  },

  garden() {
    const tall = 114;
    const ground = 8;
    const floor = tall - ground;
    const base = tall - 14;

    // clipped hedges at the back, with a cypress in each gap
    const far: Drawable[] = [];
    for (const [i, [x, len]] of [
      [30, 190],
      [300, 160],
      [540, 220],
      [840, 170],
    ].entries()) {
      far.push(gen.rectangle(x, base - 13, len, 13, hatch(GREEN, 10 + i, 4.2)));
      far.push(
        gen.ellipse(
          x + len + 40,
          base - 21,
          11,
          42,
          hatch("#256f49", 20 + i, 2),
        ),
      );
    }

    const pot = (x: number, seed: number) =>
      gen.polygon(
        [
          [x - 5, base - 8],
          [x + 5, base - 8],
          [x + 3.5, base],
          [x - 3.5, base],
        ],
        hatch(ORANGE, seed, 1.6),
      );
    const mid: Drawable[] = [];
    // the fountain, as in my private garden
    const f = 200;
    mid.push(
      gen.ellipse(f, base - 3, 46, 8, pen("#5a5a5a", 30, 1.2)),
      gen.line(f, base - 6, f, base - 30, pen("#5a5a5a", 31, 1.6)),
      gen.ellipse(f, base - 18, 25, 5, pen("#5a5a5a", 32, 1.1)),
      gen.ellipse(f, base - 29, 12, 3.4, pen("#5a5a5a", 33, 1)),
    );
    for (const side of [-1, 1]) {
      mid.push(
        gen.path(
          `M ${f} ${base - 36} Q ${f + side * 9} ${base - 40} ${f + side * 11} ${base - 20}`,
          pen(BLUE, 34 + side, 1.1),
        ),
        gen.path(
          `M ${f + side * 11} ${base - 17} Q ${f + side * 20} ${base - 18} ${f + side * 20} ${base - 5}`,
          pen(BLUE, 36 + side, 1.1),
        ),
      );
    }
    // a ball topiary, two balls on a stem
    const b = 430;
    mid.push(
      pot(b, 40),
      gen.line(b, base - 8, b, base - 30, pen("#8a6a3a", 41, 1.3)),
      gen.circle(b, base - 22, 16, hatch(GREEN, 42, 2)),
      gen.circle(b, base - 37, 11, hatch(GREEN, 43, 2)),
    );
    // an arch of roses
    const a = 650;
    mid.push(
      gen.path(
        `M ${a - 17} ${base} L ${a - 17} ${base - 26} Q ${a} ${base - 50} ${a + 17} ${base - 26} L ${a + 17} ${base}`,
        pen(GREEN, 50, 1.7),
      ),
    );
    for (let i = 0; i < 11; i++) {
      const q = i / 10;
      const ang = Math.PI * (1 - q);
      const rx = q < 0.18 || q > 0.82 ? 17 : 17;
      const x = a + Math.cos(ang) * rx;
      const y =
        q < 0.18
          ? base - 26 * (q / 0.18)
          : q > 0.82
            ? base - 26 * ((1 - q) / 0.18)
            : base - 26 - Math.sin(((q - 0.18) / 0.64) * Math.PI) * 12;
      mid.push(
        gen.circle(n(x), n(y), 5, {
          ...hatch(i % 2 ? PINK : ORANGE, 51 + i, 1.4),
          fillStyle: "solid",
        }),
      );
    }
    // a cone
    const c = 860;
    mid.push(
      pot(c, 60),
      gen.polygon(
        [
          [c - 9, base - 8],
          [c, base - 44],
          [c + 9, base - 8],
        ],
        hatch(GREEN, 61, 2),
      ),
    );
    // an urn of flowers on a plinth
    const u = 1050;
    mid.push(
      gen.rectangle(u - 6, base - 10, 12, 10, pen("#5a5a5a", 70, 1.1)),
      gen.path(
        `M ${u - 7} ${base - 22} Q ${u - 8} ${base - 12} ${u} ${base - 10} Q ${u + 8} ${base - 12} ${u + 7} ${base - 22} Z`,
        pen("#5a5a5a", 71, 1.2),
      ),
    );
    for (const [i, [dx, up, colour]] of (
      [
        [-6, 34, YELLOW],
        [0, 40, PINK],
        [6, 33, VIOLET],
      ] as [number, number, string][]
    ).entries()) {
      mid.push(
        gen.line(
          u + dx * 0.4,
          base - 22,
          u + dx,
          base - up,
          pen(GREEN, 72 + i, 1),
        ),
        gen.circle(u + dx, base - up, 6.5, {
          ...hatch(colour, 75 + i, 1.4),
          fillStyle: "solid",
        }),
      );
    }
    // and a tiered one, three shelves
    const t = 1230;
    mid.push(
      pot(t, 80),
      gen.line(t, base - 8, t, base - 44, pen("#8a6a3a", 81, 1.3)),
      gen.ellipse(t, base - 16, 20, 9, hatch(GREEN, 82, 2)),
      gen.ellipse(t, base - 29, 15, 8, hatch(GREEN, 83, 2)),
      gen.ellipse(t, base - 41, 10, 7, hatch(GREEN, 84, 2)),
    );

    // the gravel path she's on, with the meadow's flowers along its edge
    const roll = dice(31);
    const small = 0.5;
    const flowers = [];
    let i = 0;
    for (let x = 40; x < 1170; x += 50 + roll() * 90) {
      const made = flower(700 + i++, Math.round(34 + roll() * 26));
      flowers.push({
        shapes: made.shapes,
        place: `translate(${n(x - (FLOWER / 2) * small)} ${n(floor + 1 - made.tall * small)}) scale(${small})`,
      });
    }
    return {
      tall,
      ground,
      strips: [
        { wide: 1200, drift: 0.14, art: <Paths shapes={far} /> },
        { wide: 1400, drift: 0.32, art: <Paths shapes={mid} /> },
        {
          wide: 1200,
          drift: 1,
          art: (
            <>
              <Paths
                shapes={[
                  gen.line(-12, floor, 1212, floor, {
                    ...pen(PENCIL, 7),
                    bowing: 0.3,
                  }),
                ]}
              />
              {flowers.map((fl) => (
                <g key={fl.place} transform={fl.place}>
                  <Paths shapes={fl.shapes} />
                </g>
              ))}
            </>
          ),
        },
      ],
    };
  },
};

export function Scene({ name, show }: { name: SceneName; show: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const riderRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const built = useMemo(() => BUILD[name](), [name]);

  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;
    const watch = new ResizeObserver(() => setWidth(scene.clientWidth));
    watch.observe(scene);
    return () => watch.disconnect();
  }, []);

  useEffect(() => {
    const scene = ref.current;
    const rider = riderRef.current;
    const horse = rider?.querySelector<HTMLElement>(".horse");
    if (!show || !width || !scene || !rider || !horse) return;

    const chip = rider.querySelector<HTMLElement>(".rider-chip");
    let shown = -1;
    const frame = (i: number) => {
      if (i === shown) return;
      shown = i;
      horse.style.backgroundPositionX = `${(i / GALLOP) * 100}%`;
      // each picture gets its own printing of the ink, so the grain belongs
      // to her and isn't a still screen she's moving behind
      horse.style.filter = `url(#tx-horse-${i % INKS})`;
      if (chip)
        chip.dataset.frame = String(Math.min(i, GALLOP - 1) + 1).padStart(
          2,
          "0",
        );
    };
    const wide = horse.offsetWidth;
    const mark = Math.max(14, width * 0.3 - wide / 2); // where she runs
    rider.dataset.here = "";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // no galloping: she stands and looks at the view
      frame(GALLOP);
      rider.style.translate = `${mark.toFixed(1)}px`;
      return;
    }

    // the ground goes by at exactly the pace of her legs
    const speed = (wide * STRIDE * PACE) / 1000; // px per ms
    // measured once: how far each strip slides before it repeats
    const laps = [...scene.querySelectorAll<HTMLElement>(".scene-strip")].map(
      (strip) => ({
        strip,
        lap: (strip.firstElementChild as Element).getBoundingClientRect().width,
        drift: Number(strip.dataset.drift),
      }),
    );
    const arrive = 2200; // she comes in from the left edge first
    let raf = 0;
    const began = performance.now();
    const step = (now: number) => {
      const t = now - began;
      const gone = t * speed;
      for (const { strip, lap, drift } of laps) {
        strip.style.translate = `${(-((gone * drift) % lap)).toFixed(1)}px`;
      }
      // coming in, she also covers the ground between the edge and her mark
      const in01 = Math.min(1, t / arrive);
      const come = (mark + wide) * (1 - (1 - in01) ** 2.2);
      rider.style.translate = `${(come - wide).toFixed(1)}px`;
      frame(Math.floor(((gone + come) / (wide * STRIDE)) * GALLOP) % GALLOP);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      delete rider.dataset.here;
    };
  }, [show, width]);

  const strip = (s: Strip, key: number) => (
    <div
      key={key}
      className="scene-strip"
      data-drift={s.drift}
      data-blend={s.blend ? "" : undefined}
    >
      {Array.from(
        { length: width ? Math.ceil(width / (s.wide * 0.55)) + 1 : 0 },
        (_, i) => (
          <svg
            // biome-ignore lint/suspicious/noArrayIndexKey: identical copies side by side
            key={i}
            viewBox={`0 0 ${s.wide} ${built.tall}`}
            style={{ width: `calc(var(--u) * ${s.wide}px)` }}
            aria-hidden="true"
          >
            {s.art}
          </svg>
        ),
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="scene"
      data-scene={name}
      data-show={show ? "" : undefined}
      aria-hidden="true"
      style={
        {
          "--tall": built.tall,
          "--ground": built.ground,
        } as React.CSSProperties
      }
    >
      {built.still}
      {built.strips.map((s, i) => (s.front ? null : strip(s, i)))}
      <span ref={riderRef} className="rider" data-over={built.over}>
        <span className="horse" />
        {built.over === "frame" ? (
          <span className="rider-box">
            <i />
            <i />
            <i />
            <i />
          </span>
        ) : null}
        {built.over ? <span className="rider-chip" /> : null}
      </span>
      {built.strips.map((s, i) => (s.front ? strip(s, i) : null))}
    </div>
  );
}
