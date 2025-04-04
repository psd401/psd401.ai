import { getAllPosts } from '@/lib/blog';
import { getAllArticles } from '@/lib/articles';
import { getAllPresentations } from '@/lib/presentations';
import { getAllUseCases } from '@/lib/use-cases';
import { getAllPolicies } from '@/lib/policies';
import { getAllTools } from '@/lib/tools';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psd401.ai';

  // Fetch all content
  const [posts, articles, presentations, useCases, policies, tools] = await Promise.all([
    getAllPosts(),
    getAllArticles(),
    getAllPresentations(),
    getAllUseCases(),
    getAllPolicies(),
    getAllTools(),
  ]);

  const llmsContent = `# Peninsula School District AI Implementation
> A comprehensive resource for AI implementation in K-12 education, featuring policies, tools, use cases, and best practices from Peninsula School District.

## Key Resources

### Policies & Guidelines
${policies
  .map(
    policy => `- [${policy.title}](${baseUrl}/policies/${policy.slug})
  > ${policy.description}
  
${policy.content}
`
  )
  .join('\n')}

### AI Tools & Resources
${tools
  .map(
    tool => `- [${tool.title}](${baseUrl}/tools/${tool.slug})
  > ${tool.description}
  
${tool.content}
`
  )
  .join('\n')}

### Implementation Use Cases
${useCases
  .map(
    useCase => `- [${useCase.title}](${baseUrl}/use-cases/${useCase.slug})
  > ${useCase.description}
  
${useCase.content}
`
  )
  .join('\n')}

### Blog Posts
${posts
  .map(
    post => `- [${post.title}](${baseUrl}/blog/${post.slug})
  > ${post.description}
  
${post.content}
`
  )
  .join('\n')}

## Optional Resources

### Presentations
${presentations
  .map(
    presentation => `- [${presentation.title}](${baseUrl}/presentations/${presentation.slug})
  > ${presentation.description}
  
${presentation.content}
`
  )
  .join('\n')}

### External Articles
${articles
  .map(
    article => `- [${article.title}](${article.externalUrl || `${baseUrl}/articles/${article.slug}`})
  > ${article.description}
  
${article.content}
`
  )
  .join('\n')}

## Metadata
- Last Updated: ${new Date().toISOString()}
- Content Categories: Policies, Tools, Use Cases, Blog Posts, Presentations, Articles
- Primary Focus: K-12 Education AI Implementation
- Institution: Peninsula School District
- Website: ${baseUrl}
`;

  return new Response(llmsContent, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
