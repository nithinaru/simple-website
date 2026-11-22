import { type RefObject, useLayoutEffect, useState } from "react";

/*
 * the opening: measuring guides, like the ones a design tool shows around a
 * selected frame, draw themselves around the text column. the page then
 * brings the words in (see pages/index.tsx) and tells the guides to leave.
 */

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  vw: number;
};

export function RulerIntro({
  target,
  leaving,
}: {
  target: RefObject<HTMLElement | null>;
  /** true once the words are in: the guides pull back off the page */
  leaving: boolean;
}) {
  const [box, setBox] = useState<Box | null>(null);
  const [drawn, setDrawn] = useState(false);

  // before paint, so the guides are in place on the very first frame
  useLayoutEffect(() => {
    const el = target.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox({
        left: Math.round(r.left),
        top: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom),
        vw: window.innerWidth,
      });
    };
    measure();
    // the column moves when its font arrives or the window changes
    const watcher = new ResizeObserver(measure);
    watcher.observe(el);
    window.addEventListener("resize", measure);

    // a beat to paint the hidden state, then animate from it. a timer rather
    // than an animation frame, so it still runs in a tab that isn't in view
    const start = setTimeout(() => setDrawn(true), 40);
    return () => {
      watcher.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(start);
    };
  }, [target]);

  if (!box) return null;

  const gutter = box.vw - box.right;
  const roomy = gutter >= 64;
  const phase = leaving ? "out" : drawn ? "in" : "idle";

  return (
    <div className="rl" data-phase={phase} aria-hidden="true">
      {/* ruler ticks along the top and left edges of the window */}
      <div className="rl-ticks rl-ticks-top" />
      <div className="rl-ticks rl-ticks-left" />

      {/* the four guides through the edges of the column */}
      <div className="rl-v" style={{ left: box.left }} />
      <div
        className="rl-v"
        style={{ left: box.right, transitionDelay: "80ms" }}
      />
      <div
        className="rl-h"
        style={{ top: box.top, transitionDelay: "140ms" }}
      />
      <div
        className="rl-h"
        style={{ top: box.bottom, transitionDelay: "220ms" }}
      />

      {/* hatching in the margins either side */}
      <div
        className="rl-hatch"
        style={{ left: 0, width: box.left, top: box.top, height: box.height }}
      />
      <div
        className="rl-hatch"
        style={{
          left: box.right + 1,
          width: gutter,
          top: box.top,
          height: box.height,
        }}
      />

      {/* a cross at each corner */}
      {[
        ["tl", box.left, box.top],
        ["tr", box.right, box.top],
        ["bl", box.left, box.bottom],
        ["br", box.right, box.bottom],
      ].map(([corner, x, y]) => (
        <div key={corner} className="rl-cross" style={{ left: x, top: y }} />
      ))}

      {/* how wide the column is */}
      <div
        className="rl-dim rl-dim-h"
        style={{ left: box.left, width: box.width, top: box.top - 30 }}
      >
        <span>{box.width}</span>
      </div>

      {/* how far it sits from the top */}
      <div
        className="rl-dim rl-dim-v"
        style={{ left: box.left + 14, top: 0, height: box.top }}
      >
        <span>{box.top}</span>
      </div>

      {/* how tall it is, when there's room beside it */}
      {roomy ? (
        <div
          className="rl-dim rl-dim-v"
          style={{ left: box.right + 22, top: box.top, height: box.height }}
        >
          <span>{box.height}</span>
        </div>
      ) : null}

      {/* the margins */}
      <div
        className="rl-note"
        style={{ left: 0, width: box.left, top: box.bottom + 8 }}
      >
        {box.left}
      </div>
      <div
        className="rl-note"
        style={{ left: box.right, width: gutter, top: box.bottom + 8 }}
      >
        {gutter}
      </div>
    </div>
  );
}
