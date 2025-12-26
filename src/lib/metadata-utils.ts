/**
 * Truncates text at word boundaries for SEO-friendly meta descriptions
 * @param text - The text to truncate
 * @param maxLength - Maximum character length (default: 160 for meta descriptions)
 * @returns Truncated text ending at a word boundary
 */
export function truncateAtWordBoundary(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If no space found, just truncate at maxLength
  if (lastSpace === -1) {
    return truncated + '...';
  }

  return truncated.slice(0, lastSpace) + '...';
}

/**
 * Strips markdown formatting from text
 * @param text - Markdown text
 * @returns Plain text without markdown symbols
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/[#*`_~[\]()]/g, '') // Remove markdown symbols
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Creates a description from markdown content with smart truncation
 * @param content - Markdown content
 * @param maxLength - Maximum length (default: 160)
 * @returns SEO-friendly description
 */
export function createDescriptionFromContent(content: string, maxLength: number = 160): string {
  const plainText = stripMarkdown(content);
  return truncateAtWordBoundary(plainText, maxLength);
}
