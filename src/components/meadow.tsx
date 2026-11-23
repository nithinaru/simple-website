import { useEffect, useMemo, useRef, useState } from "react";
import type { Drawable } from "roughjs/bin/core";
import { gen, Paths } from "@/components/sketch";

/*
 * a strip of flowers along the bottom of the window, drawn with the same pen
 * as everything else and coloured in. they come up once the page has settled,
 * sway a little, lean away from the pointer, and a click plants another.
 * (the idea of a meadow for a footer is beyza sezer's, beyza.io; these are
 * my own flowers.)
 *
 * sallie gardner gallops among them: the twelve frames of eadweard
 * muybridge's "the horse in motion" (palo alto, 19 june 1878, long in the
 * public domain), cut out of the plate and played back as he never could.
 * she's off the page for now (the page doesn't pass a gait), but kept.
 * there are two ways she keeps moving:
 *   run    she crosses the meadow every so often and the flowers part for her
 *   drift  she gallops on the spot and the meadow slides past underneath
 *
 * drawn in the browser only: how many there are depends on the window.
 */

const STEM = "#2f8f5b";
const PETALS = [
  "#1f4fff", // the page's cobalt
  "#c8432b", // the bridge
  "#fdb515", // cal
  "#ef6aa5",
  "#7c4ddb",
  "#2aa7d8",
];
const WIDE = 44; // every flower is drawn in a box this wide
const EVERY = 23; // one flower about this often, px
const GALLOP = 11; // frames in her stride; the one after them is standing
const STRIDE = 2.7; // ground covered in one stride, in horse lengths
const SPEED = 0.46; // crossing the meadow, px per ms
const DRIFT = 0.13; // the meadow sliding past, px per ms
const SPARE = 40; // how far past either edge a drifting flower goes round
const REACH = 95; // how near the pointer has to be to push one over, px

// a small seeded dice, so a flower is the same each time it's drawn
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

