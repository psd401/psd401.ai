import { getAllPosts } from '@/lib/blog';
import BlogClient from './blog-client';

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const posts = await getAllPosts();
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));

  return <BlogClient posts={posts} allTags={allTags} />;
} 