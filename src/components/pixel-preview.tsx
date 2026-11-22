import { useEffect, useRef } from "react";

/*
 * the screenshot that appears beside a link on hover. it arrives as a handful
 * of big pixels and sharpens in a few quick steps, like the work thumbnails
 * on locomotive.ca: each step redraws the picture at a low resolution and
 * scales it up with smoothing off.
 */

// `open` goes false when the pointer leaves; the rest is kept, so the card
// fades out where it is instead of jumping away
export type Hover = { src: string; rect: DOMRect; open: boolean } | null;

const WIDTH = 232;
const HEIGHT = Math.round((WIDTH * 10) / 16);
// how many pixels wide the picture is at each step, and how long each lasts
const STEPS = [5, 9, 16, 28, 52, 96];
const STEP_MS = 55;

/*
 * keep the card near the pointer as it moves over the link: most of the way
 * to wherever the pointer is from the middle of the link, with a slight tilt.
 * the css eases it there quickly, so it trails the pointer only a touch.
 */
export const follow = (e: React.PointerEvent<HTMLElement>) => {
  const card = document.querySelector<HTMLElement>(".preview");
  if (!card) return;
  const r = e.currentTarget.getBoundingClientRect();
  // capped, so a long link doesn't swing it far or push it off the window
  const cap = (n: number, most: number) => Math.max(-most, Math.min(most, n));
  const dx = cap((e.clientX - (r.left + r.width / 2)) * 0.85, 70);
  const dy = cap((e.clientY - (r.top + r.height / 2)) * 0.8, 14);
  card.style.setProperty("--dx", `${dx.toFixed(1)}px`);
  card.style.setProperty("--dy", `${dy.toFixed(1)}px`);
  card.style.setProperty("--tilt", `${(dx * 0.035).toFixed(2)}deg`);
};

const cache = new Map<string, HTMLImageElement>();

const load = (src: string) => {
  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    cache.set(src, img);
  }
  return img;
};

/** fetch the screenshots ahead of time so the first hover isn't blank */
export const preload = (srcs: string[]) => {
  for (const src of srcs) load(src);
};

// draw `img` to fill a w-by-h box, cropping whatever overflows
const cover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) => {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, 0, sw, sh, 0, 0, w, h);
};

export function PixelPreview({ hover }: { hover: Hover }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const src = hover?.src;
  const open = hover?.open ?? false;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!src || !open || !canvas || !ctx) return;

    const img = load(src);
    const small = document.createElement("canvas");
    const smallCtx = small.getContext("2d");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let timer: ReturnType<typeof setTimeout>;
    let live = true;

    const draw = (step: number) => {
      if (!live) return;
      const w = canvas.width;
      const h = canvas.height;
      const across = STEPS[step];
      ctx.clearRect(0, 0, w, h);
      if (across === undefined || reduced || !smallCtx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        cover(ctx, img, w, h);
        return;
      }
      small.width = across;
      small.height = Math.max(1, Math.round((across * 10) / 16));
      cover(smallCtx, img, small.width, small.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, w, h);
      timer = setTimeout(() => draw(step + 1), STEP_MS);
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img.complete && img.naturalWidth) draw(0);
    else img.addEventListener("load", () => draw(0), { once: true });

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [src, open]);

  // above the link when there's room, otherwise below it
  let left = 0;
  let top = 0;
  if (hover) {
    const { rect } = hover;
    left = Math.max(
      12,
      Math.min(
        rect.left + rect.width / 2 - WIDTH / 2,
        window.innerWidth - WIDTH - 12,
      ),
    );
    top = rect.top - HEIGHT - 12;
    if (top < 12) top = rect.bottom + 8;
  }

  return (
    <div
      className="preview"
      data-show={open ? "" : undefined}
      style={{ left, top, width: WIDTH }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} width={WIDTH * 2} height={HEIGHT * 2} />
    </div>
  );
}
