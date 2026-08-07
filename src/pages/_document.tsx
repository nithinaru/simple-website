import { Head, Html, Main, NextScript } from "next/document";

const CRITICAL_FONTS = [
  "/fonts/Redaction_100-Bold.woff2",
  "/fonts/Redaction_10-Regular.woff2",
  "/fonts/Redaction_70-Bold.woff2",
  "/fonts/Redaction-Regular.woff2",
  "/fonts/Redaction_35-Bold.woff2",
  "/fonts/Redaction_100-Regular.woff2",
  "/fonts/Redaction_20-Regular.woff2",
  "/fonts/Redaction_50-Bold.woff2",
];

/*
 * rolls a fresh palette on every page load. runs blocking in <head>, before
 * first paint, so there is no flash of the previous/fallback theme.
 *
 * only two numbers are random — the hue and how much chroma it carries. every
 * tone in globals.css derives from those, which is what keeps a random roll
 * looking deliberate instead of like eight unrelated colours.
 */
const THEME_SCRIPT = `(function(){try{
var h=Math.random()*360;
var c=0.012+Math.random()*0.012;
var s=document.documentElement.style;
s.setProperty('--tone-h',h.toFixed(2));
s.setProperty('--tone-c',c.toFixed(4));
}catch(e){}})();`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {CRITICAL_FONTS.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0a0a0a" />
        <meta name="theme-color" content="#f7f1e7" />
        <meta name="msapplication-TileColor" content="#f7f1e7" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
