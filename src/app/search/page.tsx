import { searchContent } from '@/lib/search';
import SearchClient from './search-client';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search across all AI resources, articles, tools, and policies on Peninsula SD AI.',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const results = query ? await searchContent(query) : [];

  return <SearchClient results={results} />;
}
