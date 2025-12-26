import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Studio',
  description:
    'AI Studio - A secure, open-source platform providing K-12 educators and students with access to frontier generative AI models at 90% lower cost.',
  openGraph: {
    title: 'AI Studio | Peninsula SD AI',
    description:
      'A secure, open-source platform providing K-12 educators and students with access to frontier AI models.',
    images: ['/images/aistudio-1.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Studio | Peninsula SD AI',
    description:
      'A secure, open-source platform providing K-12 educators and students with access to frontier AI models.',
    images: ['/images/aistudio-1.png'],
  },
};

export default function AIStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
