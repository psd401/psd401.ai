import { getToolBySlug } from '@/lib/tools';
import { Card, CardBody, Chip, Link as NextUILink } from '@nextui-org/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/tools" className="text-primary hover:underline mb-8 inline-block">
        ← Back to Tools
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            {tool.title}
          </h1>
          <p className="text-xl text-foreground/80">{tool.description}</p>

          <div className="flex flex-wrap gap-2">
            {tool.type && (
              <Chip color="primary" variant="flat" size="sm">
                {tool.type}
              </Chip>
            )}
            {tool.status && (
              <Chip color="success" variant="flat" size="sm">
                {tool.status}
              </Chip>
            )}
            {tool.tags?.map(tag => (
              <Chip key={tag} variant="flat" size="sm">
                {tag}
              </Chip>
            ))}
          </div>

          <Card className="bg-content1">
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground/60 mb-1">Privacy Level</h3>
                <p>{tool.privacy}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground/60 mb-1">Status</h3>
                <p>{tool.status}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground/60 mb-1">Type</h3>
                <p>{tool.type}</p>
              </div>
            </CardBody>
          </Card>

          {tool.demoUrl && (
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-none">
              <CardBody className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm">Launch this tool in your browser</span>
                  <NextUILink
                    href={tool.demoUrl}
                    target="_blank"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
                    showAnchorIcon
                  >
                    Launch Tool
                  </NextUILink>
                </div>
              </CardBody>
            </Card>
          )}

          {tool.url && tool.url !== tool.demoUrl && (
            <Card className="bg-secondary-50 dark:bg-secondary-900/20 border-none">
              <CardBody className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm">Additional resource for this tool</span>
                  <NextUILink
                    href={tool.url}
                    target="_blank"
                    className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition-colors inline-flex items-center gap-2"
                    showAnchorIcon
                  >
                    Visit Resource
                  </NextUILink>
                </div>
              </CardBody>
            </Card>
          )}
        </header>

        <Card>
          <CardBody className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-base prose-p:leading-7 prose-p:my-4 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-bold prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:italic">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
                ),
                li: ({ ...props }) => <li className="my-1" {...props} />,
                p: ({ ...props }) => <p className="my-4" {...props} />,
              }}
            >
              {tool.content}
            </Markdown>
          </CardBody>
        </Card>
      </article>
    </div>
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
