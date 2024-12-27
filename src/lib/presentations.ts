import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Presentation {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  presenter: string;
  type: string;
  tags: string[];
  slides_url?: string;
  video_url?: string;
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

      return {
        slug,
        content,
        title: data.title,
        description: data.description,
        date: data.date,
        presenter: data.presenter,
        type: data.type,
        tags: data.tags || [],
        slides_url: data.slides_url,
        video_url: data.video_url,
      };
    });

  return allPresentations.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getAllTags(): Promise<string[]> {
  const presentations = await getAllPresentations();
  const tags = new Set<string>();

  presentations.forEach(presentation => {
    presentation.tags?.forEach(tag => tags.add(tag));
    if (presentation.presenter) tags.add(`Presenter: ${presentation.presenter}`);
    if (presentation.type) tags.add(`Type: ${presentation.type}`);
  });

  return Array.from(tags).sort();
}

export async function getPresentationBySlug(slug: string): Promise<Presentation | null> {
  const presentations = await getAllPresentations();
  return presentations.find(presentation => presentation.slug === slug) || null;
}
