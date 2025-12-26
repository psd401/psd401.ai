// Type definitions for JSON-LD schemas
export interface OrganizationSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
}

export interface ArticleSchema {
  '@type': 'Article' | 'NewsArticle' | 'BlogPosting';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export interface BreadcrumbSchema {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface WebPageSchema {
  '@type': 'WebPage';
  name: string;
  description?: string;
  url?: string;
}

export interface SoftwareApplicationSchema {
  '@type': 'SoftwareApplication' | 'WebApplication';
  name: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
}

export type JsonLdSchema =
  | OrganizationSchema
  | ArticleSchema
  | BreadcrumbSchema
  | WebPageSchema
  | SoftwareApplicationSchema;

interface JsonLdProps {
  data: JsonLdSchema | JsonLdSchema[];
}

/**
 * JSON-LD structured data component for SEO
 * Renders schema.org structured data in a script tag
 */
export default function JsonLd({ data }: JsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    ...(Array.isArray(data) ? { '@graph': data } : data),
  };

  return (
    <script
      type="application/ld+json"
      // SECURITY: dangerouslySetInnerHTML is safe here because:
      // 1. All schema data is TypeScript-typed and comes from trusted sources (server-side content files)
      // 2. JSON.stringify provides serialization protection against code injection
      // 3. User-generated content is never passed to these schema factory functions
      // IMPORTANT: Only use createOrganizationSchema, createArticleSchema, etc. with trusted/sanitized data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Helper functions to create common schemas
export function createOrganizationSchema(): OrganizationSchema {
  return {
    '@type': 'Organization',
    name: 'Peninsula School District',
    url: 'https://psd401.ai',
    logo: 'https://psd401.ai/images/psd-logo.png',
    description:
      'Peninsula School District AI Hub - Resources and guidance for AI in K-12 education',
    sameAs: [
      'https://facebook.com/psd401',
      'https://linkedin.com/company/peninsula-school-district',
      'https://github.com/psd401',
    ],
  };
}

export function createArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: {
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  url: string;
}): ArticleSchema {
  return {
    '@type': 'BlogPosting',
    headline,
    description,
    image: image ? `https://psd401.ai${image}` : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: author
      ? {
          '@type': 'Person',
          name: author,
        }
      : {
          '@type': 'Organization',
          name: 'Peninsula School District',
        },
    publisher: {
      '@type': 'Organization',
      name: 'Peninsula School District',
      logo: {
        '@type': 'ImageObject',
        url: 'https://psd401.ai/images/psd-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://psd401.ai${url}`,
    },
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url ? `https://psd401.ai${item.url}` : undefined,
    })),
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
}): WebPageSchema {
  return {
    '@type': 'WebPage',
    name,
    description,
    url: `https://psd401.ai${url}`,
  };
}
