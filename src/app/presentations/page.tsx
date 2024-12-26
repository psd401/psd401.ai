import { getAllContent } from '@/lib/markdown';
import PresentationsClient from './presentations-client';

export interface Presentation {
  slug: string;
  content: string;
  frontmatter: {
    title: string;
    date?: string;
    presenter?: string;
    type?: string;
    description?: string;
    thumbnail?: string;
    tags?: string[];
  };
}

function getAllTags(presentations: Presentation[]): string[] {
  const tags = new Set<string>();
  presentations.forEach(presentation => {
    presentation.frontmatter.tags?.forEach(tag => tags.add(tag));
    if (presentation.frontmatter.presenter) tags.add(`Presenter: ${presentation.frontmatter.presenter}`);
    if (presentation.frontmatter.type) tags.add(`Type: ${presentation.frontmatter.type}`);
  });
  return Array.from(tags).sort();
}

export default async function PresentationsPage() {
  const presentations = getAllContent('presentations');
  const allTags = getAllTags(presentations);

  return (
    <PresentationsClient 
      presentations={presentations}
      allTags={allTags}
    />
  );
} 