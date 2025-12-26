import { getAllPresentations, getAllTags } from '@/lib/presentations';
import PresentationsClient from './presentations-client';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Presentations',
  description:
    'AI in education presentations covering key concepts, practical applications, and emerging trends for K-12 educators.',
  openGraph: {
    title: 'Presentations | Peninsula SD AI',
    description: 'AI in education presentations covering key concepts and practical applications.',
    images: ['/images/sections/presentations-hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Presentations | Peninsula SD AI',
    description: 'AI in education presentations covering key concepts and practical applications.',
    images: ['/images/sections/presentations-hero.jpg'],
  },
};

export default async function PresentationsPage() {
  const [presentations, allTags] = await Promise.all([getAllPresentations(), getAllTags()]);

  return <PresentationsClient presentations={presentations} allTags={allTags} />;
}
