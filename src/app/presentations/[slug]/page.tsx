import { getContentBySlug } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';

interface Props {
  params: {
    slug: string;
  };
}

export default function PresentationPage({ params }: Props) {
  const presentation = getContentBySlug('presentations', params.slug);

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{presentation.frontmatter.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {presentation.frontmatter.date && (
            <time>{new Date(presentation.frontmatter.date).toLocaleDateString()}</time>
          )}
          {presentation.frontmatter.presenters &&
            presentation.frontmatter.presenters.length > 0 && (
              <span>Presented by {presentation.frontmatter.presenters.join(', ')}</span>
            )}
          {presentation.frontmatter.type && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
              {presentation.frontmatter.type}
            </span>
          )}
          {presentation.frontmatter.audience && (
            <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded">
              For {presentation.frontmatter.audience}
            </span>
          )}
        </div>
      </header>

      {presentation.frontmatter.slides && (
        <div className="mb-8">
          <iframe
            src={presentation.frontmatter.slides}
            className="w-full aspect-video rounded-lg border"
            allowFullScreen
          />
        </div>
      )}

      <MarkdownContent content={presentation.content} />
    </article>
  );
}
