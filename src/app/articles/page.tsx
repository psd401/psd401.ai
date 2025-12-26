import { getAllArticles, getAllTags } from '@/lib/articles';
import ArticlesClient from './articles-client';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Curated research and articles on AI in education from leading researchers, educators, and experts in the field.',
  openGraph: {
    title: 'Articles | Peninsula SD AI',
    description:
      'Curated research and articles on AI in education from leading researchers and experts.',
    images: ['/images/sections/articles-hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles | Peninsula SD AI',
    description:
      'Curated research and articles on AI in education from leading researchers and experts.',
    images: ['/images/sections/articles-hero.jpg'],
  },
};

export default async function ArticlesPage() {
  const [articles, allTags] = await Promise.all([getAllArticles(), getAllTags()]);

  return <ArticlesClient articles={articles} allTags={allTags} />;
}
