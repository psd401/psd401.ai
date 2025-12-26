import { Chip } from '@nextui-org/react';
import { getAllPolicies, getPolicyBySlug } from '@/lib/policies';
import MarkdownContent from '@/components/MarkdownContent';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const policies = await getAllPolicies();
  return policies.map(policy => ({
    slug: policy.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const policy = await getPolicyBySlug(params.slug);
  if (!policy) {
    return { title: 'Policy Not Found' };
  }

  return {
    title: policy.title,
    description: policy.description || `${policy.category} policy - ${policy.status}`,
    openGraph: {
      title: policy.title,
      description: policy.description || `${policy.category} policy - ${policy.status}`,
      type: 'article',
      modifiedTime: policy.date,
    },
  };
}

export default async function PolicyPage({ params }: Props) {
  const policy = await getPolicyBySlug(params.slug);

  if (!policy) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{policy.title}</h1>
        <div className="flex flex-wrap gap-4 items-center">
          {policy.date && (
            <time className="text-sm text-foreground/60">
              Last updated: {new Date(policy.date).toLocaleDateString()}
            </time>
          )}
          {policy.category && (
            <Chip color="primary" variant="flat" size="sm">
              {policy.category}
            </Chip>
          )}
          {policy.status && (
            <Chip color="success" variant="flat" size="sm">
              Status: {policy.status}
            </Chip>
          )}
        </div>
      </header>

      <MarkdownContent content={policy.content} />
    </article>
  );
}
