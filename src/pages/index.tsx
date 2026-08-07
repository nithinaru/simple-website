import {
  type MotionNodeAnimationOptions,
  motion,
  type Transition,
} from "motion/react";
import { memo, useCallback, useState } from "react";
import AnimatedText from "@/components/animated-text";
import HoverPreview from "@/components/hover-preview";
import {
  AWARDS,
  EDUCATION,
  INTERESTS,
  PAPERS,
  PATENTS,
  PROJECTS,
  WORK_ITEMS,
} from "@/utils/constants";
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
}: ItemRowProps) {
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      onHover(id, previewUrl, e.currentTarget.getBoundingClientRect());
    },
    [onHover, id, previewUrl],
  );

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <motion.div
        className="relative flex flex-col items-start will-change-transform -mx-2 px-2 -my-1 py-1 text-left"
        initial={ITEM_ANIMATION.initial}
        animate={ITEM_ANIMATION.animate}
        transition={{
          ...ITEM_ANIMATION.transition,
          delay,
        }}
        onMouseEnter={handleMouseEnter}
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
            <span className="font-bold text-stone-700 truncate">{label}</span>
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
        <img src={previewUrl} alt="" className="hidden" fetchPriority="low" />
      </motion.div>
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

  return (
    <>
      <Line delay={0.5}>
        <p className="text-sm text-stone-600 mt-3 max-w-lg">
          i study operations research &amp; math at uc berkeley. i'm heavily
          invested in agricultural automation and smart wearable technology, and
          i currently work as an operations researcher at the uc davis graduate
          school of management.
        </p>
      </Line>

      <Line delay={0.65}>
        <p className="text-xs text-stone-400 mt-2 max-w-lg">
          {INTERESTS.join(" · ")}
        </p>
      </Line>

      <SectionHeading text="education" />

      <div className="flex flex-col gap-3 mt-3">
        {EDUCATION.map((school, i) => (
          <Line key={school.slug} delay={0.5 + i * 0.15}>
            <a href={school.url} target="_blank" rel="noopener noreferrer">
              <div className="flex flex-col items-start text-left">
                <div className="flex items-baseline justify-between gap-2 sm:gap-8 w-full">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-bold text-stone-700 truncate">
                      {school.school}
                    </span>
                    <span className="text-sm text-stone-500 hidden sm:inline">
                      {school.degree}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-stone-500 sm:hidden">
                  {school.degree}
                </span>
                <span className="text-xs text-stone-600">{school.about}</span>
              </div>
            </a>
          </Line>
        ))}
      </div>

      <Line delay={0.65}>
        <p className="text-xs text-stone-400 mt-4">honors</p>
      </Line>

      <div className="flex flex-col gap-2 mt-2">
        {AWARDS.map((award, i) => (
          <Line key={`${award.title}-${award.org}`} delay={0.65 + i * 0.1}>
            <div className="flex items-baseline justify-between gap-2 sm:gap-8 w-full">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-bold text-stone-700">{award.title}</span>
                <span className="text-sm text-stone-500">{award.org}</span>
              </div>
              <span className="text-sm text-stone-400 whitespace-nowrap hidden sm:inline">
                {award.year}
              </span>
            </div>
          </Line>
        ))}
      </div>

      <SectionHeading text="work" />

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
          />
        ))}
      </div>

      <SectionHeading text="projects" />

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
          />
        ))}
      </div>

      <SectionHeading text="publications" />

      <div className="flex flex-col gap-3 mt-3">
        {PAPERS.map((paper, i) => (
          <Line key={paper.title} delay={0.5 + i * 0.15}>
            <a href={paper.url} target="_blank" rel="noopener noreferrer">
              <div className="flex flex-col items-start text-left">
                <div className="flex items-baseline justify-between gap-2 sm:gap-8 w-full">
                  <span className="font-bold text-stone-700">
                    {paper.title}
                  </span>
                  <span className="text-sm text-stone-400 whitespace-nowrap hidden sm:inline">
                    {paper.year}
                  </span>
                </div>
                <span className="text-xs text-stone-600">
                  {paper.venue} — {paper.status}
                  {paper.citations > 0
                    ? ` · ${paper.citations} citations`
                    : null}
                </span>
              </div>
            </a>
          </Line>
        ))}

        {PATENTS.map((patent, i) => (
          <Line key={patent.number} delay={0.5 + (PAPERS.length + i) * 0.15}>
            <div className="flex flex-col items-start text-left">
              <div className="flex items-baseline justify-between gap-2 sm:gap-8 w-full">
                <span className="font-bold text-stone-700">{patent.title}</span>
                <span className="text-sm text-stone-400 whitespace-nowrap hidden sm:inline">
                  {patent.year}
                </span>
              </div>
              <span className="text-xs text-stone-600">
                patent {patent.number} — {patent.status}
              </span>
            </div>
          </Line>
        ))}
      </div>

      <p className="text-xs text-stone-400 mt-2 mb-4">
        design based on{" "}
        <a
          href="https://looskie.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-stone-600"
        >
          cody miller's website
        </a>
      </p>

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
