import Head from "next/head";
import NextLink from "next/link";
import { useEffect, useRef } from "react";
import type { Drawable } from "roughjs/bin/core";
import { LOOK, TextureFilters } from "@/components/options";
import { Bridge, gen, Paths } from "@/components/sketch";

/*
 * the page for an address that isn't one: the front page's own heading,
 * about you this time, and the bridge as far as it was built, with the
 * horse stopped where the road gives out.
 */

const home = (label: string) => (
  <NextLink className="lnk" href="/">
    <span className="lnk-t">{label}</span>
  </NextLink>
);

const ORANGE = "#c8432b";
const PENCIL = "#9c9c9c";
const BLUE = "#1f4fff";
const n = (v: number) => Math.round(v * 100) / 100;
const pen = (colour: string, seed: number, weight = 1.2) => ({
  seed,
  roughness: 0.9,
  stroke: colour,
  strokeWidth: weight,
});
const hatch = (colour: string, seed: number, gap = 1.15) => ({
  ...pen(colour, seed, 1.1),
  fill: colour,
  fillStyle: "hachure",
  hachureGap: gap,
  fillWeight: 0.7,
  hachureAngle: -41 + (seed % 5) * 20,
});

// the drawing is this big; the css scales it by its height (see .lost-road)
const WIDE = 520;
const TALL = 142;

/* one tower of the golden gate, the span reaching out from it, and then no
   more: the same bridge as the front page (see scenes.tsx), unfinished */
function broken(): Drawable[] {
  const floor = TALL - 37; // the roadway
  const sea = TALL - 5;
  const top = 10;
  const low = floor - 6;
  const tower = 150;
  const mid = 430; // tower to the middle of a whole span
  const end = 372; // where the road gives out
  const cable = (x: number) =>
    low - (low - top) * ((mid - Math.abs(x - tower)) / mid) ** 2;
  const paint = (seed: number, weight = 1.2) => pen(ORANGE, seed, weight);

  // the roadway and the truss under it
  let zig = `M -20 ${floor + 7}`;
  for (let x = -20; x < end - 12; x += 10) {
    zig += ` L ${x + 5} ${floor + 1.5} L ${x + 10} ${floor + 7}`;
  }
  const built: Drawable[] = [
    gen.line(-30, floor + 1, end, floor + 1, paint(1, 1.7)),
    gen.line(-30, floor + 7, end - 9, floor + 7, paint(2, 1.1)),
    gen.path(zig, { ...paint(3, 0.7), roughness: 0.4 }),
    // the last of it, hanging off the end
    gen.line(end, floor + 1, end + 13, floor + 8, paint(4, 1.5)),
    gen.line(end - 9, floor + 7, end - 2, floor + 18, paint(5, 1)),
    gen.line(end + 9, floor + 14, end + 13, floor + 23, paint(6, 0.9)),
    gen.line(end - 20, floor + 7, end - 17, floor + 13, paint(7, 0.8)),
  ];

  // the tower: two legs that step in as they climb, bands between them
  const steps: [number, number, number][] = [
    [floor + 1, floor - 36, 7.4],
    [floor - 36, floor - 63, 6.4],
    [floor - 63, floor - 83, 5.4],
    [floor - 83, top, 4.6],
  ];
  for (const side of [-10, 10]) {
    const cx = tower + side;
    for (const [i, [from, to, w]] of steps.entries()) {
      built.push(
        gen.rectangle(
          n(cx - w / 2),
          to,
          w,
          from - to,
          hatch(ORANGE, 20 + i + side),
        ),
      );
    }
    built.push(
      gen.rectangle(
        cx - 4.2,
        floor + 7,
        8.4,
        sea - 9 - (floor + 7),
        hatch(ORANGE, 30 + side),
      ),
      gen.rectangle(cx - 2.8, top - 4, 5.6, 4, paint(34 + side, 1.1)),
    );
  }
  for (const [i, [y, h]] of [
    [floor - 41, 10],
    [floor - 67, 8],
    [floor - 86, 6.5],
    [top + 0.5, 5.5],
  ].entries()) {
    built.push(gen.rectangle(tower - 7, y, 14, h, hatch(ORANGE, 40 + i, 1.3)));
  }
  built.push(gen.rectangle(tower - 7, floor - 5, 14, 5, paint(48, 1)));
  const under = (sea - 9 - (floor + 7)) / 2;
  for (let i = 0; i < 2; i++) {
    const y = floor + 7 + i * under;
    built.push(
      gen.line(tower - 6.5, y, tower + 6.5, n(y + under), paint(50 + i, 0.9)),
      gen.line(tower + 6.5, y, tower - 6.5, n(y + under), paint(52 + i, 0.9)),
    );
  }
  built.push(
    gen.rectangle(tower - 23, sea - 9, 46, 10, hatch(PENCIL, 60, 2.4)),
  );

  // the cable: whole on the near side, and on the far side as far as the road
  for (const [from, to] of [
    [-30, tower],
    [tower, end - 6],
  ]) {
    const along: [number, number][] = [];
    for (let x = from; x <= to + 0.1; x += (to - from) / 14)
      along.push([n(x), n(cable(x))]);
    built.push(gen.curve(along, { ...paint(from + 105, 1.7), roughness: 0.5 }));
  }
  // where it parted: a few strands, and the rest hanging
  const snap = cable(end - 6);
  built.push(
    gen.curve(
      [
        [end - 6, n(snap)],
        [end + 4, n(snap + 9)],
        [end + 5, n(snap + 21)],
      ],
      paint(70, 1.3),
    ),
    gen.line(end - 6, n(snap), end + 6, n(snap - 1), paint(71, 0.8)),
    gen.line(end - 6, n(snap), end + 2, n(snap + 4), paint(72, 0.8)),
  );
  for (let x = -20; x < end - 10; x += 10) {
    if (Math.abs(x - tower) < 15 || floor + 1 - cable(x) < 3) continue;
    built.push(
      gen.line(x, n(cable(x)), x, floor + 1, {
        ...paint(200 + x, 0.5),
        roughness: 0.35,
      }),
    );
  }

  // the water, and the far side it was meant to reach
  for (const [i, x] of [20, 92, 196, 262, 318, 396, 452, 498].entries()) {
    const y = sea - 1 + (i % 3) * 2;
    built.push(
      gen.curve(
        [
          [x, y],
          [x + 5, y - 1.6],
          [x + 10, y],
          [x + 15, y - 1.6],
          [x + 20, y],
        ],
        pen(BLUE, 80 + i, 1),
      ),
    );
  }
  built.push(
    gen.curve(
      [
        [430, floor + 4],
        [462, floor - 8],
        [496, floor - 13],
        [530, floor - 10],
      ],
      pen(PENCIL, 90, 1.3),
    ),
  );
  return built;
}

