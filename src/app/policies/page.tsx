import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { getAllContent } from '@/lib/markdown';
import Link from 'next/link';

export default function PoliciesPage() {
  const policies = getAllContent('policies');

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative text-center py-24 min-h-[400px] flex items-center -mx-6">
        {/* Background Image */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/sections/policies-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65'
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="space-y-6 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text">
            AI Policies & Guidance
          </h1>
          <p className="text-xl text-foreground/90">
            Official guidelines and policies for AI usage in our district
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto grid gap-6">
        {policies.map((policy) => (
          <Link key={policy.slug} href={`/policies/${policy.slug}`}>
            <Card className="hover:scale-[1.02] transition-transform">
              <CardHeader className="flex flex-col items-start gap-1">
                <h2 className="text-2xl font-bold">{policy.frontmatter.title}</h2>
                {policy.frontmatter.lastUpdated && (
                  <time className="text-sm text-gray-500">
                    Last updated: {new Date(policy.frontmatter.lastUpdated).toLocaleDateString()}
                  </time>
                )}
                {policy.frontmatter.category && (
                  <span className="bg-primary-100 text-primary-800 text-sm px-2 py-1 rounded">
                    {policy.frontmatter.category}
                  </span>
                )}
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  {policy.content.slice(0, 200)}...
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
} 