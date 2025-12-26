import { getAllTools, getAllTags } from '@/lib/tools';
import ToolsClient from './tools-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Tools',
  description:
    'Curated collection of AI tools and resources for K-12 education. Find practical tools to streamline workflows and personalize learning.',
  openGraph: {
    title: 'AI Tools | Peninsula SD AI',
    description: 'Curated collection of AI tools and resources for K-12 education.',
    images: ['/images/sections/tools-hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools | Peninsula SD AI',
    description: 'Curated collection of AI tools and resources for K-12 education.',
    images: ['/images/sections/tools-hero.jpg'],
  },
};

export default async function ToolsPage() {
  const [tools, allTags] = await Promise.all([getAllTools(), getAllTags()]);

  return <ToolsClient tools={tools} allTags={allTags} />;
}
