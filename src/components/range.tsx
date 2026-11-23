import { useEffect, useMemo, useRef, useState } from "react";
import type { Drawable } from "roughjs/bin/core";
import { WIDE as FLOWER, draw as flower } from "@/components/meadow";
import { gen, Paths } from "@/components/sketch";

/*
 * the second idea for the bottom of the window (?scene=hills): a little open
 * country for the horse. it's drawn like everything else on the page, in
 * line on white with the colour scribbled in: a pencil line of hills a long
 * way off, a green one nearer with trees on it in the flowers' colours, and
 * the meadow's own flowers along the ground. sallie gardner (muybridge's
 * "the horse in motion", palo alto, 1878, public domain) gallops on the spot
 * while it goes by behind her, the far hills slowly and the ground at her
 * own pace, which is how she can run for ever without getting anywhere.
 *
 * drawn in the browser only: how much of it there is depends on the window.
 */

const TALL = 84; // every strip is drawn in a box this tall
const GROUND = 6; // how far up from the bottom she runs
const GALLOP = 11; // frames in her stride; the one after them is standing
const STRIDE = 2.7; // ground covered in one stride, in horse lengths
const PACE = 1; // strides a second

const WAVE = Math.PI * 2;
const GREEN = "#2f8f5b";

// each strip's skyline repeats exactly over its own width, so copies of it
// laid end to end join up
const FAR = {
  wide: 1600,
  drift: 0.035, // how fast it goes by, as a share of the ground's speed
  line: "#9c9c9c", // pencil, like the lines under the links
  at: (x: number) =>
    46 +
    15 * Math.sin((WAVE * x) / 800 + 1) +
    8 * Math.sin((WAVE * x) / (1600 / 3) + 2.2) +
    3 * Math.sin((WAVE * x) / 320),
};
const NEAR = {
  wide: 1400,
  drift: 0.13,
  line: GREEN,
  at: (x: number) =>
    24 +
    8 * Math.sin((WAVE * x) / 700 + 0.5) +
    4.5 * Math.sin((WAVE * x) / (1400 / 3) + 4),
};
const FRONT = { wide: 1200, drift: 1 };

// the trees take the flowers' colours
const CROWNS = ["#1f4fff", "#c8432b", "#fdb515", "#ef6aa5", "#7c4ddb", GREEN];

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

/** a line of hills: one stroke of the pen along the top, nothing filled in */
function hills({ wide, at, line }: typeof FAR, seed: number) {
  // it runs a little past both ends, so it overlaps the next copy's
  const top: [number, number][] = [];
  for (let x = -30; x <= wide + 30; x += 46) top.push([x, n(TALL - at(x))]);
  return gen.curve(top, {
    seed,
    roughness: 0.9,
    stroke: line,
    strokeWidth: 1.3,
  });
}

/** round trees and tall thin ones standing on the nearer hills */
function trees() {
  const roll = dice(77);
  const shapes: Drawable[] = [];
  const pick = (from: number, to: number) => from + roll() * (to - from);
  for (let x = 60; x < NEAR.wide - 40; x += pick(110, 230)) {
    const foot = TALL - NEAR.at(x) + 1;
    const seed = Math.round(x);
    const crown = CROWNS[Math.floor(roll() * CROWNS.length)];
    const pen = { seed, roughness: 0.9, strokeWidth: 1.1 };
    const filled = {
      ...pen,
      stroke: crown,
      fill: crown,
      fillStyle: "hachure",
      hachureGap: 2.1,
      fillWeight: 0.7,
      hachureAngle: Math.round(pick(-60, 60)),
    };
    if (roll() < 0.35) {
      // tall and narrow, a cypress
      const high = pick(17, 25);
      shapes.push(
        gen.line(n(x), n(foot), n(x), n(foot - 4), { ...pen, stroke: GREEN }),
        gen.ellipse(
          n(x),
          n(foot - 3 - high / 2),
          pick(5.5, 7.5),
          n(high),
          filled,
        ),
      );
    } else {
      // a short trunk under a round crown, an oak
      const trunk = pick(6, 9);
      const size = pick(12, 17);
      shapes.push(
        gen.line(n(x), n(foot), n(x + 0.5), n(foot - trunk), {
          ...pen,
          stroke: GREEN,
          strokeWidth: 1.4,
        }),
        gen.ellipse(
          n(x),
          n(foot - trunk - size * 0.36),
          n(size),
          n(size * 0.82),
          filled,
        ),
      );
    }
  }
  return shapes;
}

/** the ground she runs on: a pencil line, with the meadow's flowers along it */
function ground() {
  const roll = dice(31);
  const pick = (from: number, to: number) => from + roll() * (to - from);
  const floor = TALL - GROUND;
  const line = gen.line(-20, floor, FRONT.wide + 20, floor, {
    seed: 5,
    roughness: 1.1,
    bowing: 0.4,
    stroke: "#9c9c9c",
    strokeWidth: 1.2,
  });
  // the same flowers as the meadow, drawn at half the size
  const small = 0.5;
  const flowers = [];
  let i = 0;
  for (let x = 40; x < FRONT.wide - 30; x += pick(34, 78)) {
    const { tall, shapes } = flower(900 + i++, Math.round(pick(34, 62)));
    flowers.push({
      shapes,
      place: `translate(${n(x - (FLOWER / 2) * small)} ${n(floor + 1 - tall * small)}) scale(${small})`,
    });
  }
  return { line, flowers };
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
      {strip(FAR, "far", <Paths shapes={[drawn.far]} />)}
      {strip(
        NEAR,
        "near",
        <>
          <Paths shapes={[drawn.near]} />
          <Paths shapes={drawn.trees} />
        </>,
      )}
      <span ref={horseRef} className="horse" />
      {strip(
        FRONT,
        "front",
        <>
          <Paths shapes={[drawn.ground.line]} />
          {drawn.ground.flowers.map((f) => (
            <g key={f.place} transform={f.place}>
              <Paths shapes={f.shapes} />
            </g>
          ))}
        </>,
      )}
    </div>
  );
}
