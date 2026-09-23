import { motion, type Variants } from "motion/react";
import React, { useLayoutEffect, useRef, useState } from "react";

const CHARACTER_ANIMATION = {
  initial: {
    opacity: 0,
    y: 5,
  },
  animate: (charCount: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: charCount === 1 ? 0.25 : 1, // if its just like "&", make the duration rlly small
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  }),
} as const satisfies Variants;

// a link's underline draws left to right alongside its letters
const UNDERLINE_ANIMATION = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
  },
} as const satisfies Variants;

type IAnimatedTextProps = {
  text: string;
  element: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  className?: string;
  artificialDelay?: number;
  /**
   * words to render as links, keyed by the word without trailing punctuation.
   * an optional icon sits after the word, inside the link.
   */
  links?: Record<string, { href: string; icon?: React.ReactNode }>;
  /** seconds between each word starting; keep small for long text */
  wordDelay?: number;
  /**
   * reveal wrapped text one line at a time: seconds between each line
   * starting. wordDelay then staggers words within a line.
   */
  lineDelay?: number;
};

const AnimatedText = ({
  element,
  className,
  text,
  artificialDelay,
  links,
  wordDelay = 0.25,
  lineDelay,
}: IAnimatedTextProps) => {
  const ref = useRef<HTMLElement>(null);
  // for line mode: [line, position in line] per word, measured before paint.
  // words stay hidden until it's known.
  const [layout, setLayout] = useState<Array<[number, number]> | null>(null);

  useLayoutEffect(() => {
    if (lineDelay === undefined || !ref.current) return;
    const words = ref.current.querySelectorAll<HTMLElement>("[data-word]");
    const result: Array<[number, number]> = [];
    let line = -1;
    let top = Number.NEGATIVE_INFINITY;
    let pos = 0;
    for (const word of words) {
      // offsetTop ignores the entrance transform, so this is the resting line
      if (word.offsetTop > top + 2) {
        line += 1;
        top = word.offsetTop;
        pos = 0;
      }
      result.push([line, pos]);
      pos += 1;
    }
    setLayout(result);
  }, [lineDelay]);

  const delayFor = (index: number) => {
    if (lineDelay === undefined) return index * wordDelay;
    const [line, pos] = layout?.[index] ?? [0, 0];
    return line * lineDelay + pos * wordDelay;
  };
  const ready = lineDelay === undefined || layout !== null;

  const renderCharacters = (chars: string) =>
    [...chars].map((character, index) => (
      <motion.span
        // biome-ignore lint/suspicious/noArrayIndexKey: cry harder
        key={index}
        className="inline-block"
        aria-hidden="true"
        custom={chars.length}
        variants={CHARACTER_ANIMATION}
      >
        {character}
      </motion.span>
    ));

  const renderWord = (word: string) => {
    const [, bare, trailing] = word.match(/^(.*?)([.,!?;:]*)$/) ?? [];
    const link = links?.[bare];
    if (!link) return renderCharacters(word);

    return (
      <>
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <span className="relative">
            {renderCharacters(bare)}
            {link.icon ? (
              <motion.span
                className="inline-block"
                variants={CHARACTER_ANIMATION}
                custom={1}
              >
                {link.icon}
              </motion.span>
            ) : null}
            {/* drawn as its own element, not text-decoration (which doesn't
                reach the inline-block letters), so it can sweep in with them.
                runs under the icon too. */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-px h-px origin-left bg-stone-400 group-hover:bg-current transition-colors"
              variants={UNDERLINE_ANIMATION}
            />
          </span>
        </a>
        {renderCharacters(trailing)}
      </>
    );
  };

  // words are separated by real spaces, not margins, so a text selection
  // runs continuously and copies with the spaces intact
  const Children = text.split(" ").map((word, index) => (
    <React.Fragment
      // biome-ignore lint/suspicious/noArrayIndexKey: cry harder
      key={index}
    >
      {index > 0 ? " " : null}
      <motion.span
        data-word
        className="inline-block whitespace-nowrap will-change-transform"
        aria-hidden="true"
        initial="initial"
        animate={ready ? "animate" : "initial"}
        transition={{
          delayChildren: delayFor(index) + (artificialDelay ?? 0),
          staggerChildren: 0.025,
        }}
      >
        {renderWord(word)}
      </motion.span>
    </React.Fragment>
  ));

  return React.createElement(element, { className, ref }, Children);
};

export default AnimatedText;
