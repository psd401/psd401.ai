'use client';

import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@nextui-org/react';
import NextLink from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';
import { Link } from '@nextui-org/react';

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
          <NextLink href="/" className="flex items-center gap-3">
            <Image
              src="/images/psd-logo.png"
              alt="Peninsula School District Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-bold text-2xl text-sea-glass hover:text-sea-foam">
              Artificial Intelligence in PSD
            </span>
          </NextLink>
        </NavbarBrand>

        <div className="h-8 w-px bg-sea-glass/20 mx-4 hidden sm:block" />

        <NavbarContent className="hidden sm:flex gap-8" justify="center">
          {navItems.map(item => (
            <NavbarItem key={item.name}>
              <NextLink
                href={item.href}
                className="text-white/90 hover:text-sea-glass text-base font-medium"
              >
                {item.name}
              </NextLink>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow container mx-auto px-6 py-8">{children}</main>

      <footer className="bg-pacific border-t border-sea-glass/20 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              <NextLink href="/" className="flex items-center gap-3">
                <Image
                  src="/images/psd-logo.png"
                  alt="Peninsula School District Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="font-bold text-xl text-sea-glass hover:text-sea-foam">
                  Artificial Intelligence in PSD
                </span>
              </NextLink>
              <nav className="hidden md:flex gap-6">
                {navItems.map(item => (
                  <NextLink
                    key={item.name}
                    href={item.href}
                    className="text-white/80 hover:text-sea-glass text-sm"
                  >
                    {item.name}
                  </NextLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <NextLink
                href="https://facebook.com/psd401"
                target="_blank"
                className="text-white/80 hover:text-sea-glass"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </NextLink>
              <NextLink
                href="https://linkedin.com/company/peninsula-school-district"
                target="_blank"
                className="text-white/80 hover:text-sea-glass"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </NextLink>
              <NextLink
                href="https://github.com/psd401/psd401.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-sea-glass"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </NextLink>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-white/80">
            <p>&copy; {new Date().getFullYear()} Peninsula School District. All rights reserved.</p>
            <p className="mt-2">
              All content on this website is licensed under{' '}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1"
                target="_blank"
                rel="license noopener noreferrer"
                className="inline-flex items-center hover:text-sea-glass"
              >
                Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
                <Image
                  width={22}
                  height={22}
                  className="ml-1 inline"
                  src="/images/cc/cc.svg"
                  alt="CC"
                />
                <Image
                  width={22}
                  height={22}
                  className="ml-1 inline"
                  src="/images/cc/by.svg"
                  alt="BY"
                />
                <Image
                  width={22}
                  height={22}
                  className="ml-1 inline"
                  src="/images/cc/nc.svg"
                  alt="NC"
                />
                <Image
                  width={22}
                  height={22}
                  className="ml-1 inline"
                  src="/images/cc/sa.svg"
                  alt="SA"
                />
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
