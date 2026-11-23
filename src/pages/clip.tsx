import Head from "next/head";
import { useEffect, useState } from "react";
import type { Drawable } from "roughjs/bin/core";
import { LOOK } from "@/components/options";
import { Bridge, gen, Paths } from "@/components/sketch";

/*
 * a scratch page: the share image, and the clip a link preview can play.
 * the name as big as it goes, the bridge and where it is in the corner, and
 * four things of mine drawn over the type: the globe, a tower of the bridge,
 * a spark and a sun.
 *
 * it moves the way a hand-drawn film does: every drawing is made again a
 * few times a second, a little differently, and the ink is printed again
 * with it. ?still holds the first drawing, for the image. shot at 1200 by
 * 630. not linked from anywhere.
 */
const BLUE = "#1f4fff";
const ORANGE = "#c8432b";
const YELLOW = "#f2b632";

const DRAWINGS = 5; // how many times each thing was drawn
const INKS = 3; // how many printings of the ink
const EVERY = 130; // ms a drawing is held: about eight a second

const CSS = `
.clip{position:absolute;inset:0;overflow:hidden;background:#fff;color:#141414;line-height:1;letter-spacing:-0.02em;white-space:nowrap}
.clip-where{position:absolute;right:66px;top:44px;display:flex;align-items:center;gap:14px;font-size:44px;letter-spacing:0;z-index:2}
.clip-where b{font:600 15px/1.35 var(--font-mono),monospace;white-space:pre}
.clip-line{position:absolute;left:-6px;font-size:372px}
.clip-over{position:absolute;inset:0;width:100%;height:100%}
.clip-held{position:absolute;inset:0;filter:url(#boil-text)}
`;

const A = { x: 315, y: 130 }; // the globe
const B = { x: 905, y: 290 }; // the tower
const C = { x: 122, y: 430 }; // the spark
const D = { x: 610, y: 480 }; // the sun

const n = (v: number) => Math.round(v * 10) / 10;
const TURN = Math.PI * 2;

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

/** everything, drawn for the k-th time */
function things(k: number): Drawable[] {
  const s = k * 97;
  const ink = (colour: string, seed: number, weight = 5) => ({
    seed: seed + s,
    roughness: 1.5,
    stroke: colour,
    strokeWidth: weight,
  });
  const fill = (colour: string, seed: number, gap = 9) => ({
    ...ink(colour, seed, 4.5),
    fill: colour,
    fillStyle: "hachure",
    hachureGap: gap,
    fillWeight: 3.6,
    // the hatching leans a little differently each time
    hachureAngle: -41 + (seed % 5) * 22 + (k - 2) * 5,
  });
  // the tower is drawn with a finer pen
  const thin = (seed: number) => ({
    ...fill(ORANGE, seed, 6),
    strokeWidth: 3,
    fillWeight: 2.4,
  });
  // a hand never lands in quite the same place twice
  const roll = dice(k + 11);
  const shake = () => (k ? (roll() - 0.5) * 5 : 0);
  const ax = A.x + shake();
  const ay = A.y + shake();
  const bx = B.x + shake();
  const by = B.y + shake();
  const cx = C.x + shake();
  const cy = C.y + shake();
  const dx = D.x + shake();
  const dy = D.y + shake();

  // the spark: a dozen fat strokes out from the middle, none the same length
  const lengths = [58, 40, 62, 44, 54, 38, 60, 46, 56, 42, 64, 40];
  const spark = lengths.map((long, i) => {
    const a = (i / lengths.length) * TURN + 0.13 + (roll() - 0.5) * 0.06;
    return gen.line(
      n(cx + 9 * Math.cos(a)),
      n(cy + 9 * Math.sin(a)),
      n(cx + long * Math.cos(a)),
      n(cy + long * Math.sin(a)),
      ink(ORANGE, 60 + i, 12),
    );
  });
  // the sun: scribbled in, with short rays
  const rays = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * TURN + (roll() - 0.5) * 0.08;
    return gen.line(
      n(dx + 66 * Math.cos(a)),
      n(dy + 66 * Math.sin(a)),
      n(dx + 92 * Math.cos(a)),
      n(dy + 92 * Math.sin(a)),
      ink(YELLOW, 40 + i, 6),
    );
  });

  return [
    // the globe
    gen.circle(ax, ay, 140, ink(BLUE, 3, 6)),
    gen.ellipse(ax, ay, 62, 140, ink(BLUE, 4, 5)),
    gen.line(ax - 70, ay, ax + 70, ay, ink(BLUE, 5, 5)),
    gen.curve(
      [
        [ax - 60, ay - 36],
        [ax, ay - 26],
        [ax + 60, ay - 36],
      ],
      ink(BLUE, 6, 5),
    ),
    gen.curve(
      [
        [ax - 60, ay + 36],
        [ax, ay + 26],
        [ax + 60, ay + 36],
      ],
      ink(BLUE, 7, 5),
    ),
    // a tower of the bridge
    gen.rectangle(bx - 40, by - 96, 17, 190, thin(8)),
    gen.rectangle(bx + 23, by - 96, 17, 190, thin(9)),
    gen.rectangle(bx - 23, by - 90, 46, 16, thin(10)),
    gen.rectangle(bx - 23, by - 40, 46, 16, thin(11)),
    gen.rectangle(bx - 23, by + 14, 46, 18, thin(12)),
    gen.line(bx - 150, by + 62, bx + 150, by + 62, ink(ORANGE, 13, 5)),
    gen.curve(
      [
        [bx - 150, by + 40],
        [bx - 88, by - 10],
        [bx - 32, by - 96],
      ],
      ink(ORANGE, 14, 3.6),
    ),
    gen.curve(
      [
        [bx + 32, by - 96],
        [bx + 88, by - 10],
        [bx + 150, by + 40],
      ],
      ink(ORANGE, 15, 3.6),
    ),
    ...spark,
    gen.circle(dx, dy, 100, fill(YELLOW, 16, 8)),
    ...rays,
  ];
}

