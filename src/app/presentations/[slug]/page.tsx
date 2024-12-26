import { getContentBySlug } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';
import { Image } from '@nextui-org/react';

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
        {presentation.frontmatter.thumbnail && (
          <div className="mb-6">
            <Image
              alt={presentation.frontmatter.title}
              src={presentation.frontmatter.thumbnail}
              className="w-full max-h-[400px] object-cover rounded-lg"
            />
          </div>
        )}
        <h1 className="text-4xl font-bold mb-4">{presentation.frontmatter.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {presentation.frontmatter.date && (
            <time>
              {new Date(presentation.frontmatter.date).toLocaleDateString()}
            </time>
          )}
          {presentation.frontmatter.presenter && (
            <span>
              Presented by {presentation.frontmatter.presenter}
            </span>
          )}
          {presentation.frontmatter.type && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
              {presentation.frontmatter.type}
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