import { getUseCaseBySlug } from '@/lib/use-cases';
import MarkdownContent from '@/components/MarkdownContent';
import { Chip } from '@nextui-org/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    category: string;
    slug: string;
  };
}

export default async function UseCasePage({ params }: Props) {
  const useCase = await getUseCaseBySlug(params.category, params.slug);

  if (!useCase) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 text-sm text-foreground/60">
        <Link href="/use-cases" className="hover:text-primary">
          Use Cases
        </Link>
        <span className="mx-2">→</span>
        <Link href={`/use-cases#${params.category}`} className="hover:text-primary">
          {decodeURIComponent(params.category)
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </Link>
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
  );
}
