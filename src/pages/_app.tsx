import AnimatedText from "@/components/animated-text";
import { PlaneIcon, SparkleIcon } from "@/components/icons";
import { SocialStickers } from "@/components/social-stickers";
import { PROJECTS, SOCIALS, WORK_ITEMS } from "@/utils/constants";
import "@/globals.css";
import {
  LayoutGroup,
  motion,
  type Transition,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { AppProps } from "next/app";
import {
  Abril_Fatface,
  Bodoni_Moda,
  Fraunces,
  Goudy_Bookletter_1911,
  IM_Fell_English,
  Instrument_Sans,
  Marcellus,
  Rye,
  UnifrakturMaguntia,
} from "next/font/google";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});

// the face the name settles on once the animation finishes, also used for
// the headings (see globals.css)
const nameFont = Goudy_Bookletter_1911({
  subsets: ["latin"],
  weight: "400",
  display: "block",
});

// blackletter, ultra-bold display, engraved roman, western slab, old book
// type, high-contrast didone, heavy soft-serif — the flicker pool below
const unifraktur = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: "400",
  display: "block",
});
const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
  display: "block",
});
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  display: "block",
});
const rye = Rye({ subsets: ["latin"], weight: "400", display: "block" });
const imFellEnglish = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  display: "block",
});
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: "700",
  display: "block",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "900",
  display: "block",
});

// exposed on :root (rather than via next/font's class) so the 404 page, which
// renders outside <main>, gets the same fonts
const FONT_VARS = `:root{--font-body:${bodyFont.style.fontFamily};--font-name:${nameFont.style.fontFamily}}`;

const NAME_WRAPPER_SPRING_CONFIG = {
  type: "spring",
  stiffness: 80,
  damping: 20,
} as const satisfies Transition;

// lower stiffness (and higher mass/damping) than the wrapper's spring: takes
// noticeably longer to settle, and — since it's overdamped, never
// overshooting — its velocity only ever decreases as it nears the end, so
// the font changes (tied to its value) naturally slow down the closer the
// name gets to its resting place
const NAME_SPRING_CONFIG = {
  stiffness: 20,
  // 2 * sqrt(k * m) ≈ 15.5 is critical; stay above so the spring never
  // overshoots and round() can't flicker a step backward
  damping: 26,
  mass: 3,
} as const satisfies Transition;

// the whole name — both first and last together — starts big and centred,
// cycling through wildly different typefaces (blackletter, ultra-bold
// display, engraved roman, western slab, old book type, high-contrast
// didone, heavy soft-serif) as it shrinks down to its resting size — a
// title card auditioning fonts, a la the Loki logo — before landing on
// nameFont. sizes are calibrated for "Nithin Aruswamy" as one string (not
// just "Nithin"), so the whole thing fits on screen instead of overflowing
const ANIMATION_STEPS = [
  { font: unifraktur.style.fontFamily, weight: 400, size: 6.5 },
  { font: abrilFatface.style.fontFamily, weight: 400, size: 6.0 },
  { font: marcellus.style.fontFamily, weight: 400, size: 5.55 },
  { font: rye.style.fontFamily, weight: 400, size: 5.13 },
  { font: imFellEnglish.style.fontFamily, weight: 400, size: 4.74 },
  { font: bodoniModa.style.fontFamily, weight: 700, size: 4.38 },
  { font: fraunces.style.fontFamily, weight: 900, size: 4.05 },
  { font: "var(--font-name), serif", weight: 400, size: 3.75 },
] as const satisfies Array<{
  font: string;
  weight: number;
  size: number;
}>;

// every step but the last is a flicker candidate; the last is the settle.
// at a given step each letter samples a different one (offset by its own
// index), so the name doesn't flip fonts in lockstep — each letter looks
// like it's independently auditioning typefaces before they all land on
// the same one together
const LAST_STEP = ANIMATION_STEPS.length - 1;
const STEP_INDICES = ANIMATION_STEPS.map((_, i) => i);
const STEP_SIZES = ANIMATION_STEPS.map((s) => s.size);
const fontStepFor = (step: number, letterIndex: number) =>
  step >= LAST_STEP
    ? ANIMATION_STEPS[LAST_STEP]
    : ANIMATION_STEPS[(step + letterIndex) % LAST_STEP];

// over the final couple of steps, letters peel off into nameFont one at a
// time, in a random order, instead of every letter snapping over together
// the instant the spring crosses the finish line
const SETTLE_RAMP_STEPS = 2;
const SETTLE_RAMP_START = LAST_STEP - SETTLE_RAMP_STEPS;

