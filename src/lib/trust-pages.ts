/**
 * The three trust pages: /about, /contact and /privacy.
 *
 * Each body is markdown, and the same string serves both shapes of the page:
 * the HTML route renders it through MarkdownContent, and a request with
 * `Accept: text/markdown` gets it verbatim (src/app/markdown/[page]). One
 * source, so the two cannot drift.
 *
 * Everything on the privacy page is a description of what the code does.
 * Change the code that collects data (Google Analytics in app/layout.tsx, the
 * Field Notes driver in lib/field-notes/) and this page must change with it.
 */
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from './site';

export type TrustPageKey = 'about' | 'contact' | 'privacy';

export type TrustPage = {
  key: TrustPageKey;
  path: `/${TrustPageKey}`;
  title: string;
  description: string;
  body: string;
};

const about: TrustPage = {
  key: 'about',
  path: '/about',
  title: 'About this site',
  description:
    'Who publishes Peninsula AI, why it exists, and how its content is made, licensed and kept current.',
  body: `${SITE_NAME} (${SITE_URL}) is published by Peninsula School District, a public school district in Gig Harbor, Washington.

We use AI in teaching, operations, policy and professional learning, and we publish that work here as we do it: the software we build, the guidance our staff work from, the talks we give, and what we learn along the way, including what did not work.

## Who it is for

Other districts, mostly. If you are deciding whether to try something we have tried, this site shows you what it took and how it went. Our own staff, families and community use it too, to see what the district is doing with AI and why.

## What is here

- **Guidance**: the documents our staff work from, in plain language.
- **Writing**: notes from the people doing the work.
- **Presentations**: talks and slides, published as given.
- **Software**: products district staff build for district problems, most of them open source.
- **Open Adaptive District**: our protocol for AI work, in six-week cycles any district can adopt.
- **Reference library**: staff-submitted use cases, reviewed tools and summarized research.

## How it is made

Every page is a markdown file in a public GitHub repository, [psd401/psd401.ai](https://github.com/psd401/psd401.ai). Every number on the site is computed from those files when the site is built; none is typed in by hand. The same files are published for software agents as an Open Knowledge Format bundle at [/okf](/okf), with an index at [/llms.txt](/llms.txt).

## Licence and reuse

Content is published under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Other districts are welcome to adapt it, with credit. Software we build carries its own licence in its own repository.

## Contact

Questions, corrections and requests go to ${CONTACT_EMAIL}. See [Contact](/contact) for details.
`,
};

const contact: TrustPage = {
  key: 'contact',
  path: '/contact',
  title: 'Contact',
  description:
    'How to reach Peninsula School District about its AI work: questions, corrections, partnerships and the software we publish.',
  body: `${SITE_NAME} is published by Peninsula School District in Gig Harbor, Washington.

## Email

Write to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) about anything on this site:

- questions from another district about adapting our guidance, software or the Open Adaptive District protocol
- corrections, if something here is wrong or out of date
- requests to speak, present or collaborate
- accessibility problems with any page

We do not use a contact form, so nothing you send is stored by this website.

## Software and code

Most of the software we build is open source. Bugs and feature requests for a specific product are best filed as an issue in its repository on GitHub, under [github.com/psd401](https://github.com/psd401). Problems with this website itself go to [psd401/psd401.ai](https://github.com/psd401/psd401.ai/issues).

## Field Notes

To get new writing by email, sign up for Field Notes on the [Writing](/writing) page. Every message carries a one-click unsubscribe link.

## Elsewhere

- GitHub: [github.com/psd401](https://github.com/psd401)
- LinkedIn: [Peninsula School District](https://linkedin.com/company/peninsula-school-district)
- Facebook: [psd401](https://facebook.com/psd401)

For district business unrelated to AI, such as enrollment, schools or records requests, contact Peninsula School District directly through its main website, [psd401.net](https://www.psd401.net).
`,
};

const privacy: TrustPage = {
  key: 'privacy',
  path: '/privacy',
  title: 'Privacy',
  description:
    'What this website collects, why, where it is kept and how to have it removed: analytics, the Field Notes subscriber list, and server logs.',
  body: `This page describes what ${SITE_NAME} (${SITE_URL}) collects when you visit it. It covers this website only. Peninsula School District's student and staff data practices are governed by district policy and are not described here.

## In short

You can read every page on this site without an account and without giving us anything. We collect three kinds of information: usage statistics through Google Analytics, the request logs every web host keeps, and the email address of anyone who signs up for Field Notes. We do not sell any of it, and we do not use any of it for advertising.

## Usage statistics

The site uses Google Analytics to count visits and see which pages are read. It loads after the page has finished loading, and it sets cookies in your browser. Google receives your IP address, browser details and the pages you view. We use the reports to decide what to write and what to fix. You can block it with any content blocker, or with Google's [opt-out browser add-on](https://tools.google.com/dlpage/gaoptout), and the site works the same.

## Field Notes subscribers

If you sign up for Field Notes on the Writing page, we store:

- your email address
- a random identifier
- whether you have confirmed the subscription
- a hashed confirmation token, until you confirm
- an unsubscribe key
- when you signed up and confirmed

These are kept in the district's own Amazon Web Services account, and email is sent through Amazon SES. No mailing-list company is involved. We send one confirmation email, and nothing else until you confirm. Unconfirmed sign-ups expire after seven days: the confirmation link stops working, and Amazon's automatic expiry deletes the record, usually within a few days after that. Unsubscribing, through the link in any email, deletes your record outright; we keep no list of former subscribers. The table has point-in-time recovery switched on, so a deleted record can remain in its backups for up to 35 days. Your email address never appears in a link we send you, so it does not reach server logs or analytics.

## Server logs

The site is hosted on Amazon Web Services. Like any web host, it records requests in server logs, including IP address, the page requested and browser details, which are used to keep the site running and secure.

## Your browser

The light and dark theme setting is stored in your browser's local storage. It is never sent to us.

## Children

This site is written for adults: educators, district staff and families. It does not knowingly collect information from children.

## Questions and removal

To ask what we hold about you, or to have it removed, write to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).
`,
};

export const TRUST_PAGES: Record<TrustPageKey, TrustPage> = { about, contact, privacy };

export function isTrustPageKey(key: string): key is TrustPageKey {
  return Object.hasOwn(TRUST_PAGES, key);
}
