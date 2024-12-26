import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { getAllContent } from '@/lib/markdown';
import Link from 'next/link';

export default function PoliciesPage() {
  const policies = getAllContent('policies');

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Policies & Guidance</h1>
        <p className="text-xl text-gray-600">
          Official guidelines and policies for AI usage in our district
        </p>
      </section>

      <section className="grid gap-6">
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
                <p className="text-gray-600">
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