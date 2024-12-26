import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const useCasesDirectory = path.join(process.cwd(), 'src/content/use-cases');

export interface UseCase {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
  author?: string;
  school?: string;
  grade_level?: string;
  subject?: string;
  tools_used?: string[];
}

export async function getAllUseCases(): Promise<UseCase[]> {
  // Get file names under /content/use-cases
  const fileNames = fs.readdirSync(useCasesDirectory);
  const allUseCases = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(useCasesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the use case metadata section
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        content,
        author: data.author,
        school: data.school,
        grade_level: data.grade_level,
        subject: data.subject,
        tools_used: data.tools_used,
      };
    });

  return allUseCases;
}

export async function getUseCaseBySlug(slug: string): Promise<UseCase | null> {
  try {
    const fullPath = path.join(useCasesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the use case metadata section
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
      author: data.author,
      school: data.school,
      grade_level: data.grade_level,
      subject: data.subject,
      tools_used: data.tools_used,
    };
  } catch (error) {
    console.error(`Error reading use case ${slug}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const useCases = await getAllUseCases();
  const tagSet = new Set<string>();
  
  useCases.forEach(useCase => {
    useCase.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
} 