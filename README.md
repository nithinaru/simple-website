# simple-website

Source for [nithinaruswamy.com](https://nithinaruswamy.com): a single-page personal site built with Next.js (pages router), Tailwind v4, Motion and TypeScript.

All content — experience, projects, publications, patents and social links — lives in [`src/utils/constants.ts`](src/utils/constants.ts). The intro paragraph and its links are in [`src/pages/_app.tsx`](src/pages/_app.tsx).

### how the page works

- **Intro animation.** The name cycles through cuts of Redaction (pixel to smooth) while shrinking, then lands on Goudy Bookletter 1911. Once it lands, the last name, intro, social stickers and sections animate in. See `ANIMATION_STEPS` in `_app.tsx`.
- **Breathing name.** After landing, one random letter per word slowly swells and settles, with its neighbours swelling a little less, mostly slow with the odd quick burst. Goudy only has one weight, so the thickness is an animated same-colour text stroke on a registered CSS property (`--name-stroke` in [`src/globals.css`](src/globals.css)).
- **Palette.** A fixed warm off-white matched to the favicon (`#f7f1e7`), with text tones on a faintly brown hue. All tones are CSS variables in `globals.css`, mapped onto Tailwind's `stone-*` utilities.
- **Fonts.** Instrument Sans for body text and Goudy Bookletter 1911 for the name and headings, both via `next/font`; the Redaction cuts used by the intro are self-hosted in `public/fonts` and preloaded in [`src/pages/_document.tsx`](src/pages/_document.tsx).
- **Hover previews.** Hovering an experience or project row shows a screenshot of its site from `public/images/previews/`.

### install & run

```
npm install
npm run dev
```

`npm run dev` and `npm run build` first run `scripts/fetch-previews.ts`, which fetches any missing link-preview screenshots via Microlink, then `scripts/optimize-previews.mjs`, which converts them to 800px WebP. Only the `.webp` files are committed.

### deploying

Hosted on Vercel; see [`vercel.json`](vercel.json). The deploy runs `npm run build:ci` — plain `next build`, without the preview fetch — so a deploy never depends on a third-party API. After adding an item to `constants.ts`, run `npm run prebuild` locally and commit the new screenshot.

`npm run lint` runs Biome over the whole project.

### credits

Originally based on [Cody Miller's website](https://looskie.com) ([looskie/website](https://github.com/looskie/website)).
