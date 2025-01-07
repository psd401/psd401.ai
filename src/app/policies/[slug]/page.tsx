import { getContentBySlug } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';

interface Props {
  params: {
    slug: string;
  };
}

export default function PolicyPage({ params }: Props) {
  const policy = getContentBySlug('policies', params.slug);

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{policy.frontmatter.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {policy.frontmatter.lastUpdated && (
            <time>
              Last updated: {new Date(policy.frontmatter.lastUpdated).toLocaleDateString()}
            </time>
          )}
          {policy.frontmatter.category && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
              {policy.frontmatter.category}
            </span>
          )}
          {policy.frontmatter.status && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
              Status: {policy.frontmatter.status}
            </span>
          )}
        </div>
      </header>

      <MarkdownContent content={policy.content} />
    </article>
  );
}
