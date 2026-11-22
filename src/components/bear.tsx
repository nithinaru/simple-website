import { type RefObject, useEffect, useState } from "react";
import rough from "roughjs";

/*
 * a small hand-drawn bear. once the opening is over it walks slowly in from
 * the right, down to the name, stops just short of the full stop after it,
 * and lowers its head to have a look. there it stays.
 *
 * it's stop-motion: a handful of drawings shown one after another, a few a
 * second, and the bear only moves when the drawing changes. every drawing is
 * made with a different seed, so the lines shiver the way redrawn frames do.
 * the drawings are placeholders: swap `draw` for real artwork later.
 */

const gen = rough.generator();

const INK = "#141414";
const VIEW = { w: 120, h: 84 }; // the drawing's own units; feet stand on y=80
const SCALE = 0.62; // drawing units to css px
const FPS = 8;
const STRIDE = 4; // px moved per drawing while walking
const SLOPE = 0.34; // how steeply it comes down: px dropped per px walked
const RUN = 420; // furthest it starts from where it ends up, px

type Shape = { d: string; stroke: string; width: number; fill: string };

// node and the browser disagree in the last decimal of sines and cosines
const tidy = (d: string) =>
  d.replace(/-?\d+\.\d+/g, (n) => Number(n).toFixed(2));

/** one drawing of the bear, facing left. `step` is where it is in its stride */
const draw = (seed: number, step: number | null): Shape[] => {
  const looking = step === null;
  const turn = looking ? 0 : (step / 6) * Math.PI * 2;
  const bob = looking ? 0 : Math.sin(turn * 2) * 1.1;
  const pen = { roughness: 1.1, stroke: INK, strokeWidth: 1.6 };
  const solid = { ...pen, fill: "#fff", fillStyle: "solid" as const };

  // a leg swings forward lifted and back planted
  const leg = (hip: number, offset: number, far: boolean, n: number) => {
    const swing = looking ? 0 : Math.sin(turn + offset) * 9;
    const lift = looking ? 0 : Math.max(0, Math.cos(turn + offset)) * 4;
    const foot = 80 - lift;
    return gen.polygon(
      [
        [hip - 5, 54 + bob],
        [hip - 6 + swing, foot],
        [hip + 6 + swing, foot],
        [hip + 6, 54 + bob],
      ],
      { ...solid, seed: seed + n, stroke: far ? "#8a8a8a" : INK },
    );
  };

  // head up while walking; down by the ground, nose forward, when looking
  const hx = looking ? 23 : 30;
  const hy = looking ? 60 : 39 + bob;

  const drawings = [
    // the far pair of legs first, so the body covers their tops
    leg(54, Math.PI, true, 1),
    leg(94, 0, true, 2),
    gen.circle(104, 38 + bob, 8, { ...solid, seed: seed + 3 }),
    gen.ellipse(68, 44 + bob, 70, 40, { ...solid, seed: seed + 4 }),
    leg(46, 0, false, 5),
    leg(86, Math.PI, false, 6),
    gen.circle(hx - 6, hy - 13, 9, { ...solid, seed: seed + 7 }),
    gen.circle(hx + 7, hy - 13, 9, { ...solid, seed: seed + 8 }),
    gen.circle(hx, hy, 28, { ...solid, seed: seed + 9 }),
    gen.ellipse(hx - 13, hy + 4, 14, 10, { ...solid, seed: seed + 10 }),
    gen.circle(hx - 19, hy + 2, 4, {
      ...pen,
      seed: seed + 11,
      fill: INK,
      fillStyle: "solid",
    }),
    gen.circle(hx - 5, hy - 3, 2.4, {
      ...pen,
      seed: seed + 12,
      fill: INK,
      fillStyle: "solid",
    }),
  ];

  return drawings.flatMap((drawing) =>
    gen.toPaths(drawing).map((p) => ({
      d: tidy(p.d),
      stroke: p.stroke,
      width: p.strokeWidth,
      fill: p.fill ?? "none",
    })),
  );
};

const WALK = Array.from({ length: 6 }, (_, i) => draw(100 + i * 17, i));
const LOOK = Array.from({ length: 3 }, (_, i) => draw(300 + i * 17, null));

type Place = { x: number; y: number };

/** where the bear ends up: just right of the name, feet on its baseline */
const restingPlace = (name: HTMLElement): Place | null => {
  const r = name.getBoundingClientRect();
  const x = r.right + 9;
  // no room beside the name on a narrow window: no bear
  if (x + VIEW.w * SCALE > window.innerWidth - 4) return null;
  const baseline = r.top + r.height * 0.74;
  return { x, y: baseline - 80 * SCALE };
};

export function Bear({ beside }: { beside: RefObject<HTMLElement | null> }) {
  const [place, setPlace] = useState<Place | null>(null);
  const [frame, setFrame] = useState(0);
  const [looking, setLooking] = useState(false);
  const [shown, setShown] = useState(0); // fades in over its first steps

  useEffect(() => {
    const name = beside.current?.querySelector<HTMLElement>(".name");
    if (!name) return;
    const end = restingPlace(name);
    if (!end) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlace(end);
      setLooking(true);
      setShown(1);
      return;
    }

    // start up and to the right, off the edge of the window if that's near
    const run = Math.min(RUN, window.innerWidth - end.x + 20);
    let left = Math.ceil(run / STRIDE);
    let tick = 0;
    let arrived = false;
    setPlace({ x: end.x + left * STRIDE, y: end.y - left * STRIDE * SLOPE });

    // a timer, not animation frames: stop-motion wants a fixed, slow beat
    const timer = setInterval(() => {
      tick += 1;
      if (!arrived) {
        left -= 1;
        setFrame(tick % WALK.length);
        setShown(Math.min(1, tick / 6));
        setPlace({
          x: end.x + left * STRIDE,
          y: end.y - left * STRIDE * SLOPE,
        });
        if (left <= 0) {
          arrived = true;
          setLooking(true);
        }
        // standing: the lines keep shivering, but slower
      } else if (tick % 3 === 0) {
        setFrame((tick / 3) % LOOK.length);
      }
    }, 1000 / FPS);

    // stay beside the name if the window changes once it's there
    const settle = () => {
      const next = restingPlace(name);
      if (arrived && next) setPlace(next);
    };
    window.addEventListener("resize", settle);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", settle);
    };
  }, [beside]);

  if (!place) return null;
  const shapes = looking
    ? LOOK[frame % LOOK.length]
    : WALK[frame % WALK.length];

  return (
    <svg
      className="bear fade"
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      width={VIEW.w * SCALE}
      height={VIEW.h * SCALE}
      style={{ left: place.x, top: place.y, opacity: shown }}
      aria-hidden="true"
    >
      {shapes.map((s, i) => (
        <path
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed drawing
          key={i}
          d={s.d}
          stroke={s.stroke}
          strokeWidth={s.width}
          fill={s.fill}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
