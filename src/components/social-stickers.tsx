import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  CheckIcon,
  GitHubIcon,
  GoogleScholarIcon,
  LinkedInIcon,
  MailIcon,
} from "@/components/icons";
import { SOCIALS } from "@/utils/constants";
import { BUTTON_DELAY, BUTTON_STEP } from "@/utils/entrance";
import { AUTHOR_EMAIL } from "@/utils/site";

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

// how long the email sticker says "Copied" before going back
const COPIED_MS = 1600;

function legacyCopy(text: string) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  // off-screen but still selectable; 16px stops ios zooming in on focus
  field.style.cssText = "position:fixed;top:0;left:-9999px;font-size:16px";
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  field.remove();
  return ok;
}

export function SocialStickers() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  // the email sticker copies the address. the async clipboard api is
  // blocked in some browsers (in-app webviews, older safari, plain http), so
  // the old selection-based copy is the backup, and only if both fail does
  // the click open the mail app instead.
  const copyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    let ok = false;
    try {
      await navigator.clipboard.writeText(AUTHOR_EMAIL);
      ok = true;
    } catch {
      ok = legacyCopy(AUTHOR_EMAIL);
    }
    if (ok) {
      setCopied(true);
    } else {
      window.location.href = `mailto:${AUTHOR_EMAIL}`;
    }
  };

  return (
    // wraps only on the very narrowest phones (under ~330px), where four
    // stickers can't fit on one line
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
      {SOCIALS.map((social, i) => {
        const sticker = STICKERS[social.label];
        const tilt = TILTS[i % TILTS.length];
        const isMail = social.href.startsWith("mailto:");
        const showCopied = isMail && copied;

        return (
          <motion.a
            key={social.label}
            href={social.href}
            target={isMail ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={
              isMail ? `Copy email address ${AUTHOR_EMAIL}` : social.label
            }
            onClick={isMail ? copyEmail : undefined}
            className="flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-md border border-stone-300 bg-stone-100 px-1.5 sm:px-2 py-1 text-xs font-bold text-stone-600 shadow-[0_1px_2px_oklch(0.3_0.02_62/0.12)] hover:text-stone-800 [&_svg]:size-3"
            initial={{ opacity: 0, y: 5, filter: "blur(4px)", rotate: tilt }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotate: tilt }}
            whileHover={{ rotate: 0, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              default: {
                duration: 0.92,
                ease: ENTRANCE_EASE,
                delay: BUTTON_DELAY + i * BUTTON_STEP,
              },
              rotate: SNAP,
              scale: SNAP,
            }}
          >
            {showCopied ? <CheckIcon /> : sticker?.icon}
            {showCopied ? "Copied" : (sticker?.label ?? social.label)}
          </motion.a>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}
