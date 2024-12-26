import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const toolsDirectory = path.join(process.cwd(), 'src/content/tools');

export interface Tool {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
  url?: string;
  pricing?: string;
  platform?: string;
  type: string;
  status: string;
}

export async function getAllTools(): Promise<Tool[]> {
  // Get file names under /content/tools
  const fileNames = fs.readdirSync(toolsDirectory);
  const allTools = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(toolsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the tool metadata section
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        content,
        url: data.url,
        pricing: data.pricing,
        platform: data.platform,
        type: data.type,
        status: data.status,
      };
    });

  return allTools;
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
      pricing: data.pricing,
      platform: data.platform,
      type: data.type,
      status: data.status,
    };
  } catch (error) {
    console.error(`Error reading tool ${slug}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const tools = await getAllTools();
  const tagSet = new Set<string>();
  
  tools.forEach(tool => {
    tool.tags?.forEach(tag => tagSet.add(tag));
    if (tool.type) tagSet.add(tool.type);
    if (tool.status) tagSet.add(tool.status);
  });

  return Array.from(tagSet).sort();
} 