// the spring is overdamped, so its last stretch to LAST_STEP crawls. the
// ramp finishes, and the rest of the page starts, this far short of it —
// otherwise the page sits idle waiting on a name that already looks done
const SETTLE_RAMP_END = LAST_STEP - 0.35;

// settle position per letter: a shuffled 0..count-1 (Fisher-Yates), so a
// letter settles once the ramp's settled count passes its rank
const shuffledRanks = (count: number) => {
  const ranks = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  return ranks;
};

const NAME = "Nithin";
const LAST_NAME = "Aruswamy";

// `font` shorthand per step for document.fonts.load. the last step's font is
// a css var, which load() can't resolve, so it uses nameFont directly
const FONT_LOAD_SPECS = ANIMATION_STEPS.map((step, i) => {
  const family = i === LAST_STEP ? nameFont.style.fontFamily : step.font;
  return `${step.weight} 1em ${family}`;
});
const FONT_LOAD_CAP_MS = 2000;
const LETTER_COUNT = NAME.length + LAST_NAME.length;

const INTRO =
  "Hey, I'm Nithin. I study Operations Research & Mathematics and currently on a gap year in San Francisco. I enjoy traveling, making ceramics & scrolling on Cosmos.";
const INTRO_LINKS = {
  traveling: {
    href: "https://travel.nithinaruswamy.com/",
    icon: <PlaneIcon />,
  },
  Cosmos: { href: "https://www.cosmos.so/nithinaru", icon: <SparkleIcon /> },
};

// once settled, a few random letters — never all of them at once — drift
// into a different font for a couple seconds, then drift back, like the
// name is still idly considering itself
const IDLE_CHANGE_MIN_MS = 1000;
const IDLE_CHANGE_MAX_MS = 4000;
const IDLE_CHANGE_DURATION_MIN_MS = 2000;
const IDLE_CHANGE_DURATION_MAX_MS = 3000;
const IDLE_CHANGE_LETTERS_MIN = 1;
const IDLE_CHANGE_LETTERS_MAX = 3;

// a font change crossfades the old glyph out and the new one in (blurred at
// the midpoint) rather than snapping. the incoming glyph is scaled down to
// fit its letter's box, so a wide face can't run into its neighbours
const MORPH_MS = 300;
const MORPH_BLUR = "blur(6px)";
const MORPH_FIT_SLACK = 1.05;
const FLICKER_MS = 110;
const FLICKER_PULSE = [
  { opacity: 0.35, filter: MORPH_BLUR },
  { opacity: 1, filter: "blur(0px)" },
] as const satisfies Keyframe[];
const FLICKER_TIMING = {
  duration: FLICKER_MS,
  easing: "ease-out",
} as const satisfies KeyframeAnimationOptions;
const GLYPH_OUT = [
  { opacity: 1, filter: "blur(0px)" },
  { opacity: 0, filter: MORPH_BLUR },
] as const satisfies Keyframe[];
const GLYPH_IN = [
  { opacity: 0, filter: MORPH_BLUR },
  { opacity: 1, filter: "blur(0px)" },
] as const satisfies Keyframe[];

const SITE_URL = "https://nithinaruswamy.com";
const SITE_TITLE = "Nithin Aruswamy";
const SITE_DESCRIPTION =
  "Nithin studies OR & Mathematics. He is an operations researcher at UC Davis GSM. He's an avid traveler (50+ countries) and a #1 Amazon New Release travel author.";

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nithin Aruswamy",
  url: SITE_URL,
  jobTitle: "Operations Researcher & Student",
  description: SITE_DESCRIPTION,
  // every profile and site that is Nithin's, so search engines can tie them
  // to the one person
  sameAs: [
    "https://www.linkedin.com/in/aruswamy",
    "https://github.com/nithinaru",
    "https://scholar.google.com/citations?user=jqQkW0AAAAAJ&hl=en&oi=ao",
    "https://x.com/nithinaru",
    "https://www.cosmos.so/nithinaru",
    "https://travel.nithinaruswamy.com/",
  ],
  workExample: {
    "@type": "Book",
    name: "Jet-Set Teen",
    url: "https://www.amazon.com/dp/B0DF68HLGD",
    author: { "@type": "Person", name: "Nithin Aruswamy" },
  },
});

type FontStep = { font: string; weight: number };

type NameLetterProps = {
  letter: string;
  step: FontStep;
  register: (el: HTMLSpanElement | null) => void;
};

