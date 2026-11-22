import Head from "next/head";
import {
  LABEL_FAMILY,
  LOOK,
  MONO_FAMILY,
  TEXT_FAMILY,
} from "@/components/options";
import { Bridge } from "@/components/sketch";

/*
 * a scratch page, not part of the site: seven ideas for the favicon, each
 * shown large, at the two sizes browsers use, and sitting in a tab. once one
 * is picked it becomes real icon files and this page goes.
 */

const BLUE = "#1f4fff";
const INK = "#141414";

/** the cobalt text box with a handle on each corner, as round the name */
function Box({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <rect
        x="11"
        y="11"
        width="42"
        height="42"
        fill="none"
        stroke={BLUE}
        strokeWidth="3"
      />
      {[
        [11, 11],
        [53, 11],
        [11, 53],
        [53, 53],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 5.5}
          y={y - 5.5}
          width="11"
          height="11"
          fill="#fff"
          stroke={BLUE}
          strokeWidth="3"
        />
      ))}
      {children}
    </>
  );
}

const letter = (extra: React.SVGProps<SVGTextElement> = {}) => (
  <text
    x="32"
    y="44"
    textAnchor="middle"
    fontFamily={`"${TEXT_FAMILY}", Georgia, serif`}
    fontSize="34"
    fill={INK}
    {...extra}
  >
    N
  </text>
);

type Idea = { name: string; note: string; art: React.ReactNode };

const IDEAS: Idea[] = [
  {
    name: "N in a cobalt box",
    note: "The heading, shrunk: the letter inside its text box.",
    art: <Box>{letter({ fontSize: 30, y: 43 })}</Box>,
  },
  {
    name: "Just the box",
    note: "No letter. The most abstract, and the clearest when tiny.",
    art: <Box />,
  },
  {
    name: "N with a cobalt full stop",
    note: "The name's own punctuation, in the one colour on the page.",
    art: (
      <>
        {letter({ x: 27, fontSize: 46, y: 49 })}
        <circle cx="52" cy="45" r="5" fill={BLUE} />
      </>
    ),
  },
  {
    name: "The measuring line",
    note: "The line under your links, capped at both ends, under the letter.",
    art: (
      <>
        {letter({ fontSize: 36, y: 38 })}
        <path
          d="M10 52 H54 M10 45 V59 M54 45 V59"
          fill="none"
          stroke={BLUE}
          strokeWidth="3"
        />
      </>
    ),
  },
  {
    name: "The size chip",
    note: "The little cobalt label that sits over the name's box.",
    art: (
      <>
        <rect x="6" y="16" width="52" height="32" rx="7" fill={BLUE} />
        <text
          x="32"
          y="41"
          textAnchor="middle"
          fontFamily={`"${MONO_FAMILY}", ui-monospace, monospace`}
          fontSize="26"
          fill="#fff"
        >
          N
        </text>
      </>
    ),
  },
  {
    name: "The Golden Gate",
    note: "The hand-drawn bridge from the location line. The only warm colour.",
    art: (
      <foreignObject x="0" y="0" width="64" height="64">
        <span className="favicon-bridge">
          <Bridge seed={43} />
        </span>
      </foreignObject>
    ),
  },
  {
    name: "A live one",
    note: "The box, which flips to a tick for a moment when the email is copied.",
    art: (
      <Box>
        <path
          d="M21 33 L29 41 L44 24"
          fill="none"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
    ),
  },
];

function Icon({ art, size }: { art: React.ReactNode; size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      {art}
    </svg>
  );
}

export default function Favicons() {
  return (
    <div className="v2 page favicons" data-stage="settled" style={LOOK}>
      <Head>
        <title>Favicon ideas</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="v2-column">
        <h1>Favicon ideas</h1>
        <p className="lede">
          Each one large, at 32 and 16 pixels, and in a browser tab, light and
          dark.
        </p>

        {IDEAS.map((idea, i) => (
          <article key={idea.name} className="favicon-idea">
            <div className="favicon-big">
              <Icon art={idea.art} size={128} />
            </div>
            <div>
              <h2>
                {i + 1}. {idea.name}
              </h2>
              <p className="favicon-note">{idea.note}</p>
              <div className="favicon-sizes">
                <Icon art={idea.art} size={32} />
                <Icon art={idea.art} size={16} />
                {(["light", "dark"] as const).map((tone) => (
                  <span key={tone} className="favicon-tab" data-tone={tone}>
                    <Icon art={idea.art} size={16} />
                    <span
                      style={{ fontFamily: `"${LABEL_FAMILY}", sans-serif` }}
                    >
                      Nithin Aruswamy
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
