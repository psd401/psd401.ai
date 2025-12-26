import { getAllTags, getUseCasesByCategory, getAllCategories } from '@/lib/use-cases';
import UseCasesClient from './use-cases-client';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Use Cases',
  description:
    'Practical examples of AI implementation in K-12 education with ready-to-use prompts and best practices.',
  openGraph: {
    title: 'Use Cases | Peninsula SD AI',
    description:
      'Practical examples of AI implementation in K-12 education with ready-to-use prompts.',
    images: ['/images/sections/use-cases-hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Use Cases | Peninsula SD AI',
    description:
      'Practical examples of AI implementation in K-12 education with ready-to-use prompts.',
    images: ['/images/sections/use-cases-hero.jpg'],
  },
};

export default async function UseCasesPage() {
  const [useCasesByCategory, allTags, categories] = await Promise.all([
    getUseCasesByCategory(),
    getAllTags(),
    getAllCategories(),
  ]);

  return (
    <UseCasesClient
      useCasesByCategory={useCasesByCategory}
      allTags={allTags}
      categories={categories}
    />
  );
}
