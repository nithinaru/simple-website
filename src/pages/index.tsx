import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bear } from "@/components/bear";
import { Dock, type DockItem, keepDockInView } from "@/components/dock";
import {
  LABEL_FAMILY,
  MONO_FAMILY,
  TEXT_FAMILY,
  TEXT_SCALE,
  TEXTURE,
  TextureFilters,
} from "@/components/options";
import {
  follow,
  type Hover,
  PixelPreview,
  preload,
} from "@/components/pixel-preview";
import { RulerIntro } from "@/components/ruler-intro";
import { Bridge, Fountain, Globe, Sign, underline } from "@/components/sketch";

/*
 * the whole site: a name and a few short paragraphs about right now, sized
 * to fit the window so nothing scrolls.
 *
 * the opening, after justinschueler.com, runs in four stages:
 *   appear   measuring guides draw in around where the name will be (see
 *            RulerIntro); everything else waits behind a fog
 *   sweep    a band of colour runs along the name and leaves it in ink
 *   out      the guides pull back and the rest of the page comes into focus
 *   settled  ordinary text
 */

type Link = {
  text: string;
  /** without one, it's just a logo and a word */
  href?: string;
  /** domain to take the logo from */
  logo?: string;
  /** or the address of the logo itself */
  logoSrc?: string;
  /** or a one-colour shape, tinted with css: [address, colour, width in em] */
  mark?: readonly [string, string, number];
  /** the mark already says the name, so don't print the text beside it */
  wordless?: boolean;
  /** or a drawing */
  icon?: "fountain";
  /** screenshot shown on hover, from public/images/previews */
  preview?: string;
  /** the page moves: there's a looping clip beside the screenshot */
  moving?: boolean;
};
/** a phrase that opens the socials when hovered */
type Net = { net: string };
type Token = string | Link | Net;

const favicon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const NAME = "Nithin.";
const GREETING = "Hey, I'm";

const COPY: Token[][] = [
  [
    "Everything I do is for the 8 year old & 80 year old version of myself. I'm active on ",
    { net: "the internet" },
    " & on a gap year from ",
    {
      // "Cal" in the university's own script, in california gold
      text: "Cal",
      wordless: true,
      mark: [
        "https://upload.wikimedia.org/wikipedia/commons/8/8b/California_Golden_Bears_logo.svg",
        "#fdb515",
        1.44,
      ],
    },
    ".",
  ],
  [
    "I'm building the future of dynamic pricing at ",
    {
      text: "Priceflag",
      href: "https://priceflag.org/",
      // the flag-bearer from the priceflag logo, on his own
      mark: ["/images/logos/priceflag-mark.svg", "#1f4fff", 0.62],
      preview: "priceflag",
    },
    ", and breaking AI agents at ",
    {
      text: "Idler",
      href: "https://idler.ai/",
      logo: "idler.ai",
      preview: "idler-widget-factory",
      moving: true,
    },
    " (YC S25).",
  ],
  [
    "Away from the screen I ",
    {
      text: "travel",
      href: "https://travel.nithinaruswamy.com/",
      preview: "travel",
      moving: true,
    },
    ", throw pots, and tend my ",
    {
      text: "Private Garden",
      href: "https://studio.nithinaruswamy.com",
      icon: "fountain",
      preview: "private-garden",
      moving: true,
    },
    ".",
  ],
];

const SOCIALS: readonly DockItem[] = [
  { label: "Twitter", href: "https://x.com/nithinaru", logo: "x.com" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/aruswamy",
    logo: "linkedin.com",
  },
  { label: "GitHub", href: "https://github.com/nithinaru", logo: "github.com" },
  {
    label: "Cosmos",
    href: "https://www.cosmos.so/nithinaru",
    logo: "cosmos.so",
  },
  {
    label: "Scholar",
    href: "https://scholar.google.com/citations?user=jqQkW0AAAAAJ&hl=en&oi=ao",
    logo: "scholar.google.com",
  },
];

const LINKS = COPY.flat().filter(
  (t): t is Link => typeof t !== "string" && "text" in t,
);
const PREVIEWS = LINKS.flatMap((l) =>
  l.preview ? [`/images/previews/${l.preview}.webp`] : [],
);
const CLIPS = LINKS.flatMap((l) =>
  l.preview && l.moving ? [`/images/previews/${l.preview}.mp4`] : [],
);

// timing of the opening, in ms
const START = 700; // the guides are drawn by now
const LINE_MS = 560; // how long the colour takes to cross the name
const LINE_GAP = 170; // between lines, should the name ever wrap
const BAND = 150; // width of the colour band, px
const RETRACT = 760; // how long the guides take to leave

type Stage = "appear" | "sweep" | "out" | "settled";

