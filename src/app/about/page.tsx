import TrustPage, { trustPageMetadata } from '@/components/TrustPage';

export const metadata = trustPageMetadata('about');

export default function AboutPage() {
  return <TrustPage page="about" />;
}
