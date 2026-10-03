import {
  PAPERS,
  PATENTS,
  PRESS,
  PROJECTS,
  type PressItem,
  VIDEOS,
  WORK_ITEMS,
} from "@/utils/constants";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/utils/site";

/**
 * schema.org JSON-LD for search engines only: nothing here renders on the
 * page. it describes Nithin as one connected entity (a @graph of nodes that
 * point at each other by @id) so Google can tie the website, the profiles,
 * the book, the press and the organisations to a single person — the input
 * a knowledge panel is built from.
 *
 * everything is derived from constants.ts where it can be, so the visible
 * page and this data can't drift apart (an entry marked hidden there stays
 * out of here too). only add facts that are publicly sourced.
 */

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PROFILE_ID = `${SITE_URL}/#profile`;
const BOOK_ID = `${SITE_URL}/#jet-set-teen`;
const PERSON_REF = { "@id": PERSON_ID };

// every profile and site that is Nithin's, so search engines can tie them to
// the one person
const SAME_AS = [
  "https://www.linkedin.com/in/aruswamy",
  "https://github.com/nithinaru",
  "https://scholar.google.com/citations?user=jqQkW0AAAAAJ&hl=en&oi=ao",
  "https://x.com/nithinaru",
  "https://www.cosmos.so/nithinaru",
  "https://travel.nithinaruswamy.com/",
  "https://devpost.com/nithin-alaska",
  "https://www.youtube.com/@nithinaru",
  "https://www.goodreads.com/nithinaru",
  "https://www.amazon.com/stores/Nithin-Aruswamy/author/B0DG2GLQWL",
  "https://openlibrary.org/authors/OL16612734A",
  "https://orcid.org/0009-0001-3792-6961",
  "https://apps.apple.com/us/app/oneday-by-nithin-aruswamy/id6755661127",
];

const KNOWS_ABOUT = [
  "Operations research",
  "Mathematics",
  "Computer vision",
  "Agricultural automation",
  "Agritech",
  "Marketing analytics",
  "Travel writing",
  "Software engineering",
];

const organisation = (name: string, url: string) => ({
  "@type": "Organization",
  name,
  url,
});

const workOrganisation = (company: string) => {
  const item = WORK_ITEMS.find((work) => work.company === company);
  return item ? organisation(item.company, item.url) : null;
};

const present = <T>(value: T | null): value is T => value !== null;

const currentEmployers = [
  workOrganisation("Idler / Widget Factory"),
  workOrganisation("UC Davis GSM"),
].filter(present);

// past roles and schools: alumniOf is the closest fit for both
const pastOrganisations = [
  "UC Berkeley Haas",
  "UC Irvine EECS",
  "Gamr",
  "Robolabs",
]
  .map(workOrganisation)
  .filter(present);

const project = (slug: string) => PROJECTS.find((item) => item.slug === slug);

const priceflag = project("priceflag");
const terran = project("terran");
const oneDay = project("oneday-app");
const jetSetTeen = project("jet-set-teen");

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: PERSON_REF,
};

// ProfilePage is what Google documents for a page whose main subject is one
// person
const profilePage = {
  "@type": "ProfilePage",
  "@id": PROFILE_ID,
  url: SITE_URL,
  name: SITE_TITLE,
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: PERSON_REF,
};

const book = {
  "@type": "Book",
  "@id": BOOK_ID,
  name: "Jet-Set Teen: Plan an International Trip in an Hour! 30+ International Travels & Budgeting Tips",
  alternateName: "Jet-Set Teen",
  author: PERSON_REF,
  url: jetSetTeen?.url,
  // the Kindle listing and the Open Library edition
  sameAs: [
    "https://www.amazon.com/dp/B0DF68HLGD",
    "https://play.google.com/store/books/details?id=vLQTEgAAQBAJ",
    "https://books.google.com/books?id=vLQTEgAAQBAJ",
    "https://openlibrary.org/books/OL62603255M",
  ],
  isbn: "979-8336225266",
  datePublished: "2024-08-23",
  numberOfPages: 350,
  inLanguage: "en",
  genre: "Travel guide",
  publisher: { "@type": "Organization", name: "Independently published" },
};

const pressId = (item: PressItem) => `${SITE_URL}/#press-${item.slug}`;

