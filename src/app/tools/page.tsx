import { getAllContent } from '@/lib/markdown';
import ToolsClient from './tools-client';

export interface Tool {
  slug: string;
  content: string;
  frontmatter: {
    title: string;
    status: string;
    type: string;
    description: string;
    demoUrl?: string;
    tags?: string[];
  };
}

function getAllTags(tools: Tool[]): string[] {
  const tags = new Set<string>();
  tools.forEach(tool => {
    tool.frontmatter.tags?.forEach(tag => tags.add(tag));
    if (tool.frontmatter.type) tags.add(tool.frontmatter.type);
    if (tool.frontmatter.status) tags.add(tool.frontmatter.status);
  });
  return Array.from(tags).sort();
}

export default async function ToolsPage() {
  const tools = getAllContent('tools');
  const allTags = getAllTags(tools);

  return (
    <ToolsClient 
      tools={tools}
      allTags={allTags}
    />
  );
} 