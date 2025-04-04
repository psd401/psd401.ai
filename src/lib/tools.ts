import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const toolsDirectory = path.join(process.cwd(), 'src/content/tools');

export interface Tool {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  provider: string;
  status: string;
  access_type: string;
  tags: string[];
  url?: string;
  thumbnail?: string;
}

export async function getAllTools(): Promise<Tool[]> {
  const fileNames = fs.readdirSync(toolsDirectory);
  const allTools = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(toolsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        category: data.category,
        provider: data.provider,
        status: data.status,
        access_type: data.access_type,
        tags: data.tags || [],
        url: data.url,
        thumbnail: data.thumbnail,
      };
    });

  return allTools.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  try {
    const fullPath = path.join(toolsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the tool metadata section
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
      url: data.url,
      thumbnail: data.thumbnail,
      date: data.date,
      category: data.category,
      provider: data.provider,
      status: data.status,
      access_type: data.access_type,
    };
  } catch (error) {
    console.error(`Error reading tool ${slug}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const tools = await getAllTools();
  const tags = new Set<string>();

  tools.forEach(tool => {
    // Add regular tags
    tool.tags?.forEach(tag => tags.add(tag));

    // Add tool type
    if (tool.access_type) {
      tags.add(`Type: ${tool.access_type}`);
    }

    // Add status
    if (tool.status) {
      tags.add(`Status: ${tool.status}`);
    }
  });

  return Array.from(tags).sort();
}
