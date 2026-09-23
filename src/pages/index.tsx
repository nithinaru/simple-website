import {
  type MotionNodeAnimationOptions,
  motion,
  type Transition,
} from "motion/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { memo, useCallback, useState } from "react";
import AnimatedText from "@/components/animated-text";
import HoverPreview from "@/components/hover-preview";
import { PAPERS, PATENTS, PROJECTS, WORK_ITEMS } from "@/utils/constants";
import getPreviewUrl from "@/utils/get-preview-url";

type HoverState = {
  id: string;
  rect: DOMRect;
  previewUrl: string;
} | null;

const ITEM_ANIMATION = {
  initial: {
    opacity: 0,
    y: 5,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  transition: {
    duration: 1,
    ease: [0.2, 0.65, 0.3, 0.9],
  },
} as const satisfies MotionNodeAnimationOptions;

const ITEM_HOVER_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 30,
} as const satisfies Transition;

// TEMP: body font shortlist. visiting /?fonts sets each of the first rows in
// a different candidate, labelled, so they can be compared on the real page.
// remove once one is picked.
const FONT_TEST = [
  "Hanken Grotesk",
  "Instrument Sans",
  "Albert Sans",
  "Onest",
  "Golos Text",
  "Host Grotesk",
  "Funnel Sans",
  "Wix Madefor Text",
] as const;

const FONT_TEST_HREF = `https://fonts.googleapis.com/css2?${FONT_TEST.map(
  (f) => `family=${f.replaceAll(" ", "+")}:wght@400;700`,
).join("&")}&display=swap`;

// precompute preview urls since items are static
const WORK_PREVIEW_URLS = new Map(
  WORK_ITEMS.map((item) => [item.slug, getPreviewUrl(item) ?? ""]),
);
const PROJECT_PREVIEW_URLS = new Map(
  PROJECTS.map((item) => [item.slug, getPreviewUrl(item) ?? ""]),
);

type ItemRowProps = {
  id: string;
  label: string;
  role: string;
  about: string;
  date?: string;
  url: string;
  isHovered: boolean;
  layoutId: string;
  delay: number;
  previewUrl: string;
  onHover: (id: string, previewUrl: string, rect: DOMRect) => void;
  testFont?: number;
};

const ItemRow = memo(function ItemRow({
  id,
  label,
  role,
  about,
  date,
  url,
  isHovered,
  layoutId,
  delay,
  previewUrl,
  onHover,
  testFont,
}: ItemRowProps) {
  const testFamily =
    testFont === undefined ? undefined : `"${FONT_TEST[testFont]}", sans-serif`;

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      onHover(id, previewUrl, e.currentTarget.getBoundingClientRect());
    },
    [onHover, id, previewUrl],
  );

  const content = (
      <motion.div
        className="relative flex flex-col items-start will-change-transform -mx-2 px-2 -my-1 py-1 text-left"
        initial={ITEM_ANIMATION.initial}
        animate={ITEM_ANIMATION.animate}
        transition={{
          ...ITEM_ANIMATION.transition,
          delay,
        }}
        onMouseEnter={handleMouseEnter}
        style={testFamily ? { fontFamily: testFamily } : undefined}
      >
        {isHovered ? (
          <motion.div
            layoutId={layoutId}
            className="absolute inset-0 bg-stone-300/30 border border-stone-300/50 rounded-md"
            transition={ITEM_HOVER_TRANSITION}
          />
        ) : null}

        <div className="relative flex items-baseline justify-between gap-2 sm:gap-8 w-full">
          <div className="flex items-baseline gap-2 min-w-0">
            <span
              className="font-display font-bold text-stone-700 truncate"
              style={testFamily ? { fontFamily: testFamily } : undefined}
            >
              {label}
            </span>
            <span className="text-sm text-stone-500 hidden sm:inline">
              {role}
            </span>
          </div>
          {date ? (
            <span className="text-sm text-stone-400 whitespace-nowrap hidden sm:inline">
              {date}
            </span>
          ) : null}
        </div>

        <span className="relative text-xs text-stone-500 sm:hidden">
          {role}
        </span>

        <span className="relative text-xs text-stone-600">{about}</span>
        {testFont === undefined ? null : (
          <span className="relative text-[10px] text-stone-400 mt-0.5">
            {testFont + 1} · {FONT_TEST[testFont]}
          </span>
        )}
        {previewUrl ? (
          <img src={previewUrl} alt="" className="hidden" fetchPriority="low" />
        ) : null}
      </motion.div>
  );

  if (!url) {
    return content;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
});

type LineProps = {
  delay: number;
  children: React.ReactNode;
};

