import fs from 'fs';
import path from 'path';
import { getAllContent } from '@/lib/markdown';
import { UseCase } from '@/lib/use-cases';

export type { UseCase };

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
      const markdownContent = getAllContent(`use-cases/${categoryDir}`).find(
        uc => uc.slug === file.replace('.md', '')
      );

      if (markdownContent) {
        const useCase: UseCase = {
          slug: markdownContent.slug,
          title: markdownContent.frontmatter.title,
          description: markdownContent.frontmatter.description,
          content: markdownContent.content,
          tags: markdownContent.frontmatter.tags || [],
          author: markdownContent.frontmatter.author,
          school: markdownContent.frontmatter.school,
          grade_level: markdownContent.frontmatter.grade_level,
          subject: markdownContent.frontmatter.subject,
          tools_used: markdownContent.frontmatter.tools_used,
        };

        const category = markdownContent.frontmatter.category;
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
    useCase.tags?.forEach(tag => tags.add(tag));
    if (useCase.subject) tags.add(useCase.subject);
    if (useCase.grade_level) tags.add(`Grade ${useCase.grade_level}`);
  });
  return Array.from(tags).sort();
} 