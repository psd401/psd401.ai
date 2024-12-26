import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const presentationsDirectory = path.join(process.cwd(), 'src/content/presentations');

export interface Presentation {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
  date?: string;
  slides_url?: string;
  video_url?: string;
}

export async function getAllPresentations(): Promise<Presentation[]> {
  // Get file names under /content/presentations
  const fileNames = fs.readdirSync(presentationsDirectory);
  const allPresentations = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(presentationsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the presentation metadata section
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        content,
        date: data.date,
        slides_url: data.slides_url,
        video_url: data.video_url,
      };
    });

  // Sort presentations by date in descending order if date is available
  return allPresentations.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getPresentationBySlug(slug: string): Promise<Presentation | null> {
  try {
    const fullPath = path.join(presentationsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the presentation metadata section
    const { data, content } = matter(fileContents);

    // Validate required fields
    if (!data.title || !data.description) {
      console.warn(`Missing required fields in ${slug}.md`);
      return null;
    }

    // Combine the data with the slug and content
    return {
      slug,
      content,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      date: data.date,
      slides_url: data.slides_url,
      video_url: data.video_url,
    };
  } catch (error) {
    console.error(`Error reading presentation ${slug}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const presentations = await getAllPresentations();
  const tagSet = new Set<string>();
  
  presentations.forEach(presentation => {
    presentation.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
} 