/** shrink the type until the column fits the window: the page never scrolls */
const fit = (root: HTMLElement, column: HTMLElement) => {
  let scale = 1;
  root.style.setProperty("--fit", "1");
  const style = getComputedStyle(root);
  const room =
    root.clientHeight -
    Number.parseFloat(style.paddingTop) -
    Number.parseFloat(style.paddingBottom);
  for (let pass = 0; pass < 5 && column.offsetHeight > room; pass++) {
    // smaller type also means fewer lines, so close in over a few passes
    scale *= Math.max(0.5, room / column.offsetHeight) * 0.99;
    root.style.setProperty("--fit", scale.toFixed(4));
  }
};

/** write on each cobalt line and box how big it is, like the guides do */
const labelLinks = (column: HTMLElement) => {
  for (const el of column.querySelectorAll<HTMLElement>(".lnk-t")) {
    el.dataset.w = String(Math.round(el.getBoundingClientRect().width));
  }
  // and on the box round the name, its width and height
  const name = column.querySelector<HTMLElement>(".name");
  const box = column.querySelector<HTMLElement>(".name-box");
  if (name && box) {
    const r = name.getBoundingClientRect();
    box.dataset.size = `${Math.round(r.width)} × ${Math.round(r.height)}`;
  }
};

/*
 * work out which line each piece of the name sits on, and how far along it,
 * so the colour can run through them in reading order. returns the number of
 * lines.
 */
