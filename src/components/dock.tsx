import { useRef } from "react";
import { type SocialKind, SocialSign } from "@/components/sketch";

/*
 * the socials, tucked behind one phrase. hovering the phrase fans them out
 * above it; moving along the row gently swells whichever one is under the
 * pointer, with its neighbours rising a little too, like the dock on a mac.
 */

// each has either a sign drawn in code, or a picture: nithin's own drawings,
// cut out of a sketch he sent, in public/images/logos
export type DockItem = {
  label: string;
  href: string;
  sign?: SocialKind;
  drawing?: string;
};

/** nudge the row sideways if it would hang off the edge of the window */
export const keepDockInView = (phrase: HTMLElement) => {
  const dock = phrase.querySelector<HTMLElement>(".dock");
  if (!dock) return;
  dock.style.setProperty("--shift", "0px");
  const r = dock.getBoundingClientRect();
  const shift =
    r.left < 8
      ? 8 - r.left
      : r.right > window.innerWidth - 8
        ? window.innerWidth - 8 - r.right
        : 0;
  dock.style.setProperty("--shift", `${Math.round(shift)}px`);
};

const SMALL = 1; // the ones far from the pointer keep their size
const SWELL = 0.42; // how much the one under the pointer gains on top
const REACH = 70; // px over which the swell falls away
const EASE = 0.16; // share of the remaining distance covered each frame

export function Dock({ items }: { items: readonly DockItem[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  // how far apart their middles are at rest, measured once on the way in
  const pitch = useRef(0);
  // the size each one is heading for, and the size it is right now. the
  // pointer only ever sets where they're heading; a loop eases them there a
  // little each frame, so sweeping back and forth never jerks or restarts
  const aim = useRef<number[]>([]);
  const now = useRef<number[]>([]);
  const frame = useRef(0);

  const glide = () => {
    const els = [...(ref.current?.children ?? [])] as HTMLElement[];
    let moving = false;
    els.forEach((el, k) => {
      const to = aim.current[k] ?? 1;
      const at = now.current[k] ?? 1;
      const next = Math.abs(to - at) < 0.002 ? to : at + (to - at) * EASE;
      if (next !== to) moving = true;
      now.current[k] = next;
      el.style.setProperty("--s", next.toFixed(4));
    });
    frame.current = moving ? requestAnimationFrame(glide) : 0;
  };

  const wake = () => {
    if (!frame.current) frame.current = requestAnimationFrame(glide);
  };

  const rest = () => {
    const els = [...(ref.current?.children ?? [])];
    aim.current = els.map(() => 1);
    for (const el of els) el.removeAttribute("data-near");
    wake();
  };

  const enter = () => {
    const dock = ref.current;
    const first = dock?.children[0] as HTMLElement | undefined;
    if (!dock || !first) return;
    // layout sizes, which the fan-out animation doesn't disturb, taken while
    // everything is at its resting size
    if (!pitch.current || now.current.every((s) => s === 1)) {
      pitch.current =
        first.offsetWidth / (now.current[0] ?? 1) +
        Number.parseFloat(getComputedStyle(dock).columnGap);
    }
  };

  const move = (e: React.PointerEvent) => {
    const dock = ref.current;
    if (!dock) return;
    const els = [...dock.children] as HTMLElement[];
    // the row stays centred as it swells, so each one's resting middle is a
    // fixed step from the middle of the row: the swelling can't chase itself
    const box = dock.getBoundingClientRect();
    const centre = box.left + box.width / 2;
    const half = (els.length - 1) / 2;
    let nearest = 0;
    let least = Number.POSITIVE_INFINITY;
    aim.current = els.map((_, k) => {
      const away = Math.abs(e.clientX - (centre + (k - half) * pitch.current));
      if (away < least) {
        least = away;
        nearest = k;
      }
      return SMALL + SWELL * Math.exp(-((away / REACH) ** 2));
    });
    els.forEach((el, k) => {
      el.toggleAttribute("data-near", k === nearest);
    });
    wake();
  };

  const mid = (items.length - 1) / 2;

  return (
    <span
      ref={ref}
      className="dock"
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={rest}
    >
      {items.map((item, k) => (
        <a
          key={item.label}
          className="dock-item"
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          style={
            {
              // each starts stacked on the middle and slides out to its place
              "--from": `${((mid - k) * 2).toFixed(2)}em`,
              "--wait": `${Math.round(Math.abs(k - mid) * 35)}ms`,
            } as React.CSSProperties
          }
        >
          {item.drawing ? (
            // biome-ignore lint/performance/noImgElement: small local png
            <img className="social" src={item.drawing} alt="" />
          ) : item.sign ? (
            <SocialSign kind={item.sign} seed={61 + k * 13} />
          ) : null}
          <span className="dock-label">{item.label}</span>
        </a>
      ))}
    </span>
  );
}
