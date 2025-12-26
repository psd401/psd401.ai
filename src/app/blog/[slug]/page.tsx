import { getPostBySlug, getAllPosts } from '@/lib/blog';
import MarkdownContent from '@/components/MarkdownContent';
import { Chip } from '@nextui-org/react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const description = post.description || post.content.slice(0, 160).replace(/[#*`]/g, '');

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="space-y-8 mb-12">
        <Link
          href="/blog"
          className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-2"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        <div className="space-y-4">
          <div className="flex gap-2">
            {post.tags?.map(tag => (
              <Chip key={tag} variant="flat" size="sm">
                {tag}
              </Chip>
            ))}
          </div>

          <h1 className="text-4xl font-bold">{post.title}</h1>

          <div className="flex items-center gap-4 text-foreground/60">
            <span>{new Date(post.date).toLocaleDateString()}</span>
            {post.author && <span>By {post.author}</span>}
          </div>
        </div>

        {post.image && (
          <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
            <Image src={post.image} alt={post.title} fill className="object-cover" />
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownContent content={post.content} />
      </div>
    </article>
  );
}