const Line = memo(function Line({ delay, children }: LineProps) {
  return (
    <motion.div
      className="will-change-transform"
      initial={ITEM_ANIMATION.initial}
      animate={ITEM_ANIMATION.animate}
      transition={{ ...ITEM_ANIMATION.transition, delay }}
    >
      {children}
    </motion.div>
  );
});

function SectionHeading({ text }: { text: string }) {
  return (
    <AnimatedText
      className="text-xl mt-8 font-bold"
      element="h2"
      text={text}
      artificialDelay={0.3}
    />
  );
}

export default function Home() {
  const [hoveredWork, setHoveredWork] = useState<HoverState>(null);
  const [hoveredProject, setHoveredProject] = useState<HoverState>(null);

  const handleWorkHover = useCallback(
    (id: string, previewUrl: string, rect: DOMRect) => {
      setHoveredWork({ id, rect, previewUrl });
    },
    [],
  );

  const handleProjectHover = useCallback(
    (id: string, previewUrl: string, rect: DOMRect) => {
      setHoveredProject({ id, rect, previewUrl });
    },
    [],
  );

  const clearWorkHover = useCallback(() => setHoveredWork(null), []);
  const clearProjectHover = useCallback(() => setHoveredProject(null), []);

  const fontTest = useRouter().query.fonts !== undefined;
  const testFontAt = (row: number) =>
    fontTest && row < FONT_TEST.length ? row : undefined;

  return (
    <>
      {fontTest ? (
        <Head>
          <link rel="stylesheet" href={FONT_TEST_HREF} />
        </Head>
      ) : null}

      <SectionHeading text="Experience" />

      <div className="flex flex-col gap-3 mt-3" onMouseLeave={clearWorkHover}>
        {WORK_ITEMS.map((item, i) => (
          <ItemRow
            key={item.slug}
            id={item.company}
            label={item.company}
            role={item.role}
            about={item.about}
            date={item.date}
            url={item.url}
            isHovered={hoveredWork?.id === item.company}
            layoutId="work-hover"
            delay={0.5 + i * 0.15}
            previewUrl={WORK_PREVIEW_URLS.get(item.slug) ?? ""}
            onHover={handleWorkHover}
            testFont={testFontAt(i)}
          />
        ))}
      </div>

      <SectionHeading text="Projects" />

      <div
        className="flex flex-col gap-3 mt-3"
        onMouseLeave={clearProjectHover}
      >
        {PROJECTS.map((project, i) => (
          <ItemRow
            key={project.slug}
            id={project.name}
            label={project.name}
            role={project.role}
            about={project.about}
            url={project.url}
            isHovered={hoveredProject?.id === project.name}
            layoutId="project-hover"
            delay={0.5 + i * 0.15}
            previewUrl={PROJECT_PREVIEW_URLS.get(project.slug) ?? ""}
            onHover={handleProjectHover}
            testFont={testFontAt(WORK_ITEMS.length + i)}
          />
        ))}
      </div>

      <SectionHeading text="Publications" />

      <div className="flex flex-col gap-3 mt-3">
        {PAPERS.map((paper, i) => (
          <Line key={paper.title} delay={0.5 + i * 0.15}>
            <div className="flex flex-col items-start text-left">
              <div className="flex items-baseline justify-between gap-2 sm:gap-8 w-full">
                <span className="font-display font-bold text-stone-700">
                  {paper.title}
                </span>
                <span className="text-sm text-stone-400 whitespace-nowrap hidden sm:inline">
                  {paper.year}
                </span>
              </div>
              <span className="text-xs text-stone-600">
                {paper.venue}
                {paper.citations > 0 ? ` · ${paper.citations} citations` : null}
              </span>
            </div>
          </Line>
        ))}

        {PATENTS.map((patent, i) => (
          <Line key={patent.number} delay={0.5 + (PAPERS.length + i) * 0.15}>
            <div className="flex flex-col items-start text-left">
              <div className="flex items-baseline justify-between gap-2 sm:gap-8 w-full">
                <span className="font-display font-bold text-stone-700">
                  {patent.title}
                </span>
                <span className="text-sm text-stone-400 whitespace-nowrap hidden sm:inline">
                  {patent.year}
                </span>
              </div>
              <span className="text-xs text-stone-600">
                Patent {patent.number}
              </span>
            </div>
          </Line>
        ))}
      </div>

      <div className="hidden md:block">
        <HoverPreview
          previewUrl={
            hoveredWork?.previewUrl || hoveredProject?.previewUrl || null
          }
          anchorRect={hoveredWork?.rect || hoveredProject?.rect || null}
        />
      </div>
    </>
  );
}
