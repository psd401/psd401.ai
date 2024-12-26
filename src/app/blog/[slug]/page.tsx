import { getPostBySlug, getAllPosts } from '@/lib/blog';
import MarkdownContent from '@/components/MarkdownContent';
import Image from 'next/image';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="space-y-8 mb-12">
        <Link 
          href="/blog"
          className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        <div className="space-y-4">
          <div className="flex gap-2">
            {post.tags?.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 bg-primary-500/10 text-primary-500 rounded-full">
                {tag}
              </span>
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
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
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