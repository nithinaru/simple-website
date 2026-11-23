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

function draw(seed: number) {
  const roll = dice(seed * 7919 + 13);
  const pick = (from: number, to: number) => from + roll() * (to - from);
  const kind = Math.floor(roll() * 6);
  const tall = Math.round(kind === 5 ? pick(26, 46) : pick(46, 112));
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

  const foot: [number, number] = [WIDE / 2, tall];
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
            [n(WIDE / 2 + pick(-4, 4)), tall],
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

type Planted = { seed: number; x: number; late?: boolean };

function Flower({ seed, x, late }: Planted) {
  const { tall, shapes } = useMemo(() => draw(seed), [seed]);
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

export function Meadow({ show }: { show: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [planted, setPlanted] = useState<Planted[]>([]);

  useEffect(() => {
    const size = () => setWidth(window.innerWidth);
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);

  // lean away from the pointer when it comes down among them
  useEffect(() => {
    const meadow = ref.current;
    if (!meadow) return;
    let raf = 0;
    let at: { x: number; y: number } | null = null;
    const lean = () => {
      raf = 0;
      const top = meadow.getBoundingClientRect().top - 60;
      for (const f of meadow.querySelectorAll<HTMLElement>(".flower")) {
        const dx = Number(f.dataset.x) - (at?.x ?? 1e6);
        const near =
          at && at.y > top ? Math.max(0, 1 - Math.abs(dx) / REACH) : 0;
        f.style.setProperty(
          "--lean",
          `${(Math.sign(dx || 1) * near * 16).toFixed(1)}deg`,
        );
      }
    };
    const move = (e: PointerEvent) => {
      at = e.pointerType === "mouse" ? { x: e.clientX, y: e.clientY } : null;
      raf ||= requestAnimationFrame(lean);
    };
    const leave = () => {
      at = null;
      raf ||= requestAnimationFrame(lean);
    };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  const grown = useMemo(() => {
    const count = Math.max(8, Math.round(width / EVERY));
    return Array.from({ length: width ? count : 0 }, (_, i) => {
      const roll = dice(i + 101);
      return {
        seed: i + 3,
        x: Math.round(((i + 0.15 + roll() * 0.7) / count) * width),
      };
    });
  }, [width]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: planting is a bonus for the mouse, nothing is lost without it
    <div
      ref={ref}
      className="meadow"
      data-show={show ? "" : undefined}
      aria-hidden="true"
      onClick={(e) => {
        const x = Math.round(e.clientX);
        setPlanted((was) => [
          ...was.slice(-40),
          { seed: 500 + ((was.at(-1)?.seed ?? 500) % 4000) + x, x, late: true },
        ]);
      }}
    >
      {[...grown, ...planted].map((f) => (
        <Flower key={`${f.seed}-${f.x}`} {...f} />
      ))}
    </div>
  );
}
