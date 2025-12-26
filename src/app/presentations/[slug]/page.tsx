import { getAllPresentations, getPresentationBySlug } from '@/lib/presentations';
import MarkdownContent from '@/components/MarkdownContent';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const presentations = await getAllPresentations();
  return presentations.map(presentation => ({
    slug: presentation.slug,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const presentation = await getPresentationBySlug(params.slug);
  if (!presentation) {
    return {
      title: 'Presentation Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: presentation.title,
    description:
      presentation.description || `${presentation.type} presentation for ${presentation.audience}`,
    openGraph: {
      title: presentation.title,
      description:
        presentation.description ||
        `${presentation.type} presentation for ${presentation.audience}`,
      type: 'article',
      publishedTime: presentation.date,
    },
  };
}

export default async function PresentationPage(props: Props) {
  const params = await props.params;
  const presentation = await getPresentationBySlug(params.slug);

  if (!presentation) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{presentation.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {presentation.date && <time>{new Date(presentation.date).toLocaleDateString()}</time>}
          {presentation.presenters && presentation.presenters.length > 0 && (
            <span>Presented by {presentation.presenters.join(', ')}</span>
          )}
          {presentation.type && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{presentation.type}</span>
          )}
          {presentation.audience && (
            <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded">
              For {presentation.audience}
            </span>
          )}
        </div>
      </header>

      {presentation.slides && (
        <div className="mb-8">
          <iframe
            src={presentation.slides}
            className="w-full aspect-video rounded-lg border"
            allowFullScreen
          />
        </div>
      )}

      <MarkdownContent content={presentation.content} />
    </article>
  );
}
