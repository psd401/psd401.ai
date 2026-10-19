import TrustPage, { trustPageMetadata } from '@/components/TrustPage';

export const metadata = trustPageMetadata('contact');

export default function ContactPage() {
  return <TrustPage page="contact" />;
}