/* the ink, printed three ways: the edges wander and specks drop out */
function Inks() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      {/* the name gets a quieter printing: made by hand, but type, not a
          drawing */}
      <filter
        id="boil-text"
        x="0"
        y="0"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.022"
          numOctaves="2"
          seed="3"
          result="wander"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="wander"
          scale="3"
          xChannelSelector="R"
          yChannelSelector="G"
          result="moved"
        />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.7"
          numOctaves="2"
          seed="5"
        />
        <feColorMatrix
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  11 0 0 0 -8.9"
          result="specks"
        />
        <feComposite in="moved" in2="specks" operator="out" />
      </filter>
      {Array.from({ length: INKS }, (_, k) => (
        <filter
          // biome-ignore lint/suspicious/noArrayIndexKey: three fixed filters
          key={k}
          id={`boil-${k}`}
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022"
            numOctaves="2"
            seed={3 + k * 7}
            result="wander"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wander"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="moved"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="2"
            seed={5 + k * 11}
          />
          <feColorMatrix
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  11 0 0 0 -8.1"
            result="specks"
          />
          <feComposite in="moved" in2="specks" operator="out" />
        </filter>
      ))}
    </svg>
  );
}

// the parts of the picture where the letters are nearer than the drawings
const FRONT =
  "M330 0h130v345h-130z M992 0h208v345h-208z M628 330h140v300h-140z";

const where = (
  <div className="clip-where">
    <Bridge seed={43} />
    <b>{"← 37.7749 →\n→ 122.4194 ←"}</b>
  </div>
);

const name = (
  <>
    <div className="clip-line" style={{ top: -8 }}>
      Nithin
    </div>
    <div className="clip-line" style={{ top: 276 }}>
      Aruswamy
    </div>
  </>
);

export default function Clip() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("still")) return;
    const id = setInterval(() => setTick((t) => t + 1), EVERY);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="v2" style={{ ...LOOK, padding: 0 } as React.CSSProperties}>
      <Head>
        <title>Clip</title>
        <meta name="robots" content="noindex" />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static css */}
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <div className="clip">
        {/* the name and the corner hold still */}
        <div className="clip-held">
          {where}
          {name}
        </div>
        {/* the drawings are what move */}
        <svg
          className="clip-over"
          viewBox="0 0 1200 630"
          aria-hidden="true"
          style={{ filter: `url(#boil-${tick % INKS})` }}
        >
          <Paths shapes={things(tick % DRAWINGS)} />
        </svg>
        {/* the name again, only where a letter passes in front of a drawing:
            the globe goes behind the i, the cable behind the n, the sun
            behind the far side of the u */}
        <div className="clip-held" style={{ clipPath: `path("${FRONT}")` }}>
          {name}
        </div>
      </div>
      <Inks />
    </div>
  );
}
