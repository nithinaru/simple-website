import { Head, Html, Main, NextScript } from "next/document";
import { FONT_STYLESHEETS } from "@/components/options";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        {/* font options still being chosen between; see components/options */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        {FONT_STYLESHEETS.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {/* without scripts nothing runs the opening, so show the text plainly */}
        <noscript>
          <style>
            {
              ".v2 *{animation:none!important;opacity:1!important;filter:none!important}.v2 .w{color:inherit!important}.v2 .w::before{display:none}.v2 .logo{background:none!important}"
            }
          </style>
        </noscript>
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
