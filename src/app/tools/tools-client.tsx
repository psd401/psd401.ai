'use client';

import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import type { Tool } from '@/lib/tools';

interface ToolsClientProps {
  tools: Tool[];
  allTags: string[];
}

export default function ToolsClient({ tools, allTags }: ToolsClientProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const filterByTags = (tool: Tool) => {
    if (selectedTags.size === 0) return true;
    
    const toolTags = new Set([
      ...(tool.tags || []),
      tool.type,
      tool.status,
      tool.platform,
      tool.pricing
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => toolTags.has(tag));
  };

  const filteredTools = tools.filter(filterByTags);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative text-center py-24 min-h-[400px] flex items-center -mx-6">
        {/* Background Image */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/tools-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65'
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="space-y-6 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            AI Tools & Applications
          </h1>
          <p className="text-xl text-foreground/90">
            Curated collection of AI tools and applications for education
          </p>
        </div>
      </section>

      {/* Tags Browser */}
      <section className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Chip
              key={tag}
              variant={selectedTags.has(tag) ? "solid" : "flat"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`}>
            <Card className="hover:scale-[1.02] transition-transform">
              <CardHeader className="flex flex-col items-start gap-2">
                <h2 className="text-xl font-bold">{tool.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Chip color="primary" variant="flat" size="sm">
                    {tool.type}
                  </Chip>
                  <Chip color={tool.status === 'Approved' ? 'success' : 'warning'} variant="flat" size="sm">
                    {tool.status}
                  </Chip>
                  {tool.platform && (
                    <Chip variant="flat" size="sm">
                      {tool.platform}
                    </Chip>
                  )}
                  {tool.pricing && (
                    <Chip variant="flat" size="sm">
                      {tool.pricing}
                    </Chip>
                  )}
                </div>
                {tool.tags?.map((tag) => (
                  <Chip key={tag} variant="flat" size="sm">
                    {tag}
                  </Chip>
                ))}
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
} 