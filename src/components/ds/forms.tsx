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
  className?: string;
};

/**
 * The Field Notes sign-up. Appears once per page, at the foot of a section.
 * The submit is a mono word, not a filled button — it sits on the input rule.
 *
 * Posts to NEXT_PUBLIC_SUBSCRIBE_ENDPOINT. With no endpoint configured the
 * form renders disabled and says so, rather than silently swallowing an
 * address — a signup box that does nothing is worse than no signup box.
 */
export function SubscribeForm({
  title = 'Field Notes',
  blurb,
  cta = 'Subscribe →',
  className,
}: SubscribeFormProps) {
  const endpoint = process.env.NEXT_PUBLIC_SUBSCRIBE_ENDPOINT;
  const [state, setState] = React.useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [email, setEmail] = React.useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!endpoint || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  const message =
    state === 'done'
      ? 'Subscribed. Check your inbox to confirm.'
      : state === 'error'
        ? 'That did not go through. Try again, or email hagelk@psd401.net.'
        : !endpoint
          ? 'Sign-up is not connected yet — email hagelk@psd401.net to be added.'
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
            disabled={!endpoint || state === 'done'}
            onChange={e => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="ds-subscribe__submit"
            disabled={!endpoint || state === 'sending' || state === 'done'}
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
