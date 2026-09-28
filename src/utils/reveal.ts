// entrance timings (seconds) for everything under the name, so the page
// reveals as one top-to-bottom cascade: intro lines, then the social
// stickers, then each section's heading followed by its rows. every piece
// uses the same fade-up (see REVEAL_ANIMATION)

// the stickers start while the intro's later lines are still arriving
export const STICKERS_START = 0.2;

// the first section starts while the intro's last line is still landing
export const FIRST_SECTION_START = 0.3;

// a section's rows trail its heading by this much
export const HEADING_TO_ROWS = 0.1;

// gap between one row starting and the next
export const ROW_STEP = 0.05;

// pause between the last row of a section and the next section's heading
export const SECTION_GAP = 0.03;

// how long each piece takes to fade up
export const REVEAL_DURATION = 0.5;

// when the rows of a section that starts at `start` (its heading) begin
export const rowsStart = (start: number) => start + HEADING_TO_ROWS;

// when the section after one with `rowCount` rows, starting at `start`, begins
export const nextSectionStart = (start: number, rowCount: number) =>
  rowsStart(start) + rowCount * ROW_STEP + SECTION_GAP;
