import { useEffect, useMemo, useRef, useState } from "react";
import type { Drawable } from "roughjs/bin/core";
import { gen, Paths } from "@/components/sketch";

/*
 * the second idea for the bottom of the window (?scene=hills): open country
 * for the horse instead of a meadow. golden hills a long way off, greener
 * ones nearer with oaks and cypresses on them, and a strip of ground with
 * tufts of grass. sallie gardner (muybridge's "the horse in motion", palo
 * alto, 1878, public domain) gallops on the spot while the country goes by
 * behind her, the far hills slowly and the ground at her own pace, which is
 * how she can run for ever without getting anywhere.
 *
 * drawn in the browser only: how much of it there is depends on the window.
 */

const TALL = 150; // every strip is drawn in a box this tall
const GROUND = 9; // how far up from the bottom she runs
const GALLOP = 11; // frames in her stride; the one after them is standing
const STRIDE = 2.7; // ground covered in one stride, in horse lengths
const PACE = 1; // strides a second

const WAVE = Math.PI * 2;

// each strip's skyline repeats exactly over its own width, so copies of it
// laid end to end join up
const FAR = {
  wide: 1600,
  drift: 0.035, // how fast it goes by, as a share of the ground's speed
  line: "#d3ad52",
  wash: "#f8efd0",
  at: (x: number) =>
    82 +
    26 * Math.sin((WAVE * x) / 800 + 1) +
    13 * Math.sin((WAVE * x) / (1600 / 3) + 2.2) +
    5 * Math.sin((WAVE * x) / 320),
};
const NEAR = {
  wide: 1400,
  drift: 0.13,
  line: "#7ea261",
  wash: "#e4eed2",
  at: (x: number) =>
    40 +
    15 * Math.sin((WAVE * x) / 700 + 0.5) +
    8 * Math.sin((WAVE * x) / (1400 / 3) + 4),
};
const FRONT = { wide: 1200, drift: 1 };

const LEAVES = ["#2f8f5b", "#256f49", "#6c8f33"];
const BLOOMS = ["#1f4fff", "#c8432b", "#fdb515", "#ef6aa5", "#7c4ddb"];

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

/** a line of hills: a flat wash of colour with a pencil line along the top */
function hills({ wide, at, line }: typeof FAR, seed: number) {
  let wash = `M -1 ${TALL}`;
  for (let x = -1; x <= wide + 1; x += 8) wash += ` L ${x} ${n(TALL - at(x))}`;
  wash += ` L ${wide + 1} ${TALL} Z`;
  // the line runs a little past both ends, so it overlaps the next copy's
  const top: [number, number][] = [];
  for (let x = -30; x <= wide + 30; x += 46) top.push([x, n(TALL - at(x))]);
  const drawn = gen.curve(top, {
    seed,
    roughness: 0.8,
    stroke: line,
    strokeWidth: 1.3,
  });
  return { wash, drawn };
}

/** oaks and cypresses standing on the nearer hills */
function trees() {
  const roll = dice(77);
  const shapes: Drawable[] = [];
  const pick = (from: number, to: number) => from + roll() * (to - from);
  for (let x = 60; x < NEAR.wide - 40; x += pick(95, 190)) {
    const foot = TALL - NEAR.at(x) + 2;
    const seed = Math.round(x);
    const leaf = LEAVES[Math.floor(roll() * LEAVES.length)];
    const pen = { seed, roughness: 0.9, strokeWidth: 1.1 };
    const filled = {
      ...pen,
      stroke: leaf,
      fill: leaf,
      fillStyle: "hachure",
      hachureGap: 2.4,
      fillWeight: 0.7,
      hachureAngle: Math.round(pick(-60, 60)),
    };
    if (roll() < 0.3) {
      // a cypress: tall and narrow
      const high = pick(30, 44);
      shapes.push(
        gen.line(n(x), n(foot), n(x), n(foot - 6), {
          ...pen,
          stroke: "#7a5a3a",
        }),
        gen.ellipse(n(x), n(foot - 4 - high / 2), pick(8, 11), n(high), filled),
      );
    } else {
      // an oak: a short trunk under a few round clumps of leaves
      const trunk = pick(9, 14);
      const size = pick(15, 22);
      shapes.push(
        gen.line(n(x - 1), n(foot), n(x - 0.5), n(foot - trunk), {
          ...pen,
          stroke: "#7a5a3a",
          strokeWidth: 1.6,
        }),
        gen.ellipse(
          n(x - size * 0.42),
          n(foot - trunk - size * 0.2),
          n(size),
          n(size * 0.8),
          filled,
        ),
        gen.ellipse(
          n(x + size * 0.42),
          n(foot - trunk - size * 0.25),
          n(size),
          n(size * 0.85),
          { ...filled, seed: seed + 1 },
        ),
        gen.ellipse(
          n(x),
          n(foot - trunk - size * 0.62),
          n(size * 1.05),
          n(size * 0.9),
          { ...filled, seed: seed + 2 },
        ),
      );
    }
  }
  return shapes;
}

