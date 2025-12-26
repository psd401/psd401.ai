import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cache } from 'react';

const articlesDirectory = path.join(process.cwd(), 'src/content/articles');

export interface Article {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  type?: string;
  tags: string[];
  image?: string;
  source?: string;
  source_url?: string;
  externalUrl?: string;
}

async function processMarkdown(content: string): Promise<string> {
  // Remove the first H1 header (title) since it's shown at the top of the page
  const contentWithoutTitle = content.replace(/^# .+$/m, '');

  // Add two newlines after each header for spacing
  const spacedContent = contentWithoutTitle.replace(/^(#{1,6} .+)$/gm, '$1\n\n');

  const result = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown
    .use(remarkBreaks) // Convert soft line breaks to <br>
    .use(html, { sanitize: false })
    .process(spacedContent);

  return (
    result
      .toString()
      // Add margin classes to headers
      .replace(/<h1>/g, '<h1 class="text-2xl font-bold mt-8 mb-6">')
      .replace(/<h2>/g, '<h2 class="text-xl font-bold mt-8 mb-4">')
      .replace(/<h3>/g, '<h3 class="text-lg font-bold mt-6 mb-4">')
      .replace(/<h4>/g, '<h4 class="text-base font-bold mt-6 mb-4">')
      .replace(/<h5>/g, '<h5 class="text-sm font-bold mt-6 mb-4">')
      .replace(/<h6>/g, '<h6 class="text-xs font-bold mt-6 mb-4">')
      // Add margin and line height to paragraphs
      .replace(/<p>/g, '<p class="mb-6 leading-relaxed">')
  );
}

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const contentHtml = await processMarkdown(content);

    return {
      slug,
      content: contentHtml,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      type: data.type,
      tags: data.tags || [],
      image: data.image,
      source: data.source,
      source_url: data.source_url,
      externalUrl: data.externalUrl,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
});

export async function getAllArticles(): Promise<Article[]> {
  const fileNames = await fs.readdir(articlesDirectory);
  const allArticles = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(articlesDirectory, fileName);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const contentHtml = await processMarkdown(content);

        return {
          slug,
          content: contentHtml,
          title: data.title,
          description: data.description,
          date: data.date,
          author: data.author,
          type: data.type,
          tags: data.tags || [],
          image: data.image,
          source: data.source,
          source_url: data.source_url,
          externalUrl: data.externalUrl,
        };
      })
  );

  return allArticles.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  const tags = new Set<string>();

  articles.forEach(article => {
    // Add regular tags
    article.tags?.forEach(tag => tags.add(tag));

    // Add article type
    if (article.type) {
      tags.add(`Type: ${article.type}`);
    }

    // Add authors (handling comma-separated lists)
    if (article.author) {
      article.author.split(/\s*,\s*/).forEach(author => {
        tags.add(`Author: ${author.trim()}`);
      });
    }
  });

  return Array.from(tags).sort();
}
