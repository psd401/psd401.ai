import { getAllArticles, getAllTags } from '@/lib/articles';
import ArticlesClient from './articles-client';

export const revalidate = 3600; // Revalidate every hour

export default async function ArticlesPage() {
  const [articles, allTags] = await Promise.all([
    getAllArticles(),
    getAllTags()
  ]);

  return <ArticlesClient articles={articles} allTags={allTags} />;
} 