/**
 * Open Knowledge Format (OKF) v0.2.
 *
 * `src/content/` IS the OKF bundle — not a build artefact derived from it.
 * Every markdown file under it is a "concept"; agents consume the same files
 * the site renders, from GitHub or from /okf.
 *
 * Spec: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
 *
 * The conformance bar is deliberately low, and that is the point:
 *
 *   1. Every non-reserved .md file has parseable YAML frontmatter.
 *   2. Every frontmatter block has a non-empty `type`.
 *   3. Reserved filenames (index.md, log.md) follow their structures.
 *
 * Consumers MUST NOT reject a bundle for missing optional fields, unknown
 * `type` values, unknown extra keys, broken cross-links, or missing index.md.
 * Our own validator mirrors that: it errors on the three rules above and
 * warns on everything else.
 */

export const OKF_VERSION = '0.2';

/** Filenames OKF reserves. These are never concepts. */
export const OKF_RESERVED_FILENAMES = ['index.md', 'log.md'] as const;

export function isReservedFilename(fileName: string): boolean {
  return (OKF_RESERVED_FILENAMES as readonly string[]).includes(fileName);
}

/**
 * The `type` values this bundle produces. OKF leaves the vocabulary to the
 * producer — this is ours, and it is closed. Adding one means adding it here,
 * to src/lib/schemas.ts, and to the table in src/content/CONTENT.md.
 */
export const OKF_TYPES = [
  'post',
  'software',
  'policy',
  'presentation',
  'use-case',
  'tool',
  'research',
  'protocol',
] as const;

export type OkfType = (typeof OKF_TYPES)[number];

/** Lifecycle. `stable` is the default when the field is absent. */
export const OKF_STATUSES = ['draft', 'stable', 'deprecated'] as const;
export type OkfStatus = (typeof OKF_STATUSES)[number];

/**
 * Actor convention. Consumers classify trust by the `human:` prefix, so the
 * shape matters:
 *   agents/tools      `<producer>/<version>`   e.g. claude-code/opus-5
 *   people            `human:<id>`             e.g. human:hagelk
 *   automated process `process:<id>`           e.g. process:content-migrate
 */
export type OkfActor = string;

export const ACTOR_PATTERN =
  /^(human:[a-z0-9._-]+|process:[a-z0-9._-]+|[a-z0-9._-]+\/[a-z0-9._-]+)$/i;

export function isHumanActor(actor: OkfActor): boolean {
  return actor.startsWith('human:');
}

/** Trust tier, derived by the consumer — never stored. */
export type TrustTier = 'unverified' | 'machine-confirmed' | 'human-reviewed';

export function trustTier(verified: OkfVerification[] | undefined): TrustTier {
  if (!verified || verified.length === 0) return 'unverified';
  return verified.some(v => isHumanActor(v.by)) ? 'human-reviewed' : 'machine-confirmed';
}

/* ------------------------------------------------------------ field types */

export type OkfSource = {
  /** REQUIRED within an entry. URI or bundle path. */
  resource: string;
  /** Stable key, referenced by markdown footnote labels for per-claim attribution. */
  id?: string;
  title?: string;
  author?: string;
  usage_count?: number;
  /** YYYY-MM-DD */
  last_modified?: string;
};

export type OkfGenerated = {
  /** REQUIRED within `generated`. */
  by: OkfActor;
  /** ISO 8601 datetime of last meaningful change. */
  at?: string;
};

export type OkfVerification = {
  by: OkfActor;
  at?: string;
};

/** The OKF fields every concept in this bundle may carry. */
export type OkfFrontmatter = {
  /** The one universally required field. */
  type: OkfType;
  title?: string;
  description?: string;
  /** URI uniquely identifying the underlying asset — for us, the canonical URL. */
  resource?: string;
  tags?: string[];
  sources?: OkfSource[];
  generated?: OkfGenerated;
  /** A bare mapping is legal; consumers treat it as a one-element list. */
  verified?: OkfVerification[] | OkfVerification;
  status?: OkfStatus;
  /** YYYY-MM-DD. The concept is stale when today >= this date. */
  stale_after?: string;
};

/** Normalise `verified` to a list — the spec allows a bare mapping. */
export function normalizeVerified(
  verified: OkfFrontmatter['verified']
): OkfVerification[] | undefined {
  if (!verified) return undefined;
  return Array.isArray(verified) ? verified : [verified];
}

/** Is this concept past its stale_after date? */
export function isStale(staleAfter: string | undefined, today = new Date()): boolean {
  if (!staleAfter) return false;
  const cutoff = new Date(`${staleAfter}T00:00:00Z`);
  if (Number.isNaN(cutoff.getTime())) return false;
  return today >= cutoff;
}

/**
 * Cross-links between concepts use bundle-absolute markdown paths — a leading
 * slash, relative to the bundle root — because those stay valid when a
 * document moves. Example: `[customers](/tables/customers.md)`.
 */
export function bundlePath(contentDir: string, slug: string): string {
  return `/${contentDir}/${slug}.md`;
}
