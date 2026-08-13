/**
 * Site-wide configuration: the five standing sections, the de-prioritised
 * reference library, and the URL contract.
 *
 * This is the single source of truth for navigation, breadcrumbs, the
 * sitemap, llms.txt, and the OKF bundle's `resource` fields. Adding a section
 * here is the only edit needed to have it appear in all of them.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://psd401.ai';

export const SITE_NAME = 'Peninsula AI';
export const SITE_TAGLINE = 'A public school district doing its AI work in the open.';
export const SITE_DESCRIPTION =
  'Peninsula School District publishes its AI work in public: the software it builds, the policies it writes, the talks it gives, and the experiments that failed.';

/** Section colour keys, matching [data-section] in tokens/colors.css. */
export type SectionKey = 'writing' | 'software' | 'guidance' | 'presentations' | 'oad' | 'practice';

export type Section = {
  /** Permanent two-digit number. The site's spine — never renumber. */
  n: string;
  key: SectionKey;
  name: string;
  href: string;
  /** Directory under src/content/ this section renders, if any. */
  contentDir?: string;
  /** OKF `type` for concepts in this section. */
  okfType?: string;
  description: string;
};

/**
 * The five standing sections. These appear in the masthead, always numbered,
 * and are never collapsed into a "More" menu on desktop.
 */
export const SECTIONS: Section[] = [
  {
    n: '01',
    key: 'writing',
    name: 'Writing',
    href: '/writing',
    contentDir: 'writing',
    okfType: 'post',
    description:
      'Notes from the people doing the work — what we tried, what it cost, what we would do differently.',
  },
  {
    n: '02',
    key: 'software',
    name: 'Software',
    href: '/software',
    contentDir: 'software',
    okfType: 'software',
    description: 'Products in production, built by district staff for district problems.',
  },
  {
    n: '03',
    key: 'guidance',
    name: 'Guidance',
    href: '/guidance',
    contentDir: 'guidance',
    okfType: 'policy',
    description:
      'The documents our own staff work from. Plain language, published in Markdown, licensed so you can fork them.',
  },
  {
    n: '04',
    key: 'presentations',
    name: 'Presentations',
    href: '/presentations',
    contentDir: 'presentations',
    okfType: 'presentation',
    description: 'Talks and slides, published as given.',
  },
  {
    n: '05',
    key: 'oad',
    name: 'Open Adaptive District',
    href: '/open-adaptive-district',
    description: 'How the work gets done — the loop underneath all five sections.',
  },
];

/**
 * The reference library. Deliberately not a sixth numbered section and not in
 * the masthead — it is linked from the footer and from the sections it
 * supports. These URLs are unchanged from the pre-redesign site on purpose:
 * they are 92 of ~200 pages and moving them would cost more than it gained.
 */
export const PRACTICE_HUB = { key: 'practice' as const, name: 'Practice', href: '/practice' };

export const PRACTICE_SECTIONS: Section[] = [
  {
    n: '',
    key: 'practice',
    name: 'Use Cases',
    href: '/use-cases',
    contentDir: 'use-cases',
    okfType: 'use-case',
    description: 'Practical examples of AI in use across the district, submitted by staff.',
  },
  {
    n: '',
    key: 'practice',
    name: 'Tools',
    href: '/tools',
    contentDir: 'tools',
    okfType: 'tool',
    description: 'AI tools reviewed for use in Peninsula School District.',
  },
  {
    n: '',
    key: 'practice',
    name: 'Research',
    href: '/articles',
    contentDir: 'articles',
    okfType: 'research',
    description: 'External research and articles on AI in education.',
  },
];

export const ALL_SECTIONS = [...SECTIONS, ...PRACTICE_SECTIONS];

/** Masthead entries — the five, in order. */
export const MASTHEAD_SECTIONS = SECTIONS.map(({ n, name, href }) => ({ n, name, href }));

export const SOCIAL_LINKS = [
  { name: 'GitHub', href: 'https://github.com/psd401' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/peninsula-school-district' },
  { name: 'Facebook', href: 'https://facebook.com/psd401' },
];

export const LICENSE = {
  name: 'CC BY-NC-SA 4.0',
  href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
};

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** The section a content directory belongs to. */
export function sectionForContentDir(dir: string): Section | undefined {
  return ALL_SECTIONS.find(s => s.contentDir === dir);
}
