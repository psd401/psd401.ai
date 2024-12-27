'use client';

import { Card, CardBody, CardHeader, Image, Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import type { Presentation } from '@/lib/presentations';

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
      ...(presentation.tags || []),
      presentation.presenter ? `Presenter: ${presentation.presenter}` : null,
      presentation.type ? `Type: ${presentation.type}` : null
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => presentationTags.has(tag));
  };

  const filteredPresentations = presentations.filter(filterByTags);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-24 min-h-[400px] flex items-center -mx-6">
        {/* Background Image */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/presentations-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65'
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="space-y-6 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            Presentations & Resources
          </h1>
          <p className="text-xl text-foreground/90">
            Conference materials, training resources, and educational presentations
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
        {filteredPresentations.map((presentation) => (
          <Link key={presentation.slug} href={`/presentations/${presentation.slug}`}>
            <Card className="hover:scale-[1.02] transition-transform">
              {presentation.thumbnail && (
                <Image
                  alt={presentation.title}
                  src={presentation.thumbnail}
                  className="object-cover h-48 w-full"
                />
              )}
              <CardHeader className="flex flex-col items-start gap-2">
                <h2 className="text-xl font-bold">{presentation.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {presentation.type && (
                    <Chip color="primary" variant="flat" size="sm">
                      {presentation.type}
                    </Chip>
                  )}
                  {presentation.tags?.map((tag) => (
                    <Chip key={tag} variant="flat" size="sm">
                      {tag}
                    </Chip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                  {presentation.date && (
                    <time>
                      {new Date(presentation.date).toLocaleDateString()}
                    </time>
                  )}
                  {presentation.presenter && (
                    <span>
                      By {presentation.presenter}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  {presentation.description}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
} 