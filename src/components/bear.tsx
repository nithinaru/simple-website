import { type RefObject, useEffect, useState } from "react";

/*
 * a small bear, in solid black. once the opening is over and the box round
 * the name has been drawn, it walks slowly in from the right, down to the
 * name, stops just short of the full stop after it, and lowers its head to
 * have a look. there it stays.
 *
 * it's stop-motion: a handful of poses shown one after another, a few a
 * second, and the bear only moves when the pose changes. this bear is a
 * stand-in built from simple shapes: swap `Pose` for real drawings later.
 */

const INK = "#141414";
const VIEW = { w: 120, h: 84 }; // the drawing's own units; feet stand on y=80
const SCALE = 0.62; // drawing units to css px
const FPS = 10;
const POSES = 8; // drawings in one full stride
const STRIDE = 3.2; // px moved per drawing while walking
const SLOPE = 0.34; // how steeply it comes down: px dropped per px walked
const RUN = 420; // furthest it starts from where it ends up, px
const WAIT = 1100; // ms after the opening before it sets off

/** one pose of the bear, facing left. `step` is where it is in its stride;
    null is standing still with its head down */
function Pose({ step }: { step: number | null }) {
  const looking = step === null;
  const turn = looking ? 0 : (step / POSES) * Math.PI * 2;
  // the body rises and falls twice per stride, the head a beat behind it
  const bob = looking ? 0 : Math.sin(turn * 2) * 1.2;
  const nod = looking ? 0 : Math.sin(turn * 2 - 0.9) * 1.4;

  // a leg: thigh to a knee that leads the foot, then down to the foot, which
  // lifts as it swings forward and stays planted as it pushes back
  const leg = (hip: number, offset: number) => {
    const swing = looking ? 0 : Math.sin(turn + offset) * 9;
    const lift = looking ? 0 : Math.max(0, Math.cos(turn + offset)) * 5;
    const knee = hip + swing * 0.45 - (looking ? 0 : 2);
    return (
      <polyline
        points={`${hip},${50 + bob} ${knee},${65 + bob * 0.5 - lift * 0.4} ${hip + swing},${76 - lift}`}
        fill="none"
        stroke={INK}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  // head carried low and forward on the walk; down by the ground when looking
  const hx = looking ? 19 : 25;
  const hy = looking ? 61 : 42 + nod;

  return (
    <g fill={INK}>
      {leg(52, Math.PI)}
      {leg(93, 0)}
      {leg(44, 0)}
      {leg(86, Math.PI)}
      {/* rump, belly and the hump of the shoulders */}
      <ellipse cx="90" cy={42 + bob} rx="18" ry="19" />
      <ellipse cx="68" cy={44 + bob} rx="34" ry="19" />
      <ellipse cx="48" cy={37 + bob} rx="19" ry="16" />
      {/* neck, head, muzzle, ear */}
      <line
        x1="42"
        y1={40 + bob}
        x2={hx + 5}
        y2={hy}
        stroke={INK}
        strokeWidth="23"
        strokeLinecap="round"
      />
      <ellipse cx={hx} cy={hy} rx="13.5" ry="11.5" />
      <ellipse cx={hx - 12} cy={hy + 3.5} rx="8" ry="6" />
      <circle cx={hx + 6.5} cy={hy - 10.5} r="4.6" />
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

    // start up and to the right, off the edge of the window if that's near
    const run = Math.min(RUN, window.innerWidth - end.x + 20);
    let left = Math.ceil(run / STRIDE);
    let tick = 0;
    let arrived = false;
    let timer: ReturnType<typeof setInterval>;

    // a timer, not animation frames: stop-motion wants a fixed, slow beat
    const start = setTimeout(() => {
      setPlace({ x: end.x + left * STRIDE, y: end.y - left * STRIDE * SLOPE });
      timer = setInterval(() => {
        if (arrived) return;
        tick += 1;
        left -= 1;
        setFrame(tick % POSES);
        setShown(Math.min(1, tick / 6));
        setPlace({
          x: end.x + left * STRIDE,
          y: end.y - left * STRIDE * SLOPE,
        });
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
