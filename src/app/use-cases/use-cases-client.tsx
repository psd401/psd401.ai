'use client';

import { Card, CardBody, CardHeader, Chip, Divider } from '@heroui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { UseCase } from '@/lib/use-cases';

interface CategoryData {
  name: string;
  slug: string;
  description: string;
}

interface UseCasesClientProps {
  useCasesByCategory: { [key: string]: UseCase[] };
  allTags: string[];
  categories: { [key: string]: CategoryData };
}

export default function UseCasesClient({
  useCasesByCategory,
  allTags,
  categories,
}: UseCasesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('classroom-use');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Organize tags into categories
  const tagCategories = {
    'Grade Levels': allTags.filter(tag => tag.startsWith('Grade:')),
    Subjects: allTags.filter(tag => !tag.includes(':') && !tag.startsWith('Grade')),
    Tools: allTags.filter(tag => tag.startsWith('Tool:')),
    Authors: allTags.filter(tag => tag.startsWith('Author:')),
    Schools: allTags.filter(tag => tag.startsWith('School:')),
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && Object.values(categories).some(cat => cat.slug === hash)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategory(hash);
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [categories]);

  const handleTabChange = (slug: string) => {
    setSelectedCategory(slug);
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
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

  const filterByTags = (useCase: UseCase) => {
    if (selectedTags.size === 0) return true;

    const useCaseTags = new Set(
      [
        ...(useCase.tags || []),
        useCase.author ? `Author: ${useCase.author}` : null,
        useCase.school ? `School: ${useCase.school}` : null,
        useCase.grade_level ? `Grade: ${useCase.grade_level}` : null,
        useCase.subject,
        ...(useCase.tools_used || []).map(tool => `Tool: ${tool}`),
      ].filter(Boolean)
    );

    return Array.from(selectedTags).some(tag => useCaseTags.has(tag));
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative text-center py-16 min-h-[280px] flex items-center -mx-6">
        {/* Background Image */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/use-cases-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65',
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />

        <div className="space-y-4 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            Use Cases & Examples
          </h1>
          <p className="text-xl text-foreground/90">
            Real-world examples and implementation guides for AI in the classroom
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <div className="sticky top-24 space-y-8">
              {/* Categories Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-primary-500 mb-4">Categories</h2>
                <Card className="border border-divider">
                  <CardHeader
                    className="cursor-pointer hover:bg-content2 py-2"
                    onClick={() => toggleCategory('categories')}
                  >
                    <h3 className="text-md font-semibold flex items-center justify-between w-full">
                      Select Category
                      <span
                        className={`transform transition-transform ${
                          expandedCategories.has('categories') ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </h3>
                  </CardHeader>
                  {expandedCategories.has('categories') && (
                    <CardBody className="py-2 px-3">
                      <div className="flex flex-col gap-1">
                        {Object.values(categories).map(category => (
                          <Chip
                            key={category.slug}
                            variant={selectedCategory === category.slug ? 'solid' : 'flat'}
                            className="cursor-pointer hover:scale-105 transition-transform"
                            size="sm"
                            onClick={() => handleTabChange(category.slug)}
                          >
                            {category.name}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  )}
                </Card>
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
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
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-12 lg:min-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            {Object.entries(categories).map(([categoryKey, categoryData]) => {
              const cases = (useCasesByCategory[categoryKey] || []).filter(filterByTags);
              if (cases.length === 0) return null;

              return (
                <section
                  key={categoryKey}
                  id={categoryData.slug}
                  className="space-y-6 scroll-mt-24 relative"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{categoryData.name}</h2>
                    <p className="text-foreground/80">{categoryData.description}</p>
                  </div>
                  <Divider className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-[1px]">
                    {cases.map(useCase => (
                      <Link
                        key={useCase.slug}
                        href={`/use-cases/${categoryData.slug}/${useCase.slug}`}
                        className="block"
                      >
                        <Card className="hover:scale-[1.02] transition-transform w-full h-full">
                          <CardHeader className="flex flex-col items-start gap-2">
                            <h3 className="text-xl font-bold">{useCase.title}</h3>
                            <div className="flex flex-wrap gap-2">
                              {useCase.subject && (
                                <Chip color="primary" variant="flat" size="sm">
                                  {useCase.subject}
                                </Chip>
                              )}
                              {useCase.grade_level && (
                                <Chip color="secondary" variant="flat" size="sm">
                                  Grade {useCase.grade_level}
                                </Chip>
                              )}
                              {useCase.tools_used?.map(tool => (
                                <Chip key={tool} variant="flat" size="sm">
                                  {tool}
                                </Chip>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-x-4 text-sm text-foreground/60">
                              {useCase.author && <span>By {useCase.author}</span>}
                              {useCase.school && <span>at {useCase.school}</span>}
                            </div>
                            <p className="text-foreground/80 mt-2">{useCase.description}</p>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