// an article is about Nithin. a podcast episode is about the book — not an
// appearance by him — so it points at the book and stays off his own press
const pressNode = (item: PressItem) => {
  switch (item.kind) {
    case "article":
      return {
        "@type": "NewsArticle",
        "@id": pressId(item),
        headline: item.title,
        url: item.url,
        datePublished: item.date,
        author: item.author
          ? { "@type": "Person", name: item.author }
          : undefined,
        publisher: organisation(item.outlet, item.outletUrl ?? item.url),
        about: PERSON_REF,
      };
    case "podcast":
      return {
        "@type": "PodcastEpisode",
        "@id": pressId(item),
        name: item.title,
        url: item.url,
        datePublished: item.date,
        about: { "@id": BOOK_ID },
      };
    default: {
      const unhandled: never = item.kind;
      throw new Error(`unhandled press kind: ${unhandled}`);
    }
  }
};

const pressNodes = PRESS.map(pressNode);
const pressAboutPerson = PRESS.filter((item) => item.kind === "article").map(
  (item) => ({ "@id": pressId(item) }),
);

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_TITLE,
  givenName: "Nithin",
  familyName: "Aruswamy",
  url: SITE_URL,
  image: `${SITE_URL}/og.png`,
  jobTitle: "Operations Researcher & Student",
  description: SITE_DESCRIPTION,
  worksFor: currentEmployers,
  alumniOf: [
    {
      "@type": "HighSchool",
      name: "Dublin High School",
      address: { "@type": "PostalAddress", addressLocality: "Dublin" },
    },
    ...pastOrganisations,
  ],
  affiliation: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of California, Berkeley",
      url: "https://www.berkeley.edu",
    },
  ],
  knowsAbout: KNOWS_ABOUT,
  // a stable researcher ID, the same one Wikidata and paper databases use
  identifier: {
    "@type": "PropertyValue",
    propertyID: "ORCID",
    value: "0009-0001-3792-6961",
    url: "https://orcid.org/0009-0001-3792-6961",
  },
  sameAs: SAME_AS,
  subjectOf: pressAboutPerson,
};

// as reported in the AgriTech Insights and Independent pieces (see PRESS)
const TERRAN_AWARDS = [
  "Second place, 2024 Zuora Climate Action Challenge (Network for Teaching Entrepreneurship)",
  "Top 100 team, 2024-25 Blue Ocean Student Entrepreneur Competition",
  "Finalist, 2025 GENIUS Olympiad",
];

const founded = [
  priceflag && {
    ...organisation(priceflag.name, priceflag.url),
    description: priceflag.about,
    founder: PERSON_REF,
  },
  terran && {
    ...organisation(terran.name, terran.url),
    description: terran.about,
    founder: PERSON_REF,
    foundingDate: "2025-01",
    award: TERRAN_AWARDS,
  },
].filter(Boolean);

const app = oneDay && {
  "@type": "MobileApplication",
  name: oneDay.name,
  url: oneDay.url,
  description: oneDay.about,
  operatingSystem: "iOS",
  applicationCategory: "ProductivityApplication",
  author: PERSON_REF,
};

// videos on his own channel, which ties the channel to the site and person
const videos = VIDEOS.map((video) => ({
  "@type": "VideoObject",
  name: video.title,
  url: `https://www.youtube.com/watch?v=${video.id}`,
  embedUrl: `https://www.youtube.com/embed/${video.id}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
  author: PERSON_REF,
}));

const papers = PAPERS.map((paper) => ({
  "@type": "ScholarlyArticle",
  name: paper.title,
  datePublished: paper.year,
  isPartOf: { "@type": "Periodical", name: paper.venue },
  author: PERSON_REF,
}));

// a provisional filing with a dozen inventors, so contributor not author
const patents = PATENTS.map((patent) => ({
  "@type": "CreativeWork",
  name: patent.title,
  identifier: `Provisional patent application ${patent.number}`,
  dateCreated: patent.year,
  contributor: PERSON_REF,
}));

const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    website,
    profilePage,
    person,
    book,
    ...pressNodes,
    ...founded,
    ...(app ? [app] : []),
    ...videos,
    ...papers,
    ...patents,
  ],
};

// "<" is escaped so no string in the data can close the script tag early
export const JSON_LD = JSON.stringify(GRAPH).replace(/</g, "\\u003c");
