import { getUseCaseBySlug, getAllUseCases } from '@/lib/use-cases';
import MarkdownContent from '@/components/MarkdownContent';
import { Chip } from '@/components/ui/ClientChip';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import JsonLd, { createBreadcrumbSchema } from '@/components/JsonLd';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const useCases = await getAllUseCases();
  return useCases.map(useCase => ({
    category: useCase.category,
    slug: useCase.slug,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const decodedCategory = decodeURIComponent(params.category);
  const useCase = await getUseCaseBySlug(decodedCategory, params.slug);
  if (!useCase) {
    return {
      title: 'Use Case Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: useCase.title,
    description: useCase.description,
    openGraph: {
      title: useCase.title,
      description: useCase.description,
      type: 'article',
      images: ['/images/sections/use-cases-hero.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: useCase.title,
      description: useCase.description,
      images: ['/images/sections/use-cases-hero.jpg'],
    },
  };
}

export default async function UseCasePage(props: Props) {
  const params = await props.params;
  const decodedCategory = decodeURIComponent(params.category);
  const useCase = await getUseCaseBySlug(decodedCategory, params.slug);

  if (!useCase) {
    notFound();
  }

  const categoryDisplayName = decodedCategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Use Cases', url: '/use-cases' },
    { name: categoryDisplayName, url: `/use-cases#${params.category}` },
    { name: useCase.title },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-foreground/60">
          <Link href="/use-cases" className="hover:text-primary">
            Use Cases
          </Link>
          <span className="mx-2" aria-hidden="true">
            →
          </span>
          <Link href={`/use-cases#${params.category}`} className="hover:text-primary">
            {categoryDisplayName}
          </Link>
          <span className="mx-2" aria-hidden="true">
            →
          </span>
          <span aria-current="page">{useCase.title}</span>
        </nav>

        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
              {useCase.title}
            </h1>
            <p className="text-xl text-foreground/80">{useCase.description}</p>

            <div className="flex flex-wrap gap-2">
              {useCase.subject && (
                <Chip color="primary" variant="flat" size="sm">
                  {useCase.subject}
                </Chip>
              )}
              {useCase.grade_level && (
                <Chip color="secondary" variant="flat" size="sm">
                  Grade {useCase.grade_level}
                </Chip>
              )}
              {useCase.tools_used?.map(tool => (
                <Chip key={tool} variant="flat" size="sm">
                  {tool}
                </Chip>
              ))}
            </div>

            {useCase.tags && useCase.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {useCase.tags.map(tag => (
                    <Chip key={tag} variant="flat" size="sm">
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {(useCase.author || useCase.school) && (
              <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                {useCase.author && <span>By {useCase.author}</span>}
                {useCase.school && <span>at {useCase.school}</span>}
              </div>
            )}
          </header>

          <div className="prose dark:prose-invert max-w-none">
            <MarkdownContent content={useCase.content} />
          </div>

          <footer className="pt-8 border-t">
            <Link href="/use-cases" className="text-primary hover:underline">
              ← Back to Use Cases
            </Link>
          </footer>
        </article>
      </div>
    </>
  );
}