function draw(seed: number, height: number) {
  const roll = dice(seed * 7919 + 13);
  const pick = (from: number, to: number) => from + roll() * (to - from);
  const kind = Math.floor(roll() * 6);
  // grass stays low, whatever the flowers round it are doing
  const tall = Math.round(kind === 5 ? height * pick(0.42, 0.6) : height);
  const colour = PETALS[Math.floor(roll() * PETALS.length)];
  const heart = colour === "#fdb515" ? "#c8432b" : "#fdb515";
  const pen = { seed: seed + 1, roughness: 0.9, strokeWidth: 1.3 };
  const filled = {
    ...pen,
    stroke: colour,
    fill: colour,
    fillStyle: "hachure",
    hachureGap: 2.1,
    fillWeight: 0.7,
    hachureAngle: Math.round(pick(-70, 70)),
  };

  // the feet go a little below the box, so no stem stops short of the edge
  const foot: [number, number] = [WIDE / 2, tall + 4];
  const cx = n(WIDE / 2 + pick(-5, 5));
  const cy = 15;
  const bend = n(WIDE / 2 + pick(-5, 5));
  const shapes: Drawable[] = [];

  const stemTo = (x: number, y: number) =>
    shapes.push(
      gen.curve([foot, [bend, n(tall * 0.62)], [x, y]], {
        ...pen,
        stroke: STEM,
        strokeWidth: 1.4,
      }),
    );

  const leaf = (y: number, side: number, size: number) => {
    const x = n(WIDE / 2 + (bend - WIDE / 2) * 0.6);
    shapes.push(
      gen.path(
        `M ${x} ${y} Q ${n(x + side * size * 0.55)} ${n(y - size * 0.95)} ${n(x + side * size)} ${n(y - size * 0.45)} Q ${n(x + side * size * 0.5)} ${n(y + size * 0.1)} ${x} ${y} Z`,
        { ...pen, stroke: STEM, strokeWidth: 1.1 },
      ),
    );
  };

  if (kind === 5) {
    // grass: a few blades and nothing else, to fill the gaps
    for (let i = 0; i < 3; i++) {
      const lean = pick(-13, 13);
      shapes.push(
        gen.curve(
          [
            [n(WIDE / 2 + pick(-4, 4)), tall + 4],
            [n(WIDE / 2 + lean * 0.4), n(tall * 0.5)],
            [n(WIDE / 2 + lean), n(pick(4, tall * 0.4))],
          ],
          { ...pen, seed: seed + i, stroke: STEM, strokeWidth: 1.2 },
        ),
      );
    }
    return { tall, shapes };
  }

  if (kind === 4) {
    // a spike of small buds, lavender-like
    stemTo(cx, 6);
    const buds = 6 + Math.floor(roll() * 3);
    for (let i = 0; i < buds; i++) {
      const side = i % 2 ? 1 : -1;
      shapes.push(
        gen.ellipse(n(cx + side * 3.2), n(7 + i * 4.6), 5.4, 4.2, {
          ...filled,
          seed: seed + i,
        }),
      );
    }
    leaf(n(tall * 0.8), roll() < 0.5 ? -1 : 1, 11);
    return { tall, shapes };
  }

  stemTo(cx, kind === 1 ? cy + 8 : cy);
  if (tall > 62) leaf(n(tall * pick(0.62, 0.8)), roll() < 0.5 ? -1 : 1, 12);
  if (tall > 84) leaf(n(tall * pick(0.42, 0.56)), roll() < 0.5 ? -1 : 1, 10);

  if (kind === 0) {
    // a daisy: long petals round a heart
    const petals = 7 + Math.floor(roll() * 4);
    const long = pick(8.5, 11.5);
    const turn = pick(0, 6.28);
    for (let i = 0; i < petals; i++) {
      const a = turn + (i / petals) * Math.PI * 2;
      const at = (r: number, off: number) =>
        `${n(cx + Math.cos(a + off) * r)} ${n(cy + Math.sin(a + off) * r)}`;
      shapes.push(
        gen.path(
          `M ${cx} ${cy} Q ${at(long * 0.62, 0.42)} ${at(long, 0)} Q ${at(long * 0.62, -0.42)} ${cx} ${cy} Z`,
          { ...filled, seed: seed + i },
        ),
      );
    }
    shapes.push(
      gen.circle(cx, cy, 6.4, {
        ...pen,
        stroke: heart,
        fill: heart,
        fillStyle: "solid",
      }),
    );
  } else if (kind === 1) {
    // a tulip: a cup with three points
    shapes.push(
      gen.path(
        `M ${cx - 7} ${cy - 5} Q ${cx - 8.5} ${cy + 7} ${cx} ${cy + 8.5} Q ${cx + 8.5} ${cy + 7} ${cx + 7} ${cy - 5} L ${cx + 3.4} ${cy + 0.5} L ${cx} ${cy - 7} L ${cx - 3.4} ${cy + 0.5} Z`,
        filled,
      ),
    );
  } else if (kind === 2) {
    // a burst: spokes with a dot on the end of each
    const spokes = 10 + Math.floor(roll() * 5);
    const far = pick(8.5, 11);
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      const x = n(cx + Math.cos(a) * far);
      const y = n(cy + Math.sin(a) * far);
      shapes.push(
        gen.line(cx, cy, x, y, {
          ...pen,
          seed: seed + i,
          stroke: colour,
          strokeWidth: 1,
        }),
        gen.circle(x, y, 2.6, {
          ...pen,
          seed: seed + i,
          stroke: colour,
          fill: colour,
          fillStyle: "solid",
        }),
      );
    }
  } else {
    // five round petals
    const turn = pick(0, 1.2);
    for (let i = 0; i < 5; i++) {
      const a = turn + (i / 5) * Math.PI * 2;
      shapes.push(
        gen.circle(n(cx + Math.cos(a) * 6), n(cy + Math.sin(a) * 6), 8.4, {
          ...filled,
          seed: seed + i,
        }),
      );
    }
    shapes.push(
      gen.circle(cx, cy, 5, {
        ...pen,
        stroke: heart,
        fill: heart,
        fillStyle: "solid",
      }),
    );
  }
  return { tall, shapes };
}

