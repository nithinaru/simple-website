/*
 * change one short piece of text into another by shuffling: the letters
 * churn through random characters and settle into the new text from the
 * left, while the length slides from the old one to the new one.
 */

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789×·+";
const TICK = 40; // ms between redraws

const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** returns a function that stops it early */
export const shuffleText = (
  write: (text: string) => void,
  from: string,
  to: string,
  ms = 520,
) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    write(to);
    return () => {};
  }
  const start = Date.now();
  // a timer rather than animation frames: the churn should be a little coarse
  const timer = setInterval(() => {
    const p = Math.min(1, (Date.now() - start) / ms);
    if (p >= 1) {
      clearInterval(timer);
      write(to);
      return;
    }
    const length = Math.round(from.length + (to.length - from.length) * p);
    const settled = Math.floor(p * to.length);
    let out = to.slice(0, settled);
    for (let i = settled; i < length; i++) {
      // spaces stay put, so the words keep their shape while they churn
      out += to[i] === " " ? " " : pick();
    }
    write(out);
  }, TICK);
  return () => clearInterval(timer);
};

/** put text on the clipboard, falling back for browsers that refuse the api */
export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
};
