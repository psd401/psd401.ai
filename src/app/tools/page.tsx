import { getAllTools, getAllTags } from '@/lib/tools';
import ToolsClient from './tools-client';

export default async function ToolsPage() {
  const [tools, allTags] = await Promise.all([
    getAllTools(),
    getAllTags()
  ]);

  return (
    <ToolsClient 
      tools={tools}
      allTags={allTags}
    />
  );
} 