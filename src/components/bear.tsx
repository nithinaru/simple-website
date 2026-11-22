import { type RefObject, useEffect, useState } from "react";

/*
 * a small bear, in solid black. once the opening is over and the box round
 * the name has been drawn, it walks slowly in from the right edge of the
 * window, level with the name, stops just short of the full stop after it,
 * and lowers its head to have a look. there it stays.
 *
 * it's stop-motion: a handful of poses shown one after another, a few a
 * second, and the bear only moves when the pose changes. this bear is a
 * stand-in built from simple shapes: swap `Pose` for real drawings later.
 */

const INK = "#141414";
const VIEW = { w: 120, h: 84 }; // the drawing's own units; feet stand on y=80
const SCALE = 0.7; // drawing units to css px
const FPS = 10;
const POSES = 8; // drawings in one full stride
const STRIDE = 4.4; // px moved per drawing while walking
const WAIT = 1100; // ms after the opening before it sets off

// the outline of body and head as one shape, walking and with the head down.
// from the nose: up over the brow and the ear, along the hump of the
// shoulders and the back, round the rump, back along the belly to the jaw
const WALKING =
  "M8 47 C8 43 13 40 19 37 C21 33 24 30 27 31 C29 28 33 29 33 33 C40 30 48 26 56 27 C66 27 74 30 84 29 C98 28 108 36 108 48 C108 56 104 60 98 60 L40 60 C34 60 30 56 28 52 C22 54 14 54 10 51 C8 50 8 48 8 47 Z";
const LOOKING =
  "M6 66 C6 62 10 58 16 56 C17 52 20 49 23 50 C25 47 29 48 29 52 C34 44 42 30 56 27 C66 27 74 30 84 29 C98 28 108 36 108 48 C108 56 104 60 98 60 L40 60 C36 60 33 62 30 66 C24 71 14 72 9 70 C7 69 6 67 6 66 Z";

/** one pose of the bear, facing left. `step` is where it is in its stride;
    null is standing still with its head down */
function Pose({ step }: { step: number | null }) {
  const looking = step === null;
  const turn = looking ? 0 : (step / POSES) * Math.PI * 2;
  // the body rises and falls twice per stride
  const bob = looking ? 0 : Math.sin(turn * 2) * 1.2;

  // a leg: down from the hip through a knee that leads the foot, to a paw
  // that lifts as it swings forward and stays planted as it pushes back
  const leg = (hip: number, offset: number) => {
    const swing = looking ? 0 : Math.sin(turn + offset) * 9;
    const lift = looking ? 0 : Math.max(0, Math.cos(turn + offset)) * 5;
    const knee = hip + swing * 0.45 - (looking ? 0 : 2);
    const foot = hip + swing;
    return (
      <>
        <polyline
          points={`${hip},${52 + bob} ${knee},${66 + bob * 0.5 - lift * 0.4} ${foot},${75 - lift}`}
          fill="none"
          stroke={INK}
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx={foot - 3} cy={77.5 - lift} rx="8" ry="4" />
      </>
    );
  };

  return (
    <g fill={INK}>
      {leg(52, Math.PI)}
      {leg(98, 0)}
      {leg(42, 0)}
      {leg(90, Math.PI)}
      <path
        d={looking ? LOOKING : WALKING}
        transform={`translate(0 ${bob.toFixed(2)})`}
      />
    </g>
  );
}

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

    // start just off the right edge of the window, level with the name
    const run = window.innerWidth - end.x + 20;
    let left = Math.ceil(run / STRIDE);
    let tick = 0;
    let arrived = false;
    let timer: ReturnType<typeof setInterval>;

    // a timer, not animation frames: stop-motion wants a fixed, slow beat
    const start = setTimeout(() => {
      setPlace({ x: end.x + left * STRIDE, y: end.y });
      timer = setInterval(() => {
        if (arrived) return;
        tick += 1;
        left -= 1;
        setFrame(tick % POSES);
        setShown(Math.min(1, tick / 6));
        setPlace({ x: end.x + left * STRIDE, y: end.y });
        if (left <= 0) {
          arrived = true;
          setLooking(true);
          clearInterval(timer);
        }
      }, 1000 / FPS);
    }, WAIT);

    // stay beside the name if the window changes once it's there
    const settle = () => {
      const next = restingPlace(name);
      if (arrived && next) setPlace(next);
    };
    window.addEventListener("resize", settle);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
      window.removeEventListener("resize", settle);
    };
  }, [beside]);

  if (!place) return null;

  return (
    <svg
      className="bear fade"
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      width={VIEW.w * SCALE}
      height={VIEW.h * SCALE}
      style={{ left: place.x, top: place.y, opacity: shown }}
      aria-hidden="true"
    >
      <Pose step={looking ? null : frame} />
    </svg>
  );
}
