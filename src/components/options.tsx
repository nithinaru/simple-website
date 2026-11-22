import { useEffect, useState } from "react";
import { NAME_MARKS, type NameMark } from "@/components/sketch";

/*
 * the choices that are still open (link style, ink texture, font), switchable
 * live from a small panel in the corner. this is scaffolding for picking a direction: once each one is
 * decided, hard-code the winner and delete the panel.
 */

const COLLLETTTIVO = "https://cdn.jsdelivr.net/gh/collletttivo";

export type FontChoice = {
  id: string;
  label: string;
  by: string;
  family: string;
  /** evens out how big each face looks at the same font-size */
  scale: number;
  /** file to load from a cdn; fontshare and google faces come from _document */
  src?: string;
};

const GH = "https://cdn.jsdelivr.net/gh";

// junicode and besley are the two picked so far; the rest are in their vein:
// scholarly old-style book faces, and clarendon-ish slabs
export const FONTS: readonly FontChoice[] = [
  {
    id: "junicode",
    label: "Junicode",
    by: "Peter Baker",
    family: "Junicode",
    scale: 1.06,
    src: `${GH}/psb1558/Junicode-font/webfiles/JunicodeVF-Roman.woff2`,
  },
  {
    id: "besley",
    label: "Besley",
    by: "indestructible type*",
    family: "Besley",
    scale: 0.96,
    src: `${GH}/indestructible-type/Besley/fonts/webfonts/Besley-Regular.woff2`,
  },
  {
    id: "elstob",
    label: "Elstob",
    by: "Peter Baker",
    family: "Elstob",
    scale: 1.06,
    src: `${GH}/psb1558/Elstob-font/webfiles/Elstob.woff2`,
  },
  {
    id: "fanwood",
    label: "Fanwood Text",
    by: "Barry Schwartz",
    family: "Fanwood Text",
    scale: 1.1,
    src: `${GH}/theleagueof/fanwood/webfonts/fanwood_text-webfont.woff`,
  },
  {
    id: "linden-hill",
    label: "Linden Hill",
    by: "Barry Schwartz",
    family: "Linden Hill",
    scale: 1.12,
    src: `${GH}/theleagueof/linden-hill/webfonts/LindenHill-webfont.woff`,
  },
  {
    id: "bagnard",
    label: "Bagnard",
    by: "Sebastien Sanfilippo",
    family: "Bagnard",
    scale: 1.02,
    src: `${GH}/sebsan/Bagnard/Bagnard.otf`,
  },
  {
    id: "ronzino",
    label: "Ronzino",
    by: "Collletttivo",
    family: "Ronzino",
    scale: 1,
    src: `${COLLLETTTIVO}/ronzino@main/fonts/Ronzino-Regular.woff2`,
  },
  {
    id: "brygada",
    label: "Brygada 1918",
    by: "Capitalics",
    family: "Brygada 1918",
    scale: 1.02,
  },
  {
    id: "bona-nova",
    label: "Bona Nova",
    by: "Capitalics",
    family: "Bona Nova",
    scale: 1.04,
  },
  {
    id: "old-standard",
    label: "Old Standard",
    by: "Alexey Kryukov",
    family: "Old Standard TT",
    scale: 1.04,
  },
  {
    id: "castoro",
    label: "Castoro",
    by: "Tiro Typeworks",
    family: "Castoro",
    scale: 0.98,
  },
  {
    id: "averia",
    label: "Averia Serif",
    by: "Dan Sayers",
    family: "Averia Serif Libre",
    scale: 1,
  },
  {
    id: "inknut",
    label: "Inknut Antiqua",
    by: "Claus Eggers Sorensen",
    family: "Inknut Antiqua",
    scale: 0.86,
  },
  {
    id: "trocchi",
    label: "Trocchi",
    by: "Vernon Adams",
    family: "Trocchi",
    scale: 0.94,
  },
  {
    id: "zodiak",
    label: "Zodiak",
    by: "Fontshare",
    family: "Zodiak",
    scale: 1,
  },
  { id: "rowan", label: "Rowan", by: "Fontshare", family: "Rowan", scale: 1 },
  { id: "recia", label: "Recia", by: "Fontshare", family: "Recia", scale: 1 },
  {
    id: "bespoke-slab",
    label: "Bespoke Slab",
    by: "Fontshare",
    family: "Bespoke Slab",
    scale: 1,
  },
];

/** stylesheets for the faces above that come from a font service */
export const FONT_STYLESHEETS = [
  ...["zodiak", "rowan", "recia", "bespoke-slab"].map(
    (font) => `https://api.fontshare.com/v2/css?f[]=${font}@400&display=swap`,
  ),
  "https://fonts.googleapis.com/css2?family=Averia+Serif+Libre&family=Bona+Nova&family=Brygada+1918&family=Castoro&family=Inknut+Antiqua&family=Old+Standard+TT&family=Trocchi&display=swap",
];

// faces used for small parts of the page, whatever the text face is
export const MONO_FAMILY = "Necto Mono";
export const LABEL_FAMILY = "Apfel Grotezk";

const formatOf = (src: string) =>
  src.endsWith(".otf") ? "opentype" : src.endsWith(".woff") ? "woff" : "woff2";

