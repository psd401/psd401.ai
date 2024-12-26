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

export async function getAllPosts(): Promise<Post[]> {
  // For now, return some sample blog posts
  return [
    {
      title: "Student Success Stories with AI",
      description: "How our students are leveraging AI tools to enhance their learning experience",
      slug: "student-success-with-ai",
      tags: ["success stories", "students", "learning"]
    },
    {
      title: "AI Professional Development Program",
      description: "Overview of our comprehensive AI training program for educators",
      slug: "ai-professional-development",
      tags: ["professional development", "teachers", "training"]
    }
  ];
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