'use client';

import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import { Article } from './page';

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
      ...(article.frontmatter.tags || []),
      article.frontmatter.author ? `Author: ${article.frontmatter.author}` : null,
      article.frontmatter.source ? `Source: ${article.frontmatter.source}` : null
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => articleTags.has(tag));
  };

  const filteredArticles = articles.filter(filterByTags);

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Curated Articles</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Essential readings about AI in education
        </p>
      </section>

      {/* Tags Browser */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-4">Browse by Tags</h2>
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

      <section className="max-w-4xl mx-auto px-4 grid gap-6">
        {filteredArticles.map((article) => (
          <Link 
            key={article.slug} 
            href={article.frontmatter.sourceUrl || `/articles/${article.slug}`}
            target={article.frontmatter.sourceUrl ? "_blank" : undefined}
          >
            <Card className="hover:scale-[1.02] transition-transform">
              <CardHeader className="flex flex-col items-start gap-2">
                <div className="flex flex-wrap gap-2">
                  {article.frontmatter.tags?.map((tag) => (
                    <Chip key={tag} variant="flat" size="sm">
                      {tag}
                    </Chip>
                  ))}
                </div>
                <h2 className="text-2xl font-bold">{article.frontmatter.title}</h2>
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                  {article.frontmatter.author && (
                    <span>By {article.frontmatter.author}</span>
                  )}
                  {article.frontmatter.source && (
                    <span>From {article.frontmatter.source}</span>
                  )}
                  {article.frontmatter.date && (
                    <time>
                      {new Date(article.frontmatter.date).toLocaleDateString()}
                    </time>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600">
                  {article.content.slice(0, 200)}...
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
} 