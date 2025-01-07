import { getAllPolicies } from './policies';
import { getAllPosts } from './blog';
import { getAllPresentations } from './presentations';
import { getAllTools } from './tools';
import { getAllArticles } from './articles';
import { getAllUseCases } from './use-cases';

export type SearchResult = {
  title: string;
  description: string;
  url: string;
  section: 'Policies' | 'Blog' | 'Presentations' | 'Tools' | 'Articles' | 'Use Cases';
  tags?: string[];
};

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query) return [];

  const normalizedQuery = query.toLowerCase();

  try {
    // Fetch all content
    const [policies, posts, presentations, tools, articles, useCases] = await Promise.all([
      getAllPolicies(),
      getAllPosts(),
      getAllPresentations(),
      getAllTools(),
      getAllArticles(),
      getAllUseCases(),
    ]);

    // Convert each content type to SearchResult format
    const results: SearchResult[] = [
      ...policies.map(policy => ({
        title: policy.title,
        description: policy.description,
        url: `/policies/${policy.slug}`,
        section: 'Policies' as const,
        tags: policy.tags,
      })),
      ...posts.map(post => ({
        title: post.title,
        description: post.description,
        url: `/blog/${post.slug}`,
        section: 'Blog' as const,
        tags: post.tags,
      })),
      ...presentations.map(presentation => ({
        title: presentation.title,
        description: presentation.description,
        url: `/presentations/${presentation.slug}`,
        section: 'Presentations' as const,
        tags: presentation.tags,
      })),
      ...tools.map(tool => ({
        title: tool.title,
        description: tool.description,
        url: `/tools/${tool.slug}`,
        section: 'Tools' as const,
        tags: tool.tags,
      })),
      ...articles.map(article => ({
        title: article.title,
        description: article.description,
        url: `/articles/${article.slug}`,
        section: 'Articles' as const,
        tags: article.tags,
      })),
      ...useCases.map(useCase => ({
        title: useCase.title,
        description: useCase.description,
        url: `/use-cases/${useCase.slug}`,
        section: 'Use Cases' as const,
        tags: useCase.tags,
      })),
    ];

    // Filter results based on query
    return results.filter(result => {
      const searchableText = [result.title, result.description, ...(result.tags || [])]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
}
