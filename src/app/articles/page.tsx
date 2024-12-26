import { getAllContent } from '@/lib/markdown';
import ArticlesClient from './articles-client';

export interface Article {
  slug: string;
  content: string;
  frontmatter: {
    title: string;
    date?: string;
    author?: string;
    tags?: string[];
    source?: string;
    sourceUrl?: string;
  };
}

function getAllTags(articles: Article[]): string[] {
  const tags = new Set<string>();
  articles.forEach(article => {
    article.frontmatter.tags?.forEach(tag => tags.add(tag));
    if (article.frontmatter.author) tags.add(`Author: ${article.frontmatter.author}`);
    if (article.frontmatter.source) tags.add(`Source: ${article.frontmatter.source}`);
  });
  return Array.from(tags).sort();
}

export default async function ArticlesPage() {
  const articles = getAllContent('articles');
  const allTags = getAllTags(articles);

  return (
    <ArticlesClient 
      articles={articles}
      allTags={allTags}
    />
  );
} 