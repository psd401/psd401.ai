import { getAllPosts } from '@/lib/blog';
import BlogClient from './blog-client';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stories and updates about AI implementation across Peninsula School District. Discover how educators are using AI in K-12 classrooms.',
  openGraph: {
    title: 'Blog | Peninsula SD AI',
    description: 'Stories and updates about AI implementation across Peninsula School District.',
    images: ['/images/sections/blog-hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Peninsula SD AI',
    description: 'Stories and updates about AI implementation across Peninsula School District.',
    images: ['/images/sections/blog-hero.jpg'],
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));

  return <BlogClient posts={posts} allTags={allTags} />;
}