// until the intro lands each letter flows inline in whatever face the spring
// picked. once locked (data-locked, with a fixed width and height, set in
// App), the glyph layers are centred in that box, so a face with a different
// width overflows evenly instead of pushing the line. --fit shrinks a
// too-wide face back into the box.
const GLYPH_LOCKED =
  "group-data-[locked]/letter:absolute group-data-[locked]/letter:top-0 group-data-[locked]/letter:left-1/2 group-data-[locked]/letter:whitespace-nowrap group-data-[locked]/letter:[transform:translateX(-50%)_scale(var(--fit,1))]";

// two stacked glyph layers so a font change can crossfade (see morph in
// App). the spare one is invisible until a crossfade uses it
function NameLetter({ letter, step, register }: NameLetterProps) {
  return (
    <span
      ref={register}
      aria-hidden="true"
      // leading-none: a font swap can't change this letter's own line-box
      // height, so it never pushes the content below the heading up or down
      className="group/letter inline-block leading-none align-bottom data-[locked]:relative"
      style={{ fontFamily: step.font, fontWeight: step.weight }}
    >
      <span className={GLYPH_LOCKED}>{letter}</span>
      <span
        className={`hidden group-data-[locked]/letter:block group-data-[locked]/letter:opacity-0 ${GLYPH_LOCKED}`}
      >
        {letter}
      </span>
    </span>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const settledRef = useRef(false);
  const appliedRef = useRef<Array<FontStep | undefined>>([]);
  const progress = useMotionValue(0);
  const spring = useSpring(progress, NAME_SPRING_CONFIG);
  const [expanded, setExpanded] = useState(false);
  const [settleRank] = useState(() => shuffledRanks(LETTER_COUNT));
  const prefersReducedMotion = useReducedMotion();

  const fontSize = useTransform(spring, STEP_INDICES, STEP_SIZES);
  const fontSizeRem = useTransform(
    fontSize,
    (v) =>
      `clamp(${(v * 0.3).toFixed(2)}rem, ${(v * 2.9).toFixed(2)}vw, ${v}rem)`,
  );

  useMotionValueEvent(spring, "change", (v) => {
    // once landed, stop writing fonts: later idle swaps would get wiped
    // on every remaining spring tick
    if (settledRef.current) return;

    const i = Math.max(0, Math.min(Math.round(v), LAST_STEP));

    // over the final SETTLE_RAMP_STEPS, a growing number of letters (in
    // random order) lock into nameFont for good while the rest keep
    // flickering
    const settledFrac = Math.max(
      0,
      Math.min(
        1,
        (v - SETTLE_RAMP_START) / (SETTLE_RAMP_END - SETTLE_RAMP_START),
      ),
    );
    const settledCount = Math.round(settledFrac * LETTER_COUNT);

    // both first and last name are on screen and flickering together
    for (let letterIndex = 0; letterIndex < LETTER_COUNT; letterIndex++) {
      const el = letterRefs.current[letterIndex];
      if (!el) continue;

      const step =
        settleRank[letterIndex] < settledCount
          ? ANIMATION_STEPS[LAST_STEP]
          : fontStepFor(i, letterIndex);
      // the spring ticks every frame but a step lasts many; skip the write
      // (and the style invalidation it costs) unless the face changed
      if (appliedRef.current[letterIndex] === step) continue;
      appliedRef.current[letterIndex] = step;
      el.style.setProperty("font-family", step.font, "important");
      el.style.setProperty("font-weight", String(step.weight), "important");
      // the new face lands out of a quick blur, like the idle crossfade but
      // faster (these swaps come many per second). a pulse rather than a
      // crossfade: the letters still flow inline here, so the outgoing face
      // has no box to hold while the incoming one fades in
      if (!prefersReducedMotion) el.animate([...FLICKER_PULSE], FLICKER_TIMING);
    }

    // every letter has settled by SETTLE_RAMP_END, so the name is done
    if (v >= SETTLE_RAMP_END) {
      settledRef.current = true;
      setExpanded(true);
    }
  });

  // hold the spring until every face in the cycle is decoded. otherwise a
  // font arriving mid-animation swaps in late and reflows the whole name —
  // the stutter. capped so a slow network never blocks the intro for long
  useEffect(() => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      progress.set(LAST_STEP);
    };

    const text = `${NAME}${LAST_NAME}`;
    const loads = FONT_LOAD_SPECS.map((spec) =>
      document.fonts.load(spec, text),
    );
    Promise.all(loads).then(start, start);
    const cap = setTimeout(start, FONT_LOAD_CAP_MS);

    return () => clearTimeout(cap);
  }, [progress]);

  // lock every letter's box to the width it measures in the settled font.
  // without this, a later idle font change (a different glyph is a
  // different width) nudges the line's total width, and since the block is
  // centred, the whole name shifts sideways — only the glyph should change
  useEffect(() => {
    if (!expanded) return;

    // measure everything first, then write, so locking one letter can't
    // shift the ones measured after it
    // in em, not px: the font-size spring is still finishing its last bit
    // when this runs, and the boxes must keep tracking it
    const boxes = letterRefs.current.slice(0, LETTER_COUNT).map((el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const fontPx = Number.parseFloat(getComputedStyle(el).fontSize);
      return { width: rect.width / fontPx, height: rect.height / fontPx };
    });

    boxes.forEach((box, index) => {
      const el = letterRefs.current[index];
      if (!el || !box) return;
      el.style.width = `${box.width}em`;
      el.style.height = `${box.height}em`;
      // from here the glyphs are absolutely centred in the box (see
      // .name-letter in globals.css), so a wider face overflows evenly
      el.dataset.locked = "";
    });
  }, [expanded]);

  // once expanded, a few random letters at a time drift into a different
  // font for a couple seconds, then drift back — never the whole name at
  // once, and never on a fixed beat
  useEffect(() => {
    if (!expanded) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const running: Animation[] = [];
    // letters mid-crossfade or currently away from nameFont; never picked
    // again until they're back
    const busy = new Set<number>();

    // crossfade a letter to another face: the spare glyph layer takes the
    // new face and fades in while the current one fades out, then the
    // current layer adopts the new face and the spare goes quiet again
    const morph = (index: number, step: FontStep, onDone?: () => void) => {
      const letter = letterRefs.current[index];
      const glyphs = letter?.children;
      if (!letter || !glyphs || glyphs.length < 2) return;
      const current = glyphs[0] as HTMLElement;
      const spare = glyphs[1] as HTMLElement;

      spare.style.fontFamily = step.font;
      spare.style.fontWeight = String(step.weight);
      // natural width first (fit 1), then shrink to the letter's box
      spare.style.setProperty("--fit", "1");
      const natural = spare.getBoundingClientRect().width;
      const fit =
        natural > 0
          ? Math.min(1, (letter.offsetWidth * MORPH_FIT_SLACK) / natural)
          : 1;
      spare.style.setProperty("--fit", String(fit));

      const timing = {
        duration: MORPH_MS,
        easing: "ease-in-out",
        fill: "forwards",
      } as const satisfies KeyframeAnimationOptions;
      const fadeIn = spare.animate([...GLYPH_IN], timing);
      const fadeOut = current.animate([...GLYPH_OUT], timing);
      running.push(fadeIn, fadeOut);

      fadeIn.finished
        .then(() => {
          current.style.fontFamily = step.font;
          current.style.fontWeight = String(step.weight);
          current.style.setProperty("--fit", String(fit));
          fadeIn.cancel();
          fadeOut.cancel();
          onDone?.();
        })
        .catch(() => {
          // cancelled by unmount
        });
    };

    const scheduleNext = () => {
      const delay =
        IDLE_CHANGE_MIN_MS +
        Math.random() * (IDLE_CHANGE_MAX_MS - IDLE_CHANGE_MIN_MS);
      timers.push(
        setTimeout(() => {
          if (cancelled) return;

          const count =
            IDLE_CHANGE_LETTERS_MIN +
            Math.floor(
              Math.random() *
                (IDLE_CHANGE_LETTERS_MAX - IDLE_CHANGE_LETTERS_MIN + 1),
            );
          const free = Array.from({ length: LETTER_COUNT }, (_, i) => i).filter(
            (i) => !busy.has(i),
          );
          const indices = shuffledRanks(free.length)
            .slice(0, Math.min(count, free.length))
            .map((i) => free[i]);

          for (const index of indices) {
            busy.add(index);
            const step =
              ANIMATION_STEPS[
                Math.floor(Math.random() * (ANIMATION_STEPS.length - 1))
              ];

            const hold =
              IDLE_CHANGE_DURATION_MIN_MS +
              Math.random() *
                (IDLE_CHANGE_DURATION_MAX_MS - IDLE_CHANGE_DURATION_MIN_MS);

            // fade to the new face, hold it, fade back to nameFont
            morph(index, step, () => {
              if (cancelled) return;
              timers.push(
                setTimeout(() => {
                  morph(index, ANIMATION_STEPS[LAST_STEP], () =>
                    busy.delete(index),
                  );
                }, hold),
              );
            });
          }

          scheduleNext();
        }, delay),
      );
    };

    scheduleNext();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      for (const animation of running) animation.cancel();
    };
  }, [expanded]);

  if (router.pathname === "/404") {
    return (
      <>
        <Head>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: font vars */}
          <style dangerouslySetInnerHTML={{ __html: FONT_VARS }} />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  return (
    <main className="flex h-full w-full overflow-hidden">
      <Head>
        <title>{SITE_TITLE}</title>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: font vars */}
        <style dangerouslySetInnerHTML={{ __html: FONT_VARS }} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />

        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static json-ld
          dangerouslySetInnerHTML={{ __html: JSON_LD }}
        />
      </Head>

      <div className="flex flex-1 min-w-0 bg-stone-200">
        <div className="flex-1 min-w-0 flex justify-center px-6 py-[15vh] overflow-y-auto">
          <LayoutGroup>
            <motion.div
              // position only: when the intro/socials/experience mount below,
              // a full layout animation would animate the height change via
              // scale — squashing the name (still mid font-size spring) as
              // a visible glitch. position-only leaves the height change to
              // resolve instantly and just smooths any x/y shift
              layout={expanded ? "position" : false}
              className="relative flex flex-col items-start w-full min-w-0 md:w-auto max-w-md md:max-w-none"
              transition={NAME_WRAPPER_SPRING_CONFIG}
            >
              <motion.h1
                // the vw term above is sized so the full name fits on one
                // line even on the narrowest phones
                className="will-change-transform whitespace-nowrap"
                style={{ fontSize: fontSizeRem }}
                aria-label={`${NAME} ${LAST_NAME}`}
              >
                <span className="whitespace-nowrap">
                  {[...NAME].map((letter, i) => (
                    <NameLetter
                      // biome-ignore lint/suspicious/noArrayIndexKey: static string
                      key={i}
                      letter={letter}
                      step={fontStepFor(0, i)}
                      register={(el) => {
                        letterRefs.current[i] = el;
                      }}
                    />
                  ))}
                </span>{" "}
                <span className="whitespace-nowrap">
                  {[...LAST_NAME].map((letter, i) => (
                    <NameLetter
                      // biome-ignore lint/suspicious/noArrayIndexKey: static string
                      key={i}
                      letter={letter}
                      step={fontStepFor(0, NAME.length + i)}
                      register={(el) => {
                        letterRefs.current[NAME.length + i] = el;
                      }}
                    />
                  ))}
                </span>
              </motion.h1>

              {expanded ? (
                <>
                  <AnimatedText
                    text={INTRO}
                    links={INTRO_LINKS}
                    wordDelay={0.015}
                    lineDelay={0.12}
                    element="p"
                    // w-0 + min-w-full: fill the column without letting the
                    // long line widen it past the rows below
                    className="w-0 min-w-full mt-1"
                  />

                  <SocialStickers />

                  <Component {...pageProps} />
                </>
              ) : null}

              <noscript>
                <p>
                  Hey, I&apos;m Nithin. I study Operations Research &amp;
                  Mathematics and currently on a gap year in San Francisco. I
                  enjoy <a href={INTRO_LINKS.traveling.href}>traveling</a>,
                  making ceramics &amp; scrolling on{" "}
                  <a href={INTRO_LINKS.Cosmos.href}>Cosmos</a>.
                </p>
                <nav>
                  {SOCIALS.map((social) => (
                    <a key={social.label} href={social.href}>
                      {social.label}
                    </a>
                  ))}
                </nav>

                <h2>Experience</h2>
                {WORK_ITEMS.map((item) => (
                  <div key={item.slug}>
                    <a href={item.url}>
                      <strong>{item.company}</strong> — {item.role}
                    </a>
                    <p>{item.about}</p>
                    <span>{item.date}</span>
                  </div>
                ))}

                <h2>Projects</h2>
                {PROJECTS.map((project) => (
                  <div key={project.slug}>
                    <a href={project.url}>
                      <strong>{project.name}</strong> — {project.role}
                    </a>
                    <p>{project.about}</p>
                  </div>
                ))}
              </noscript>
            </motion.div>
          </LayoutGroup>
        </div>
      </div>
    </main>
  );
}
