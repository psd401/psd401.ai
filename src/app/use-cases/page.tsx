import { CATEGORIES, getUseCasesByCategory, getAllTags } from './page-data';
import UseCasesClient from './use-cases-client';

export default async function UseCasesPage() {
  const useCasesByCategory = await getUseCasesByCategory();
  const allTags = getAllTags(useCasesByCategory);

  return (
    <UseCasesClient 
      useCasesByCategory={useCasesByCategory}
      allTags={allTags}
      categories={CATEGORIES}
    />
  );
} 