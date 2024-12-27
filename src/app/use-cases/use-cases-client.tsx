'use client';

import { Card, CardBody, CardHeader, Chip, Divider, Tabs, Tab } from '@nextui-org/react';
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
  categories 
}: UseCasesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("classroom-use");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Handle hash change for direct links
    const hash = window.location.hash.slice(1);
    if (hash && Object.values(categories).some(cat => cat.slug === hash)) {
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

  const filterByTags = (useCase: UseCase) => {
    if (selectedTags.size === 0) return true;
    
    const useCaseTags = new Set([
      ...(useCase.tags || []),
      useCase.author ? `Author: ${useCase.author}` : null,
      useCase.school ? `School: ${useCase.school}` : null,
      useCase.grade_level ? `Grade: ${useCase.grade_level}` : null,
      useCase.subject,
      ...(useCase.tools_used || []).map(tool => `Tool: ${tool}`)
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => useCaseTags.has(tag));
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-24 min-h-[400px] flex items-center -mx-6">
        {/* Background Image */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/use-cases-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65'
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="space-y-6 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            Use Cases & Examples
          </h1>
          <p className="text-xl text-foreground/90">
            Real-world examples and implementation guides for AI in the classroom
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="sticky top-0 z-50">
        <div className="bg-background/80 backdrop-blur-lg shadow-sm">
          <nav className="py-4 max-w-7xl mx-auto px-4">
            <Tabs 
              aria-label="Categories" 
              className="max-w-4xl mx-auto"
              variant="underlined"
              selectedKey={selectedCategory}
              onSelectionChange={(key) => handleTabChange(key as string)}
            >
              {Object.values(categories).map((category) => (
                <Tab
                  key={category.slug}
                  title={category.name}
                />
              ))}
            </Tabs>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 space-y-12">
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

        {/* Categories and Use Cases */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((useCase) => (
                  <Link 
                    key={useCase.slug} 
                    href={`/use-cases/${categoryData.slug}/${useCase.slug}`}
                  >
                    <Card className="hover:scale-[1.02] transition-transform">
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
                          {useCase.tools_used?.map((tool) => (
                            <Chip key={tool} variant="flat" size="sm">
                              {tool}
                            </Chip>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                          {useCase.author && (
                            <span>
                              By {useCase.author}
                            </span>
                          )}
                          {useCase.school && (
                            <span>
                              at {useCase.school}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p className="text-gray-600 dark:text-gray-400">
                          {useCase.description}
                        </p>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
} 