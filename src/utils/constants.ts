export type WorkItem = {
  company: string;
  slug: string;
  role: string;
  date: string;
  about: string;
  url: string;
  /** ms to wait before screenshotting, for sites with an entrance animation */
  previewWaitMs?: number;
  /** keep the entry here but leave it off the site (and out of previews) */
  hidden?: boolean;
};

export type Project = {
  name: string;
  slug: string;
  role: string;
  date?: string;
  about: string;
  url: string;
  /** ms to wait before screenshotting, for sites with an entrance animation */
  previewWaitMs?: number;
};

export type Paper = {
  title: string;
  venue: string;
  year: string;
  citations: number;
};

export type Patent = {
  number: string;
  title: string;
  year: string;
};

/**
 * press and mentions. not rendered in the page UI: they feed the JSON-LD (see
 * structured-data.ts) and the <noscript> fallback in _app.tsx.
 *
 * "article" is a piece about Nithin; "podcast" is an episode about the book,
 * not an appearance by him, so it stays off his own press.
 */
export type PressItem = {
  slug: string;
  kind: "article" | "podcast";
  title: string;
  outlet: string;
  url: string;
  /** ISO date; leave out if unknown */
  date?: string;
  author?: string;
  outletUrl?: string;
};

export type Social = {
  label: string;
  href: string;
};

export const SOCIALS: readonly Social[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/aruswamy" },
  { label: "GitHub", href: "https://github.com/nithinaru" },
  {
    label: "Google Scholar",
    href: "https://scholar.google.com/citations?user=jqQkW0AAAAAJ&hl=en&oi=ao",
  },
  { label: "Email", href: "mailto:nithin.alaska@gmail.com" },
];

const ALL_WORK_ITEMS: readonly WorkItem[] = [
  {
    company: "Idler / Widget Factory",
    slug: "idler-widget-factory",
    role: "Software Engineer",
    date: "Sep 2026 — Present",
    about:
      "Stress-testing frontier AI agents across RL environments & coding benchmarks",
    url: "https://idler.ai/",
  },
  {
    company: "UC Davis GSM",
    slug: "uc-davis-gsm",
    role: "Researcher",
    date: "May 2026 — Present",
    about:
      "Donor allocation framework across 500k+ records to improve outreach ROI",
    url: "https://gsm.ucdavis.edu",
  },
  {
    company: "UC Berkeley Haas",
    slug: "berkeley-haas-bbay",
    role: "Teaching Assistant",
    date: "Sep 2025 — May 2026",
    about:
      "Guided student founders launching ventures at the Business Academy for Youth",
    url: "https://haas.berkeley.edu/business-academy/careers/instructors/",
  },
  {
    company: "UC Irvine EECS",
    slug: "uc-irvine-eecs",
    role: "Researcher",
    date: "Aug 2025 — Dec 2025",
    about:
      "Novel computer vision pipeline for fabric categorization and wear prediction",
    url: "https://www.xia-lab.com/team",
  },
  {
    company: "Gamr",
    slug: "gamr",
    role: "Software Engineer",
    date: "Jul 2024 — Feb 2026",
    about:
      "Built AMA, an AI career guide for gamers at Africa's #1 gaming platform",
    url: "https://www.gamr.africa/",
  },
  {
    company: "Robolabs",
    slug: "robolabs",
    role: "Instructor",
    date: "Jun 2023 — Nov 2025",
    about:
      "Mentored 10+ middle school teams and ran logistics for VEX at UC Berkeley",
    url: "https://www.robolabs.org/",
  },
];

export const WORK_ITEMS: readonly WorkItem[] = ALL_WORK_ITEMS.filter(
  (item) => !item.hidden,
);

