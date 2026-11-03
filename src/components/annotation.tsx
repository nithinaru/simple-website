import { motion, useReducedMotion } from "motion/react";

export type AnnotationKind = "box" | "highlight";

// a hand-marked note on a word, in the spirit of rough notation: a marker
// swipe behind it, or a pen box around it. it draws in left to right once the
// row has settled. the svg stretches to the word, so x is a percentage of the
// word's width.
const DRAW = {
  initial: { clipPath: "inset(0 100% 0 0)" },
  animate: { clipPath: "inset(0 0% 0 0)" },
} as const;

// marker: one fat, slightly tilted stroke that sits low on the letters, like
// a highlighter dragged a touch off-level
const HIGHLIGHT_PATH = "M0 12.6 Q 48 10.6, 100 11.4";

// box: two passes of a pen round the word. the first starts top left and
// overshoots back past its start; the second is lighter and a little off.
const BOX_PATHS = [
  "M1.5 3.2 L 98.4 2.4 L 99.2 21.4 L 0.8 22.2 L 1.8 1.6",
  "M-0.6 4.4 L 99.6 3.6 L 97.9 22.8 L 2.4 21.1 Z",
] as const;

export function Annotation({
  kind,
  delay,
}: {
  kind: AnnotationKind;
  delay: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={
        kind === "highlight"
          ? "pointer-events-none absolute -inset-x-1 -top-0.5 h-[calc(100%+0.25rem)] w-[calc(100%+0.5rem)] overflow-visible text-[var(--marker)]"
          : "pointer-events-none absolute -inset-x-1.5 -top-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.75rem)] overflow-visible text-stone-500"
      }
      initial={reduce ? false : DRAW.initial}
      animate={DRAW.animate}
      transition={{
        duration: kind === "highlight" ? 0.6 : 0.9,
        ease: [0.45, 0, 0.25, 1],
        delay,
      }}
    >
      {kind === "highlight" ? (
        <path
          d={HIGHLIGHT_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="15"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path
            d={BOX_PATHS[0]}
            strokeWidth="1.25"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={BOX_PATHS[1]}
            strokeWidth="0.9"
            strokeLinejoin="round"
            opacity="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      )}
    </motion.svg>
  );
}
