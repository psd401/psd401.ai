/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react', 'tailwind-variants', 'tailwind-merge'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'mirrors.creativecommons.org',
      },
    ],
  },

  // Enable static file serving for robots.txt and sitemap.xml
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
};

export default nextConfig;
