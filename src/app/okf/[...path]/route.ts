import fs from 'node:fs/promises';
import path from 'node:path';
import { DIR_TO_TYPE } from '@/lib/schemas';

export const dynamic = 'force-static';

/**
 * Serves raw markdown out of the OKF bundle.
 *
 * Two URL shapes reach this handler:
 *   /okf/writing/my-post.md        the bundle path, directly
 *   /writing/my-post.md            rewritten here by next.config.js, so any
 *                                  page's markdown source sits beside it
 *
 * Content type is text/markdown so an agent gets the source, while a browser
 * still renders it as text rather than downloading it.
 */
const CONTENT = path.join(process.cwd(), 'src/content');
const ALLOWED_DIRS = new Set([...Object.keys(DIR_TO_TYPE), '']);

export async function generateStaticParams() {
  const dirs = Object.keys(DIR_TO_TYPE);
  const params: Array<{ path: string[] }> = [{ path: ['index.md'] }, { path: ['log.md'] }];

  for (const dir of dirs) {
    let files: string[];
    try {
      files = await fs.readdir(path.join(CONTENT, dir));
    } catch {
      continue;
    }
    for (const file of files) {
      if (file.endsWith('.md')) params.push({ path: [dir, file] });
    }
  }
  return params;
}

export async function GET(_request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;

  // Path traversal guard: no '..', no absolute segments, at most dir/file.
  if (
    segments.length === 0 ||
    segments.length > 2 ||
    segments.some(s => s.includes('..') || s.includes('/') || s.includes('\\'))
  ) {
    return new Response('Not found', { status: 404 });
  }

  const [first, second] = segments;
  const dir = second ? first : '';
  const file = second ?? first;

  if (!ALLOWED_DIRS.has(dir) || !file.endsWith('.md')) {
    return new Response('Not found', { status: 404 });
  }

  const target = path.join(CONTENT, dir, file);

  // Belt and braces: the resolved path must still be inside the bundle.
  if (!path.resolve(target).startsWith(path.resolve(CONTENT) + path.sep)) {
    return new Response('Not found', { status: 404 });
  }

  let body: string;
  try {
    body = await fs.readFile(target, 'utf8');
  } catch {
    return new Response('Not found', { status: 404 });
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
