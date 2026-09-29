'use client';

/**
 * The confirm and unsubscribe pages' single interaction.
 *
 * The emailed link carries its id and token in the URL fragment (#id=…&t=…).
 * Fragments are never sent to a server, so they stay out of access logs and
 * Referer headers. This component reads the fragment, then immediately
 * replaces the URL with the bare path so the token does not linger in the
 * address bar, browser history, or analytics page views.
 *
 * Nothing happens until the person presses the button — see the note in
 * src/app/api/field-notes/confirm/route.ts about link-scanning mail filters.
 */
import React from 'react';
import { Button } from '@/components/ds';
import { NEWSLETTER } from '@/lib/newsletter';

type Mode = 'confirm' | 'unsubscribe';
type State = 'loading' | 'ready' | 'working' | 'done' | 'expired' | 'invalid' | 'error';

const COPY: Record<Mode, { button: string; done: string; doneDetail: string }> = {
  confirm: {
    button: 'Confirm my subscription',
    done: 'You are subscribed.',
    doneDetail: `${NEWSLETTER.name} will come to this address. Every issue has a link to unsubscribe.`,
  },
  unsubscribe: {
    button: 'Unsubscribe',
    done: 'You are unsubscribed.',
    doneDetail: 'Your address has been deleted from the list. Nothing more will be sent to it.',
  },
};

export default function FieldNotesAction({ mode }: { mode: Mode }) {
  const [state, setState] = React.useState<State>('loading');
  const pair = React.useRef<{ id: string; secret: string } | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const id = params.get('id');
    const secret = params.get(mode === 'confirm' ? 't' : 'k');
    // Strip the fragment before anything else can read it.
    window.history.replaceState(null, '', window.location.pathname);
    if (id && secret) {
      pair.current = { id, secret };
      setState('ready');
    } else {
      setState('invalid');
    }
  }, [mode]);

  async function act() {
    if (!pair.current) return;
    setState('working');
    try {
      const body =
        mode === 'confirm'
          ? { id: pair.current.id, token: pair.current.secret }
          : { id: pair.current.id, key: pair.current.secret };
      const res = await fetch(`/api/field-notes/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { outcome?: string };
      if (data.outcome === 'confirmed' || data.outcome === 'removed') setState('done');
      else if (data.outcome === 'expired') setState('expired');
      else if (data.outcome === 'invalid' || res.status === 400) setState('invalid');
      else setState('error');
    } catch {
      setState('error');
    }
  }

  const copy = COPY[mode];

  return (
    <div aria-live="polite" style={{ maxWidth: '58ch' }}>
      {state === 'loading' && <p className="ds-lead">Checking the link…</p>}

      {(state === 'ready' || state === 'working') && (
        <Button variant="solid" size="lg" onClick={act} disabled={state === 'working'}>
          {state === 'working' ? 'One moment…' : copy.button}
        </Button>
      )}

      {state === 'done' && (
        <>
          <p className="ds-lead" style={{ marginBottom: 12, opacity: 1 }}>
            <strong>{copy.done}</strong>
          </p>
          <p className="ds-lead">{copy.doneDetail}</p>
        </>
      )}

      {state === 'expired' && (
        <p className="ds-lead">
          This link has expired. Confirmation links last seven days — sign up again on the{' '}
          <a href="/writing" style={{ color: 'var(--sec)' }}>
            Writing
          </a>{' '}
          page and we will send a fresh one.
        </p>
      )}

      {state === 'invalid' && (
        <p className="ds-lead">
          This link is not valid. It may have been copied incompletely, or already replaced by a
          newer one. Email hagelk@psd401.net and we will sort it out.
        </p>
      )}

      {state === 'error' && (
        <p className="ds-lead" role="alert">
          Something went wrong on our side. Try again in a minute, or email hagelk@psd401.net.
        </p>
      )}
    </div>
  );
}
