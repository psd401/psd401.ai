/**
 * JSON-LD structured data.
 *
 * Answer engines and search engines both read this; it is the cheapest AEO
 * win on the site. Before the redesign every page emitted `BlogPosting`
 * regardless of what it was, so a policy, a conference talk and an external
 * research summary all claimed to be blog posts. Each content type now emits
 * the schema.org type that actually describes it.
 *
 *   post          → BlogPosting
 *   software      → SoftwareApplication
 *   policy        → Article  (+ isPartOf the guidance collection)
 *   presentation  → LearningResource / Event
 *   use-case      → HowTo
 *   research      → ScholarlyArticle (+ citation to the original)
 *   tool          → SoftwareApplication (third-party)
 *   any index     → CollectionPage + ItemList
 */
import React from 'react';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, absoluteUrl } from '@/lib/site';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type JsonLdSchema = Record<string, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface JsonLdProps {
  data: JsonLdSchema | JsonLdSchema[];
}

/**
 * SECURITY: dangerouslySetInnerHTML is safe here because every value comes
 * from server-side content files via the factories below, and JSON.stringify
 * escapes the payload. The `<` replacement closes the one remaining hole —
 * a literal `</script>` inside a string would otherwise end the tag early.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    ...(Array.isArray(data) ? { '@graph': data } : data),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/* ------------------------------------------------------------- publisher */

const PUBLISHER = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Peninsula School District',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('/images/psd-logo.png'),
  },
};

export function createOrganizationSchema(): JsonLdSchema {
  return {
    ...PUBLISHER,
    '@type': ['Organization', 'EducationalOrganization'],
    description: SITE_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gig Harbor',
      addressRegion: 'WA',
      addressCountry: 'US',
    },
    sameAs: [
      'https://github.com/psd401',
      'https://linkedin.com/company/peninsula-school-district',
      'https://facebook.com/psd401',
    ],
  };
}

/** Enables the sitelinks search box, and tells agents where search lives. */
export function createWebSiteSchema(): JsonLdSchema {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-US',
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/* --------------------------------------------------------------- common */

type BaseArgs = {
  title: string;
  description: string;
  url: string;
  date?: string;
  image?: string;
  author?: string;
  tags?: string[];
};

function common({ title, description, url, date, image, author, tags }: BaseArgs) {
  return {
    headline: title,
    name: title,
    description,
    url: absoluteUrl(url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(url) },
    ...(date ? { datePublished: date, dateModified: date } : {}),
    ...(image ? { image: absoluteUrl(image) } : {}),
    ...(tags?.length ? { keywords: tags.join(', ') } : {}),
    author: author ? { '@type': 'Person', name: author } : { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  };
}

/* ---------------------------------------------------------- per-type ---- */

export function createBlogPostingSchema(args: BaseArgs): JsonLdSchema {
  return { '@type': 'BlogPosting', ...common(args) };
}

export function createArticleSchema(args: BaseArgs): JsonLdSchema {
  return { '@type': 'Article', ...common(args) };
}

/** Districts evaluating our software are the target reader for this one. */
export function createSoftwareSchema(
  args: BaseArgs & {
    repo?: string;
    license?: string;
    maturity?: string;
    stack?: string;
  }
): JsonLdSchema {
  const { repo, license, maturity, stack, ...base } = args;
  return {
    '@type': 'SoftwareApplication',
    ...common(base),
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    ...(repo ? { codeRepository: repo, downloadUrl: repo } : {}),
    ...(license ? { license } : {}),
    ...(stack ? { runtimePlatform: stack } : {}),
    ...(maturity ? { releaseNotes: `Maturity: ${maturity}` } : {}),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Third-party tools in the reference library. */
export function createToolSchema(
  args: BaseArgs & { provider?: string; demoUrl?: string }
): JsonLdSchema {
  const { provider, demoUrl, ...base } = args;
  return {
    '@type': 'SoftwareApplication',
    ...common(base),
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    ...(demoUrl ? { url: demoUrl, sameAs: demoUrl } : {}),
    ...(provider ? { provider: { '@type': 'Organization', name: provider } } : {}),
  };
}

export function createPresentationSchema(
  args: BaseArgs & { presenters?: string[]; audience?: string; format?: string; slides?: string }
): JsonLdSchema {
  const { presenters, audience, format, slides, ...base } = args;
  return {
    '@type': 'LearningResource',
    ...common(base),
    learningResourceType: format ?? 'Presentation',
    ...(presenters?.length
      ? { author: presenters.map(name => ({ '@type': 'Person', name })) }
      : {}),
    ...(audience ? { audience: { '@type': 'Audience', audienceType: audience } } : {}),
    ...(slides ? { associatedMedia: { '@type': 'MediaObject', contentUrl: slides } } : {}),
  };
}

/**
 * Use cases are genuinely how-to content: a task, the tools it needed, and
 * what was done. HowTo is the schema answer engines reach for when someone
 * asks "how do I ...", which is exactly the query these should win.
 */
export function createHowToSchema(
  args: BaseArgs & { tools?: string[]; category?: string }
): JsonLdSchema {
  const { tools, category, ...base } = args;
  return {
    '@type': 'HowTo',
    ...common(base),
    ...(tools?.length ? { tool: tools.map(name => ({ '@type': 'HowToTool', name })) } : {}),
    ...(category ? { about: category } : {}),
  };
}

/** External research, with a citation pointing at the real source. */
export function createResearchSchema(
  args: BaseArgs & { source?: string; externalUrl?: string; format?: string }
): JsonLdSchema {
  const { source, externalUrl, format, ...base } = args;
  return {
    '@type': 'ScholarlyArticle',
    ...common(base),
    ...(format ? { genre: format } : {}),
    ...(externalUrl
      ? {
          citation: {
            '@type': 'CreativeWork',
            url: externalUrl,
            ...(source ? { publisher: { '@type': 'Organization', name: source } } : {}),
          },
          sameAs: externalUrl,
        }
      : {}),
  };
}

/* ------------------------------------------------------------ structural */

export function createBreadcrumbSchema(items: Array<{ name: string; url?: string }>): JsonLdSchema {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
  };
}

/** Every index page. Gives answer engines the whole set in one read. */
export function createCollectionSchema({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: Array<{ title: string; url: string; description?: string }>;
}): JsonLdSchema {
  return {
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(url),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.title,
        url: absoluteUrl(item.url),
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  };
}

export function createWebPageSchema({
  name,
  description,
  url,
}: {
  name: string;
  description?: string;
  url: string;
}): JsonLdSchema {
  return {
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(url),
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

/** Q&A blocks, where content has them. Wins featured snippets. */
export function createFaqSchema(qa: Array<{ question: string; answer: string }>): JsonLdSchema {
  return {
    '@type': 'FAQPage',
    mainEntity: qa.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
