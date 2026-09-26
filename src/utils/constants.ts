export type WorkItem = {
  company: string;
  slug: string;
  role: string;
  date: string;
  about: string;
  url: string;
  /** ms to wait before screenshotting, for sites with an entrance animation */
  previewWaitMs?: number;
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

export const WORK_ITEMS: readonly WorkItem[] = [
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
    name: "Tarsole (fka Therapeuo)",
    slug: "therapeuo",
    role: "Co-Founder",
    about: "Building the world's first mass-market smart insole",
    url: "https://therapeuo.xyz/",
    previewWaitMs: 4000,
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
  {
    name: "Truffle",
    slug: "truffle",
    role: "Creator",
    about: "A natural language optimizer for operations research problems",
    url: "https://github.com/nithinaru/Truffle",
  },
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
