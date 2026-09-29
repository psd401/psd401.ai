import React from 'react';

/**
 * The Open Adaptive District cycle: eight weeks drawn as a ring, one segment
 * per week, with the phase labels as real text around it so they stay
 * readable at phone width and to screen readers.
 *
 * This deliberately borrows three other section colours on a page that is
 * otherwise violet only. The phases need telling apart at a glance, and this
 * was chosen over a single-colour version. The colours are borrowed, not
 * linked — nothing here points at Writing, Software or Presentations.
 */

type Phase = {
  key: 'plan' | 'do' | 'share' | 'between';
  weeks: string;
  name: string;
  body: string;
  /** First and last week of the phase, 1-based. */
  span: [number, number];
  color: string;
};

const PHASES: Phase[] = [
  {
    key: 'plan',
    weeks: 'Week 1',
    name: 'Plan',
    body: 'Pick one problem and write a one-page build plan.',
    span: [1, 1],
    color: 'var(--sec-writing)',
  },
  {
    key: 'do',
    weeks: 'Weeks 2–5',
    name: 'Do',
    body: 'Build it and use it in real work. Post a check-in every Friday.',
    span: [2, 5],
    color: 'var(--sec-software)',
  },
  {
    key: 'share',
    weeks: 'Week 6',
    name: 'Study & share',
    body: 'The agent drafts the wrap-up. The team makes the call:',
    span: [6, 6],
    color: 'var(--sec-presentations)',
  },
  {
    key: 'between',
    weeks: 'Weeks 7–8',
    name: 'Between cycles',
    body: 'Leaders read every wrap-up and set the next focus.',
    span: [7, 8],
    color: 'var(--hairline)',
  },
];

const OUTCOMES = ['Keep it', 'Stop it', 'Run it again'];

const C = 200; // centre of the 400 × 400 viewBox
const R = 150;
const STROKE = 46;
const GAP_DEG = 1.2;

/** Clockwise from twelve o'clock; week k starts at (k - 1) × 45°. */
const angleOf = (week: number) => -90 + 45 * (week - 1);

function point(deg: number, radius = R): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)];
}

function arcPath(fromWeek: number, toWeek: number): string {
  const a1 = angleOf(fromWeek) + GAP_DEG;
  const a2 = angleOf(toWeek + 1) - GAP_DEG;
  const [x1, y1] = point(a1);
  const [x2, y2] = point(a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function Ring() {
  const [ax, ay] = point(-90 - 0.6);
  return (
    <svg
      viewBox="0 0 400 400"
      className="oad-cycle__ring"
      role="img"
      aria-label="An eight-week cycle: six weeks of work, then two weeks between cycles."
    >
      {PHASES.map(p => (
        <path
          key={p.key}
          d={arcPath(p.span[0], p.span[1])}
          fill="none"
          style={{ stroke: p.color }}
          strokeWidth={STROKE}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const week = i + 1;
        const [x, y] = point(angleOf(week) + 22.5);
        return (
          <text
            key={week}
            x={x.toFixed(2)}
            y={(y + 5).toFixed(2)}
            textAnchor="middle"
            className="oad-cycle__week"
            style={{ fill: week >= 7 ? 'var(--ink)' : 'var(--on-accent)' }}
          >
            {week}
          </text>
        );
      })}
      {/* Direction: the end of week 8 runs back into week 1. */}
      <path
        d={`M ${ax - 12} ${ay - 11} L ${ax + 4} ${ay} L ${ax - 12} ${ay + 11} Z`}
        style={{ fill: 'var(--sec)' }}
      />
      <text x={C} y={C - 2} textAnchor="middle" className="oad-cycle__total">
        8 weeks
      </text>
      <text x={C} y={C + 26} textAnchor="middle" className="oad-cycle__split">
        6 WORKING · 2 BETWEEN
      </text>
    </svg>
  );
}

export default function OadCycle() {
  return (
    <div className="oad-cycle">
      <div className="oad-cycle__centre">
        <Ring />
      </div>
      {PHASES.map(p => (
        <div key={p.key} className={`oad-cycle__phase oad-cycle__phase--${p.key}`}>
          <div
            className="ds-label ds-label--sm"
            style={{ color: p.key === 'between' ? undefined : p.color }}
          >
            {p.weeks}
          </div>
          <h3 className="oad-cycle__name">{p.name}</h3>
          <p className="oad-cycle__body">{p.body}</p>
          {p.key === 'share' && (
            <ul className="oad-cycle__outcomes">
              {OUTCOMES.map(o => (
                <li key={o} className="ds-label ds-label--sm">
                  {o}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
