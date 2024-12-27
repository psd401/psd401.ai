'use client';

import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import type { Article } from '@/lib/articles';

interface ArticlesClientProps {
  articles: Article[];
  allTags: string[];
}

export default function ArticlesClient({ articles, allTags }: ArticlesClientProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const filterByTags = (article: Article) => {
    if (selectedTags.size === 0) return true;
    
    const articleTags = new Set([
      ...(article.tags || []),
      article.author ? `Author: ${article.author}` : null
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => articleTags.has(tag));
  };

  const filteredArticles = articles.filter(filterByTags);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-24 min-h-[400px] flex items-center -mx-6">
        {/* Background Image */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/articles-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65'
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

      {/* Tags Browser */}
      <section className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Chip
              key={tag}
              variant={selectedTags.has(tag) ? "solid" : "flat"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Link key={article.slug} href={`/articles/${article.slug}`}>
            <Card className="hover:scale-[1.02] transition-transform">
              <CardHeader className="flex flex-col items-start gap-2">
                <h2 className="text-xl font-bold">{article.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {article.tags?.map((tag) => (
                    <Chip key={tag} variant="flat" size="sm">
                      {tag}
                    </Chip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                  {article.date && (
                    <time>
                      {new Date(article.date).toLocaleDateString()}
                    </time>
                  )}
                  {article.author && (
                    <span>
                      By {article.author}
                    </span>
                  )}
                  {article.source_url && (
                    <Link 
                      href={article.source_url} 
                      target="_blank" 
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Source →
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  {article.description}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
} 