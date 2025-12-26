import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const toolsDirectory = path.join(process.cwd(), 'src/content/tools');

export interface Tool {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  provider: string;
  status: string;
  access_type: string;
  tags: string[];
  privacy?: string;
  url?: string;
  demoUrl?: string;
  thumbnail?: string;
}

export async function getAllTools(): Promise<Tool[]> {
  const fileNames = await fs.readdir(toolsDirectory);
  const allTools = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(toolsDirectory, fileName);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          slug,
          title: data.title,
          description: data.description,
          content,
          date: data.date || new Date().toISOString().split('T')[0],
          category: data.category,
          provider: data.provider,
          status: data.status,
          access_type: data.access_type,
          tags: data.tags || [],
          privacy: data.privacy,
          url: data.url,
          demoUrl: data.demoUrl,
          thumbnail: data.thumbnail,
        };
      })
  );

  return allTools;
}

export const getToolBySlug = cache(async (slug: string): Promise<Tool | null> => {
  try {
    const fullPath = path.join(toolsDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      description: data.description,
      content,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category,
      provider: data.provider,
      status: data.status,
      access_type: data.access_type,
      tags: data.tags || [],
      privacy: data.privacy,
      url: data.url,
      demoUrl: data.demoUrl,
      thumbnail: data.thumbnail,
    };
  } catch (error) {
    console.error(`Error reading tool ${slug}:`, {
      error: error instanceof Error ? error.message : error,
      path: path.join(toolsDirectory, `${slug}.md`),
    });
    return null;
  }
});

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

    // Add provider
    if (tool.provider) {
      tags.add(`Provider: ${tool.provider}`);
    }

    // Add privacy
    if ((tool as any).privacy) {
      tags.add(`Privacy: ${(tool as any).privacy}`);
    }
  });

  return Array.from(tags).sort();
}
