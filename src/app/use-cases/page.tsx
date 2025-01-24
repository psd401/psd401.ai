import { getAllTags, getUseCasesByCategory, getAllCategories } from '@/lib/use-cases';
import UseCasesClient from './use-cases-client';

export const revalidate = 3600; // Revalidate every hour

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