export const FONT_FACE_CSS = [
  ...FONTS.flatMap((f) =>
    f.src
      ? [
          `@font-face{font-family:"${f.family}";src:url("${f.src}") format("${formatOf(f.src)}");font-weight:100 900;font-display:swap}`,
        ]
      : [],
  ),
  `@font-face{font-family:"${MONO_FAMILY}";src:url("${COLLLETTTIVO}/necto-mono@main/fonts/NectoMono-Regular.woff2") format("woff2");font-display:swap}`,
  `@font-face{font-family:"${LABEL_FAMILY}";src:url("${COLLLETTTIVO}/apfel-grotezk@main/fonts/ApfelGrotezk-Fett.woff2") format("woff2");font-weight:700;font-display:swap}`,
].join("");

export type Options = {
  font: string;
  /** how links are marked: a cobalt measuring line, or a pencil stroke */
  marks: "guide" | "sketch";
  /** what the ink of the text looks like */
  texture: Texture;
  /** the hand-drawn mark on the name in the heading */
  nameMark: NameMark;
};

export const TEXTURES = [
  { id: "grain", label: "Grainy ink" },
  { id: "rough", label: "Rough edges" },
  { id: "press", label: "Both" },
  { id: "worn", label: "Worn print" },
  { id: "none", label: "Solid" },
] as const;

export type Texture = (typeof TEXTURES)[number]["id"];

/*
 * the textures, as svg filters laid over each word. noise either thins the
 * ink in specks (grain), nudges the outline about (rough), or both.
 */
export function TextureFilters() {
  const grain = (key: string, strength: number, frequency: number) => (
    <>
      <feTurbulence
        type="fractalNoise"
        baseFrequency={frequency}
        numOctaves="2"
        seed="4"
        result={`${key}-noise`}
      />
      {/* turn the noise into see-through specks */}
      <feColorMatrix
        in={`${key}-noise`}
        type="matrix"
        values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-strength} 0 0 0 ${1 + strength * 0.45}`}
        result={`${key}-specks`}
      />
    </>
  );
  const rough = (key: string, amount: number) => (
    <>
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.55"
        numOctaves="2"
        seed="9"
        result={`${key}-wobble`}
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2={`${key}-wobble`}
        scale={amount}
        xChannelSelector="R"
        yChannelSelector="G"
        result={`${key}-edges`}
      />
    </>
  );
  return (
    <svg className="texture-defs" aria-hidden="true">
      <defs>
        <filter id="tx-grain" x="-10%" y="-40%" width="120%" height="180%">
          {grain("g", 1.1, 1.3)}
          <feComposite in="SourceGraphic" in2="g-specks" operator="in" />
        </filter>
        <filter id="tx-rough" x="-10%" y="-40%" width="120%" height="180%">
          {rough("r", 1.6)}
        </filter>
        <filter id="tx-press" x="-10%" y="-40%" width="120%" height="180%">
          {rough("p", 1.3)}
          {grain("p", 1.1, 1.3)}
          <feComposite in="p-edges" in2="p-specks" operator="in" />
        </filter>
        <filter id="tx-worn" x="-10%" y="-40%" width="120%" height="180%">
          {rough("w", 1.8)}
          {grain("w", 2, 0.75)}
          <feComposite in="w-edges" in2="w-specks" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

export const DEFAULTS: Options = {
  font: "besley",
  marks: "guide",
  texture: "press",
  nameMark: "box",
};

// bump the number to make everyone start again from the defaults
const KEY = "redesign-options-5";

export function useOptions() {
  const [options, setOptions] = useState<Options>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setOptions({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {
      // private window or blocked storage: the defaults are fine
    }
  }, []);

  const set = <K extends keyof Options>(key: K, value: Options[K]) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // see above
      }
      return next;
    });
  };

  return [options, set] as const;
}

function Group<T extends string>({
  title,
  value,
  choices,
  onPick,
}: {
  title: string;
  value: T;
  choices: readonly { id: T; label: string }[];
  onPick: (id: T) => void;
}) {
  return (
    <fieldset className="opt-group">
      <legend>{title}</legend>
      {choices.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-pressed={c.id === value}
          onClick={() => onPick(c.id)}
        >
          {c.label}
        </button>
      ))}
    </fieldset>
  );
}

export function OptionsPanel({
  options,
  set,
  onReplay,
}: {
  options: Options;
  set: ReturnType<typeof useOptions>[1];
  onReplay: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="opt" data-open={open ? "" : undefined}>
      {open ? (
        <div className="opt-panel">
          <Group
            title="Mark on the name"
            value={options.nameMark}
            choices={NAME_MARKS}
            onPick={(id) => set("nameMark", id)}
          />
          <Group
            title="Links"
            value={options.marks}
            choices={[
              { id: "guide", label: "Cobalt measuring line" },
              { id: "sketch", label: "Pencil line" },
            ]}
            onPick={(id) => set("marks", id)}
          />
          <Group
            title="Ink"
            value={options.texture}
            choices={TEXTURES}
            onPick={(id) => set("texture", id)}
          />
          <fieldset className="opt-group opt-fonts">
            <legend>Font</legend>
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={f.id === options.font}
                onClick={() => set("font", f.id)}
              >
                <span style={{ fontFamily: `"${f.family}", serif` }}>
                  {f.label}
                </span>
                <small>{f.by}</small>
              </button>
            ))}
          </fieldset>
          <button type="button" className="opt-replay" onClick={onReplay}>
            Replay intro
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="opt-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Options"}
      </button>
    </div>
  );
}
