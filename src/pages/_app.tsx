import { FONT_FACE_CSS } from "@/components/options";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/utils/site";
import { JSON_LD } from "@/utils/structured-data";
import "@/globals.css";
import type { AppProps } from "next/app";
import { Goudy_Bookletter_1911, Instrument_Sans } from "next/font/google";
import Head from "next/head";

// the 404 page still uses the old pair of faces
const bodyFont = Instrument_Sans({ subsets: ["latin"], display: "swap" });
const nameFont = Goudy_Bookletter_1911({
  subsets: ["latin"],
  weight: "400",
  display: "block",
});

const FONT_VARS = `:root{--font-body:${bodyFont.style.fontFamily};--font-name:${nameFont.style.fontFamily}}`;

export default function App({ Component, pageProps, router }: AppProps) {
  if (router.pathname === "/404") {
    return (
      <>
        <Head>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: font vars */}
          <style dangerouslySetInnerHTML={{ __html: FONT_VARS }} />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  return (
    <main>
      <Head>
        <title>{SITE_TITLE}</title>
        <style
          // biome-ignore lint/security/noDangerouslySetInnerHtml: font faces
          dangerouslySetInnerHTML={{ __html: FONT_VARS + FONT_FACE_CSS }}
        />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="author" content={SITE_TITLE} />
        <meta name="msvalidate.01" content="BC46D7CD921CD032F8BB1AC091B33313" />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />

        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static json-ld
          dangerouslySetInnerHTML={{ __html: JSON_LD }}
        />
      </Head>

      <Component {...pageProps} />
    </main>
  );
}
