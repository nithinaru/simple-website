import Head from "next/head";
import {
  LABEL_FAMILY,
  LOOK,
  MONO_FAMILY,
  TEXT_FAMILY,
} from "@/components/options";
import { Bridge, Fountain, Sign } from "@/components/sketch";

/*
 * a scratch page, not part of the site: six ideas for the card that shows
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

const CARDS: Card[] = [
  {
    name: "The selected name",
    note: "Your name as a selected text layer: cobalt box, handles, and the card's own size on the chip.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <text
          x="600"
          y="352"
          textAnchor="middle"
          fontFamily={serif}
          fontSize="100"
          fill={INK}
        >
          Nithin Aruswamy
        </text>
        <rect
          x="96"
          y="232"
          width="1008"
          height="166"
          fill="none"
          stroke={BLUE}
          strokeWidth="3"
        />
        {[
          [96, 232],
          [1104, 232],
          [96, 398],
          [1104, 398],
        ].map(([x, y]) => handle(x, y))}
        <rect x="528" y="176" width="144" height="38" rx="7" fill={BLUE} />
        <text
          x="600"
          y="202"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="20"
          fill="#fff"
        >
          1200 × 630
        </text>
        <text
          x="600"
          y="470"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="22"
          fill="#8a8a8a"
        >
          nithinaruswamy.com
        </text>
      </>
    ),
  },
  {
    name: "Measured",
    note: "The opening of the site, frozen: guides through the edges of the name, hatched margins, every distance written down.",
    art: (
      <>
        <defs>
          <pattern
            id="og-hatch"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="14" stroke={BLUE} strokeWidth="2" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="#fff" />
        <rect
          x="0"
          y="250"
          width="150"
          height="150"
          fill="url(#og-hatch)"
          opacity="0.35"
        />
        <rect
          x="1050"
          y="250"
          width="150"
          height="150"
          fill="url(#og-hatch)"
          opacity="0.35"
        />
        <path
          d={`M150 0 V${H} M1050 0 V${H} M0 250 H${W} M0 400 H${W}`}
          stroke={BLUE}
          strokeWidth="2"
          fill="none"
        />
        {/* ruler ticks along the top */}
        <path
          d={Array.from(
            { length: 76 },
            (_, i) => `M${i * 16} 0 V${i % 5 === 0 ? 22 : 10}`,
          ).join(" ")}
          stroke={BLUE}
          strokeWidth="2"
        />
        <text
          x="600"
          y="358"
          textAnchor="middle"
          fontFamily={serif}
          fontSize="104"
          fill={INK}
        >
          Hey, I&apos;m Nithin.
        </text>
        {/* the width, and the gap above */}
        <path
          d="M150 190 H1050 M150 176 V204 M1050 176 V204"
          stroke={BLUE}
          strokeWidth="2"
          fill="none"
        />
        <rect x="560" y="174" width="80" height="32" fill="#fff" />
        <text
          x="600"
          y="198"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="22"
          fill={BLUE}
        >
          900
        </text>
        <path
          d="M200 0 V250 M186 250 H214"
          stroke={BLUE}
          strokeWidth="2"
          fill="none"
        />
        <rect x="170" y="108" width="60" height="32" fill="#fff" />
        <text
          x="200"
          y="132"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="22"
          fill={BLUE}
        >
          250
        </text>
        <text
          x="75"
          y="440"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="22"
          fill={BLUE}
        >
          150
        </text>
        <text
          x="1125"
          y="440"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="22"
          fill={BLUE}
        >
          150
        </text>
      </>
    ),
  },
  {
    name: "The bridge",
    note: "The hand-drawn Golden Gate, large, with your name and coordinates beside it.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <Drawn x={462} y={56} size={500}>
          <Bridge seed={43} />
        </Drawn>
        <text x="64" y="300" fontFamily={serif} fontSize="76" fill={INK}>
          Nithin
        </text>
        <text x="64" y="386" fontFamily={serif} fontSize="76" fill={INK}>
          Aruswamy
        </text>
        <text
          x="64"
          y="452"
          fontFamily={heavy}
          fontWeight="700"
          fontSize="22"
          fill={INK}
        >
          ← 37.7749 →
        </text>
        <text
          x="64"
          y="480"
          fontFamily={heavy}
          fontWeight="700"
          fontSize="22"
          fill={INK}
        >
          → 122.4194 ←
        </text>
      </>
    ),
  },
  {
    name: "Mid-sweep",
    note: "The name caught halfway through the colour that paints it in. As a clip, the band keeps crossing.",
    art: (
      <>
        <defs>
          <linearGradient
            id="og-sweep"
            gradientUnits="userSpaceOnUse"
            x1="-1400"
            x2="2600"
            y1="0"
            y2="0"
          >
            <stop offset="0" stopColor={INK} />
            <stop offset="0.5" stopColor={INK} />
            <stop offset="0.515" stopColor="#c79bc4" />
            <stop offset="0.535" stopColor="#e9694a" />
            <stop offset="0.555" stopColor="#e9b84a" />
            <stop offset="0.575" stopColor="#b3c7e8" />
            <stop offset="0.595" stopColor="#4f8fdf" />
            <stop offset="0.61" stopColor="#e3e3e3" />
            <stop offset="1" stopColor="#e3e3e3" />
            {/* slide the whole gradient across, rest, and go again */}
            <animate
              attributeName="x1"
              values="-2200;-1400;-400;-400;-2200"
              keyTimes="0;0.3;0.7;0.9;1"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="1800;2600;3600;3600;1800"
              keyTimes="0;0.3;0.7;0.9;1"
              dur="5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="#fff" />
        <text
          x="72"
          y="290"
          fontFamily={serif}
          fontSize="150"
          fill="url(#og-sweep)"
        >
          Nithin
        </text>
        <text
          x="72"
          y="460"
          fontFamily={serif}
          fontSize="150"
          fill="url(#og-sweep)"
        >
          Aruswamy.
        </text>
        <text x="76" y="548" fontFamily={mono} fontSize="22" fill="#8a8a8a">
          nithinaruswamy.com
        </text>
      </>
    ),
  },
  {
    name: "Too big for the card",
    note: "Your name so large it runs off the edges, with flat dots dropped over it. The loudest of the six.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <text
          x="-18"
          y="330"
          fontFamily={serif}
          fontSize="330"
          letterSpacing="-14"
          fill={INK}
        >
          Nithin
        </text>
        <text
          x="-22"
          y="610"
          fontFamily={serif}
          fontSize="330"
          letterSpacing="-14"
          fill={INK}
        >
          Aruswamy
        </text>
        <circle cx="318" cy="150" r="62" fill={BLUE} />
        <circle cx="905" cy="318" r="74" fill={ORANGE} />
        <circle cx="610" cy="520" r="50" fill="#f2b632" />
        <circle cx="1090" cy="84" r="40" fill={BLUE} />
        <circle cx="120" cy="470" r="34" fill={ORANGE} />
      </>
    ),
  },
  {
    name: "The address plate",
    note: "Three big lines with the site's hand-drawn signs set into them, like a sign on a building.",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <Drawn x={60} y={74} size={104}>
          <Sign shape="diamond" label="NA" seed={5} />
        </Drawn>
        <text x="236" y="160" fontFamily={serif} fontSize="96" fill={INK}>
          Nithin Aruswamy
        </text>
        <Drawn x={56} y={258} size={104}>
          <Bridge seed={43} />
        </Drawn>
        <text x="216" y="344" fontFamily={serif} fontSize="96" fill={INK}>
          San Francisco
        </text>
        <text
          x="896"
          y="306"
          fontFamily={heavy}
          fontWeight="700"
          fontSize="30"
          fill={INK}
        >
          ← 37.7749 →
        </text>
        <text
          x="896"
          y="344"
          fontFamily={heavy}
          fontWeight="700"
          fontSize="30"
          fill={INK}
        >
          → 122.4194 ←
        </text>
        <text x="64" y="534" fontFamily={serif} fontSize="96" fill={INK}>
          builds, travels
        </text>
        <Drawn x={800} y={442} size={104}>
          <Fountain seed={71} />
        </Drawn>
        <Drawn x={944} y={442} size={104}>
          <Sign shape="box" label="CA" seed={9} />
        </Drawn>
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
          Six cards for when the link is sent to someone, each shown as it would
          sit in a message.
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
