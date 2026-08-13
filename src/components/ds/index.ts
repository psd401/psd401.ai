/**
 * Peninsula AI design system.
 *
 * Ported from the Claude Design project `5db21ee4`. The source organised
 * components into four directories; that mapping is preserved here:
 *
 *   design system            this repo
 *   ─────────────────────    ────────────────────────────────
 *   components/core/         ./core.tsx
 *   components/navigation/   ./navigation.tsx + ./Masthead.tsx
 *   components/content/      ./content.tsx
 *   components/forms/        ./forms.tsx
 *
 * Styling lives in `src/styles/ds.css`; design tokens in
 * `src/styles/tokens/`. Two rules matter more than the rest:
 *
 *   1. One section colour per page. Set `data-section` once on the page
 *      wrapper; never mix two in a single view. The homepage is the only
 *      exception, because it is the index of all five.
 *   2. Never invent a number, and never hide a failure. Counts on this site
 *      are real and computed from content. "What flopped" is a first-class
 *      category, not something to bury.
 */

export {
  Button,
  Chip,
  SectionRule,
  StatCell,
  ImageFrame,
  CodeBlock,
  PullQuote,
  BrowserFrame,
  SECTION_KEYS,
} from './core';
export type { SectionKey } from './core';

export { UtilityBar, Breadcrumb, SideNav, OnThisPage } from './navigation';
export type { Crumb, NavGroup, TocItem } from './navigation';

export { Masthead } from './Masthead';
export type { MastheadSection } from './Masthead';

export { ThemeToggle } from './ThemeToggle';

export { SectionHeader, PostCard, DocCard, SpecTable, StepRow, ProductCard } from './content';
export type { SpecRow, Step } from './content';

export { TextInput, SubscribeForm } from './forms';
