import { SOCIALS } from "@/utils/constants";

const ROW = 0.11;
const HEADING_LEAD = 0.15;
const SECTION_GAP = 0.26;

// summary starts as soon as the page expands. buttons wait until that
// paragraph is underway, then each section follows the one above it.
export const BUTTON_DELAY = 1.06;
export const BUTTON_STEP = 0.074;

export const EXPERIENCE_AT =
  BUTTON_DELAY + Math.max(0, SOCIALS.length - 1) * BUTTON_STEP + 0.32;

export function cascade(start: number, count: number) {
  const row = (index: number) => start + HEADING_LEAD + index * ROW;
  const next =
    count === 0 ? start + SECTION_GAP : row(count - 1) + ROW + SECTION_GAP;
  return { heading: start, row, next };
}
