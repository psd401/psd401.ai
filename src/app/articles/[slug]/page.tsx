import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { Card, CardBody } from '@/components/ui/ClientCard';
import { Chip } from '@/components/ui/ClientChip';
import { HeroUILink as NextUILink } from '@/components/ui/ClientLink';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map(article => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(props: ArticlePageProps): Promise<Metadata> {
  const params = await props.params;
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      authors: article.author ? [article.author] : undefined,
      images: article.image ? [article.image] : undefined,
    },
  };
}

export default async function ArticlePage(props: ArticlePageProps) {
  const params = await props.params;
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/articles" className="text-primary hover:underline mb-8 inline-block">
        ← Back to Articles
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {article.date && <time>{new Date(article.date).toLocaleDateString()}</time>}
            {article.author && <span>By {article.author}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags?.map(tag => (
              <Chip key={tag} variant="flat" size="sm">
                {tag}
              </Chip>
            ))}
          </div>
          {article.externalUrl && (
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-none">
              <CardBody className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm">
                    Read the full article on {article.source || 'the original source'}
                  </span>
                  <NextUILink
                    href={article.externalUrl}
                    target="_blank"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
                    showAnchorIcon
                  >
                    Read Original Article
                  </NextUILink>
                </div>
              </CardBody>
            </Card>
          )}
        </header>

        <Card className="prose dark:prose-invert max-w-none">
          <CardBody className="prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-base prose-p:leading-7 prose-p:my-4 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-bold prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:italic">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </CardBody>
        </Card>
      </article>
    </div>
  );
}
