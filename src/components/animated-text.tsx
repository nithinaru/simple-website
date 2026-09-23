import { motion, type Variants } from "framer-motion";
import React from "react";

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
};

const AnimatedText = ({
  element,
  className,
  text,
  artificialDelay,
  links,
  wordDelay = 0.25,
}: IAnimatedTextProps) => {
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
          {/* a border, not text-decoration: underlines don't reach the
              inline-block letter spans. kept off the icon. */}
          <span className="border-b border-stone-400 group-hover:border-current transition-colors">
            {renderCharacters(bare)}
          </span>
          {link.icon ? (
            <motion.span
              className="inline-block"
              variants={CHARACTER_ANIMATION}
              custom={1}
            >
              {link.icon}
            </motion.span>
          ) : null}
        </a>
        {renderCharacters(trailing)}
      </>
    );
  };

  const Children = text.split(" ").map((word, index) => (
    <motion.span
      // biome-ignore lint/suspicious/noArrayIndexKey: cry harder
      key={index}
      className="inline-block mr-[0.25em] whitespace-nowrap will-change-transform"
      aria-hidden="true"
      initial="initial"
      animate="animate"
      transition={{
        delayChildren: index * wordDelay + (artificialDelay ?? 0),
        staggerChildren: 0.025,
      }}
    >
      {renderWord(word)}
    </motion.span>
  ));

  return React.createElement(element, { className }, Children);
};

export default AnimatedText;
