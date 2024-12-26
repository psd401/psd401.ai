'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from '@nextui-org/react';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';

const navItems = [
  { name: 'Policies', href: '/policies' },
  { name: 'Blog', href: '/blog' },
  { name: 'Presentations', href: '/presentations' },
  { name: 'Tools', href: '/tools' },
  { name: 'Articles', href: '/articles' },
  { name: 'Use Cases', href: '/use-cases' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar className="bg-pacific border-b border-sea-glass/20 min-h-[72px]">
        <NavbarBrand className="mr-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/psd-logo.png"
              alt="Peninsula School District Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-bold text-2xl text-sea-glass hover:text-sea-foam">
              Peninsula SD AI
            </span>
          </Link>
        </NavbarBrand>
        
        <div className="h-8 w-px bg-sea-glass/20 mx-4 hidden sm:block" />
        
        <NavbarContent className="hidden sm:flex gap-8" justify="center">
          {navItems.map((item) => (
            <NavbarItem key={item.name}>
              <Link
                href={item.href}
                className="text-white/90 hover:text-sea-glass text-base font-medium"
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow container mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="bg-pacific border-t border-sea-glass/20 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/images/psd-logo.png"
                  alt="Peninsula School District Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="font-bold text-xl text-sea-glass hover:text-sea-foam">
                  Peninsula SD AI
                </span>
              </Link>
              <nav className="hidden md:flex gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-white/80 hover:text-sea-glass text-sm"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="https://facebook.com/psd401" target="_blank" className="text-white/80 hover:text-sea-glass">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </Link>
              <Link href="https://linkedin.com/company/peninsula-school-district" target="_blank" className="text-white/80 hover:text-sea-glass">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-white/80">
            <p>&copy; {new Date().getFullYear()} Peninsula School District. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 