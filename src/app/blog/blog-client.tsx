'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { BlogPost } from '@/lib/blog';

export default function BlogClient({ posts, allTags }: { posts: BlogPost[]; allTags: string[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredPosts =
    selectedTags.length > 0
      ? posts.filter(post => post.tags?.some(tag => selectedTags.includes(tag)))
      : posts;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative text-center py-16 min-h-[280px] flex items-center -mx-6">
        {/* Background Image */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/blog-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65',
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
            <Chip
              key={tag}
              variant={selectedTags.includes(tag) ? 'solid' : 'flat'}
              className="cursor-pointer hover:scale-105 transition-transform"
              size="sm"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="grid gap-6">
          {filteredPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="hover:scale-[1.02] transition-transform">
                <div className="grid md:grid-cols-4 gap-4">
                  {post.image && (
                    <div className="md:col-span-1">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={300}
                        height={200}
                        className="object-cover w-full h-full rounded-l"
                      />
                    </div>
                  )}
                  <div className={`${post.image ? 'md:col-span-3' : 'md:col-span-4'}`}>
                    <CardHeader className="flex flex-col items-start gap-1">
                      <h2 className="text-2xl font-bold">{post.title}</h2>
                      {post.date && (
                        <time className="text-sm text-foreground/60">
                          {new Date(post.date).toLocaleDateString()}
                        </time>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map(tag => (
                            <Chip key={tag} variant="flat" size="sm">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardBody>
                      <p className="text-foreground/80">{post.description}</p>
                    </CardBody>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* RSS Feed Link */}
        <div className="flex justify-center pt-8">
          <Link
            href="/feed.xml"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-600"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
            </svg>
            Subscribe to RSS Feed
          </Link>
        </div>
      </section>
    </div>
  );
}
