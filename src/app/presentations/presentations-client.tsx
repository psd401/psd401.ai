'use client';

import { Card, CardBody, CardHeader, Image, Chip } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import type { Presentation } from '@/lib/presentations';

interface PresentationsClientProps {
  presentations: Presentation[];
  allTags: string[];
}

export default function PresentationsClient({ presentations, allTags }: PresentationsClientProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Organize tags into categories
  const tagCategories = {
    'Presentation Types': allTags.filter(tag => tag.startsWith('Type:')),
    'Target Audiences': allTags.filter(tag => tag.startsWith('Audience:')),
    Presenters: allTags.filter(tag => tag.startsWith('Presenter:')),
  };

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const filterByTags = (presentation: Presentation) => {
    if (selectedTags.size === 0) return true;

    const presentationTags = new Set(
      [
        ...(presentation.tags || []),
        ...(presentation.presenters?.map(presenter => `Presenter: ${presenter}`) || []),
        presentation.type ? `Type: ${presentation.type}` : null,
        presentation.audience ? `Audience: ${presentation.audience}` : null,
      ].filter(Boolean)
    );

    return Array.from(selectedTags).some(tag => presentationTags.has(tag));
  };

  const filteredPresentations = presentations.filter(filterByTags);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative text-center py-16 min-h-[320px] flex items-center -mx-6">
        {/* Background Image */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/presentations-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65',
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

      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar with Tag Categories */}
        <aside className="md:w-64 flex-shrink-0 space-y-6">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold text-primary-500 mb-4">Filter by Tags</h2>
            <div className="space-y-4">
              {Object.entries(tagCategories).map(([category, tags]) => (
                <Card key={category} className="border border-divider">
                  <CardHeader
                    className="cursor-pointer hover:bg-content2 py-2"
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 className="text-md font-semibold flex items-center justify-between w-full">
                      {category}
                      <span
                        className={`transform transition-transform ${
                          expandedCategories.has(category) ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </h3>
                  </CardHeader>
                  {expandedCategories.has(category) && (
                    <CardBody className="py-2 px-3">
                      <div className="flex flex-col gap-1">
                        {tags.map(tag => (
                          <Chip
                            key={tag}
                            variant={selectedTags.has(tag) ? 'solid' : 'flat'}
                            className="cursor-pointer hover:scale-105 transition-transform"
                            size="sm"
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPresentations.map(presentation => (
            <Link key={presentation.slug} href={`/presentations/${presentation.slug}`}>
              <Card className="hover:scale-[1.02] transition-transform">
                {presentation.thumbnail && (
                  <div className="relative aspect-video">
                    <Image
                      alt={presentation.title}
                      src={presentation.thumbnail}
                      className="object-cover"
                      classNames={{
                        wrapper: 'w-full h-full',
                        img: 'w-full h-full',
                      }}
                    />
                  </div>
                )}
                <CardHeader className="flex flex-col items-start gap-2">
                  <h2 className="text-xl font-bold">{presentation.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {presentation.type && (
                      <Chip color="primary" variant="flat" size="sm">
                        {presentation.type}
                      </Chip>
                    )}
                    {presentation.audience && (
                      <Chip color="secondary" variant="flat" size="sm">
                        {presentation.audience}
                      </Chip>
                    )}
                    {presentation.tags?.map(tag => (
                      <Chip key={tag} variant="flat" size="sm">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                    {presentation.date && (
                      <time>{new Date(presentation.date).toLocaleDateString()}</time>
                    )}
                    {presentation.presenters && presentation.presenters.length > 0 && (
                      <span>By {presentation.presenters.join(', ')}</span>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 dark:text-gray-400">{presentation.description}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