export const PROJECTS: readonly Project[] = [
  {
    name: "Priceflag",
    slug: "priceflag",
    role: "Co-Founder",
    date: "Present",
    about: "Simulate & safely roll out price changes for eCommerce platforms",
    url: "https://priceflag.org/",
  },
  {
    name: "Jet-Set Teen",
    slug: "jet-set-teen",
    role: "Author",
    about: "Explored 50+ countries, Amazon #1 New Release in Travel Guides",
    url: "https://www.amazon.com/Jet-Set-Teen-International-Travels-Budgeting/dp/B0DF6VKC18",
  },
  {
    name: "OneDay",
    slug: "oneday-app",
    role: "Founder",
    about: "Productivity iOS app, 5,000+ users across 30 countries",
    url: "https://apps.apple.com/us/app/oneday-by-nithin-aruswamy/id6755661127",
  },
  {
    name: "Terran",
    slug: "terran",
    role: "Co-Founder",
    about: "Autonomous farming system for efficient micro-agriculture",
    url: "https://youtu.be/HTlI9NxZe-g?si=V1cE4Rpiqy2UMVoT",
  },
];

export const PRESS: readonly PressItem[] = [
  {
    slug: "pleasanton-weekly-terran",
    kind: "article",
    title: "Dublin teen leads agriculture tech startup",
    outlet: "Pleasanton Weekly",
    outletUrl: "https://www.pleasantonweekly.com",
    url: "https://www.pleasantonweekly.com/technology/2025/12/22/dublin-teen-leads-agriculture-tech-startup/",
    date: "2025-12-22",
    author: "Jude Strzemp",
  },
  {
    slug: "agritech-insights-terran",
    kind: "article",
    title:
      "Dublin High Senior Revolutionizes Farming with Agritech Innovations",
    outlet: "AgriTech Insights",
    outletUrl: "https://agritechinsights.com",
    url: "https://agritechinsights.com/index.php/2025/12/23/dublin-high-senior-revolutionizes-farming-with-agritech-innovations/",
    date: "2025-12-23",
    author: "John Hutton",
  },
  {
    slug: "independent-terran",
    kind: "article",
    title:
      "Startup Company Led by Students Develops Hydroponics System for Small-Scale Farms",
    outlet: "The Independent",
    outletUrl: "https://www.independentnews.com",
    url: "https://www.independentnews.com/news/dublin_news/startup-company-led-by-students-develops-hydroponics-system-for-small-scale-farms/article_ef16be81-3b20-4c67-8d80-ae59f3b0e4d3.html",
    date: "2026-01-15",
    author: "Sanestina Hunter",
  },
  {
    slug: "spotify-jet-set-teen",
    kind: "podcast",
    title:
      "FYP Jet-Set Teen: Plan an International Trip in an hour! 30+ International Travels & Budgeting Tips Online",
    outlet: "Spotify",
    url: "https://open.spotify.com/episode/7cADtaNyxwdHCYx8VSfZB2",
  },
];

/** public videos on Nithin's YouTube channel; feed the JSON-LD only */
export type Video = {
  /** the YouTube video id (the part after v= or youtu.be/) */
  id: string;
  title: string;
};

export const VIDEOS: readonly Video[] = [
  {
    id: "HTlI9NxZe-g",
    title: "Terran | Scalable Farming for Small-Scale Farmers",
  },
  { id: "kmYGtSsVqA0", title: "Introducing Therapeuo" },
];

export const PAPERS: readonly Paper[] = [
  {
    title: "Math Modeling & Geometry for Fabric Analysis",
    venue: "Transactions on Machine Learning Research",
    year: "2025",
    citations: 2,
  },
  {
    title: "Textile Microtexture Dataset",
    venue: "Harvard Dataverse",
    year: "2025",
    citations: 320,
  },
  {
    title: "Efficient Micro-Agriculture System",
    venue: "Youth Innovators Journal",
    year: "2024",
    citations: 3,
  },
  {
    title: "Computer Vision Pipeline for MSE Microtextures",
    venue: "arXiv",
    year: "2024",
    citations: 12,
  },
];

export const PATENTS: readonly Patent[] = [
  {
    number: "63/742,004",
    title: "Sustainable Harvesting and Integrated Efficient Land Defense",
    year: "2023",
  },
];
