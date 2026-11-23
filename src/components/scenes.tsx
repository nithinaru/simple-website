import { useEffect, useMemo, useRef, useState } from "react";
import type { Drawable } from "roughjs/bin/core";
import { gen, Paths } from "@/components/sketch";

/*
 * somewhere for the horse to run, along the bottom of the window. sallie
 * gardner (eadweard muybridge's "the horse in motion", palo alto, 19 june
 * 1878, long in the public domain) gallops on the spot while the scene goes
 * by behind her, far things slowly and the ground at exactly the pace of her
 * legs, which is how she can run for ever without getting anywhere.
 *
 * six scenes to choose between (see them all at /scenes, or one on the front
 * page with ?scene=name). each is a few strips that repeat end to end.
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
  | "west";

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
    const tall = 124;
    const ground = 17;
    const floor = tall - ground;
    const span = 900; // tower to tower
    const mid = span / 2;
    const top = 12;
    const low = floor - 12;
    const cable = (x: number) => top + (low - top) * ((x - mid) / mid) ** 2;
    const built: Drawable[] = [
      // the deck she runs on
      gen.line(-12, floor + 1, span + 12, floor + 1, pen(ORANGE, 1, 1.5)),
      gen.line(-12, floor + 5, span + 12, floor + 5, pen(ORANGE, 2, 1)),
      // a tower: two legs and the braces between them
      gen.line(mid - 7, floor + 1, mid - 6, top - 3, pen(ORANGE, 3, 1.6)),
      gen.line(mid + 7, floor + 1, mid + 6, top - 3, pen(ORANGE, 4, 1.6)),
    ];
    for (const [i, y] of [top, 30, 50, 72].entries()) {
      built.push(gen.rectangle(mid - 7, y, 14, 5, pen(ORANGE, 10 + i, 1.1)));
    }
    // the cable swings down from the tower to the middle of each span
    for (const [from, to] of [
      [0, mid],
      [mid, span],
    ]) {
      const along: [number, number][] = [];
      for (let x = from; x <= to; x += 37.5) along.push([x, n(cable(x))]);
      built.push(gen.curve(along, pen(ORANGE, from + 5, 1.4)));
    }
    for (let x = 30; x < span; x += 30) {
      if (Math.abs(x - mid) < 12) continue;
      built.push(
        gen.line(x, n(cable(x)), x, floor + 1, {
          ...pen(ORANGE, x, 0.7),
          roughness: 0.5,
        }),
      );
    }
    const roll = dice(41);
    const water: Drawable[] = [];
    for (let x = 20; x < 600; x += 40 + roll() * 60) {
      const y = floor + 8 + roll() * (ground - 11);
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
    return {
      tall,
      ground,
      strips: [
        {
          wide: 1600,
          drift: 0.03,
          art: (
            <Paths
              shapes={[
                ridge(
                  1600,
                  tall,
                  (x) =>
                    46 +
                    13 * Math.sin((WAVE * x) / 800 + 1) +
                    7 * Math.sin((WAVE * x) / (1600 / 3) + 2.2),
                  PENCIL,
                  3,
                ),
              ]}
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
