import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const presentationsDirectory = path.join(process.cwd(), 'src/content/presentations');

export interface Presentation {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  presenters: string[];
  audience: string;
  type: string;
  tags: string[];
  thumbnail?: string;
  slides?: string;
}

export async function getAllPresentations(): Promise<Presentation[]> {
  const fileNames = fs.readdirSync(presentationsDirectory);
  const allPresentations = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(presentationsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        content,
        date: data.date || new Date().toISOString().split('T')[0],
        presenters: data.presenters || [],
        audience: data.audience,
        type: data.type,
        tags: data.tags || [],
        thumbnail: data.thumbnail,
        slides: data.slides,
      };
    });

  return allPresentations.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getAllTags(): Promise<string[]> {
  const presentations = await getAllPresentations();
  const tags = new Set<string>();

  presentations.forEach(presentation => {
    // Add regular tags
    presentation.tags?.forEach(tag => tags.add(tag));

    // Add presenters as tags
    presentation.presenters?.forEach(presenter => tags.add(`Presenter: ${presenter}`));

    // Add type
    if (presentation.type) {
      tags.add(`Type: ${presentation.type}`);
    }

    // Add audience
    if (presentation.audience) {
      tags.add(`Audience: ${presentation.audience}`);
    }
  });

  return Array.from(tags).sort();
}

export const getPresentationBySlug = cache(async (slug: string): Promise<Presentation | null> => {
  try {
    const fullPath = path.join(presentationsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      description: data.description,
      content,
      date: data.date || new Date().toISOString().split('T')[0],
      presenters: data.presenters || [],
      audience: data.audience,
      type: data.type,
      tags: data.tags || [],
      thumbnail: data.thumbnail,
      slides: data.slides,
    };
  } catch (error) {
    return null;
  }
});
