import { useEffect, useRef } from "react";

/*
 * sallie gardner at a gallop: the twelve frames of eadweard muybridge's
 * "the horse in motion" (palo alto, 19 june 1878, long in the public domain),
 * cut out of the plate and played back as he never could. she comes in from
 * the right once the page has settled and pulls up beside the name. the
 * twelfth frame of the plate is her standing still, which is where she stops.
 */

const GALLOP = 11; // frames in the stride; the one after them is standing
const WAIT = 1150; // after the page settles: the name's box is drawn by then
// ground covered in one stride, in horse lengths
const STRIDE = 3.2;

export function Horse({ go }: { go: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const horse = ref.current;
    const post = horse?.parentElement;
    const column = horse?.closest<HTMLElement>(".v2-column");
    if (!go || !horse || !post || !column) return;

    const show = (frame: number) => {
      horse.style.backgroundPositionX = `${(frame / GALLOP) * 100}%`;
    };
    const stand = () => {
      show(GALLOP);
      horse.style.setProperty("--run", "0px");
    };

    let raf = 0;
    const timer = setTimeout(() => {
      const from = post.getBoundingClientRect().left;
      const width = horse.offsetWidth;
      // nowhere to stand when the name fills the line (a phone): leave her out
      if (column.getBoundingClientRect().right - from < width * 1.25) return;
      horse.dataset.here = "";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        stand();
        return;
      }

      // from just off the right edge of the window to her mark
      const far = window.innerWidth - from + 12;
      const ms = Math.min(3400, 1500 + far * 1.5);
      const began = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - began) / ms);
        // quick at first, easing to a stop
        const gone = far * (1 - (1 - t) ** 2.4);
        if (far - gone < 1.5) {
          stand();
          return;
        }
        horse.style.setProperty("--run", `${(far - gone).toFixed(1)}px`);
        // her legs keep time with the ground she covers, so they slow with her
        show(Math.floor((gone / (width * STRIDE)) * GALLOP) % GALLOP);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, WAIT);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [go]);

  return (
    // a point on the name's baseline, just after it, for her to stand on
    <span className="horse-post" aria-hidden="true">
      <span ref={ref} className="horse" />
    </span>
  );
}