/* the front page's own heading, about you this time */
function Lost() {
  return (
    <>
      <div className="v2-column">
        <header className="head">
          <h1>
            <span className="tx">Hey, you're </span>
            <span className="name">
              <span className="tx">lost.</span>
              <span
                className="name-box"
                data-size="404 × 404"
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
                <i />
              </span>
            </span>
          </h1>
          <p className="where">
            <Bridge seed={43} />
            <span className="tx">Nowhere </span>
            <span className="coords">
              <span>← 0.0000 →</span>
              <span>→ 0.0000 ←</span>
            </span>
            <span className="tx">in particular</span>
          </p>
        </header>
        <div className="rest">
          <p className="tx">
            The road stops here. She'd rather not jump this one, so it's back{" "}
            {home("the way you came")}.
          </p>
        </div>
      </div>
      <div className="lost-road" aria-hidden="true">
        <svg viewBox={`0 0 ${WIDE} ${TALL}`} aria-hidden="true">
          <Paths shapes={broken()} />
        </svg>
        <span className="lost-horse" />
      </div>
    </>
  );
}

export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null);
  // each link's line says how long it is, as on the front page
  useEffect(() => {
    const measure = () => {
      for (const el of ref.current?.querySelectorAll<HTMLElement>(".lnk-t") ??
        []) {
        el.dataset.w = String(Math.round(el.getBoundingClientRect().width));
      }
    };
    measure();
    document.fonts.ready.then(measure);
  }, []);

  return (
    <div
      ref={ref}
      className="v2 lost"
      data-stage="settled"
      data-marks="guide"
      style={LOOK}
    >
      <Head>
        <title>404 — Nithin Aruswamy</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Lost />
      <TextureFilters />
    </div>
  );
}
