import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const policiesDirectory = path.join(process.cwd(), 'src/content/policies');

export interface Policy {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
}

export async function getAllPolicies(): Promise<Policy[]> {
  // Get file names under /content/policies
  const fileNames = fs.readdirSync(policiesDirectory);
  const allPolicies = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(policiesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the policy metadata section
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        content,
      };
    });

  return allPolicies;
}

export async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  try {
    const fullPath = path.join(policiesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the policy metadata section
    const { data, content } = matter(fileContents);

    // Validate required fields
    if (!data.title || !data.description) {
      console.warn(`Missing required fields in ${slug}.md`);
      return null;
    }

    // Combine the data with the slug and content
    return {
      slug,
      content,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error(`Error reading policy ${slug}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const policies = await getAllPolicies();
  const tagSet = new Set<string>();

  policies.forEach(policy => {
    policy.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}
