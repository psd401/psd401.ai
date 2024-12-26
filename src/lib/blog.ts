import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author?: string;
  tags?: string[];
  image?: string;
  description: string;
  content: string;
}

export type Post = {
  title: string;
  description: string;
  slug: string;
  tags: string[];
};

export async function getAllPosts(): Promise<BlogPost[]> {
  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const { data, content } = matter(fileContents);

      // Ensure date is in correct format
      const date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();

      return {
        slug,
        title: data.title,
        description: data.description,
        date,
        author: data.author,
        tags: data.tags || [],
        image: data.image,
        content,
      };
    });

  // Sort posts by date in descending order
  return allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    // Validate required fields
    if (!data.title || !data.date || !data.description) {
      console.warn(`Missing required fields in ${slug}.md`);
      return null;
    }

    // Ensure date is in correct format
    const date = new Date(data.date).toISOString();

    // Combine the data with the slug and content
    return {
      slug,
      content,
      title: data.title,
      date,
      author: data.author,
      tags: data.tags,
      image: data.image,
      description: data.description,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tagSet = new Set<string>();
  
  posts.forEach(post => {
    post.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
} 