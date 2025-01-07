import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content');

export interface MarkdownContent {
  slug: string;
  content: string;
  frontmatter: {
    title: string;
    date?: string;
    author?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export function getContentBySlug(section: string, slug: string): MarkdownContent {
  const fullPath = path.join(contentDirectory, section, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  if (!data.title) {
    throw new Error(`Missing required title in frontmatter for ${fullPath}`);
  }

  return {
    slug,
    content,
    frontmatter: data as MarkdownContent['frontmatter'],
  };
}

export function getAllContent(section: string): MarkdownContent[] {
  const fullPath = path.join(contentDirectory, section);
  const files = fs.readdirSync(fullPath);

  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.md$/, '');
      return getContentBySlug(section, slug);
    })
    .sort((a, b) => {
      if (a.frontmatter.date && b.frontmatter.date) {
        return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
      }
      return 0;
    });
}
