/**
 * Content schemas — the single source of truth for valid frontmatter.
 *
 * Every content type is an OKF base plus the domain fields that type needs.
 * `scripts/content-validate.ts` runs these over src/content/ in CI, so an
 * agent that writes a malformed file gets a precise field-level error instead
 * of a runtime crash or a silently broken page.
 *
 * Two renames happened during the OKF migration and are worth knowing about:
 *
 *   `type`   → `format`    presentations, research, tools. OKF reserves
 *                          `type` for the concept kind, and these were using
 *                          it for the kind of talk / paper / tool.
 *   `status` → `maturity`  tools only. OKF reserves `status` for the
 *                          draft/stable/deprecated lifecycle; tools were
 *                          using it for Production/Experimentation.
 */
import { z } from 'zod';
import { OKF_STATUSES, OKF_TYPES, ACTOR_PATTERN } from './okf';

/* ------------------------------------------------------------- OKF base */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD');

const actor = z.string().regex(ACTOR_PATTERN, {
  message: 'must be "human:<id>", "process:<id>", or "<producer>/<version>"',
});

const sourceSchema = z.object({
  resource: z.string().min(1, 'a source entry must carry a resource'),
  id: z.string().optional(),
  title: z.string().optional(),
  author: z.string().optional(),
  usage_count: z.number().int().optional(),
  last_modified: isoDate.optional(),
});

const verificationSchema = z.object({
  by: actor,
  at: z.string().optional(),
});

/**
 * The OKF v0.2 field families. Only `type` is required by the spec; `title`,
 * `description`, `resource` and `tags` are "SHOULD" and we enforce the first
 * three because they drive page metadata — a concept without a description
 * ships a page with no meta description.
 */
export const okfBase = z.object({
  type: z.enum(OKF_TYPES),
  title: z.string().min(1),
  description: z.string().min(1, 'drives the page meta description and search results'),
  resource: z.string().startsWith('/', 'the canonical site path, e.g. /writing/my-post'),
  tags: z.array(z.string()).default([]),

  // provenance
  sources: z.array(sourceSchema).optional(),

  // trust
  generated: z.object({ by: actor, at: z.string().optional() }).optional(),
  verified: z.union([z.array(verificationSchema), verificationSchema]).optional(),

  // lifecycle
  status: z.enum(OKF_STATUSES).default('stable'),
  stale_after: isoDate.optional(),
});

/* ------------------------------------------------------- per-type schemas */

/** 01 Writing. */
export const postSchema = okfBase.extend({
  type: z.literal('post'),
  date: isoDate,
  author: z.string().min(1),
  image: z.string().optional(),
});

/** 02 Software. */
export const softwareSchema = okfBase.extend({
  type: z.literal('software'),
  date: isoDate,
  /** Production | Pilot | Beta — where the product actually is. */
  maturity: z.enum(['Production', 'Pilot', 'Beta', 'Retired']),
  /** Short tech stack line, e.g. 'Next.js · AWS'. */
  stack: z.string().optional(),
  repo: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  license: z.string().optional(),
  contact: z.string().optional(),
  image: z.string().optional(),
  /** Rows for the technical specification table. */
  spec: z.array(z.object({ k: z.string(), v: z.string() })).optional(),
});

/** 03 Guidance. */
export const policySchema = okfBase.extend({
  type: z.literal('policy'),
  date: isoDate,
  category: z.string().optional(),
});

/** 04 Presentations. */
export const presentationSchema = okfBase.extend({
  type: z.literal('presentation'),
  date: isoDate,
  presenters: z.array(z.string()).default([]),
  audience: z.string().optional(),
  /** Was `type`. Conference Session, PD Session, Webinar, … */
  format: z.string().optional(),
  thumbnail: z.string().optional(),
  slides: z.string().optional(),
});

/** Reference library — use cases. */
export const useCaseSchema = okfBase.extend({
  type: z.literal('use-case'),
  date: isoDate,
  category: z.string().min(1),
  subject: z.string().optional(),
  grade_level: z.string().optional(),
  tools_used: z.array(z.string()).default([]),
  author: z.string().optional(),
  school: z.string().optional(),
});

/** Reference library — tools. */
export const toolSchema = okfBase.extend({
  type: z.literal('tool'),
  date: isoDate,
  category: z.string().optional(),
  provider: z.string().optional(),
  privacy: z.string().optional(),
  access_type: z.string().optional(),
  /** Was `status`. Production | Experimentation. */
  maturity: z.string().optional(),
  /** Was `type` on two files. Chat Environment, Chat AI, … */
  format: z.string().optional(),
  demoUrl: z.string().optional(),
});

/** Reference library — external research. */
export const researchSchema = okfBase.extend({
  type: z.literal('research'),
  date: isoDate,
  author: z.string().optional(),
  /** Publisher or journal. */
  source: z.string().optional(),
  /** Was `type`. Research Paper, Opinion Piece, Preprint, … */
  format: z.string().optional(),
  externalUrl: z.string().url().optional(),
  image: z.string().optional(),
});

/* ------------------------------------------------------------- registry */

export const SCHEMAS = {
  post: postSchema,
  software: softwareSchema,
  policy: policySchema,
  presentation: presentationSchema,
  'use-case': useCaseSchema,
  tool: toolSchema,
  research: researchSchema,
} as const;

export type SchemaFor<T extends keyof typeof SCHEMAS> = z.infer<(typeof SCHEMAS)[T]>;

export type Post = z.infer<typeof postSchema>;
export type Software = z.infer<typeof softwareSchema>;
export type Policy = z.infer<typeof policySchema>;
export type Presentation = z.infer<typeof presentationSchema>;
export type UseCase = z.infer<typeof useCaseSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type Research = z.infer<typeof researchSchema>;

/** Maps a content directory to the OKF type it holds. */
export const DIR_TO_TYPE = {
  writing: 'post',
  software: 'software',
  guidance: 'policy',
  presentations: 'presentation',
  'use-cases': 'use-case',
  tools: 'tool',
  articles: 'research',
} as const satisfies Record<string, keyof typeof SCHEMAS>;

export type ContentDir = keyof typeof DIR_TO_TYPE;

/** Maps a content directory to its public URL prefix. */
export const DIR_TO_URL = {
  writing: '/writing',
  software: '/software',
  guidance: '/guidance',
  presentations: '/presentations',
  'use-cases': '/use-cases',
  tools: '/tools',
  articles: '/articles',
} as const satisfies Record<ContentDir, string>;
