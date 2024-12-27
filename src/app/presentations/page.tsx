import { getAllPresentations, getAllTags } from '@/lib/presentations';
import PresentationsClient from './presentations-client';

export const revalidate = 3600; // Revalidate every hour

export default async function PresentationsPage() {
  const [presentations, allTags] = await Promise.all([
    getAllPresentations(),
    getAllTags()
  ]);

  return <PresentationsClient presentations={presentations} allTags={allTags} />;
} 