# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking without emitting files

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without modifying files
- `npm run validate` - Run both lint and format:check (pre-commit validation)

### Git Hooks

- Pre-commit hook runs `lint-staged` which auto-formats .js/.jsx/.ts/.tsx and .json/.md files

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS + NextUI component library
- **Content**: Markdown files with gray-matter frontmatter parsing
- **Theming**: Custom Peninsula SD brand colors (sea-glass, pacific, driftwood, etc.)

### Content Management System

All content is stored as Markdown files in `src/content/` with frontmatter metadata:

- **Blog**: `src/content/blog/` - Blog posts with date, author, tags
- **Presentations**: `src/content/presentations/` - Presentation materials with presenters, audience, slides
- **Policies**: `src/content/policies/` - District AI policies and guidance
- **Articles**: `src/content/articles/` - External research and articles
- **Use Cases**: `src/content/use-cases/` - Practical AI implementation examples
- **Tools**: `src/content/tools/` - AI tool directory with category, provider, status metadata

### Library Functions Pattern

Each content type has a dedicated library in `src/lib/`:

- `blog.ts`, `presentations.ts`, `policies.ts`, `articles.ts`, `use-cases.ts`, `tools.ts`
- Each exports: `getAll*()`, `getAllTags()`, `get*BySlug(slug)`
- Functions read from filesystem, parse frontmatter with gray-matter, return typed objects
- All functions are async for consistency with Next.js server components

### Search Architecture

`src/lib/search.ts` provides unified search across all content types:

- Fetches all content in parallel with `Promise.all()`
- Normalizes to common `SearchResult` type with title, description, url, section, tags
- Filters by matching query against title, description, and tags

### Page Structure

- **App Router**: `src/app/` uses Next.js 14 App Router
- **Dynamic Routes**: `[slug]` patterns for content detail pages
- **Client Components**: Filtering, search, and interactive features use `'use client'`
- **Server Components**: Content fetching and static rendering by default

### Layout System

- **Root Layout**: `src/app/layout.tsx` - Sets up fonts, metadata, Google Analytics, wraps with Providers
- **Providers**: `src/app/providers.tsx` - NextUI provider for component library
- **Layout Component**: `src/components/Layout.tsx` - Shared navigation and footer

### Path Aliases

TypeScript configured with `@/*` alias mapping to `./src/*` for cleaner imports.

### Custom Color System

Tailwind configured with Peninsula SD brand colors:

- Primary: `sea-glass` (#6CA18A), `pacific` (#25424C), `driftwood` (#D7CDBE)
- Supporting: `cedar`, `whulge`, `sea-foam`, `meadow`, `ocean`, `skylight`
- Both light and dark theme variants defined in NextUI theme configuration
