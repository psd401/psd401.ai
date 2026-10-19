import TrustPage, { trustPageMetadata } from '@/components/TrustPage';

export const metadata = trustPageMetadata('privacy');

export default function PrivacyPage() {
  return <TrustPage page="privacy" />;
}
