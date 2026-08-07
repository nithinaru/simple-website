export type WorkItem = {
  company: string;
  slug: string;
  role: string;
  date: string;
  about: string;
  url: string;
  image?: string;
};

export type EducationItem = {
  school: string;
  slug: string;
  degree: string;
  location: string;
  about: string;
  url: string;
  date?: string;
  image?: string;
};

export type Project = {
  name: string;
  slug: string;
  role: string;
  about: string;
  url: string;
  image?: string;
};

export type Paper = {
  title: string;
  venue: string;
  year: string;
  status: "published" | "preprint";
  citations: number;
  url: string;
};

export type Patent = {
  number: string;
  title: string;
  year: string;
  status: string;
};

export type Award = {
  title: string;
  org: string;
  year: string;
};

export type SkillGroup = {
  title: string;
  items: readonly string[];
};

export type MediaItem = {
  title: string;
  author: string;
  year: string;
  note?: string;
};

export type MediaGroup = {
  title: string;
  items: readonly MediaItem[];
};

export type Stamp = {
  country: string;
  code: string;
  when: string;
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

export const EDUCATION: readonly EducationItem[] = [
  {
    school: "UC Berkeley",
    slug: "uc-berkeley",
    degree: "B.A. Operations Research & Mathematics",
    location: "Berkeley, CA",
    about: "berkeley, ca",
    url: "https://www.berkeley.edu",
  },
];

export const WORK_ITEMS: readonly WorkItem[] = [
  {
    company: "UC Davis GSM",
    slug: "uc-davis-gsm",
    role: "operations researcher",
    date: "may 2026 — present",
    about:
      "donor allocation framework across 500k+ records to improve outreach ROI",
    url: "https://gsm.ucdavis.edu",
  },
  {
    company: "UC Berkeley Haas",
    slug: "berkeley-haas-bbay",
    role: "teacher assistant",
    date: "sep 2025 — may 2026",
    about:
      "guided student founders launching ventures at the Business Academy for Youth",
    url: "https://haas.berkeley.edu/business-academy/careers/instructors/",
  },
  {
    company: "UC Irvine EECS",
    slug: "uc-irvine-eecs",
    role: "machine learning researcher",
    date: "aug 2025 — dec 2025",
    about:
      "novel computer vision pipeline for fabric categorization and wear prediction",
    url: "https://www.xia-lab.com/team",
  },
  {
    company: "Gamr",
    slug: "gamr",
    role: "product engineer",
    date: "jul 2024 — feb 2026",
    about:
      "built AMA, an AI career guide for gamers at Africa's #1 gaming platform",
    url: "https://www.gamr.africa/",
  },
  {
    company: "Robolabs",
    slug: "robolabs",
    role: "robotics instructor",
    date: "jun 2023 — nov 2025",
    about:
      "mentored 10+ middle school teams and ran logistics for VEX at UC Berkeley",
    url: "https://www.robolabs.org/",
  },
];

export const PROJECTS: readonly Project[] = [
  {
    name: "Tarsole (fka Therapeuo)",
    slug: "therapeuo",
    role: "co-founder",
    about: "building the world's first mass-market smart insole",
    url: "https://therapeuo.xyz/",
  },
  {
    name: "OneDay",
    slug: "oneday-app",
    role: "founder",
    about: "productivity iOS app, 5,000+ users across 30 countries",
    url: "https://apps.apple.com/us/app/oneday-by-nithin-aruswamy/id6755661127",
  },
  {
    name: "Truffle",
    slug: "truffle",
    role: "creator",
    about: "a natural language optimizer for operations research problems",
    url: "https://github.com/nithinaru/Truffle",
  },
  {
    name: "Terran",
    slug: "terran",
    role: "co-founder",
    about: "autonomous farming system for efficient micro-agriculture",
    url: "https://youtu.be/HTlI9NxZe-g?si=V1cE4Rpiqy2UMVoT",
  },
  {
    name: "Jet-Set Teen",
    slug: "jet-set-teen",
    role: "author",
    about: "explored 50+ countries, Amazon #1 New Release in Travel Guides",
    url: "https://www.amazon.com/Jet-Set-Teen-International-Travels-Budgeting/dp/B0DF6VKC18",
  },
];

export const PAPERS: readonly Paper[] = [
  {
    title: "Math Modeling & Geometry for Fabric Analysis",
    venue: "Transactions on Machine Learning Research",
    year: "2025",
    status: "published",
    citations: 2,
    url: "https://openreview.net/pdf/7a75b4e1e1528208c787ca2058ed083741cc29b7.pdf",
  },
  {
    title: "Textile Microtexture Dataset",
    venue: "Harvard Dataverse",
    year: "2025",
    status: "published",
    citations: 320,
    url: "https://doi.org/10.7910/DVN/KUDCQX",
  },
  {
    title: "Efficient Micro-Agriculture System",
    venue: "Youth Innovators Journal",
    year: "2024",
    status: "published",
    citations: 3,
    url: "https://static1.squarespace.com/static/68f03354b22f613e25f92137/t/6902d275baad1a1ef23948ee/1761792629466/YIJ+-+SHIELD.pdf",
  },
  {
    title: "Computer Vision Pipeline for MSE Microtextures",
    venue: "arXiv",
    year: "2024",
    status: "preprint",
    citations: 12,
    url: "https://github.com/nithinaru/microtexture",
  },
];

export const PATENTS: readonly Patent[] = [
  {
    number: "63/742,004",
    title: "Sustainable Harvesting and Integrated Efficient Land Defense",
    year: "2023",
    status: "granted",
  },
];

export const AWARDS: readonly Award[] = [
  { title: "2nd Place · Design Hackathon", org: "CapCut", year: "2026" },
  { title: "1st Place · Hackathon", org: "Apify", year: "2026" },
  { title: "State Seal of Biliteracy", org: "Government of CA", year: "2026" },
  { title: "2nd Place Pitch", org: "NFTE WSI", year: "2025" },
  { title: "Top 100 Pitch", org: "Blue Ocean", year: "2025" },
  { title: "Finalist", org: "Conrad Challenge", year: "2025" },
  { title: "Finalist", org: "Genius Olympiad", year: "2025" },
  { title: "Finalist", org: "Paradigm Challenge", year: "2025" },
  { title: "1st Place Pitch", org: "Berkeley MET.ia", year: "2024" },
  { title: "Top 10 Global Skills", org: "VEX Robotics", year: "2024" },
  { title: "Worlds Quarterfinalist", org: "VEX Robotics", year: "2023" },
];

export const SKILLS: readonly SkillGroup[] = [
  {
    title: "engineering",
    items: [
      "iOS App Development",
      "Autonomous Systems",
      "Control Systems (PID)",
      "Stochastic Processes",
      "Robotics",
      "GPIO",
    ],
  },
  {
    title: "systems",
    items: [
      "Embedded Systems",
      "Sensor Integration",
      "Bluetooth Low Energy",
      "Hydroponic Systems",
    ],
  },
  {
    title: "design",
    items: ["UI/UX Design", "Hardware Prototyping", "Human-Centric Design"],
  },
  {
    title: "tools",
    items: ["Nvidia Jetson", "CAD", "Xcode", "Figma", "GitHub", "Claude Code"],
  },
  {
    title: "languages",
    items: ["Swift", "Java", "Python", "R", "C++"],
  },
];

export const INTERESTS: readonly string[] = [
  "Operations Research",
  "Smart Wearable Tech",
  "Autonomous Farming",
  "Battery Cell Technology",
  "Nuclear Energy",
  "Global Travel",
];

export const MEDIA: readonly MediaGroup[] = [
  {
    title: "books",
    items: [
      {
        title: "Dune",
        author: "Frank Herbert",
        year: "1965",
        note: "currently reading",
      },
      { title: "Build", author: "Tony Fadell", year: "2022" },
      { title: "Meditations", author: "Marcus Aurelius", year: "170 CE" },
      { title: "Ikigai", author: "Francesc Miralles", year: "2018" },
      {
        title: "Prisoners of Geography",
        author: "Tim Marshall",
        year: "2015",
      },
    ],
  },
  {
    title: "films",
    items: [
      { title: "In Whose Name?", author: "Nico Ballesteros", year: "2025" },
      {
        title: "Captain America: The Winter Soldier",
        author: "Russo Brothers",
        year: "2014",
      },
      { title: "Schindler's List", author: "Steven Spielberg", year: "1993" },
      { title: "Big Hero 6", author: "Don Hall", year: "2014" },
      { title: "F1", author: "Joseph Kosinski", year: "2025" },
    ],
  },
  {
    title: "albums",
    items: [
      {
        title: "Yeezus",
        author: "Kanye West",
        year: "2013",
        note: "on rotation",
      },
      { title: "Jackman.", author: "Jack Harlow", year: "2023" },
      { title: "Honestly, Nevermind", author: "Drake", year: "2022" },
      { title: "Diamante", author: "Gordo", year: "2024" },
      { title: "IN LOVING MEMORY+", author: "Sean Leon", year: "2023" },
    ],
  },
];

export const STAMPS: readonly Stamp[] = [
  { country: "Bolivia", code: "BO", when: "spring 2026" },
  { country: "Chile", code: "CL", when: "spring 2026" },
  { country: "Colombia", code: "CO", when: "summer 2025" },
  { country: "Brazil", code: "BR", when: "summer 2025" },
  { country: "Peru", code: "PE", when: "summer 2025" },
];

export const COUNTRIES_VISITED = 53;
