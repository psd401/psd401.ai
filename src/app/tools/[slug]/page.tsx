import { getToolBySlug } from '@/lib/tools';
import { Chip } from '@nextui-org/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Markdown from 'react-markdown';

interface Props {
  params: {
    slug: string;
  };
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link 
        href="/tools"
        className="text-primary hover:text-primary-600 mb-8 inline-flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tools
      </Link>

      {/* Tool Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{tool.title}</h1>
        <p className="text-xl text-foreground/80 mb-4">{tool.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tool.tags.map((tag) => (
            <Chip key={tag} size="sm" variant="flat">
              {tag}
            </Chip>
          ))}
        </div>

        {/* Tool Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-content1 rounded-lg">
          {tool.url && (
            <div>
              <h3 className="font-semibold text-sm text-foreground/60 mb-1">Website</h3>
              <Link 
                href={tool.url}
                target="_blank"
                className="text-primary hover:text-primary-600"
              >
                Visit Tool
              </Link>
            </div>
          )}
          {tool.pricing && (
            <div>
              <h3 className="font-semibold text-sm text-foreground/60 mb-1">Pricing</h3>
              <p>{tool.pricing}</p>
            </div>
          )}
          {tool.platform && (
            <div>
              <h3 className="font-semibold text-sm text-foreground/60 mb-1">Platform</h3>
              <p>{tool.platform}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tool Content */}
      <div className="prose dark:prose-invert max-w-none">
        <Markdown>{tool.content}</Markdown>
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  return {
    title: tool.title,
    description: tool.description,
  };
} 