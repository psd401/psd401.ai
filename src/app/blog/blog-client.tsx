'use client';

import { Card, CardBody, Button } from '@nextui-org/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { BlogPost } from '@/lib/blog';

interface BlogClientProps {
  posts: BlogPost[];
  allTags: string[];
}

export default function BlogClient({ posts, allTags }: BlogClientProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredPosts = posts.filter(post => 
    selectedTags.length === 0 || 
    post.tags?.some(tag => selectedTags.includes(tag))
  );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
          Blog & Updates
        </h1>
        <p className="text-foreground/80 text-xl max-w-3xl">
          Stay updated with the latest insights, stories, and developments in AI education from Peninsula School District.
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <Button
            key={tag}
            size="sm"
            radius="full"
            variant={selectedTags.includes(tag) ? "solid" : "flat"}
            onPress={() => toggleTag(tag)}
            className="text-xs"
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="hover:scale-[1.02] transition-transform bg-content1 hover:bg-content2">
              <CardBody className="space-y-4">
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={600}
                    height={300}
                    className="object-cover w-full h-48 rounded-lg"
                  />
                )}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {post.tags?.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-primary-500/10 text-primary-500 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{post.title}</h2>
                  <p className="text-foreground/80 line-clamp-2">{post.description}</p>
                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    {post.author && <span>By {post.author}</span>}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 