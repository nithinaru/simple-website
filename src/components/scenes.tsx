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
 * the scene is the golden gate: a few strips, each repeating end to end.
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
const PENCIL = "#9c9c9c";

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
};

type Built = {
  tall: number; // every strip is drawn in a box this tall
  ground: number; // how far up from the bottom she runs
  strips: Strip[];
};

const BUILD: { bridge: () => Built } = {
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
};

export function Scene({ show }: { show: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const riderRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const built = useMemo(() => BUILD.bridge(), []);

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

    let shown = -1;
    const frame = (i: number) => {
      if (i === shown) return;
      shown = i;
      horse.style.backgroundPositionX = `${(i / GALLOP) * 100}%`;
      // each picture gets its own printing of the ink, so the grain belongs
      // to her and isn't a still screen she's moving behind
      horse.style.filter = `url(#tx-horse-${i % INKS})`;
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
    // the opening: the scene is drawn across from the left (see .scene in
    // globals.css) while the ground gets up to speed, and she rides in a
    // beat later, once there is something under her to run on
    const wait = 900;
    const arrive = 3200;
    const upTo = 2600; // how long the ground takes to reach her pace
    let raf = 0;
    // a beat after the page settles, so this doesn't start in the same
    // frame as the text being redrawn (the sheet waits as long; see .scene)
    const began = performance.now() + 300;
    const step = (now: number) => {
      const t = Math.max(0, now - began);
      const gone = speed * (t < upTo ? (t * t) / (2 * upTo) : t - upTo / 2);
      for (const { strip, lap, drift } of laps) {
        strip.style.translate = `${(-((gone * drift) % lap)).toFixed(1)}px`;
      }
      // coming in, she also covers the ground between the edge and her mark
      const in01 = Math.min(1, Math.max(0, (t - wait) / arrive));
      const come = (mark + wide) * (1 - (1 - in01) ** 3);
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
    <div key={key} className="scene-strip" data-drift={s.drift}>
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
            {/* drawn once; the copies beside it point back at the first */}
            {i === 0 ? (
              <g id={`strip-${key}`}>{s.art}</g>
            ) : (
              <use href={`#strip-${key}`} />
            )}
          </svg>
        ),
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="scene"
      data-scene="bridge"
      data-show={show ? "" : undefined}
      aria-hidden="true"
      style={
        {
          "--tall": built.tall,
          "--ground": built.ground,
        } as React.CSSProperties
      }
    >
      {built.strips.map(strip)}
      <span ref={riderRef} className="rider">
        <span className="horse" />
      </span>
    </div>
  );
}
