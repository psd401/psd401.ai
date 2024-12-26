'use client';

import { Card, CardBody, CardHeader, Button, Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import { Tool } from './page';

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
      ...(tool.frontmatter.tags || []),
      tool.frontmatter.type,
      tool.frontmatter.status
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => toolTags.has(tag));
  };

  const filteredTools = tools.filter(filterByTags);

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Tools</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our collection of AI-powered tools for education
        </p>
      </section>

      {/* Tags Browser */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-4">Browse by Tags</h2>
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

      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.slug} className="hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-col items-start gap-1">
              <h2 className="text-2xl font-bold">{tool.frontmatter.title}</h2>
              <div className="flex flex-wrap gap-2">
                {tool.frontmatter.type && (
                  <Chip color="primary" variant="flat" size="sm">
                    {tool.frontmatter.type}
                  </Chip>
                )}
                {tool.frontmatter.status && (
                  <Chip color="success" variant="flat" size="sm">
                    {tool.frontmatter.status}
                  </Chip>
                )}
                {tool.frontmatter.tags?.map((tag) => (
                  <Chip key={tag} variant="flat" size="sm">
                    {tag}
                  </Chip>
                ))}
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-gray-600">
                {tool.frontmatter.description}
              </p>
              <div className="flex gap-4">
                <Link href={`/tools/${tool.slug}`}>
                  <Button color="primary" variant="flat">
                    Learn More
                  </Button>
                </Link>
                {tool.frontmatter.demoUrl && (
                  <Link href={tool.frontmatter.demoUrl} target="_blank">
                    <Button color="secondary" variant="flat">
                      Try Demo
                    </Button>
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </section>
    </div>
  );
} 