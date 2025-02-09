import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Presentation {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  presenters: string[];
  type: string;
  audience: string;
  tags: string[];
  slides_url?: string;
  video_url?: string;
  thumbnail?: string;
}

const presentationsDirectory = path.join(process.cwd(), 'src/content/presentations');

export async function getAllPresentations(): Promise<Presentation[]> {
  const fileNames = fs.readdirSync(presentationsDirectory);
  const allPresentations = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(presentationsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      const presenters = data.presenters || (data.presenter ? [data.presenter] : []);

      return {
        slug,
        content,
        title: data.title,
        description: data.description,
        date: data.date,
        presenters,
        type: data.type,
        audience: data.audience || 'All Staff',
        tags: data.tags || [],
        slides_url: data.slides_url,
        video_url: data.video_url,
        thumbnail: data.thumbnail,
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
