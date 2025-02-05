import { Chip } from '@nextui-org/react';
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
        <div className="flex flex-wrap gap-4 items-center">
          {policy.frontmatter.lastUpdated && (
            <time className="text-sm text-foreground/60">
              Last updated: {new Date(policy.frontmatter.lastUpdated).toLocaleDateString()}
            </time>
          )}
          {policy.frontmatter.category && (
            <Chip color="primary" variant="flat" size="sm">
              {policy.frontmatter.category}
            </Chip>
          )}
          {policy.frontmatter.status && (
            <Chip color="success" variant="flat" size="sm">
              Status: {policy.frontmatter.status}
            </Chip>
          )}
        </div>
      </header>

      <MarkdownContent content={policy.content} />
    </article>
  );
}
