import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const presentationsDirectory = path.join(process.cwd(), 'src/content/presentations');

export interface Presentation {
  slug: string;
  title: string;
  description: string;
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
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
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
    presentation.tags?.forEach(tag => tags.add(tag));
    presentation.presenters?.forEach(presenter => tags.add(`Presenter: ${presenter}`));
    if (presentation.type) tags.add(`Type: ${presentation.type}`);
    if (presentation.audience) tags.add(`Audience: ${presentation.audience}`);
  });

  return Array.from(tags).sort();
}

export async function getPresentationBySlug(slug: string): Promise<Presentation | null> {
  const presentations = await getAllPresentations();
  return presentations.find(presentation => presentation.slug === slug) || null;
}
