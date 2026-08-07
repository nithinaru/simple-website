/**
 * Resolves cover art and track lengths for the playlist.
 *
 * Reads scripts/playlist.json ({ title, artist, query, album? }) and writes
 * src/utils/songs.ts with an artwork URL and duration for each track.
 *
 * Artwork is referenced by URL from Apple's CDN rather than copied into the
 * repo, so no cover images are redistributed here.
 *
 * Matching is scored rather than "first hit wins" — a naive search puts karaoke
 * re-records, tribute covers and DJ mixes above the real release, which shows
 * up as the wrong album art on the site. Add an `album` hint to a seed when a
 * track appears on several releases and you want a specific one.
 *
 * Run with: node scripts/fetch-artwork.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Seed = { title: string; artist: string; query: string; album?: string };

const ROOT = join(import.meta.dirname, "..");
const SEEDS: Seed[] = JSON.parse(
  readFileSync(join(ROOT, "scripts/playlist.json"), "utf8"),
);

const ITUNES = "https://itunes.apple.com/search";
const ARTWORK_SIZE = "600x600bb.jpg";

/** releases that are never what we mean, however well they match by name */
const JUNK =
  /karaoke|tribute|made popular|originally performed|in the style of|instrumental|workout|dj mix|live at|beats in space|writers collection|a cappella|8-bit|lullaby|piano version/i;

type Resolved = {
  title: string;
  artist: string;
  artworkUrl: string;
  durationSeconds: number;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\$/g, "s")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function score(hit: any, seed: Seed): number {
  const artist = norm(hit.artistName ?? "");
  const track = norm(hit.trackName ?? "");
  const album = norm(hit.collectionName ?? "");

  // the credited lead artist must actually appear — this is what rejects the
  // karaoke and tribute records
  const lead = norm(seed.artist.split(",")[0]);
  const leadWords = lead.split(" ").filter(Boolean);
  if (!leadWords.every((w) => artist.includes(w))) return -1;

  let s = 50;

  const wantTitle = norm(seed.title);
  if (track === wantTitle) s += 30;
  else if (track.startsWith(wantTitle)) s += 20;
  else if (track.includes(wantTitle)) s += 10;
  else return -1;

  if (seed.album) {
    const wantAlbum = norm(seed.album);
    if (album === wantAlbum) s += 45;
    else if (album.includes(wantAlbum)) s += 35;
  }

  if (JUNK.test(hit.collectionName ?? "")) s -= 100;
  if (hit.collectionType === "Album") s += 5;

  return s;
}

async function resolve(seed: Seed): Promise<Resolved> {
  const params = new URLSearchParams({
    term: seed.query,
    entity: "song",
    limit: "25",
  });

  const fallback: Resolved = {
    title: seed.title,
    artist: seed.artist,
    artworkUrl: "",
    durationSeconds: 210,
  };

  try {
    const res = await fetch(`${ITUNES}?${params}`);
    if (!res.ok) {
      console.error(`lookup failed for ${seed.title}: ${res.status}`);
      return fallback;
    }

    const data = await res.json();
    const ranked = (data.results ?? [])
      .map((hit: any) => ({ hit, s: score(hit, seed) }))
      .filter((r: { s: number }) => r.s > 0)
      .sort((a: { s: number }, b: { s: number }) => b.s - a.s);

    if (ranked.length === 0) {
      console.error(`no acceptable match for ${seed.title}`);
      return fallback;
    }

    const { hit } = ranked[0];
    console.log(
      `ok   ${seed.title.padEnd(30)} ${String(hit.collectionName).slice(0, 36)}`,
    );

    return {
      title: seed.title,
      artist: seed.artist,
      artworkUrl: (hit.artworkUrl100 ?? "").replace(
        "100x100bb.jpg",
        ARTWORK_SIZE,
      ),
      durationSeconds: hit.trackTimeMillis
        ? Math.round(hit.trackTimeMillis / 1000)
        : fallback.durationSeconds,
    };
  } catch (err) {
    console.error(`error for ${seed.title}:`, err);
    return fallback;
  }
}

/**
 * Fallback for albums the iTunes Store doesn't carry.
 *
 * Several of these records (Yeezus, IGOR, Eternal Atake) are streaming-only —
 * they aren't sold on the iTunes Store, so the Search API returns nothing for
 * them and the only "matches" are karaoke re-records. MusicBrainz plus the
 * Cover Art Archive covers that gap. Needs a real User-Agent and ~1 req/sec.
 */
const MB_UA = "nithinaruswamy-site/1.0 ( nithin.alaska@gmail.com )";

async function coverArtArchive(seed: Seed): Promise<string> {
  if (!seed.album) return "";

  const lead = seed.artist.split(",")[0].trim();
  const query = `artist:"${lead}" AND releasegroup:"${seed.album}"`;
  const url =
    `https://musicbrainz.org/ws/2/release-group/` +
    `?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": MB_UA } });
    if (!res.ok) return "";

    const data = await res.json();
    const groups = data["release-groups"] ?? [];
    const want = norm(seed.album);
    const match = groups.find((g: any) => norm(g.title) === want) ?? groups[0];
    if (!match) return "";

    // confirm the archive actually holds a front cover before committing to it
    const art = `https://coverartarchive.org/release-group/${match.id}/front-500`;
    const head = await fetch(art, { method: "HEAD", redirect: "follow" });
    return head.ok ? art : "";
  } catch {
    return "";
  }
}

const songs: Resolved[] = [];

// serial, with a small gap — the itunes search api rate limits bursts
for (const seed of SEEDS) {
  songs.push(await resolve(seed));
  await new Promise((r) => setTimeout(r, 250));
}

// second pass: fill anything itunes couldn't reach
for (let i = 0; i < songs.length; i++) {
  if (songs[i].artworkUrl) continue;

  const art = await coverArtArchive(SEEDS[i]);
  if (art) {
    songs[i].artworkUrl = art;
    console.log(`caa  ${songs[i].title.padEnd(30)} ${SEEDS[i].album}`);
  }
  await new Promise((r) => setTimeout(r, 1100)); // musicbrainz: ~1 req/sec
}

const missing = songs.filter((s) => !s.artworkUrl);
if (missing.length > 0) {
  console.error(`\n${missing.length} without artwork:`);
  for (const m of missing) console.error(`  - ${m.title} (${m.artist})`);
}

const body = `// generated by scripts/fetch-artwork.ts — edit scripts/playlist.json instead

export interface Song {
  title: string;
  artist: string;
  /** cover art on apple's cdn; referenced, not redistributed */
  artworkUrl: string;
  durationSeconds: number;
}

/**
 * a fixed playlist. the widget picks a random track on each page load and
 * moves through the list from there, looping forever.
 */
export const SONGS: readonly Song[] = ${JSON.stringify(songs, null, 2)};
`;

writeFileSync(join(ROOT, "src/utils/songs.ts"), body);
console.log(`\nwrote ${songs.length} songs`);
