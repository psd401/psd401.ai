import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const policiesDirectory = path.join(process.cwd(), 'src/content/policies');

export interface Policy {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  status: string;
  version: string;
  tags: string[];
}

export async function getAllPolicies(): Promise<Policy[]> {
  const fileNames = fs.readdirSync(policiesDirectory);
  const allPolicies = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(policiesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        content,
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.category,
        status: data.status,
        version: data.version,
        tags: data.tags || [],
      };
    });

  return allPolicies;
}

export const getPolicyBySlug = cache(async (slug: string): Promise<Policy | null> => {
  try {
    const fullPath = path.join(policiesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      description: data.description,
      content,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category,
      status: data.status,
      version: data.version,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error(`Error reading policy ${slug}:`, error);
    return null;
  }
});

export async function getAllTags(): Promise<string[]> {
  const policies = await getAllPolicies();
  const tags = new Set<string>();

  policies.forEach(policy => {
    // Add regular tags
    policy.tags?.forEach(tag => tags.add(tag));

    // Add category
    if (policy.category) {
      tags.add(`Category: ${policy.category}`);
    }

    // Add status
    if (policy.status) {
      tags.add(`Status: ${policy.status}`);
    }

    // Add version
    if (policy.version) {
      tags.add(`Version: ${policy.version}`);
    }
  });

  return Array.from(tags).sort();
}
