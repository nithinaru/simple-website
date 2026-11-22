/*
 * the look of the page, as settled on: the faces and the ink texture.
 * (this used to be a panel of options to choose between.)
 */

const GH = "https://cdn.jsdelivr.net/gh";

/** the text face: besley, a clarendon revival by indestructible type* */
export const TEXT_FAMILY = "Besley";
/** evens out how big the face looks at a given font-size */
export const TEXT_SCALE = 0.96;

// faces used for small parts of the page
export const MONO_FAMILY = "Necto Mono";
export const LABEL_FAMILY = "Apfel Grotezk";

// loaded from a cdn for now; to be copied into the project
export const FONT_FACE_CSS = [
  `@font-face{font-family:"${TEXT_FAMILY}";src:url("${GH}/indestructible-type/Besley/fonts/webfonts/Besley-Regular.woff2") format("woff2");font-weight:100 900;font-display:swap}`,
  `@font-face{font-family:"${MONO_FAMILY}";src:url("${GH}/collletttivo/necto-mono@main/fonts/NectoMono-Regular.woff2") format("woff2");font-display:swap}`,
  `@font-face{font-family:"${LABEL_FAMILY}";src:url("${GH}/collletttivo/apfel-grotezk@main/fonts/ApfelGrotezk-Fett.woff2") format("woff2");font-weight:700;font-display:swap}`,
].join("");

/** which of the filters below the text is run through */
export const TEXTURE = "press";

/*
 * the textures, as svg filters laid over runs of text. noise either thins the
 * ink in specks (grain), nudges the outline about (rough), or both (press,
 * and a heavier worn).
 */
export function TextureFilters() {
  const grain = (key: string, strength: number, frequency: number) => (
    <>
      <feTurbulence
        type="fractalNoise"
        baseFrequency={frequency}
        numOctaves="2"
        seed="4"
        result={`${key}-noise`}
      />
      {/* turn the noise into see-through specks */}
      <feColorMatrix
        in={`${key}-noise`}
        type="matrix"
        values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-strength} 0 0 0 ${1 + strength * 0.45}`}
        result={`${key}-specks`}
      />
    </>
  );
  const rough = (key: string, amount: number) => (
    <>
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.55"
        numOctaves="2"
        seed="9"
        result={`${key}-wobble`}
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2={`${key}-wobble`}
        scale={amount}
        xChannelSelector="R"
        yChannelSelector="G"
        result={`${key}-edges`}
      />
    </>
  );
  return (
    <svg className="texture-defs" aria-hidden="true">
      <defs>
        <filter id="tx-grain" x="-10%" y="-40%" width="120%" height="180%">
          {grain("g", 1.1, 1.3)}
          <feComposite in="SourceGraphic" in2="g-specks" operator="in" />
        </filter>
        <filter id="tx-rough" x="-10%" y="-40%" width="120%" height="180%">
          {rough("r", 1.6)}
        </filter>
        <filter id="tx-press" x="-10%" y="-40%" width="120%" height="180%">
          {rough("p", 1.3)}
          {grain("p", 1.1, 1.3)}
          <feComposite in="p-edges" in2="p-specks" operator="in" />
        </filter>
        <filter id="tx-worn" x="-10%" y="-40%" width="120%" height="180%">
          {rough("w", 1.8)}
          {grain("w", 2, 0.75)}
          <feComposite in="w-edges" in2="w-specks" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
