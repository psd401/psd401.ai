'use client';

import { Card, CardBody, CardHeader, Chip, Divider, Tabs, Tab } from '@nextui-org/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UseCase, CategoryData } from './page-data';

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
    
    const caseTags = new Set([
      ...(useCase.frontmatter.tags || []),
      useCase.frontmatter.subject,
      useCase.frontmatter.gradeLevel ? `Grade ${useCase.frontmatter.gradeLevel}` : null
    ].filter(Boolean));

    return Array.from(selectedTags).some(tag => caseTags.has(tag));
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-background pb-4">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Use Cases Catalog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover practical applications of AI in education across different areas
          </p>
        </section>
      </div>

      {/* Category Navigation - Fixed position instead of sticky */}
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
      <div className="max-w-7xl mx-auto px-4 space-y-12 pt-8">
        {/* Tags Browser */}
        <section className="max-w-4xl mx-auto">
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
                <p className="text-gray-600">{categoryData.description}</p>
              </div>
              <Divider className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((useCase) => (
                  <Link 
                    key={useCase.slug} 
                    href={`/use-cases/${categoryData.slug}/${useCase.slug}`}
                  >
                    <Card className="hover:scale-[1.02] transition-transform h-full">
                      <CardHeader className="flex flex-col items-start gap-2">
                        <h3 className="text-xl font-bold">{useCase.frontmatter.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {useCase.frontmatter.subject && (
                            <Chip color="primary" variant="flat" size="sm">
                              {useCase.frontmatter.subject}
                            </Chip>
                          )}
                          {useCase.frontmatter.gradeLevel && (
                            <Chip variant="flat" size="sm">
                              Grades {useCase.frontmatter.gradeLevel}
                            </Chip>
                          )}
                          {useCase.frontmatter.status && (
                            <Chip color="success" variant="flat" size="sm">
                              {useCase.frontmatter.status}
                            </Chip>
                          )}
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p className="text-gray-600">
                          {useCase.content.slice(0, 150)}...
                        </p>
                        {useCase.frontmatter.toolsUsed && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">Tools Used:</p>
                            <div className="flex flex-wrap gap-2">
                              {useCase.frontmatter.toolsUsed.map((tool) => (
                                <Chip key={tool} variant="flat" size="sm">
                                  {tool}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}
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