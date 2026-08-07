import {
  AnimatePresence,
  type MotionNodeAnimationOptions,
  motion,
} from "motion/react";
import { useEffect, useState } from "react";
import { Marquee } from "@/components/marquee";
import { SONGS } from "@/utils/songs";

const EQUALIZER_DELAYS = [0, 0.15, 0.3];

const EQUALIZER_ANIMATION = {
  animate: {
    scaleY: [2, 10, 4, 8, 2].map((h) => h / 10), // the max height is tw's 2.5 = 10px
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
    layout: {
      type: "tween",
      ease: "easeInOut",
    },
  },
} as const satisfies MotionNodeAnimationOptions;

const SONG_CHANGE = {
  initial: {
    opacity: 0,
    filter: "blur(4px)",
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
  },
  transition: {
    duration: 0.3,
  },
} as const satisfies MotionNodeAnimationOptions;

const GLOW_FADE = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  transition: {
    duration: 0.5,
  },
} as const satisfies MotionNodeAnimationOptions;

const SPOTIFY_PILL_ANIMATION = {
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  initial: {
    opacity: 0,
    y: 10,
    filter: "blur(4px)",
  },
  transition: {
    type: "spring",
    stiffness: 60,
    delay: 0.8,
  },
} as const satisfies MotionNodeAnimationOptions;

/**
 * cheap deterministic string hash (fnv-1a). same input always gives the same
 * number, on the server and on the client — which is what keeps the generated
 * artwork hydration-safe.
 */
function hash(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * fallback for the rare track with no cover art. built from the page's own
 * generated hue (--tone-h) so it sits in the same palette as everything else,
 * with the track's hash only nudging it a little.
 */
function fallbackArtwork(title: string, artist: string) {
  const drift = hash(`${title}—${artist}`) % 40;

  return (
    `linear-gradient(135deg, ` +
    `oklch(0.72 0.06 calc(var(--tone-h) + ${drift})), ` +
    `oklch(0.5 0.05 calc(var(--tone-h) + ${drift + 30})))`
  );
}

export function NowPlaying() {
  // start at 0 on both server and client — never Date/Math.random during render
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // a different track every visit, picked after mount so the server and the
    // first client render still agree
    setIndex(Math.floor(Math.random() * SONGS.length));
    setMounted(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIndex((i) => (i + 1) % SONGS.length);
    }, SONGS[index].durationSeconds * 1000);

    return () => clearTimeout(timeout);
  }, [index]);

  const song = mounted ? SONGS[index] : null;
  const fallback = song ? fallbackArtwork(song.title, song.artist) : "";

  return (
    <AnimatePresence>
      {song ? (
        <motion.div
          animate={SPOTIFY_PILL_ANIMATION.animate}
          initial={SPOTIFY_PILL_ANIMATION.initial}
          exit={SPOTIFY_PILL_ANIMATION.initial}
          transition={SPOTIFY_PILL_ANIMATION.transition}
          className="will-change-[transform,opacity,filter] grid" // for whatever reason, this needs to be grid... otherwise safari has a spazm, bit too lazy to find out why... its gotta do with something with the LayoutGroup though.
        >
          <motion.div
            layout
            style={{
              borderRadius: 9999,
            }}
            className="absolute -top-10 p-0.5 overflow-hidden bg-stone-200 min-w-48 max-w-[calc(100vw-3rem)] sm:max-w-md rounded-[9999px]"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={song.title}
                initial={GLOW_FADE.initial}
                animate={GLOW_FADE.animate}
                exit={GLOW_FADE.initial}
                transition={GLOW_FADE.transition}
                className="absolute inset-0 h-full w-full scale-150 blur-3xl saturate-75 opacity-60 will-change-[transform,opacity] bg-cover bg-center"
                style={
                  song.artworkUrl
                    ? { backgroundImage: `url(${song.artworkUrl})` }
                    : { backgroundImage: fallback }
                }
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-stone-200/50 to-stone-200" />

            <motion.div
              layout
              style={{
                borderRadius: 9999,
              }}
              className="relative flex gap-2 items-center bg-stone-100 overflow-hidden rounded-[9999px]"
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={song.title}
                  className="flex items-center min-w-0 pl-2 py-2 will-change-[transform,opacity,filter]"
                  animate={SONG_CHANGE.animate}
                  initial={SONG_CHANGE.initial}
                  exit={SONG_CHANGE.initial}
                  transition={SONG_CHANGE.transition}
                >
                  <div className="shrink-0">
                    <motion.div layout className="relative z-10">
                      {song.artworkUrl ? (
                        <img
                          className="size-6 rounded-lg object-cover"
                          src={song.artworkUrl}
                          alt={`${song.title} by ${song.artist}`}
                        />
                      ) : (
                        <div
                          className="size-6 rounded-lg"
                          style={{ backgroundImage: fallback }}
                          role="img"
                          aria-label={`${song.title} by ${song.artist}`}
                        />
                      )}
                    </motion.div>

                    <div
                      className="absolute size-18 left-0 top-0 z-0 blur-3xl opacity-70 bg-cover bg-center"
                      style={
                        song.artworkUrl
                          ? { backgroundImage: `url(${song.artworkUrl})` }
                          : { backgroundImage: fallback }
                      }
                      aria-hidden="true"
                    />
                  </div>
                  <Marquee className="min-w-0">
                    <motion.span layout className="text-stone-800 text-sm pl-2">
                      {song.title}
                    </motion.span>
                    <motion.span
                      layout
                      className="text-stone-500 text-sm pl-2 whitespace-nowrap"
                    >
                      {song.artist}
                    </motion.span>
                  </Marquee>
                </motion.div>
              </AnimatePresence>

              <div className="relative flex items-center gap-0.5 h-[stretch] ml-auto pr-2 bg-stone-100">
                <div className="absolute right-full h-full w-3 bg-linear-to-r from-transparent to-stone-100 pointer-events-none" />
                {EQUALIZER_DELAYS.map((delay, i) => (
                  <motion.div
                    layout
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list
                    key={i}
                    className="bg-green-500 h-2.5 w-0.5 rounded-full origin-center will-change-transform"
                    animate={EQUALIZER_ANIMATION.animate}
                    transition={{
                      ...EQUALIZER_ANIMATION.transition,
                      delay,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
