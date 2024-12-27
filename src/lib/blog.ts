import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        content,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        tags: data.tags || [],
        image: data.image,
      };
    });

  return allPosts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tags = new Set<string>();

  posts.forEach(post => {
    post.tags?.forEach(tag => tags.add(tag));
    if (post.author) tags.add(`Author: ${post.author}`);
  });

  return Array.from(tags).sort();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find(post => post.slug === slug) || null;
} 