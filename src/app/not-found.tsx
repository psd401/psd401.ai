import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
        </div>

        <p className="text-foreground/60">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as={Link} href="/" color="primary" variant="solid">
            Return Home
          </Button>
          <Button as={Link} href="/blog" variant="bordered">
            Browse Blog
          </Button>
        </div>

        <div className="pt-8 text-sm text-foreground/50">
          <p>Looking for something specific? Try these:</p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <Link href="/tools" className="text-primary hover:underline">
              AI Tools
            </Link>
            <span>•</span>
            <Link href="/use-cases" className="text-primary hover:underline">
              Use Cases
            </Link>
            <span>•</span>
            <Link href="/policies" className="text-primary hover:underline">
              Policies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
