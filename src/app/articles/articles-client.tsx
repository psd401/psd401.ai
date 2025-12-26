'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import type { Article } from '@/lib/articles';

interface ArticlesClientProps {
  articles: Article[];
  allTags: string[];
}

export default function ArticlesClient({ articles, allTags }: ArticlesClientProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Organize tags into categories
  const tagCategories = {
    'Article Types': allTags
      .filter(tag => tag.startsWith('Type:'))
      .map(tag => tag.replace('Type: ', '')),
    Authors: allTags
      .filter(tag => tag.startsWith('Author:'))
      .map(tag => tag.replace('Author: ', '')),
    Topics: allTags.filter(tag => !tag.includes(':')),
  };

  const toggleTag = (tag: string, category: string) => {
    const newTags = new Set(selectedTags);
    const fullTag = category === 'Topics' ? tag : `${category.slice(0, -1)}: ${tag}`;
    if (newTags.has(fullTag)) {
      newTags.delete(fullTag);
    } else {
      newTags.add(fullTag);
    }
    setSelectedTags(newTags);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const filterByTags = (article: Article) => {
    if (selectedTags.size === 0) return true;

    const articleTags = new Set(
      [
        ...(article.tags || []),
        ...(article.author?.split(/\s*,\s*/).map(author => `Author: ${author.trim()}`) || []),
        article.type ? `Type: ${article.type}` : null,
      ].filter(Boolean)
    );

    return Array.from(selectedTags).some(tag => articleTags.has(tag));
  };

  const filteredArticles = articles.filter(filterByTags);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative text-center py-16 min-h-[320px] flex items-center -mx-6">
        {/* Background Image */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/articles-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65',
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />

        <div className="space-y-6 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            Articles & Research
          </h1>
          <p className="text-xl text-foreground/90">
            Curated articles and research about AI in education
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar with Tag Categories */}
        <aside className="md:w-64 flex-shrink-0 space-y-6">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold text-primary-500 mb-4">Filter by Tags</h2>
            <div className="space-y-4">
              {Object.entries(tagCategories).map(([category, tags]) => (
                <Card key={category} className="border border-divider">
                  <CardHeader
                    className="cursor-pointer hover:bg-content2 py-2"
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 className="text-md font-semibold flex items-center justify-between w-full">
                      {category}
                      <span
                        className={`transform transition-transform ${
                          expandedCategories.has(category) ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </h3>
                  </CardHeader>
                  {expandedCategories.has(category) && (
                    <CardBody className="py-2 px-3">
                      <div className="flex flex-col gap-1">
                        {tags.map(tag => (
                          <Chip
                            key={tag}
                            variant={selectedTags.has(tag) ? 'solid' : 'flat'}
                            className="cursor-pointer hover:scale-105 transition-transform"
                            size="sm"
                            onClick={() => toggleTag(tag, category)}
                          >
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <Link key={article.slug} href={`/articles/${article.slug}`}>
              <Card className="hover:scale-[1.02] transition-transform">
                <CardHeader className="flex flex-col items-start gap-2">
                  <h2 className="text-xl font-bold">{article.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {article.tags?.map(tag => (
                      <Chip key={tag} variant="flat" size="sm">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                    {article.date && <time>{new Date(article.date).toLocaleDateString()}</time>}
                    {article.author && <span>By {article.author}</span>}
                    {article.source_url && (
                      <Link
                        href={article.source_url}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Source
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 dark:text-gray-400">{article.description}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
