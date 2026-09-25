'use client';

/**
 * Design system — form components.
 *
 * Ported from Claude Design project 5db21ee4, `components/forms/`:
 * TextInput · SubscribeForm
 *
 * Inputs are rules, not boxes.
 */
import React from 'react';

/** Accepts any `cond && 'class'` expression, including ReactNode conditions. */
const cx = (...parts: unknown[]) =>
  parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');

/* ------------------------------------------------------------ TextInput */

type TextInputProps = {
  variant?: 'underline' | 'boxed';
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ variant = 'underline', className, ...rest }: TextInputProps) {
  return (
    <input
      className={cx('ds-input', variant === 'boxed' && 'ds-input--boxed', className)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------- SubscribeForm */

type SubscribeFormProps = {
  title?: string;
  blurb?: string;
  cta?: string;
  /**
   * Whether sign-up is connected. Decided on the server by
   * isSubscribeConfigured() in src/lib/subscribe.ts and passed down, because
   * the provider credentials that decide it must never reach the browser.
   */
  enabled: boolean;
  className?: string;
};

const FALLBACK = 'hagelk@psd401.net';

/**
 * The Field Notes sign-up. Appears once per page, at the foot of a section.
 * The submit is a mono word, not a filled button — it sits on the input rule.
 *
 * Posts to /api/subscribe. With sign-up not yet connected, the form renders
 * disabled and says so, rather than silently swallowing an address.
 */
export function SubscribeForm({
  title = 'Field Notes',
  blurb,
  cta = 'Subscribe →',
  enabled,
  className,
}: SubscribeFormProps) {
  const [state, setState] = React.useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [email, setEmail] = React.useState('');
  const [company, setCompany] = React.useState('');
  const openedAt = React.useRef<number>(0);

  React.useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enabled || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, elapsed: Date.now() - openedAt.current }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  const message =
    state === 'done'
      ? 'Check your inbox — we sent a link to confirm your address.'
      : state === 'error'
        ? `That did not go through. Try again, or email ${FALLBACK}.`
        : !enabled
          ? `Sign-up is not connected yet — email ${FALLBACK} to be added.`
          : null;

  return (
    <div className={cx('ds-subscribe', className)}>
      <div>
        <h2 className="ds-subscribe__title">{title}</h2>
        {blurb && <p className="ds-subscribe__blurb">{blurb}</p>}
      </div>
      <div>
        <form className="ds-subscribe__form" onSubmit={onSubmit}>
          <label htmlFor="subscribe-email" className="sr-only">
            Email address
          </label>
          <TextInput
            id="subscribe-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@district.org"
            value={email}
            disabled={!enabled || state === 'done'}
            onChange={e => setEmail(e.target.value)}
          />
          {/* Honeypot: off-screen and out of the tab order, so only bots fill it. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
            <input
              type="text"
              name="company"
              aria-label="Leave this field empty"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="ds-subscribe__submit"
            disabled={!enabled || state === 'sending' || state === 'done'}
          >
            {state === 'sending' ? 'Sending…' : cta}
          </button>
        </form>
        {message && (
          <p className="ds-subscribe__note" role={state === 'error' ? 'alert' : 'status'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
