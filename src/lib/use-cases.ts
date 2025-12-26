import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const useCasesDirectory = path.join(process.cwd(), 'src/content/use-cases');

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
  date?: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  count: number;
}

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
        title: data.title,
        description: data.description,
        content,
        category: data.category,
        subject: data.subject,
        grade_level: data.grade_level,
        tools_used: data.tools_used || [],
        author: data.author,
        school: data.school,
        tags: data.tags || [],
        date: data.date || new Date().toISOString().split('T')[0],
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

export const getUseCaseBySlug = cache(
  async (category: string, slug: string): Promise<UseCase | null> => {
    try {
      const fullPath = path.join(useCasesDirectory, `${slug}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      // Validate that the category matches
      if (data.category !== category) {
        return null;
      }

      return {
        slug,
        title: data.title,
        description: data.description,
        content,
        category: data.category,
        subject: data.subject,
        grade_level: data.grade_level,
        tools_used: data.tools_used || [],
        author: data.author,
        school: data.school,
        tags: data.tags || [],
        date: data.date || new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      return null;
    }
  }
);

export async function getAllCategories(): Promise<{ [key: string]: Category }> {
  const useCases = await getAllUseCases();
  const categories: { [key: string]: Category } = {};

  // Group use cases by category and build category metadata
  useCases.forEach(useCase => {
    const categorySlug = useCase.category;

    if (!categories[categorySlug]) {
      // Convert slug to display name (e.g., 'classroom-use' -> 'Classroom Use')
      const displayName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      categories[categorySlug] = {
        name: displayName,
        slug: categorySlug,
        description: '', // Description can be added in the future if needed
        count: 0,
      };
    }
    categories[categorySlug].count++;
  });

  return categories;
}
