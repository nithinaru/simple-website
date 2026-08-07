# simple-website

A minimal single-page version of [nithinaruswamy.com](https://nithinaruswamy.com), built with Next.js, Tailwind and TypeScript.

All content lives in [`src/utils/constants.ts`](src/utils/constants.ts) — work, projects, research, patents, awards, skills, interests, travel and media.

### theming

The palette is generated, not picked from a list. Every page load rolls a random hue and a small chroma value; every surface and text tone in [`src/globals.css`](src/globals.css) derives from those two numbers, keeping the lightness ramp of Tailwind's `stone` scale. That's what makes a random roll look deliberate — one hue, eight consistent tones, plus an off-hue accent for the equalizer.

The roll happens in a blocking inline script in [`src/pages/_document.tsx`](src/pages/_document.tsx) so there's no flash before first paint. To make it calmer or more colourful, change the chroma range there; to bias toward certain hues, constrain the hue line.

### the now-playing pill

The playlist lives in [`scripts/playlist.json`](scripts/playlist.json). Running `node scripts/fetch-artwork.ts` resolves each track's cover art and real duration from the iTunes Search API and regenerates [`src/utils/songs.ts`](src/utils/songs.ts). Cover images are referenced from Apple's CDN by URL, not copied into this repo.

The widget picks a random track on load, then moves through the list from there, looping. Tracks without cover art fall back to a gradient built from the page's generated hue.

### install & run

```
bun install
bun dev
```

`bun dev` and `bun build` run `scripts/fetch-previews.ts` first, which fetches link-preview screenshots via microlink into `public/images/previews/`. Existing files are skipped.

### credits

Design and codebase based on [Cody Miller's website](https://looskie.com) ([looskie/website](https://github.com/looskie/website)) — credited in the site footer. The Spotify/Discord presence widget from the original has been removed.
