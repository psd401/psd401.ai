/**
 * The confirmation email. House voice: plain, specific, no promises we have
 * not made. It deliberately states no send cadence.
 */
import { CONFIRM_WINDOW_DAYS } from './core';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function confirmationEmail(confirmUrl: string) {
  const subject = 'Confirm your Field Notes subscription';

  const text = `Someone — hopefully you — asked for Field Notes from Peninsula School District to be sent to this address.

Confirm it here:
${confirmUrl}

Field Notes is one thing we built, one thing we learned, and one thing we would do differently.

If this was not you, ignore this email. Nothing is sent to an address until it is confirmed, and this request expires in ${CONFIRM_WINDOW_DAYS} days.

Peninsula School District · Gig Harbor, Washington
https://psd401.ai
`;

  const url = escape(confirmUrl);
  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:32px 20px;background:#ffffff;color:#16202b;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6">
<div style="max-width:560px;margin:0 auto;border-top:6px solid #2a57c9;padding-top:24px">
<p style="margin:0 0 16px">Someone — hopefully you — asked for <strong>Field Notes</strong> from Peninsula School District to be sent to this address.</p>
<p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;background:#2a57c9;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px">Confirm my subscription</a></p>
<p style="margin:0 0 16px">Field Notes is one thing we built, one thing we learned, and one thing we would do differently.</p>
<p style="margin:0 0 24px;color:#5b6570">If this was not you, ignore this email. Nothing is sent to an address until it is confirmed, and this request expires in ${CONFIRM_WINDOW_DAYS} days.</p>
<p style="margin:0;color:#5b6570;font-size:13px">Peninsula School District · Gig Harbor, Washington · <a href="https://psd401.ai" style="color:#5b6570">psd401.ai</a></p>
</div></body></html>`;

  return { subject, text, html };
}