type Planted = { seed: number; x: number; height: number; late?: boolean };

function Flower({ seed, x, height, late }: Planted) {
  const { tall, shapes } = useMemo(() => draw(seed, height), [seed, height]);
  const roll = dice(seed);
  return (
    <span
      className="flower"
      data-x={x}
      style={
        {
          left: `calc(${x}px - var(--u) * ${WIDE / 2}px)`,
          width: `calc(var(--u) * ${WIDE}px)`,
          height: `calc(var(--u) * ${tall}px)`,
          zIndex: Math.floor(roll() * 5),
          // a planted one comes straight up; the rest arrive scattered
          "--wait": late ? "0ms" : `${Math.round(roll() * 900)}ms`,
          "--sway": `${(3.2 + roll() * 2.6).toFixed(2)}s`,
          "--from": `${(-roll() * 5).toFixed(2)}s`,
          "--far": `${(1.6 + roll() * 2.2).toFixed(2)}deg`,
        } as React.CSSProperties
      }
    >
      <svg viewBox={`0 0 ${WIDE} ${tall}`} aria-hidden="true">
        <Paths shapes={shapes} />
      </svg>
    </span>
  );
}

type Live = {
  at: { x: number; y: number } | null;
  horse: number | null;
  drift: number;
};

// how far a flower planted at x has been carried along, going round at the
// edges
const carried = (x: number, drift: number) => {
  if (!drift) return 0;
  const lap = window.innerWidth + SPARE * 2;
  return ((((x + drift + SPARE) % lap) + lap) % lap) - SPARE - x;
};

// every flower leans away from the pointer and from the horse
const lean = (meadow: HTMLElement | null, { at, horse, drift }: Live) => {
  if (!meadow) return;
  const top = meadow.getBoundingClientRect().top - 60;
  for (const f of meadow.querySelectorAll<HTMLElement>(".flower")) {
    const moved = carried(Number(f.dataset.x), drift);
    const x = Number(f.dataset.x) + moved;
    let deg = 0;
    if (at && at.y > top) {
      const dx = x - at.x;
      deg += Math.sign(dx || 1) * Math.max(0, 1 - Math.abs(dx) / REACH) * 16;
    }
    if (horse !== null) {
      const dx = x - horse;
      deg += Math.sign(dx || 1) * Math.max(0, 1 - Math.abs(dx) / 62) * 24;
    }
    f.style.setProperty("--lean", `${deg.toFixed(1)}deg`);
    f.style.translate = moved ? `${moved.toFixed(1)}px` : "";
  }
};

export type Gait = "run" | "drift";

/*
 * how tall a flower may grow at x: low under the column of text, so the two
 * never meet, rising to full height out towards the sides of the window
 */
const LOW = 50;
const HIGH = 108;
const roomAt = (x: number, width: number) => {
  const column = Math.min(632, width - 48) / 2;
  const out = Math.abs(x - width / 2) - column;
  const t = Math.max(0, Math.min(1, out / 200));
  return LOW + (HIGH - LOW) * t * t * (3 - 2 * t);
};

