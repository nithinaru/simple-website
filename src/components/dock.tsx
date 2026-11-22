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

export function Dock({ items }: { items: readonly DockItem[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  // how far apart their middles are at rest, measured once on the way in
  const pitch = useRef(0);

  const rest = () => {
    for (const el of ref.current?.children ?? []) {
      (el as HTMLElement).style.setProperty("--s", "1");
      el.removeAttribute("data-near");
    }
  };

  const enter = () => {
    const dock = ref.current;
    const first = dock?.children[0] as HTMLElement | undefined;
    if (!dock || !first) return;
    // layout sizes, which the fan-out animation doesn't disturb
    pitch.current =
      first.offsetWidth + Number.parseFloat(getComputedStyle(dock).columnGap);
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
    els.forEach((el, k) => {
      const away = Math.abs(e.clientX - (centre + (k - half) * pitch.current));
      if (away < least) {
        least = away;
        nearest = k;
      }
      const s = SMALL + SWELL * Math.exp(-((away / REACH) ** 2));
      el.style.setProperty("--s", s.toFixed(3));
    });
    els.forEach((el, k) => {
      el.toggleAttribute("data-near", k === nearest);
    });
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
