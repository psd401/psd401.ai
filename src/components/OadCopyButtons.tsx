'use client';

import React from 'react';
import { createPortal } from 'react-dom';

/**
 * "Copy" buttons for the templates in the Open Adaptive District documents.
 *
 * The documents are markdown rendered to HTML on the server, so they cannot
 * carry React components. Instead a document marks where a button goes with
 * an empty placeholder straight before the template, which is a blockquote:
 *
 *   <div class="oad-copy" data-copy-label="Copy the build plan"></div>
 *
 *   > **Team:** \_\_\_ …
 *
 * This component finds those placeholders after hydration and renders a
 * button into each that copies the blockquote after it. The printable copy
 * has no script, so the placeholder stays empty there and takes no space.
 */
export default function OadCopyButtons() {
  const [slots, setSlots] = React.useState<HTMLElement[]>([]);

  React.useEffect(() => {
    setSlots(
      Array.from(document.querySelectorAll<HTMLElement>('.oad-doc .oad-copy')).filter(
        slot => slot.nextElementSibling?.tagName === 'BLOCKQUOTE'
      )
    );
  }, []);

  return (
    <>
      {slots.map((slot, i) =>
        createPortal(
          <CopyButton
            target={slot.nextElementSibling as HTMLElement}
            label={slot.dataset.copyLabel ?? 'Copy the template'}
          />,
          slot,
          String(i)
        )
      )}
    </>
  );
}

function CopyButton({ target, label }: { target: HTMLElement; label: string }) {
  const [state, setState] = React.useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      // innerText keeps the paragraph breaks, so the paste reads as a form.
      await navigator.clipboard.writeText(target.innerText.trim());
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
