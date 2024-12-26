import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'src/content/articles');

export interface Article {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
  date?: string;
  author?: string;
  source_url?: string;
}

export async function getAllArticles(): Promise<Article[]> {
  // Get file names under /content/articles
  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticles = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the article metadata section
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        content,
        date: data.date,
        author: data.author,
        source_url: data.source_url,
      };
    });

  // Sort articles by date in descending order if date is available
  return allArticles.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the article metadata section
    const { data, content } = matter(fileContents);

    // Validate required fields
    if (!data.title || !data.description) {
      console.warn(`Missing required fields in ${slug}.md`);
      return null;
    }

    // Combine the data with the slug and content
    return {
      slug,
      content,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      date: data.date,
      author: data.author,
      source_url: data.source_url,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  const tagSet = new Set<string>();
  
  articles.forEach(article => {
    article.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
} 