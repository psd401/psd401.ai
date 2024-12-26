import { searchContent } from '@/lib/search';
import SearchClient from './search-client';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const results = query ? await searchContent(query) : [];
  
  return <SearchClient results={results} />;
} 