import React from 'react';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { notFound } from 'next/navigation';
import { Breadcrumb, Chip, ImageFrame, SectionRule } from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import Related from '@/components/Related';
import { getConcept, getConcepts } from '@/lib/content';
import { formatDate, readingTime } from '@/lib/format';
import JsonLd, { createBlogPostingSchema, createBreadcrumbSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getConcepts('writing');
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getConcept('writing', slug);
  if (!post) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: post.resource },
    authors: [{ name: post.author }],
    keywords: post.tags,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: post.resource,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [post.image ? { url: post.image } : DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      ...(post.image ? { images: [post.image] } : {}),
    },
  };
}

export default async function WritingPost({ params }: Props) {
  const { slug } = await params;
  const post = await getConcept('writing', slug);
  if (!post) notFound();

  return (
    <article data-section="writing">
      <JsonLd
        data={[
          createBlogPostingSchema({
            title: post.title,
            description: post.description,
            url: post.resource,
            date: post.date,
            image: post.image,
            author: post.author,
            tags: post.tags,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Writing', url: '/writing' },
            { name: post.title, url: post.resource },
          ]),
        ]}
      />

      <div
        style={{
          borderTop: 'var(--border-rule) solid var(--sec)',
          background: 'var(--sec-ground)',
          padding: '14px var(--gutter-page)',
          borderBottom: '1px solid var(--hairline-faint)',
        }}
      >
        <Breadcrumb items={[{ label: '01 Writing', href: '/writing' }, { label: post.title }]} />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <div className="ds-prose-measure">
          <div className="ds-label ds-label--sec" style={{ marginBottom: 18 }}>
            {[post.tags?.[0], formatDate(post.date)].filter(Boolean).join(' · ')}
          </div>
          <h1 className="ds-display ds-display--page" style={{ marginBottom: 20 }}>
            {post.title}
          </h1>
          <p className="ds-lead" style={{ marginBottom: 22 }}>
            {post.description}
          </p>
          {/* Muting sits on the text, not the row, so the link keeps full
              contrast (it measured 2.8:1 when the whole row was muted). */}
          <div
            className="ds-label ds-label--sm"
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
          >
            <span className="ds-label--muted">{post.author}</span>
            <span className="ds-label--muted" aria-hidden="true">
              ·
            </span>
            <span className="ds-label--muted">{readingTime(post.content)}</span>
            <span className="ds-label--muted" aria-hidden="true">
              ·
            </span>
            <a href={`${post.resource}.md`} style={{ color: 'var(--sec)' }}>
              Read as markdown
            </a>
          </div>
        </div>
      </SectionRule>

      {post.image && (
        <div style={{ padding: '0 var(--gutter-page) 8px' }}>
          <div className="ds-prose-measure">
            <ImageFrame
              src={post.image}
              alt=""
              ratio="16/9"
              priority
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        </div>
      )}

      <div style={{ padding: '28px var(--gutter-page) 48px' }}>
        <MarkdownContent content={post.content} />

        {post.tags?.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 40,
              paddingTop: 24,
              borderTop: '1px solid var(--hairline-faint)',
              maxWidth: 'var(--measure-prose)',
            }}
          >
            {post.tags.map(tag => (
              <Chip key={tag} variant="outline" size="sm">
                {tag}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <Related url={post.resource} />
    </article>
  );
}
