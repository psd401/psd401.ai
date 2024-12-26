'use client';

import { Card, CardBody, CardHeader, Image, Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import { Presentation } from './page';

interface PresentationsClientProps {
  presentations: Presentation[];
  allTags: string[];
}

export default function PresentationsClient({ presentations, allTags }: PresentationsClientProps) {
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

  const filterByTags = (presentation: Presentation) => {
    if (selectedTags.size === 0) return true;
    
    const presentationTags = new Set([
      ...(presentation.frontmatter.tags || []),
      presentation.frontmatter.presenter ? `Presenter: ${presentation.frontmatter.presenter}` : null,
      presentation.frontmatter.type ? `Type: ${presentation.frontmatter.type}` : null
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => presentationTags.has(tag));
  };

  const filteredPresentations = presentations.filter(filterByTags);

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Presentations & Resources</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Conference materials, training resources, and educational presentations
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

      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresentations.map((presentation) => (
          <Link key={presentation.slug} href={`/presentations/${presentation.slug}`}>
            <Card className="hover:scale-[1.02] transition-transform">
              {presentation.frontmatter.thumbnail && (
                <Image
                  alt={presentation.frontmatter.title}
                  src={presentation.frontmatter.thumbnail}
                  className="object-cover h-48 w-full"
                />
              )}
              <CardHeader className="flex flex-col items-start gap-2">
                <h2 className="text-xl font-bold">{presentation.frontmatter.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {presentation.frontmatter.type && (
                    <Chip color="primary" variant="flat" size="sm">
                      {presentation.frontmatter.type}
                    </Chip>
                  )}
                  {presentation.frontmatter.tags?.map((tag) => (
                    <Chip key={tag} variant="flat" size="sm">
                      {tag}
                    </Chip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                  {presentation.frontmatter.date && (
                    <time>
                      {new Date(presentation.frontmatter.date).toLocaleDateString()}
                    </time>
                  )}
                  {presentation.frontmatter.presenter && (
                    <span>
                      By {presentation.frontmatter.presenter}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600">
                  {presentation.frontmatter.description || presentation.content.slice(0, 150)}...
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
} 