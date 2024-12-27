/* eslint-disable react/no-unescaped-entities */
import { Card, CardBody } from '@nextui-org/react';
import Link from 'next/link';
import Image from 'next/image';

const sections = [
  {
    title: 'Core Resources',
    description: 'Essential guidance and documentation for AI in education',
    items: [
      {
        title: 'Policies and Guidance',
        description: 'Official district policies and guidance for AI use in education',
        image: '/images/sections/policies-hero.jpg',
        href: '/policies',
      },
      {
        title: 'Blog Posts',
        description: 'Stories and updates about AI implementation across our district',
        image: '/images/sections/blog-hero.jpg',
        href: '/blog',
      },
      {
        title: 'Presentations',
        description: 'Slide decks, videos, and materials from conferences and trainings',
        image: '/images/sections/presentations-hero.jpg',
        href: '/presentations',
      },
    ],
  },
  {
    title: 'Resources & Examples',
    description: 'Practical tools and real-world applications of AI in education',
    items: [
      {
        title: 'AI Tools',
        description: 'Curated collection of AI tools and applications for education',
        image: '/images/sections/tools-hero.jpg',
        href: '/tools',
      },
      {
        title: 'Articles',
        description: 'Curated articles and research about AI in education',
        image: '/images/sections/articles-hero.jpg',
        href: '/articles',
      },
      {
        title: 'Use Cases',
        description:
          'Real-world examples and effective prompts for AI across education and operations',
        image: '/images/sections/use-cases-hero.jpg',
        href: '/use-cases',
      },
    ],
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-24 min-h-[600px] flex items-center">
        {/* Background Image */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-0 h-full w-full"
          style={{
            backgroundImage: 'url("/images/hero-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.65',
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />

        <div className="space-y-6 max-w-4xl mx-auto px-6 relative z-[2]">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text leading-tight">
            Leading Education&apos;s AI Future
          </h1>
          <p className="text-xl text-foreground/90">
            Welcome to Peninsula School District&apos;s AI hub, where innovation meets education.
            From Gig Harbor, Washington, we&apos;re pioneering the thoughtful integration of AI
            across K-12 education, empowering students and educators to thrive in an AI-enhanced
            world.
          </p>
          <form action="/search" className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <input
                type="search"
                name="q"
                placeholder="Search for articles and guides..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>
      </section>

      {/* Content Sections */}
      {sections.map(section => (
        <section key={section.title} className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary-500">{section.title}</h2>
            <p className="text-foreground/80">{section.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map(item => (
              <Link key={item.title} href={item.href}>
                <Card className="hover:scale-[1.02] transition-transform bg-content1 hover:bg-content2">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48"
                  />
                  <CardBody className="space-y-2">
                    <h3 className="font-bold text-lg text-primary-500">{item.title}</h3>
                    <p className="text-foreground/80">{item.description}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
