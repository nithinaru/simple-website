import { useRef } from "react";

/*
 * the socials, tucked behind one phrase. hovering the phrase fans them out
 * above it; moving along the row swells whichever one is under the pointer
 * and shrinks the rest, like the dock on a mac.
 */

export type DockItem = { label: string; href: string; logo: string };

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

const SMALL = 0.8; // size of the ones far from the pointer
const SWELL = 0.95; // how much the one under the pointer gains on top
const REACH = 46; // px over which the swell falls away

export function Dock({ items }: { items: readonly DockItem[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  // where each one sits at rest, so the swelling doesn't chase its own tail
  const centres = useRef<number[]>([]);

  const rest = () => {
    for (const el of ref.current?.children ?? []) {
      (el as HTMLElement).style.setProperty("--s", "1");
      el.removeAttribute("data-near");
    }
  };

  const enter = () => {
    centres.current = [...(ref.current?.children ?? [])].map((el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  };

  const move = (e: React.PointerEvent) => {
    const els = [...(ref.current?.children ?? [])] as HTMLElement[];
    let nearest = 0;
    els.forEach((el, k) => {
      const away = Math.abs(e.clientX - (centres.current[k] ?? 0));
      if (away < Math.abs(e.clientX - (centres.current[nearest] ?? 0))) {
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
          {/* biome-ignore lint/performance/noImgElement: tiny remote favicon */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${item.logo}&sz=128`}
            alt=""
            width={64}
            height={64}
          />
          <span className="dock-label">{item.label}</span>
        </a>
      ))}
    </span>
  );
}
