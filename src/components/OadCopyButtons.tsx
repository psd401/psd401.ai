'use client';

import React from 'react';
import { createPortal } from 'react-dom';

/**
 * "Copy" buttons for the templates in the Open Adaptive District documents.
 *
 * The documents are authored HTML injected into the page, so they cannot
 * carry React components. Instead a document marks where a button goes with
 * an empty placeholder naming the template to copy:
 *
 *   <div class="oad-copy" data-copy-target="build-plan" data-copy-label="Copy the build plan"></div>
 *   <blockquote id="build-plan">…</blockquote>
 *
 * This component finds those placeholders after hydration and renders a
 * button into each. The standalone printable copy has no script, so the
 * placeholder stays empty there and takes no space.
 */
export default function OadCopyButtons() {
  const [slots, setSlots] = React.useState<HTMLElement[]>([]);

  React.useEffect(() => {
    setSlots(
      Array.from(document.querySelectorAll<HTMLElement>('.oad-doc .oad-copy[data-copy-target]'))
    );
  }, []);

  return (
    <>
      {slots.map(slot =>
        createPortal(
          <CopyButton
            targetId={slot.dataset.copyTarget!}
            label={slot.dataset.copyLabel ?? 'Copy the template'}
          />,
          slot,
          slot.dataset.copyTarget
        )
      )}
    </>
  );
}

function CopyButton({ targetId, label }: { targetId: string; label: string }) {
  const [state, setState] = React.useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    const el = document.getElementById(targetId);
    if (!el) return setState('failed');
    try {
      // innerText keeps the paragraph breaks, so the paste reads as a form.
      await navigator.clipboard.writeText(el.innerText.trim());
      setState('copied');
      window.setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('failed');
    }
  }

  return (
    <>
      <button type="button" className="ds-btn ds-btn--outline ds-btn--sm" onClick={copy}>
        {state === 'copied' ? 'Copied' : label}
      </button>
      <span role="status" className="oad-copy__status">
        {state === 'copied'
          ? 'Copied. Paste it into your team’s chat space or a doc.'
          : state === 'failed'
            ? 'Could not copy. Select the text below and copy it instead.'
            : ''}
      </span>
    </>
  );
}
