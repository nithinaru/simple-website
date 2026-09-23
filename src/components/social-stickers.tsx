import { motion } from "motion/react";
import {
  GitHubIcon,
  GoogleScholarIcon,
  LinkedInIcon,
  MailIcon,
} from "@/components/icons";
import { SOCIALS } from "@/utils/constants";

// paper-toned stickers, each at a slight tilt so the row looks hand-placed.
// hovering snaps one straight and lifts it.
const STICKERS: Record<string, { label: string; icon: React.ReactNode }> = {
  LinkedIn: { label: "LinkedIn", icon: <LinkedInIcon /> },
  GitHub: { label: "GitHub", icon: <GitHubIcon /> },
  "Google Scholar": { label: "Scholar", icon: <GoogleScholarIcon /> },
  Email: { label: "Email", icon: <MailIcon /> },
};

const TILTS = [-3, 2.5, -2, 3];

const ENTRANCE_EASE = [0.2, 0.65, 0.3, 0.9] as const;
const SNAP = { type: "spring", stiffness: 400, damping: 15 } as const;

export function SocialStickers() {
  return (
    <div className="flex flex-nowrap items-center gap-2 mt-3">
      {SOCIALS.map((social, i) => {
        const sticker = STICKERS[social.label];
        const tilt = TILTS[i % TILTS.length];
        const isMail = social.href.startsWith("mailto:");

        return (
          <motion.a
            key={social.label}
            href={social.href}
            target={isMail ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={social.label}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-bold text-stone-600 shadow-[0_1px_2px_oklch(0.3_0.02_62/0.12)] hover:text-stone-800 [&_svg]:size-3"
            initial={{ opacity: 0, y: 5, filter: "blur(4px)", rotate: tilt }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotate: tilt }}
            whileHover={{ rotate: 0, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              default: {
                duration: 1,
                ease: ENTRANCE_EASE,
                delay: 0.3 + i * 0.08,
              },
              rotate: SNAP,
              scale: SNAP,
            }}
          >
            {sticker?.icon}
            {sticker?.label ?? social.label}
          </motion.a>
        );
      })}
    </div>
  );
}
