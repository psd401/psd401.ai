'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import type { BlogPost } from '@/lib/blog';

export default function BlogClient({ posts, allTags }: { posts: BlogPost[], allTags: string[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredPosts = selectedTags.length > 0
    ? posts.filter(post => post.tags?.some(tag => selectedTags.includes(tag)))
    : posts;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-24 min-h-[400px] flex items-center -mx-6">
        {/* Background Image */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/blog-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65'
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="space-y-6 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            Blog Posts
          </h1>
          <p className="text-xl text-foreground/90">
            Stories and updates about AI implementation across our district
          </p>
        </div>
      </section>

      {/* Tag Filters */}
      <section className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto grid gap-6">
        {filteredPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="hover:scale-[1.02] transition-transform">
              <CardHeader className="flex flex-col items-start gap-1">
                <h2 className="text-2xl font-bold">{post.title}</h2>
                {post.date && (
                  <time className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="bg-primary-100 text-primary-800 text-sm px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  {post.description}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
} 