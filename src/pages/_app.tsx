import { FONT_FACE_CSS } from "@/components/options";
import {
  PAPERS,
  PATENTS,
  PRESS,
  PROJECTS,
  SOCIALS,
  WORK_ITEMS,
} from "@/utils/constants";
import {
  AUTHOR_EMAIL,
  SHARE_IMAGE_ALT,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/utils/site";
import { JSON_LD } from "@/utils/structured-data";
import "@/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps, router }: AppProps) {
  if (router.pathname === "/404") {
    return (
      <>
        <Head>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: font faces */}
          <style dangerouslySetInnerHTML={{ __html: FONT_FACE_CSS }} />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  // each page is its own address to a search engine
  const path = router.asPath.split(/[?#]/)[0];
  const pageUrl = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const title = SITE_TITLE;
  const description = SITE_DESCRIPTION;

  return (
    <main>
      <Head>
        <title>{title}</title>
        <style
          // biome-ignore lint/security/noDangerouslySetInnerHtml: font faces
          dangerouslySetInnerHTML={{ __html: FONT_FACE_CSS }}
        />
        <meta name="description" content={description} />
        <meta name="author" content={SITE_TITLE} />
        {/* a page that asks not to be listed sets its own, and wins */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1"
        />
        <meta name="msvalidate.01" content="BC46D7CD921CD032F8BB1AC091B33313" />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content={SITE_TITLE} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={SHARE_IMAGE_ALT} />
        {/* the same picture, moving, for the few places that play one */}
        <meta property="og:video" content={`${SITE_URL}/og.mp4`} />
        <meta property="og:video:secure_url" content={`${SITE_URL}/og.mp4`} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1200" />
        <meta property="og:video:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={TWITTER_HANDLE} />
        <meta name="twitter:creator" content={TWITTER_HANDLE} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:image:alt" content={SHARE_IMAGE_ALT} />

        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static json-ld
          dangerouslySetInnerHTML={{ __html: JSON_LD }}
        />
      </Head>

      <Component {...pageProps} />

      {/* everything about me, in plain html, for anything reading the page
          without scripts. the same facts are in the json-ld above */}
      <noscript>
        <h1>{SITE_TITLE}</h1>
        <p>{SITE_DESCRIPTION}</p>
        <nav>
          {SOCIALS.map((social) => (
            <a key={social.label} href={social.href}>
              {social.href.startsWith("mailto:") ? AUTHOR_EMAIL : social.label}
            </a>
          ))}
        </nav>

        <h2>Experience</h2>
        {WORK_ITEMS.map((item) => (
          <div key={item.slug}>
            <a href={item.url}>
              <strong>{item.company}</strong> — {item.role}
            </a>
            <p>{item.about}</p>
            <span>{item.date}</span>
          </div>
        ))}

        <h2>Projects</h2>
        {PROJECTS.map((project) => (
          <div key={project.slug}>
            <a href={project.url}>
              <strong>{project.name}</strong> — {project.role}
            </a>
            <p>{project.about}</p>
          </div>
        ))}

        <h2>Publications</h2>
        {PAPERS.map((paper) => (
          <p key={paper.title}>
            <strong>{paper.title}</strong> — {paper.venue}, {paper.year}
          </p>
        ))}
        {PATENTS.map((patent) => (
          <p key={patent.number}>
            <strong>{patent.title}</strong> — Patent {patent.number},{" "}
            {patent.year}
          </p>
        ))}

        <h2>Press &amp; mentions</h2>
        {PRESS.map((item) => (
          <div key={item.slug}>
            <a href={item.url}>
              <strong>{item.title}</strong> — {item.outlet}
            </a>
          </div>
        ))}
      </noscript>
    </main>
  );
}