const measure = (root: HTMLElement, name: HTMLElement) => {
  const box = name.getBoundingClientRect();
  root.style.setProperty("--lw", `${box.width.toFixed(1)}px`);
  const items = [...name.querySelectorAll<HTMLElement | SVGElement>(".w, .ink")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el, r, middle: r.top + r.height / 2 };
    })
    .sort((a, b) => a.middle - b.middle);

  let line = -1;
  let floor = Number.NEGATIVE_INFINITY;
  for (const { el, r, middle } of items) {
    // anything that starts below the middle of the current line is on the
    // next one (drawings sit a little off the words' own middle)
    if (r.top > floor) {
      line += 1;
      floor = middle;
    }
    floor = Math.max(floor, middle);
    const x = r.left - box.left;
    el.style.setProperty("--line", String(line));
    el.style.setProperty("--x", `${x.toFixed(1)}px`);
    // how far through the line's sweep the colour reaches this spot
    el.style.setProperty(
      "--xf",
      ((x + BAND * 0.6) / (box.width + BAND)).toFixed(3),
    );
  }
  return line + 1;
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("appear");
  const [hover, setHover] = useState<Hover>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => preload(PREVIEWS, CLIPS), []);

  // the opening, once, when the page arrives
  useLayoutEffect(() => {
    const root = rootRef.current;
    const column = columnRef.current;
    const name = nameRef.current;
    if (!root || !column || !name) return;

    fit(root, column);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("settled");
      return;
    }
    setStage("appear");

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        // measured as late as possible, once the font has settled
        fit(root, column);
        const lines = measure(root, name);
        setStage("sweep");
        const swept = (lines - 1) * LINE_GAP + LINE_MS + 120;
        timers.push(setTimeout(() => setStage("out"), swept));
        timers.push(setTimeout(() => setStage("settled"), swept + RETRACT));
      }, START),
    );
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  // keep fitting the window as it or the font changes
  useEffect(() => {
    const refit = () => {
      if (rootRef.current && columnRef.current) {
        fit(rootRef.current, columnRef.current);
        labelLinks(columnRef.current);
      }
    };
    refit();
    let live = true;
    document.fonts.load(`16px "${TEXT_FAMILY}"`).then(() => live && refit());
    window.addEventListener("resize", refit);
    return () => {
      live = false;
      window.removeEventListener("resize", refit);
    };
  }, []);

  // a selection only paints text, so logos and drawings are told when they're
  // inside one and paint the highlight themselves (see [data-picked] in css)
  useEffect(() => {
    const mark = () => {
      const sel = document.getSelection();
      const live = !!sel && !sel.isCollapsed;
      const pieces = columnRef.current?.querySelectorAll(
        ".logo, .mark, .sign, .name-over, .name-box, .coords, .lnk-t",
      );
      for (const el of pieces ?? []) {
        el.toggleAttribute("data-picked", live && sel.containsNode(el, true));
      }
    };
    document.addEventListener("selectionchange", mark);
    return () => document.removeEventListener("selectionchange", mark);
  }, []);

  // the heading is cut into words, so the opening can bring them in one by one
  const words = (text: string, slot?: () => React.CSSProperties) =>
    text.split(/(\s+)/).map((piece, i) =>
      piece.trim() === "" ? (
        piece && " "
      ) : (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed copy
        <span key={i} className="w" style={slot?.()}>
          {piece}
        </span>
      ),
    );

  let linkSeed = 11;
  const link = (l: Link, key: number) => {
    const seed = linkSeed;
    linkSeed += 7;
    const src = l.preview ? `/images/previews/${l.preview}.webp` : null;
    const video =
      l.preview && l.moving ? `/images/previews/${l.preview}.mp4` : undefined;
    const logo = l.logoSrc ?? (l.logo ? favicon(l.logo) : null);
    const inner = (
      <>
        {l.icon === "fountain" ? <Fountain seed={71} /> : null}
        {l.mark ? (
          <span className="mark">
            <span
              style={
                {
                  "--shape": `url(${l.mark[0]})`,
                  "--tint": l.mark[1],
                  width: `${l.mark[2]}em`,
                } as React.CSSProperties
              }
            />
          </span>
        ) : null}
        {logo ? (
          <span className="logo">
            {/* biome-ignore lint/performance/noImgElement: tiny remote logo */}
            <img src={logo} alt="" width={32} height={32} />
          </span>
        ) : null}
        <span
          className={l.href ? "lnk-t" : undefined}
          style={{ "--pen": underline(seed) } as React.CSSProperties}
        >
          <span className={l.wordless ? "tx sr-only" : "tx"}>{l.text}</span>
        </span>
      </>
    );
    if (!l.href) {
      return (
        <span key={key} className="lnk fade">
          {inner}
        </span>
      );
    }
    return (
      <a
        key={key}
        className="lnk fade"
        href={l.href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerEnter={
          src
            ? (e) => {
                if (e.pointerType !== "mouse") return;
                follow(e);
                setHover({
                  src,
                  video,
                  rect: e.currentTarget.getBoundingClientRect(),
                  open: true,
                });
              }
            : undefined
        }
        onPointerMove={src ? follow : undefined}
        onPointerLeave={
          src ? () => setHover((h) => h && { ...h, open: false }) : undefined
        }
      >
        {inner}
      </a>
    );
  };

  const net = (text: string, key: number) => (
    // focusable, so a tap or the keyboard opens the socials as well as a hover
    // biome-ignore lint/a11y/useSemanticElements: a real button can't hold the links
    <span
      key={key}
      className="net"
      role="button"
      aria-haspopup="true"
      tabIndex={0}
      onPointerEnter={(e) => keepDockInView(e.currentTarget)}
      onFocus={(e) => keepDockInView(e.currentTarget)}
    >
      <Globe seed={31} />
      <span
        className="lnk-t"
        style={{ "--pen": underline(53) } as React.CSSProperties}
      >
        <span className="tx">{text}</span>
      </span>
      <Dock items={SOCIALS} />
    </span>
  );

  // the pieces of the name arrive one after another
  let slot = 0;
  const at = () => ({ "--i": slot++ }) as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      className="v2"
      data-stage={stage}
      data-marks="guide"
      data-peek={hover?.open ? "" : undefined}
      style={
        {
          "--font-text": `"${TEXT_FAMILY}"`,
          "--font-mono": `"${MONO_FAMILY}"`,
          "--font-label": `"${LABEL_FAMILY}"`,
          "--scale": TEXT_SCALE,
          // set here, not in the stylesheet, so the #id means this document
          "--texture": `url(#tx-${TEXTURE})`,
          "--line-ms": `${LINE_MS}ms`,
          "--line-gap": `${LINE_GAP}ms`,
          "--band": `${BAND}px`,
        } as React.CSSProperties
      }
    >
      <div className="v2-column" ref={columnRef}>
        <header className="head fade">
          <h1 ref={nameRef}>
            {/* the space is inside the run, so a selection is grainy across it */}
            <span className="tx">{words(GREETING, at)} </span>
            <span className="name">
              <span className="tx">{words(NAME, at)}</span>
              {/* a cobalt text box, as a design tool shows a selected
                  layer: outline, a handle on each corner, its size on a chip.
                  it's drawn once the opening is over (see .name-box) */}
              <span className="name-box" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </span>
          </h1>
          {/* where i am, after locomotive.ca's footer: the bridge, the
              coordinates stacked between arrows, and the state on a plate */}
          <p className="where">
            <Bridge seed={43} />
            <span className="tx">San Francisco </span>
            <span className="coords">
              <span>← 37.7749 →</span>
              <span>→ 122.4194 ←</span>
            </span>
            <span className="tx">California </span>
            <Sign shape="box" label="CA" seed={9} />
          </p>
        </header>

        <div className="rest">
          {COPY.map((tokens, p) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed copy
            <p key={p}>
              {tokens.map((t, i) =>
                typeof t === "string" ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed copy
                  <span key={i} className="fade">
                    <span className="tx">{t}</span>
                  </span>
                ) : "net" in t ? (
                  net(t.net, i)
                ) : (
                  link(t, i)
                ),
              )}
            </p>
          ))}
        </div>
      </div>

      {/* once everything is in, the bear sets off */}
      {stage === "settled" ? <Bear beside={nameRef} /> : null}

      {stage === "settled" ? null : (
        <RulerIntro target={nameRef} leaving={stage === "out"} />
      )}

      <TextureFilters />

      <PixelPreview hover={hover} />
    </div>
  );
}