/** the ground she runs on: a pencil line, tufts of grass, the odd flower */
function ground() {
  const roll = dice(31);
  const pick = (from: number, to: number) => from + roll() * (to - from);
  const floor = TALL - GROUND;
  const shapes: Drawable[] = [
    gen.line(-20, floor, FRONT.wide + 20, floor, {
      seed: 5,
      roughness: 1.1,
      bowing: 0.4,
      stroke: "#5a5a5a",
      strokeWidth: 1.2,
    }),
  ];
  for (let x = 30; x < FRONT.wide - 20; x += pick(46, 120)) {
    const seed = Math.round(x);
    for (let i = 0; i < 3; i++) {
      const lean = pick(-6, 6);
      shapes.push(
        gen.curve(
          [
            [n(x + i * 2.5), floor + 1],
            [n(x + i * 2.5 + lean * 0.4), n(floor - 5)],
            [n(x + i * 2.5 + lean), n(floor - pick(8, 15))],
          ],
          {
            seed: seed + i,
            roughness: 0.8,
            stroke: "#2f8f5b",
            strokeWidth: 1.1,
          },
        ),
      );
    }
    if (roll() < 0.3) {
      const bloom = BLOOMS[Math.floor(roll() * BLOOMS.length)];
      const top = n(floor - pick(13, 19));
      shapes.push(
        gen.line(n(x + 8), floor + 1, n(x + 9), top, {
          seed,
          roughness: 0.8,
          stroke: "#2f8f5b",
          strokeWidth: 1,
        }),
        gen.circle(n(x + 9), top, 5.2, {
          seed,
          roughness: 0.8,
          stroke: bloom,
          fill: bloom,
          fillStyle: "solid",
        }),
      );
    }
  }
  return shapes;
}

export function Range({ show }: { show: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const horseRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const size = () => setWidth(window.innerWidth);
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);

  const drawn = useMemo(
    () => ({
      far: hills(FAR, 3),
      near: hills(NEAR, 8),
      trees: trees(),
      ground: ground(),
    }),
    [],
  );

  useEffect(() => {
    const range = ref.current;
    const horse = horseRef.current;
    if (!show || !width || !range || !horse) return;
    const strips = [...range.querySelectorAll<HTMLElement>(".range-strip")];
    const frame = (i: number) => {
      horse.style.backgroundPositionX = `${(i / GALLOP) * 100}%`;
    };
    const wide = horse.offsetWidth;
    const mark = Math.max(14, width * 0.3 - wide / 2); // where she runs
    horse.dataset.here = "";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // no galloping: she stands and looks at the view
      frame(GALLOP);
      horse.style.translate = `${mark.toFixed(1)}px`;
      return;
    }

    // the ground goes by at exactly the pace of her legs
    const speed = (wide * STRIDE * PACE) / 1000; // px per ms
    // measured once: how far each strip slides before it repeats
    const laps = strips.map((strip) => ({
      strip,
      lap: (strip.firstElementChild as Element).getBoundingClientRect().width,
      drift: Number(strip.dataset.drift),
    }));
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
      horse.style.translate = `${(come - wide).toFixed(1)}px`;
      frame(Math.floor(((gone + come) / (wide * STRIDE)) * GALLOP) % GALLOP);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      delete horse.dataset.here;
    };
  }, [show, width]);

  const strip = (
    of: { wide: number; drift: number },
    name: string,
    art: React.ReactNode,
  ) => (
    <div className="range-strip" data-drift={of.drift}>
      {Array.from(
        { length: width ? Math.ceil(width / (of.wide * 0.55)) + 1 : 0 },
        (_, i) => (
          <svg
            // biome-ignore lint/suspicious/noArrayIndexKey: identical copies side by side
            key={`${name}-${i}`}
            viewBox={`0 0 ${of.wide} ${TALL}`}
            style={{ width: `calc(var(--u) * ${of.wide}px)` }}
            aria-hidden="true"
          >
            {art}
          </svg>
        ),
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="range"
      data-show={show ? "" : undefined}
      aria-hidden="true"
    >
      {strip(
        FAR,
        "far",
        <>
          <path d={drawn.far.wash} fill={FAR.wash} />
          <Paths shapes={[drawn.far.drawn]} />
        </>,
      )}
      {strip(
        NEAR,
        "near",
        <>
          <path d={drawn.near.wash} fill={NEAR.wash} />
          <Paths shapes={[drawn.near.drawn]} />
          <Paths shapes={drawn.trees} />
        </>,
      )}
      <span ref={horseRef} className="horse" />
      {strip(FRONT, "front", <Paths shapes={drawn.ground} />)}
    </div>
  );
}
