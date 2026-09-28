import React from 'react';
import type { Metadata } from 'next';
import { Breadcrumb, SectionRule } from '@/components/ds';
import { ACTION_PLAN_PATH, getActionPlan } from '@/lib/oad';
import JsonLd, { createArticleSchema, createBreadcrumbSchema } from '@/components/JsonLd';

const DESCRIPTION =
  'The action plan Peninsula School District submitted for the Google & GSV Ed Leader Fellowship: building the Open Adaptive District, and sharing it with other districts.';

export async function generateMetadata(): Promise<Metadata> {
  const plan = await getActionPlan();
  return {
    title: plan.title,
    description: DESCRIPTION,
    alternates: { canonical: ACTION_PLAN_PATH },
    openGraph: {
      type: 'article',
      title: plan.title,
      description: DESCRIPTION,
      url: ACTION_PLAN_PATH,
    },
  };
}

/**
 * The fellowship action plan, inside the site chrome.
 *
 * The document is shown as submitted — see getActionPlan in src/lib/oad.ts.
 * Its own classes (monograph, field, metric-ledger, chronology, …) are styled
 * by the .oad-plan rules in src/styles/ds.css, on top of .oad-doc, so it
 * reads like the rest of the site without a word of it changing.
 */
export default async function ActionPlanPage() {
  const plan = await getActionPlan();

  return (
    <article data-section="oad">
      <JsonLd
        data={[
          createArticleSchema({
            title: plan.title,
            description: DESCRIPTION,
            url: ACTION_PLAN_PATH,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Open Adaptive District', url: '/open-adaptive-district' },
            { name: 'Fellowship action plan', url: ACTION_PLAN_PATH },
          ]),
        ]}
      />

      <div
        style={{
          borderTop: 'var(--border-rule) solid var(--sec)',
          background: 'var(--sec-ground)',
          padding: '14px var(--gutter-page)',
          borderBottom: '1px solid var(--hairline-faint)',
        }}
      >
        <Breadcrumb
          items={[
            { label: '05 Open Adaptive District', href: '/open-adaptive-district' },
            { label: 'Fellowship action plan' },
          ]}
        />
      </div>

      <SectionRule as="section" style={{ borderTop: 0 }}>
        {/* SAFE: plan.html is authored markup read from this repository at
            build time (public/openadaptivedistrict/first-draft/). It is never
            user input and never fetched at runtime. */}
        <div className="oad-doc oad-plan" dangerouslySetInnerHTML={{ __html: plan.html }} />
      </SectionRule>
    </article>
  );
}
