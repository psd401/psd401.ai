import { getAllUseCases, getAllTags, getUseCasesByCategory } from '@/lib/use-cases';
import UseCasesClient from './use-cases-client';

export const revalidate = 3600; // Revalidate every hour

export const CATEGORIES = {
  'classroom-use': {
    name: 'Classroom Use',
    slug: 'classroom-use',
    description: 'Examples of AI tools being used directly in classroom instruction and student learning'
  },
  'lesson-planning': {
    name: 'Lesson Planning',
    slug: 'lesson-planning',
    description: 'How educators are using AI to enhance lesson planning and curriculum development'
  },
  'student-support': {
    name: 'Student Support',
    slug: 'student-support',
    description: 'Applications of AI in providing additional support and accommodations for students'
  },
  'assessment': {
    name: 'Assessment',
    slug: 'assessment',
    description: 'Ways AI is being used to support student assessment and feedback'
  },
  'professional-development': {
    name: 'Professional Development',
    slug: 'professional-development',
    description: 'Examples of AI supporting teacher growth and professional learning'
  }
};

export default async function UseCasesPage() {
  const [useCasesByCategory, allTags] = await Promise.all([
    getUseCasesByCategory(),
    getAllTags()
  ]);

  return (
    <UseCasesClient 
      useCasesByCategory={useCasesByCategory}
      allTags={allTags}
      categories={CATEGORIES}
    />
  );
} 