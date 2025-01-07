'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SearchResult } from '@/lib/search';

export default function SearchClient({ results }: { results: SearchResult[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('q');
    router.push(`/search?q=${encodeURIComponent(search?.toString() || '')}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Search Results</h1>

      <div className="mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search across all content..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Search
          </button>
        </form>
      </div>

      {query && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Found {results.length} results for "{query}"
        </p>
      )}

      <div className="space-y-8">
        {results.map((result, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                {result.section}
              </span>
              {result.tags?.map(tag => (
                <span
                  key={tag}
                  className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link href={result.url} className="block group">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
                {result.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{result.description}</p>
            </Link>
          </div>
        ))}

        {query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No results found for "{query}". Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
