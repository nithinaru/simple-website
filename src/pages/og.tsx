import Head from "next/head";
import {
  LABEL_FAMILY,
  LOOK,
  MONO_FAMILY,
  TEXT_FAMILY,
} from "@/components/options";
import { Bridge } from "@/components/sketch";

/*
 * a scratch page, not part of the site: ideas for the card that shows
 * when the link is sent to someone (the og:image, or a short clip of it).
 * each is drawn at the real size, 1200 by 630, and shown as it would sit in
 * a message. once one is picked it becomes a real image and this page goes.
 */

const BLUE = "#1f4fff";
const INK = "#141414";
const ORANGE = "#c8432b";
const W = 1200;
const H = 630;

const serif = `"${TEXT_FAMILY}", Georgia, serif`;
const mono = `"${MONO_FAMILY}", ui-monospace, monospace`;
const heavy = `"${LABEL_FAMILY}", sans-serif`;

/** a hand-drawn sign from the site, placed on a card at a given size */
function Drawn({
  x,
  y,
  size,
  children,
}: {
  x: number;
  y: number;
  size: number;
  children: React.ReactNode;
}) {
  return (
    <foreignObject x={x} y={y} width={size * 1.6} height={size * 1.1}>
      <span className="og-drawn" style={{ fontSize: size }}>
        {children}
      </span>
    </foreignObject>
  );
}

const handle = (x: number, y: number) => (
  <rect
    key={`${x}-${y}`}
    x={x - 9}
    y={y - 9}
    width="18"
    height="18"
    fill="#fff"
    stroke={BLUE}
    strokeWidth="3"
  />
);

type Card = { name: string; note: string; art: React.ReactNode };

// the dots: flat, a few sizes, dropped over the type so they overlap it
const dots = (list: [number, number, number, string][]) =>
  list.map(([cx, cy, r, fill]) => (
    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} />
  ));

const YELLOW = "#f2b632";

/** the second line of the plate: a small bridge, the city, the coordinates */
const cityLine = (y: number, size: number) => (
  <>
    <Drawn x={62} y={y - size * 0.86} size={size * 0.9}>
      <Bridge seed={43} />
    </Drawn>
    <text
      x={62 + size * 1.5}
      y={y}
      fontFamily={serif}
      fontSize={size}
      fill={INK}
    >
      San Francisco
    </text>
    <text
      x={62 + size * 9.05}
      y={y - size * 0.4}
      fontFamily={heavy}
      fontWeight="700"
      fontSize={size * 0.27}
      fill={INK}
    >
      ← 37.7749 →
    </text>
    <text
      x={62 + size * 9.05}
      y={y - size * 0.06}
      fontFamily={heavy}
      fontWeight="700"
      fontSize={size * 0.27}
      fill={INK}
    >
      → 122.4194 ←
    </text>
  </>
);

// round two, from what you said about the first six: keep the dots, keep the
// bridge but small, and the plate with fewer words
const CARDS: Card[] = [
  {
    name: "The plate, two lines",
    note: "The address plate with the last line gone: your name, then the city with a small bridge and the coordinates.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <text x="64" y="290" fontFamily={serif} fontSize="118" fill={INK}>
          Nithin Aruswamy
        </text>
        {cityLine(440, 96)}
      </>
    ),
  },
  {
    name: "The plate, with dots",
    note: "The same two lines, with a few flat dots dropped over the type.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <text x="64" y="290" fontFamily={serif} fontSize="118" fill={INK}>
          Nithin Aruswamy
        </text>
        {cityLine(440, 96)}
        {dots([
          [372, 214, 46, BLUE],
          [1010, 300, 58, ORANGE],
          [560, 470, 36, YELLOW],
          [1120, 110, 30, BLUE],
          [150, 520, 26, ORANGE],
        ])}
      </>
    ),
  },
  {
    name: "Big name, dots, small bridge",
    note: "Your name as large as fits without being cut off, dots over it, and the bridge kept small in the line underneath.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <text
          x="58"
          y="250"
          fontFamily={serif}
          fontSize="208"
          letterSpacing="-6"
          fill={INK}
        >
          Nithin
        </text>
        <text
          x="58"
          y="444"
          fontFamily={serif}
          fontSize="208"
          letterSpacing="-6"
          fill={INK}
        >
          Aruswamy
        </text>
        {dots([
          [300, 150, 52, BLUE],
          [900, 372, 64, ORANGE],
          [585, 300, 38, YELLOW],
          [1085, 150, 34, BLUE],
        ])}
        {cityLine(566, 54)}
      </>
    ),
  },
  {
    name: "Off the edges, dots, small bridge",
    note: "The loud one from before, with the bridge added small in the corner so it still says where you are.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <text
          x="-18"
          y="300"
          fontFamily={serif}
          fontSize="330"
          letterSpacing="-14"
          fill={INK}
        >
          Nithin
        </text>
        <text
          x="-22"
          y="560"
          fontFamily={serif}
          fontSize="330"
          letterSpacing="-14"
          fill={INK}
        >
          Aruswamy
        </text>
        {dots([
          [318, 130, 62, BLUE],
          [905, 290, 74, ORANGE],
          [610, 480, 50, YELLOW],
          [120, 430, 34, ORANGE],
        ])}
        <rect x="900" y="26" width="276" height="92" rx="10" fill="#fff" />
        <Drawn x={918} y={36} size={66}>
          <Bridge seed={43} />
        </Drawn>
        <text
          x="1026"
          y="68"
          fontFamily={heavy}
          fontWeight="700"
          fontSize="20"
          fill={INK}
        >
          ← 37.7749 →
        </text>
        <text
          x="1026"
          y="96"
          fontFamily={heavy}
          fontWeight="700"
          fontSize="20"
          fill={INK}
        >
          → 122.4194 ←
        </text>
      </>
    ),
  },
];

export default function OgIdeas() {
  return (
    <div className="v2 page og-ideas" data-stage="settled" style={LOOK}>
      <Head>
        <title>Link preview ideas</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="v2-column">
        <h1>Link preview ideas</h1>
        <p className="lede">
          Round two: four cards built from the parts you liked, each shown as it
          would sit in a message.
        </p>

        {CARDS.map((card, i) => (
          <article key={card.name} className="og-idea">
            <h2>
              {i + 1}. {card.name}
            </h2>
            <p className="og-note">{card.note}</p>
            <div className="og-bubble">
              <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                {card.art}
              </svg>
              <div className="og-caption">
                <strong>Nithin Aruswamy</strong>
                <span>nithinaruswamy.com</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
