import fs from 'fs';
import path from 'path';
import { getAllContent } from '@/lib/markdown';

export interface UseCase {
  slug: string;
  content: string;
  frontmatter: {
    title: string;
    category: string;
    subject?: string;
    gradeLevel?: string;
    toolsUsed?: string[];
    status?: string;
    tags?: string[];
  };
}

export interface CategoryData {
  name: string;
  description: string;
  icon?: string;
  slug: string;
}

export const CATEGORIES: { [key: string]: CategoryData } = {
  'Classroom Use': {
    name: 'Classroom Use',
    description: 'AI applications for teaching and learning in the classroom',
    slug: 'classroom-use'
  },
  'Administrative Use': {
    name: 'Administrative Use',
    description: 'AI tools for school administration and management',
    slug: 'administrative-use'
  },
  'Professional Development': {
    name: 'Professional Development',
    description: 'AI-enhanced professional learning and growth',
    slug: 'professional-development'
  },
};

export async function getUseCasesByCategory() {
  const contentDir = path.join(process.cwd(), 'src/content/use-cases');
  const categories = fs.readdirSync(contentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const useCasesByCategory: { [key: string]: UseCase[] } = {};

  categories.forEach(categoryDir => {
    const categoryPath = path.join(contentDir, categoryDir);
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.md'));

    files.forEach(file => {
      const useCase = getAllContent(`use-cases/${categoryDir}`).find(
        uc => uc.slug === file.replace('.md', '')
      );

      if (useCase) {
        const category = useCase.frontmatter.category;
        if (!useCasesByCategory[category]) {
          useCasesByCategory[category] = [];
        }
        useCasesByCategory[category].push(useCase);
      }
    });
  });

  return useCasesByCategory;
}

export function getAllTags(useCasesByCategory: { [key: string]: UseCase[] }): string[] {
  const tags = new Set<string>();
  Object.values(useCasesByCategory).flat().forEach(useCase => {
    useCase.frontmatter.tags?.forEach(tag => tags.add(tag));
    if (useCase.frontmatter.subject) tags.add(useCase.frontmatter.subject);
    if (useCase.frontmatter.gradeLevel) tags.add(`Grade ${useCase.frontmatter.gradeLevel}`);
  });
  return Array.from(tags).sort();
} 