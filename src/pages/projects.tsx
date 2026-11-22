import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { LOOK, TEXT_FAMILY, TextureFilters } from "@/components/options";
import { PROJECTS } from "@/utils/constants";
import getPreviewUrl from "@/utils/get-preview-url";
import { labelLinks } from "@/utils/label-links";
import { SITE_TITLE } from "@/utils/site";

/*
 * the things i've made, one after another, for anyone who wants a closer
 * look: what it is, what i did, and something to see. unlike the front page
 * this one scrolls. the words and pictures are placeholders for now: each
 * project can take a clip (`clip`) in place of its still.
 */

/** short looping clips, by project slug, once they exist */
const CLIPS: Record<string, string> = {};

export default function Projects() {
  const columnRef = useRef<HTMLDivElement>(null);

  // the numbers on the cobalt lines, once the font is in
  useEffect(() => {
    const label = () => columnRef.current && labelLinks(columnRef.current);
    label();
    let live = true;
    document.fonts.load(`16px "${TEXT_FAMILY}"`).then(() => live && label());
    window.addEventListener("resize", label);
    return () => {
      live = false;
      window.removeEventListener("resize", label);
    };
  }, []);

  return (
    <div
      className="v2 page"
      data-stage="settled"
      data-marks="guide"
      style={LOOK}
    >
      <Head>
        <title>{`Projects — ${SITE_TITLE}`}</title>
      </Head>

      <div className="v2-column" ref={columnRef}>
        <p className="back">
          <Link className="lnk" href="/">
            <span className="lnk-t">
              <span className="tx">← Nithin</span>
            </span>
          </Link>
        </p>

        <h1>
          <span className="tx">Projects</span>
        </h1>
        <p className="lede">
          <span className="tx">
            A few things I&apos;ve built, start to finish. More detail, clips
            and write-ups are on their way.
          </span>
        </p>

        {PROJECTS.map((project) => {
          const clip = CLIPS[project.slug];
          return (
            <article key={project.slug} className="project">
              <h2>
                <span className="tx">{project.name}</span>
              </h2>
              <p className="project-meta">
                {project.role}
                {project.date ? ` · ${project.date}` : null}
              </p>
              <p>
                <span className="tx">{project.about}.</span>
              </p>

              <figure className="project-media">
                {clip ? (
                  <video
                    src={clip}
                    poster={getPreviewUrl(project)}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  // biome-ignore lint/performance/noImgElement: static, pre-sized webp
                  <img
                    src={getPreviewUrl(project)}
                    alt={`${project.name}, as it looks today`}
                    loading="lazy"
                  />
                )}
              </figure>

              {project.url ? (
                <p>
                  <a
                    className="lnk"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="lnk-t">
                      <span className="tx">See it</span>
                    </span>
                  </a>
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <TextureFilters />
    </div>
  );
}
