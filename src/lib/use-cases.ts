import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface UseCase {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  department: string;
  impact: string;
  tags: string[];
  thumbnail?: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  count: number;
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
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        department: data.department,
        impact: data.impact,
        tags: data.tags || [],
        thumbnail: data.thumbnail,
      };
    });

  return allUseCases.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getUseCasesByCategory(): Promise<{ [key: string]: UseCase[] }> {
  const useCases = await getAllUseCases();
  const useCasesByCategory: { [key: string]: UseCase[] } = {};

  useCases.forEach(useCase => {
    if (!useCasesByCategory[useCase.department]) {
      useCasesByCategory[useCase.department] = [];
    }
    useCasesByCategory[useCase.department].push(useCase);
  });

  return useCasesByCategory;
}

export async function getAllTags(): Promise<string[]> {
  const useCases = await getAllUseCases();
  const tags = new Set<string>();

  useCases.forEach(useCase => {
    useCase.tags?.forEach(tag => tags.add(tag));
    if (useCase.author) tags.add(`Author: ${useCase.author}`);
    if (useCase.department) tags.add(`Department: ${useCase.department}`);
    if (useCase.impact) tags.add(`Impact: ${useCase.impact}`);
  });

  return Array.from(tags).sort();
}

export async function getUseCaseBySlug(department: string, slug: string): Promise<UseCase | null> {
  const useCases = await getAllUseCases();
  return useCases.find(useCase => useCase.slug === slug) || null;
}

export async function getAllCategories(): Promise<{ [key: string]: Category }> {
  const useCases = await getAllUseCases();
  const categories: { [key: string]: Category } = {};

  // Group use cases by category and build category metadata
  useCases.forEach(useCase => {
    const categorySlug = useCase.department;

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
