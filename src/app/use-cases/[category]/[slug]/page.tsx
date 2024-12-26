import { getContentBySlug } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';
import { Chip, Link } from '@nextui-org/react';

interface Props {
  params: {
    category: string;
    slug: string;
  };
}

export default function UseCasePage({ params }: Props) {
  const useCase = getContentBySlug(`use-cases/${params.category}`, params.slug);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/use-cases" className="hover:text-primary">
          Use Cases
        </Link>
        <span className="mx-2">→</span>
        <Link href={`/use-cases#${params.category}`} className="hover:text-primary">
          {useCase.frontmatter.category}
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{useCase.frontmatter.title}</h1>
        <div className="flex flex-wrap gap-4 mb-4">
          {useCase.frontmatter.subject && (
            <Chip color="primary" variant="flat">
              {useCase.frontmatter.subject}
            </Chip>
          )}
          {useCase.frontmatter.gradeLevel && (
            <Chip variant="flat">
              Grades {useCase.frontmatter.gradeLevel}
            </Chip>
          )}
          {useCase.frontmatter.status && (
            <Chip color="success" variant="flat">
              {useCase.frontmatter.status}
            </Chip>
          )}
        </div>
        {useCase.frontmatter.toolsUsed && (
          <div className="space-y-2">
            <h2 className="text-sm text-gray-600">Tools Used:</h2>
            <div className="flex flex-wrap gap-2">
              {useCase.frontmatter.toolsUsed.map((tool: string) => (
                <Chip key={tool} variant="flat" size="sm">
                  {tool}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {useCase.frontmatter.tags && (
          <div className="space-y-2 mt-4">
            <h2 className="text-sm text-gray-600">Tags:</h2>
            <div className="flex flex-wrap gap-2">
              {useCase.frontmatter.tags.map((tag: string) => (
                <Chip key={tag} variant="flat" size="sm">
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </header>

      <MarkdownContent content={useCase.content} />

      <footer className="mt-12 pt-8 border-t">
        <Link href="/use-cases" className="text-primary hover:underline">
          ← Back to Use Cases
        </Link>
      </footer>
    </article>
  );
} 