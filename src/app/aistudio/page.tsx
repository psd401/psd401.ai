import React from 'react';
import Image from 'next/image';
import { Button, Card, CardBody } from '@heroui/react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Studio - Advanced AI Tools for Education | Peninsula School District',
  description:
    'Access frontier AI models like GPT-5, Claude Opus, and Google Gemini in a secure, cost-effective platform built for K-12 education. Open source and MIT licensed.',
};

export default function AIStudioPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-pacific">
          AI Studio
          <span className="block text-sea-glass mt-2">Your Gateway to Advanced AI Tools</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          A secure, open-source platform providing K-12 educators and students with access to
          frontier generative AI models—at 90% lower cost than individual licenses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            as="a"
            href="https://github.com/psd401/aistudio"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="bg-sea-glass text-white hover:bg-sea-glass/90 font-semibold px-8"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </Button>
          <Button
            as="a"
            href="mailto:aistudio@psd401.net"
            size="lg"
            variant="bordered"
            className="border-sea-glass text-sea-glass hover:bg-sea-glass/10 font-semibold px-8"
          >
            Contact for Hosted Solutions
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Open source • MIT License • Built for K-12 Education
        </p>
      </section>

      {/* Screenshot Hero */}
      <section className="mb-16">
        <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
          <Image
            src="/images/aistudio-1.png"
            alt="AI Studio interface showing frontier AI model selection"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover"
            style={{ maxHeight: '500px' }}
            priority
          />
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-pacific">
          Powerful Features for Modern Education
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 border-sea-glass/20 hover:border-sea-glass/40 transition-colors">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-sea-glass/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sea-glass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pacific">Frontier AI Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Switch between cutting-edge models like OpenAI GPT-5, Anthropic Claude Opus, and
                Google Gemini in real-time.
              </p>
            </CardBody>
          </Card>

          <Card className="border-2 border-sea-glass/20 hover:border-sea-glass/40 transition-colors">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-sea-glass/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sea-glass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pacific">District-Level Security</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Data processed within PSD&apos;s secure servers. No student or staff information
                leaves the district environment.
              </p>
            </CardBody>
          </Card>

          <Card className="border-2 border-sea-glass/20 hover:border-sea-glass/40 transition-colors">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-sea-glass/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sea-glass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pacific">90% Cost Reduction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Secure API architecture reduces costs by 90% compared to individual AI subscriptions
                for each user.
              </p>
            </CardBody>
          </Card>

          <Card className="border-2 border-sea-glass/20 hover:border-sea-glass/40 transition-colors">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-sea-glass/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sea-glass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pacific">Custom AI Assistants</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Design custom chat models and AI assistants using prompt chains—no coding required.
              </p>
            </CardBody>
          </Card>

          <Card className="border-2 border-sea-glass/20 hover:border-sea-glass/40 transition-colors">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-sea-glass/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sea-glass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pacific">Open Source</h3>
              <p className="text-gray-600 dark:text-gray-400">
                MIT licensed and available on GitHub. Self-host or contribute to the codebase.
              </p>
            </CardBody>
          </Card>

          <Card className="border-2 border-sea-glass/20 hover:border-sea-glass/40 transition-colors">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-sea-glass/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sea-glass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pacific">Built for K-12</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Designed specifically for educational use cases with age-appropriate safety and
                privacy controls.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Screenshots Gallery */}
      <section className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-pacific">
          See AI Studio in Action
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="aspect-video relative">
              <Image
                src="/images/aistudio-2.png"
                alt="Custom chat models for instructional and operational tasks"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium">Custom chat models</p>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="aspect-video relative">
              <Image
                src="/images/aistudio-3.png"
                alt="No-code AI assistant creation interface"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium">No-code assistant creation</p>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="aspect-video relative">
              <Image
                src="/images/aistudio-4.png"
                alt="Real-time model switching between GPT-5, Claude, and Gemini"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium">Switch between frontier models</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-16 bg-gradient-to-br from-sea-glass/10 to-pacific/5 rounded-xl p-8 md:p-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-pacific">
          Why AI Studio?
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-sea-glass rounded-full flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-pacific">
                Same Tools as Universities and Businesses
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Give your students and staff access to the same frontier AI models used in higher
                education and professional settings worldwide.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-sea-glass rounded-full flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-pacific">
                Privacy-First Architecture
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Secure API calls managed within PSD&apos;s servers ensure data privacy. Only minimum
                necessary information reaches AI models—no identifiable data leaves your
                environment.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-sea-glass rounded-full flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-pacific">
                Built With and For AI Users
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI Studio was developed using AI collaboration—faster prototyping, smarter
                troubleshooting, and rapid iteration demonstrate what&apos;s possible when humans
                and AI work together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="mb-16">
        <div className="bg-pacific text-white rounded-xl p-8 md:p-10">
          <div className="max-w-3xl mx-auto text-center">
            <svg
              className="w-16 h-16 mx-auto mb-6 opacity-90"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Open Source & MIT Licensed</h2>
            <p className="text-xl mb-8 text-white/90">
              AI Studio&apos;s code is freely available on GitHub. Self-host in your environment or
              contribute to the project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as="a"
                href="https://github.com/psd401/aistudio"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="bg-white text-pacific hover:bg-gray-100 font-semibold"
              >
                View Repository
              </Button>
              <Button
                as="a"
                href="https://github.com/psd401/aistudio/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="bordered"
                className="border-white text-white hover:bg-white/10"
              >
                View MIT License
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hosted Solutions Section */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-sea-glass/10 to-pacific/5 rounded-xl p-8 md:p-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-pacific">
              Interested in a Hosted Solution?
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              We&apos;re exploring the possibility of offering hosted AI Studio solutions through
              interlocal agreements with other school districts. Message us for more information.
            </p>
            <Button
              as="a"
              href="mailto:aistudio@psd401.net"
              size="lg"
              className="bg-sea-glass text-white hover:bg-sea-glass/90 font-semibold px-8"
            >
              Contact Us at aistudio@psd401.net
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-pacific">Ready to Get Started?</h2>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join Peninsula School District in bringing world-class AI tools to K-12
          education—securely, affordably, and responsibly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as="a"
            href="https://github.com/psd401/aistudio"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="bg-sea-glass text-white hover:bg-sea-glass/90 font-semibold px-8"
          >
            Download from GitHub
          </Button>
          <Button
            as="a"
            href="https://github.com/psd401/aistudio/discussions"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            variant="bordered"
            className="border-sea-glass text-sea-glass hover:bg-sea-glass/10 font-semibold px-8"
          >
            Join the Discussion
          </Button>
          <Button
            as="a"
            href="/blog/introducing-ai-studio"
            size="lg"
            variant="bordered"
            className="border-sea-glass text-sea-glass hover:bg-sea-glass/10 font-semibold px-8"
          >
            Read the Announcement
          </Button>
        </div>
      </section>
    </div>
  );
}