export function Meadow({
  show,
  gait,
}: {
  show: boolean;
  /** how the horse keeps moving; leave it out and there's no horse */
  gait?: Gait;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const horseRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const [planted, setPlanted] = useState<Planted[]>([]);
  // where the pointer and the horse are, and how far the meadow has slid
  const live = useRef<Live>({ at: null, horse: null, drift: 0 });

  useEffect(() => {
    const size = () => setWidth(window.innerWidth);
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);

  useEffect(() => {
    let raf = 0;
    const soon = () => {
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        lean(ref.current, live.current);
      });
    };
    const move = (e: PointerEvent) => {
      live.current.at =
        e.pointerType === "mouse" ? { x: e.clientX, y: e.clientY } : null;
      soon();
    };
    const leave = () => {
      live.current.at = null;
      soon();
    };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  // the horse
  useEffect(() => {
    const horse = horseRef.current;
    if (!show || !gait || !horse || !width) return;
    const frame = (i: number) => {
      horse.style.backgroundPositionX = `${(i / GALLOP) * 100}%`;
    };
    const wide = horse.offsetWidth;
    const put = (x: number) => {
      horse.style.translate = `${x.toFixed(1)}px`;
      live.current.horse = x + wide / 2;
    };
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // no galloping: she stands among the flowers
      frame(GALLOP);
      put(width * 0.68);
      horse.dataset.here = "";
      lean(ref.current, live.current);
    } else if (gait === "drift") {
      timer = setTimeout(() => {
        put(Math.max(16, width * 0.3 - wide / 2));
        horse.dataset.here = "";
        const began = performance.now();
        const step = (now: number) => {
          const t = now - began;
          live.current.drift = t * DRIFT;
          // twelve pictures a second, as a flick book would show them
          frame(Math.floor(t * 0.012) % GALLOP);
          lean(ref.current, live.current);
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }, 1400);
    } else {
      const pass = () => {
        const began = performance.now();
        horse.dataset.here = "";
        const step = (now: number) => {
          const gone = (now - began) * SPEED;
          const x = width + 12 - gone;
          if (x < -wide - 12) {
            delete horse.dataset.here;
            live.current.horse = null;
            lean(ref.current, live.current);
            timer = setTimeout(pass, 9000 + Math.random() * 5000);
            return;
          }
          put(x);
          // her legs keep time with the ground she covers
          frame(Math.floor((gone / (wide * STRIDE)) * GALLOP) % GALLOP);
          lean(ref.current, live.current);
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      };
      timer = setTimeout(pass, 1900);
    }

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      delete horse.dataset.here;
      live.current.horse = null;
      live.current.drift = 0;
      lean(ref.current, live.current);
    };
  }, [show, gait, width]);

  const grown = useMemo(() => {
    // evenly spaced out from the middle, each nudged only a little, and a
    // little past both edges so there's no gap if they drift round
    const span = width + SPARE * 2;
    const count = Math.max(8, Math.round(span / EVERY));
    const pitch = span / count;
    return Array.from({ length: width ? count : 0 }, (_, i) => {
      const roll = dice(i + 101);
      const x = Math.round(
        width / 2 + (i - (count - 1) / 2 + (roll() - 0.5) * 0.3) * pitch,
      );
      return {
        seed: i + 3,
        x,
        // every other one a head shorter, so neighbours don't crowd
        height: Math.round(
          roomAt(x, width) * (i % 2 ? 0.68 : 0.92) * (0.92 + roll() * 0.16),
        ),
      };
    });
  }, [width]);

  return (
    // a click plants a flower: a bonus for the mouse, nothing is lost without it
    <div
      ref={ref}
      className="meadow"
      data-show={show ? "" : undefined}
      aria-hidden="true"
      onClick={(e) => {
        // where it has to be planted to come up under the pointer now
        const lap = window.innerWidth + SPARE * 2;
        const drift = live.current.drift;
        const x = drift
          ? Math.round(
              ((((e.clientX - drift + SPARE) % lap) + lap) % lap) - SPARE,
            )
          : Math.round(e.clientX);
        setPlanted((was) => [
          ...was.slice(-40),
          {
            seed: 500 + ((was.at(-1)?.seed ?? 500) % 4000) + x,
            x,
            height: Math.round(
              roomAt(e.clientX, window.innerWidth) *
                (0.7 + Math.random() * 0.3),
            ),
            late: true,
          },
        ]);
      }}
    >
      {[...grown, ...planted].map((f) => (
        <Flower key={`${f.seed}-${f.x}`} {...f} />
      ))}
      {gait ? <span ref={horseRef} className="horse" /> : null}
    </div>
  );
}
