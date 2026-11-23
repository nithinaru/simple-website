import Head from "next/head";
import Link from "next/link";
import { LOOK, TextureFilters } from "@/components/options";
import { SCENES, Scene } from "@/components/scenes";

/*
 * a scratch page: the six places the horse could run along the bottom of the
 * front page, one under another, to pick from. not linked from anywhere.
 */
export default function Scenes() {
  return (
    <div className="v2 page scenes" style={LOOK as React.CSSProperties}>
      <Head>
        <title>Scenes for the horse</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="v2-column">
        <p className="back">
          <Link href="/">← Nithin</Link>
        </p>
        <h1>Scenes for the horse</h1>
        <p className="lede">
          Six places she could run along the bottom of the front page. Each one
          opens on the real page from its link.
        </p>
      </div>
      {SCENES.map((s, i) => (
        <section key={s.name} className="scene-idea">
          <div className="v2-column">
            <h2>
              {i + 1}. {s.title}
            </h2>
            <p>
              {s.note}{" "}
              <Link href={`/?scene=${s.name}`}>See it on the page →</Link>
            </p>
          </div>
          <div className="scene-stage">
            <Scene name={s.name} show />
          </div>
        </section>
      ))}
      <TextureFilters />
    </div>
  );
}
