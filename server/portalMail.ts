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

function siteUrl() {
  return String(process.env.FRONTEND_URL || process.env.VITE_APP_URL || 'https://reoxy.co.zw').replace(/\/$/, '');
}

function formatIssuedOn(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const FONT_SANS = "Arial, Helvetica, sans-serif";
const FONT_SERIF = "Georgia, 'Times New Roman', Times, serif";

function letterShell(title: string, body: string) {
  const company = REOXY_COMPANY;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3efe8;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(title)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe8;padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#fffefb;border:1px solid #e4ddd2;">
          <tr>
            <td style="height:4px;background:#1e293b;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 36px 16px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${FONT_SANS};">
                    <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;color:#0f172a;">${escapeHtml(company.brandName)}</p>
                    <p style="margin:6px 0 0;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;">Technologies</p>
                  </td>
                  <td align="right" style="font-family:${FONT_SANS};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">
                    AO РеOкси
                  </td>
                </tr>
              </table>
              <div style="margin:22px 0 0;height:1px;background:#e4ddd2;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          ${body}
          <tr>
            <td style="padding:0 36px 36px 36px;">
              <div style="height:1px;background:#e4ddd2;font-size:0;line-height:0;">&nbsp;</div>
              <p style="margin:18px 0 0;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:#64748b;">
                ${escapeHtml(company.name)} · ${escapeHtml(company.contacts.website)}<br/>
                ${escapeHtml(company.contacts.email)} · ${escapeHtml(company.contacts.primaryPhone)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(quote: PortalQuote) {
  const rows = quote.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #efe9e0;font-family:${FONT_SANS};vertical-align:top;">
            <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${escapeHtml(item.title)}</p>
            ${item.description ? `<p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:#64748b;">${escapeHtml(item.description)}</p>` : ''}
          </td>
          <td style="padding:14px 0 14px 16px;border-bottom:1px solid #efe9e0;font-family:${FONT_SANS};font-size:15px;font-weight:700;color:#0f172a;text-align:right;white-space:nowrap;vertical-align:top;">
            ${money(item.unitPrice)}
          </td>
        </tr>`
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 8px;font-family:${FONT_SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">Services</td>
        <td style="padding:0 0 8px;font-family:${FONT_SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;text-align:right;">USD</td>
      </tr>
      ${rows}
      <tr>
        <td style="padding:18px 0 0;font-family:${FONT_SANS};font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">Total</td>
        <td style="padding:18px 0 0;font-family:${FONT_SERIF};font-size:22px;color:#0f172a;text-align:right;white-space:nowrap;">${money(quote.total)}</td>
      </tr>
    </table>`;
}

function notesBlock(notes: string) {
  if (!notes) return '';
  return `
    <p style="margin:22px 0 0;font-family:${FONT_SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">Notes</p>
    <p style="margin:8px 0 0;font-family:${FONT_SERIF};font-size:15px;line-height:1.55;color:#334155;">${escapeHtml(notes)}</p>`;
}

function buttonRow(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr>
        <td style="background:#0f172a;border-radius:999px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-family:${FONT_SANS};font-size:13px;font-weight:700;letter-spacing:0.01em;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

function customerQuoteHtml(quote: PortalQuote) {
  const name = quote.customer?.fullName || 'there';
  const issued = formatIssuedOn(quote.createdAt);
  const portalHref = `${siteUrl()}/portal`;

  return letterShell(
    `${REOXY_COMPANY.brandName} quote ${quote.id}`,
    `
      <tr>
        <td style="padding:8px 36px 8px 36px;">
          <p style="margin:0;font-family:${FONT_SERIF};font-size:28px;line-height:1.15;color:#0f172a;">Issued, sealed,<br/><em style="font-style:italic;color:#1e293b;">and verifiable.</em></p>
          <p style="margin:18px 0 0;font-family:${FONT_SANS};font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">
            Quote ${escapeHtml(quote.id)}${issued ? ` · ${escapeHtml(issued)}` : ''}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 36px 32px 36px;">
          <p style="margin:0;font-family:${FONT_SANS};font-size:15px;line-height:1.65;color:#334155;">
            Dear ${escapeHtml(name)}, thank you for your request. This is an estimate for the services below. We will confirm the order before any payment is due.
          </p>
          <div style="margin:24px 0 0;">${itemsTable(quote)}</div>
          ${notesBlock(quote.notes)}
          ${buttonRow(portalHref, 'Open your portal')}
          <p style="margin:22px 0 0;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:#94a3b8;">
            This is a quote, not an invoice. Scan the QR on any issued document to confirm it.
          </p>
        </td>
      </tr>`
  );
}

function operatorQuoteHtml(quote: PortalQuote) {
  const customer = quote.customer;
  const deskHref = `${siteUrl()}/desk`;
  const issued = formatIssuedOn(quote.createdAt);

  return letterShell(
    `New quote ${quote.id}`,
    `
      <tr>
        <td style="padding:8px 36px 8px 36px;">
          <p style="margin:0;font-family:${FONT_SANS};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#7f1d1d;">Desk notice</p>
          <p style="margin:10px 0 0;font-family:${FONT_SERIF};font-size:26px;line-height:1.2;color:#0f172a;">New quote received</p>
          <p style="margin:12px 0 0;font-family:${FONT_SANS};font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">
            ${escapeHtml(quote.id)}${issued ? ` · ${escapeHtml(issued)}` : ''}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 36px 32px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ee;border:1px solid #e4ddd2;">
            <tr>
              <td style="padding:16px 18px;">
                <p style="margin:0;font-family:${FONT_SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">Customer</p>
                <p style="margin:8px 0 0;font-family:${FONT_SERIF};font-size:18px;color:#0f172a;">${escapeHtml(customer?.fullName || 'Unknown')}</p>
                <p style="margin:8px 0 0;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:#475569;">
                  ${escapeHtml(customer?.email || '—')}<br/>
                  ${escapeHtml(customer?.phone || '—')}
                </p>
              </td>
            </tr>
          </table>
          <div style="margin:22px 0 0;">${itemsTable(quote)}</div>
          ${notesBlock(quote.notes)}
          ${buttonRow(deskHref, 'Open desk')}
        </td>
      </tr>`
  );
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
  const company = REOXY_COMPANY.brandName;
  const customerEmail = quote.customer?.email;
  const customerName = quote.customer?.fullName || 'customer';
  if (customerEmail) {
    await sendResend({
      to: [customerEmail],
      subject: `Your quote ${quote.id} · ${company}`,
      html: customerQuoteHtml(quote),
    });
  }
  const operators = deskOperators();
  const alertTo = operators.length ? operators : [REOXY_COMPANY.contacts.email].filter(Boolean);
  await sendResend({
    to: alertTo,
    subject: `New quote ${quote.id} · ${customerName}`,
    html: operatorQuoteHtml(quote),
  });
}
