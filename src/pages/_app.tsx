import AnimatedText from "@/components/animated-text";
import { PlaneIcon, SparkleIcon } from "@/components/icons";
import { SocialStickers } from "@/components/social-stickers";
import { PROJECTS, SOCIALS, WORK_ITEMS } from "@/utils/constants";
import "@/globals.css";
import {
  LayoutGroup,
  type MotionNodeAnimationOptions,
  motion,
  type Transition,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "motion/react";
import type { AppProps } from "next/app";
import { Goudy_Bookletter_1911, Instrument_Sans } from "next/font/google";
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

// exposed on :root (rather than via next/font's class) so the 404 page, which
// renders outside <main>, gets the same fonts
const FONT_VARS = `:root{--font-body:${bodyFont.style.fontFamily};--font-name:${nameFont.style.fontFamily}}`;

const NAME_WRAPPER_SPRING_CONFIG = {
  type: "spring",
  stiffness: 80,
  damping: 20,
} as const satisfies Transition;

const NAME_SPRING_CONFIG = {
  stiffness: 30,
  damping: 15,
  mass: 3,
} as const satisfies Transition;

const ANIMATION_STEPS = [
  { font: '"Redaction 100"', weight: 700, size: 16 },
  { font: '"Redaction 10"', weight: 400, size: 13 },
  { font: '"Redaction 70"', weight: 700, size: 10 },
  { font: '"Redaction"', weight: 400, size: 8 },
  { font: '"Redaction 35"', weight: 700, size: 6.5 },
  { font: '"Redaction 100"', weight: 400, size: 5.2 },
  { font: '"Redaction 20"', weight: 400, size: 4.2 },
  { font: "var(--font-name), serif", weight: 400, size: 3.75 },
] as const satisfies Array<{
  font: string;
  weight: number;
  size: number;
}>;

const NAME = "Nithin";
const LAST_NAME = "Aruswamy";

const INTRO =
  "Hey, I'm Nithin. I study Operations Research & Mathematics and currently on a gap year in San Francisco. I enjoy traveling, making ceramics & scrolling on Cosmos.";
const INTRO_LINKS = {
  traveling: {
    href: "https://travel.nithinaruswamy.com/",
    icon: <PlaneIcon />,
  },
  Cosmos: { href: "https://www.cosmos.so/nithinaru", icon: <SparkleIcon /> },
};

// the last name arrives with the rest of the page once the intro has landed
const LAST_NAME_LETTER_ANIMATION = {
  initial: { opacity: 0, y: "0.2em", filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
} as const satisfies MotionNodeAnimationOptions;

const LAST_STEP = ANIMATION_STEPS.length - 1;
const STEP_INDICES = ANIMATION_STEPS.map((_, i) => i);
const STEP_SIZES = ANIMATION_STEPS.map((s) => s.size);

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

// each word breathes on its own: a timer swells one random letter at a time
// (see .name-letter in globals.css), and the letters either side of it swell
// a little less so it reads as one soft bulge. the next letter only starts
// once the last has mostly settled, so there's only ever one bulge. mostly
// slow, with the occasional burst of two or three quick breaths.
const SLOW_MS = [2200, 3200] as const;
const FAST_MS = [550, 850] as const;
// how far into the previous letter's settle the next one starts
const OVERLAP = 0.75;
const BURST_CHANCE = 0.22;

// once the name has arrived, a wave swells the letters one by one left to
// right, holds them all big, then settles them the same way (see
// .name-letter in globals.css). every letter holds for the same time, so
// each one's keyframes only differ by their delay. breathing waits until
// the wave is done.
const LETTER_COUNT = NAME.length + LAST_NAME.length;
const WAVE_START_MS = 3500;
const WAVE_STEP_MS = 55;
// the name-wave keyframes assume the rise and fall are 13% of the run each
const WAVE_RISE_MS = 300;
const WAVE_HOLD_MS = 1000;
const WAVE_LETTER_MS =
  2 * WAVE_RISE_MS + (LETTER_COUNT - 1) * WAVE_STEP_MS + WAVE_HOLD_MS;
const WAVE_END_MS =
  WAVE_START_MS + (LETTER_COUNT - 1) * WAVE_STEP_MS + WAVE_LETTER_MS;
// outermost letters peak at the edge stroke, the middle ones at the centre
const WAVE_EDGE_EM = 0.05;
const WAVE_CENTRE_EM = 0.09;

const waveStyle = (i: number) => {
  const mid = (LETTER_COUNT - 1) / 2;
  const nearness = 1 - Math.abs(i - mid) / mid;
  const peak = WAVE_EDGE_EM + (WAVE_CENTRE_EM - WAVE_EDGE_EM) * nearness;
  return {
    "--wave-delay": `${WAVE_START_MS + i * WAVE_STEP_MS}ms`,
    "--wave-ms": `${WAVE_LETTER_MS}ms`,
    "--wave-peak": `${peak.toFixed(3)}em`,
  } as React.CSSProperties;
};

const between = ([min, max]: readonly [number, number]) =>
  min + Math.random() * (max - min);

type Breath = "main" | "near" | undefined;

function useBreathing(length: number, startDelayMs: number) {
  const [current, setCurrent] = useState(-1);
  const [durationMs, setDurationMs] = useState<number>(SLOW_MS[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let last = -1;
    let burstLeft = 0;

    const breathe = () => {
      if (burstLeft === 0 && Math.random() < BURST_CHANCE) {
        burstLeft = 2 + Math.floor(Math.random() * 2);
      }
      const fast = burstLeft > 0;
      if (fast) burstLeft -= 1;
      const duration = between(fast ? FAST_MS : SLOW_MS);

      let i = Math.floor(Math.random() * (length - 1));
      if (i >= last) i += 1;
      last = i;
      setDurationMs(duration);
      setCurrent(i);

      timer = setTimeout(() => {
        setCurrent(-1);
        timer = setTimeout(breathe, duration * OVERLAP);
      }, duration);
    };
    timer = setTimeout(breathe, startDelayMs);

    return () => clearTimeout(timer);
  }, [length, startDelayMs]);

  const breathOf = (i: number): Breath => {
    if (current < 0) return undefined;
    if (i === current) return "main";
    if (Math.abs(i - current) === 1) return "near";
    return undefined;
  };

  // the transition runs at the current breath's pace, in and back out
  const style = {
    "--breath-ms": `${Math.round(durationMs)}ms`,
  } as React.CSSProperties;

  return { breathOf, style };
}

function FirstName() {
  const { breathOf, style } = useBreathing(NAME.length, WAVE_END_MS);

  return [...NAME].map((letter, i) => (
    <span
      // biome-ignore lint/suspicious/noArrayIndexKey: static string
      key={i}
      aria-hidden="true"
      className="name-letter"
      data-breathing={breathOf(i)}
      style={{ ...style, ...waveStyle(i) }}
    >
      {letter}
    </span>
  ));
}

function LastName() {
  const { breathOf, style } = useBreathing(
    LAST_NAME.length,
    WAVE_END_MS + 1500,
  );

  return [...LAST_NAME].map((letter, i) => (
    <motion.span
      // biome-ignore lint/suspicious/noArrayIndexKey: static string
      key={i}
      aria-hidden="true"
      className="inline-block name-letter"
      data-breathing={breathOf(i)}
      style={{ ...style, ...waveStyle(NAME.length + i) }}
      initial={LAST_NAME_LETTER_ANIMATION.initial}
      animate={LAST_NAME_LETTER_ANIMATION.animate}
      transition={{
        duration: 1,
        ease: [0.2, 0.65, 0.3, 0.9],
        delay: 0.15 + i * 0.04,
      }}
    >
      {letter}
    </motion.span>
  ));
}

export default function App({ Component, pageProps, router }: AppProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const progress = useMotionValue(0);
  const spring = useSpring(progress, NAME_SPRING_CONFIG);
  const [expanded, setExpanded] = useState(false);

  const fontSize = useTransform(spring, STEP_INDICES, STEP_SIZES);
  const fontSizeRem = useTransform(
    fontSize,
    (v) =>
      `clamp(${(v * 0.3).toFixed(2)}rem, ${(v * 2.9).toFixed(2)}vw, ${v}rem)`,
  );

  useMotionValueEvent(spring, "change", (v) => {
    if (!ref.current) {
      return;
    }

    const i = Math.max(0, Math.min(Math.round(v), LAST_STEP));
    ref.current.style.setProperty(
      "font-family",
      ANIMATION_STEPS[i].font,
      "important",
    );
    ref.current.style.setProperty(
      "font-weight",
      String(ANIMATION_STEPS[i].weight),
      "important",
    );

    // the spring may settle on LAST_STEP without ever overshooting it, so
    // expand as soon as it's effectively there rather than strictly past it
    if (v >= LAST_STEP - 0.05) {
      setExpanded(true);
    }
  });

  useEffect(() => {
    progress.set(LAST_STEP);
  }, [progress]);

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
              layout
              className="relative flex flex-col items-start w-full min-w-0 md:w-auto max-w-md md:max-w-none"
              transition={NAME_WRAPPER_SPRING_CONFIG}
            >
              <motion.h1
                // position only: the last name widens the heading when it
                // arrives, and a full layout animation would do that by
                // scaling — visibly stretching the first name
                layout="position"
                ref={ref}
                // the vw term above is sized so the full name fits on one
                // line even on the narrowest phones
                className="will-change-transform whitespace-nowrap"
                style={{ fontSize: fontSizeRem }}
                aria-label={`${NAME} ${LAST_NAME}`}
              >
                {expanded ? (
                  <>
                    <span className="whitespace-nowrap">
                      <FirstName />
                    </span>{" "}
                    <span className="whitespace-nowrap">
                      <LastName />
                    </span>
                  </>
                ) : (
                  NAME
                )}
              </motion.h1>

              {expanded ? (
                <>
                  <AnimatedText
                    text={INTRO}
                    links={INTRO_LINKS}
                    wordDelay={0.03}
                    lineDelay={0.5}
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
