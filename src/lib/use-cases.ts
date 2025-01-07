import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface UseCase {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  subject?: string;
  grade_level?: string;
  tools_used?: string[];
  author?: string;
  school?: string;
  tags?: string[];
}

const useCasesDirectory = path.join(process.cwd(), 'src/content/use-cases');

export async function getAllUseCases(): Promise<UseCase[]> {
  const fileNames = fs.readdirSync(useCasesDirectory);
  const allUseCases = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(useCasesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        content,
        title: data.title,
        description: data.description,
        category: data.category,
        subject: data.subject,
        grade_level: data.grade_level,
        tools_used: data.tools_used,
        author: data.author,
        school: data.school,
        tags: data.tags,
      };
    });

  return allUseCases;
}

export async function getUseCasesByCategory(): Promise<{ [key: string]: UseCase[] }> {
  const useCases = await getAllUseCases();
  const useCasesByCategory: { [key: string]: UseCase[] } = {};

  useCases.forEach(useCase => {
    if (!useCasesByCategory[useCase.category]) {
      useCasesByCategory[useCase.category] = [];
    }
    useCasesByCategory[useCase.category].push(useCase);
  });

  return useCasesByCategory;
}

export async function getAllTags(): Promise<string[]> {
  const useCases = await getAllUseCases();
  const tags = new Set<string>();

  useCases.forEach(useCase => {
    useCase.tags?.forEach(tag => tags.add(tag));
    if (useCase.author) tags.add(`Author: ${useCase.author}`);
    if (useCase.school) tags.add(`School: ${useCase.school}`);
    if (useCase.grade_level) tags.add(`Grade: ${useCase.grade_level}`);
    if (useCase.subject) tags.add(useCase.subject);
    useCase.tools_used?.forEach(tool => tags.add(`Tool: ${tool}`));
  });

  return Array.from(tags).sort();
}

export async function getUseCaseBySlug(category: string, slug: string): Promise<UseCase | null> {
  const useCases = await getAllUseCases();
  return useCases.find(useCase => useCase.category === category && useCase.slug === slug) || null;
}
