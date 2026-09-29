/**
 * The newsletter's public name and one-line description — the only place
 * either is written. Every page, form and email reads from here, so renaming
 * the newsletter is this one edit.
 *
 * UNCONFIRMED: "Field Notes" is the default title of the SubscribeForm
 * component in the Claude Design project, carried over as-is. The district
 * has not chosen a name. The tagline is from the same design ("One thing we
 * built, one thing we learned, one thing we would do differently").
 *
 * The internal identifiers (src/lib/field-notes/, /field-notes/* routes,
 * FIELD_NOTES_* variables) are separate. Renaming those is free until the
 * first issue is sent — after that, its unsubscribe links point at the routes.
 */
export const NEWSLETTER = {
  name: 'Field Notes',
  tagline: 'one thing we built, one thing we learned, and one thing we would do differently',
} as const;
