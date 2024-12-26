import { getAllPosts, getAllTags } from '@/lib/blog';
import BlogClient from './blog-client';

export default async function BlogPage() {
  const [posts, allTags] = await Promise.all([
    getAllPosts(),
    getAllTags()
  ]);

  return <BlogClient posts={posts} allTags={allTags} />;
} 