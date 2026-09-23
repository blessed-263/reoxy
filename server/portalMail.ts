import { REOXY_COMPANY } from '../src/data/companyInfo.ts';
import { deskOperators } from './supabaseAuth.ts';
import type { PortalQuote } from './portalQuotes.ts';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function itemsTable(quote: PortalQuote) {
  const rows = quote.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${escapeHtml(item.title)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${money(item.unitPrice)}</td>
        </tr>`
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>`;
}

function customerQuoteHtml(quote: PortalQuote) {
  const company = REOXY_COMPANY;
  const notes = quote.notes
    ? `<p style="margin-top:16px;color:#475569;font-size:14px;"><strong>Notes</strong><br/>${escapeHtml(quote.notes)}</p>`
    : '';
  return `<!doctype html>
<html><body style="margin:0;background:#eef1f5;font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:24px;padding:28px;border:1px solid #e2e8f0;">
    <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#0369a1;">${escapeHtml(company.brandName)} quote</p>
    <h1 style="margin:8px 0 0;font-size:22px;">${escapeHtml(quote.id)}</h1>
    <p style="margin:8px 0 20px;color:#64748b;font-size:14px;">${escapeHtml(company.name)} · ${escapeHtml(company.contacts.email)}</p>
    ${itemsTable(quote)}
    <p style="margin:20px 0 0;font-size:18px;font-weight:600;">Total ${money(quote.total)} USD</p>
    ${notes}
    <p style="margin:24px 0 0;font-size:12px;color:#64748b;">This is a quote, not an invoice. Payment is due after we confirm the order.</p>
  </div>
</body></html>`;
}

function operatorQuoteHtml(quote: PortalQuote) {
  const customer = quote.customer;
  return `<!doctype html>
<html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a;">
  <p>New portal order <strong>${escapeHtml(quote.id)}</strong></p>
  <p>
    ${escapeHtml(customer?.fullName || '')}<br/>
    ${escapeHtml(customer?.email || '')}<br/>
    ${escapeHtml(customer?.phone || '')}
  </p>
  ${itemsTable(quote)}
  <p><strong>Total ${money(quote.total)} USD</strong></p>
  ${quote.notes ? `<p>Notes: ${escapeHtml(quote.notes)}</p>` : ''}
</body></html>`;
}

async function sendResend(payload: { to: string[]; subject: string; html: string }) {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const from = String(process.env.RESEND_FROM || '').trim();
  if (!apiKey || !from || !payload.to.length) {
    console.warn('[portal] Resend skipped (RESEND_API_KEY / RESEND_FROM unset)');
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('[portal] Resend error', res.status, body);
    return false;
  }
  return true;
}

export async function sendQuoteEmails(quote: PortalQuote) {
  const customerEmail = quote.customer?.email;
  if (customerEmail) {
    await sendResend({
      to: [customerEmail],
      subject: `${REOXY_COMPANY.brandName} quote ${quote.id}`,
      html: customerQuoteHtml(quote),
    });
  }
  const operators = deskOperators();
  const alertTo = operators.length ? operators : [REOXY_COMPANY.contacts.email].filter(Boolean);
  await sendResend({
    to: alertTo,
    subject: `New order ${quote.id}`,
    html: operatorQuoteHtml(quote),
  });
}
