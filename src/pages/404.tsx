import Head from "next/head";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { LOOK, TextureFilters } from "@/components/options";
import { Bridge, gen, Paths } from "@/components/sketch";

/*
 * the page for an address that isn't one. three ways of saying so, while i
 * choose: ?v=lost (the front page, lost), ?v=road (the horse where the
 * bridge stops) and ?v=big (the number as large as it goes).
 */

const home = (label: string) => (
  <NextLink className="lnk" href="/">
    <span className="lnk-t">{label}</span>
  </NextLink>
);

/* the front page's own heading, about you this time */
function Lost() {
  return (
    <div className="v2-column">
      <header className="head">
        <h1>
          <span className="tx">Hey, you're </span>
          <span className="name">
            <span className="tx">lost.</span>
            <span className="name-box" data-size="404 × 404" aria-hidden="true">
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
          There's nothing at this address. Everything I have is back{" "}
          {home("on the front page")}.
        </p>
      </div>
    </div>
  );
}

const pencil = (seed: number, weight = 1.3) => ({
  seed,
  roughness: 0.9,
  stroke: "#9c9c9c",
  strokeWidth: weight,
});
const paint = (seed: number, weight = 1.5) => ({
  ...pencil(seed, weight),
  stroke: "#c8432b",
});

/* the bridge, as far as it was built, and the horse stopped at the end */
function Road() {
  return (
    <>
      <div className="v2-column">
        <header className="head">
          <h1>
            <span className="tx">404</span>
          </h1>
        </header>
        <div className="rest">
          <p className="tx">
            The road stops here. She'd rather not jump this one, so it's back{" "}
            {home("the way you came")}.
          </p>
        </div>
      </div>
      <div className="lost-road" aria-hidden="true">
        <svg
          viewBox="0 0 400 110"
          preserveAspectRatio="xMinYMax meet"
          aria-hidden="true"
        >
          <Paths
            shapes={[
              // the deck and the truss under it, to where they give out
              gen.line(-10, 72, 232, 72, paint(1, 1.8)),
              gen.line(-10, 79, 226, 79, paint(2, 1.1)),
              ...Array.from({ length: 23 }, (_, i) =>
                gen.line(i * 10, 79, i * 10 + 5, 72, {
                  ...paint(10 + i, 0.7),
                  roughness: 0.4,
                }),
              ),
              // the last of it, hanging
              gen.line(232, 72, 244, 78, paint(40, 1.4)),
              gen.line(226, 79, 233, 88, paint(41, 1)),
              gen.line(246, 84, 251, 92, paint(42, 1)),
              // a cable coming down to nothing
              gen.curve(
                [
                  [-10, 14],
                  [70, 40],
                  [150, 58],
                  [222, 68],
                ],
                paint(43, 1.6),
              ),
              ...Array.from({ length: 11 }, (_, i) => {
                const x = 10 + i * 20;
                const y = 18 + 50 * (1 - (1 - x / 232) ** 2);
                return gen.line(x, y, x, 72, {
                  ...paint(50 + i, 0.6),
                  roughness: 0.35,
                });
              }),
              // the water, a long way down
              ...[30, 96, 170, 236, 300, 352].map((x, i) =>
                gen.curve(
                  [
                    [x, 104],
                    [x + 5, 102.4],
                    [x + 10, 104],
                    [x + 15, 102.4],
                    [x + 20, 104],
                  ],
                  { ...pencil(70 + i, 1), stroke: "#1f4fff" },
                ),
              ),
              // and the far side, where it was meant to arrive
              gen.curve(
                [
                  [300, 70],
                  [340, 62],
                  [380, 58],
                  [410, 60],
                ],
                pencil(80),
              ),
            ]}
          />
        </svg>
        <span className="lost-horse" />
      </div>
    </>
  );
}

/* the number, as big as the window lets it be */
function Big() {
  return (
    <>
      <div className="lost-big tx" aria-hidden="true">
        404
      </div>
      <p className="where lost-corner">
        <Bridge seed={43} />
        <span className="coords">
          <span>← 0.0000 →</span>
          <span>→ 0.0000 ←</span>
        </span>
      </p>
      <p className="lost-note">
        <span className="tx">Nothing here. </span>
        {home("Back to the front page")}
      </p>
      <h1 className="sr-only">404</h1>
    </>
  );
}

const WAYS = { lost: Lost, road: Road, big: Big };

export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null);
  const [way, setWay] = useState<keyof typeof WAYS>("lost");
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("v");
    if (asked && asked in WAYS) setWay(asked as keyof typeof WAYS);
  }, []);
  // each link's line says how long it is, as on the front page
  // biome-ignore lint/correctness/useExhaustiveDependencies: measured again when the page changes
  useEffect(() => {
    const measure = () => {
      for (const el of ref.current?.querySelectorAll<HTMLElement>(".lnk-t") ??
        []) {
        el.dataset.w = String(Math.round(el.getBoundingClientRect().width));
      }
    };
    measure();
    document.fonts.ready.then(measure);
  }, [way]);
  const Way = WAYS[way];

  return (
    <div
      ref={ref}
      className="v2 lost"
      data-stage="settled"
      data-marks="guide"
      data-way={way}
      style={LOOK}
    >
      <Head>
        <title>404 — Nithin Aruswamy</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Way />
      <TextureFilters />
    </div>
  );
}
