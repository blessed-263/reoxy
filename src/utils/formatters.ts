import { Currency, Receipt } from '../types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const rounded = Math.round(amount * 100) / 100;
  switch (currency) {
    case 'RUB':
      return `${rounded.toLocaleString('ru-RU')} ₽`;
    case 'USD':
      return `$${rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${rounded.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'GBP':
      return `£${rounded.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return `${rounded} ${currency}`;
  }
};

export const generateReceiptId = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ROX-${year}-${randomNum}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatTurnaroundSpeed = (speed: string): string => {
  switch (speed) {
    case 'rush_24h':
      return '24hr Rush Expedited';
    case 'typical_48h':
      return '48hr Typical Turnaround (Agreed)';
    case 'standard_3d':
      return '3-5 Business Days';
    case 'extended':
      return 'Extended Custom Schedule';
    default:
      return speed;
  }
};

export const generateReceiptTextSummary = (receipt: Receipt): string => {
  const lines = [
    `📄 *OFFICIAL RECEIPT / INVOICE*`,
    `*РеOкси AO*`,
    `Certified Translation, Printing & Document Preparation`,
    `Website: reoxy.co.zw | Tel: +7 985 052-04-66`,
    `Address: Studencheskaya 33k6`,
    `----------------------------------------`,
    `Receipt No: ${receipt.id}`,
    `Date Issued: ${formatDate(receipt.date)}`,
    `Agreed Turnaround: ${formatDate(receipt.turnaroundDate)} (${formatTurnaroundSpeed(receipt.turnaroundSpeed)})`,
    `Client: ${receipt.client.fullName || 'Valued Client'}`,
    receipt.client.institution ? `Institution: ${receipt.client.institution}` : '',
    receipt.client.phone ? `Phone: ${receipt.client.phone}` : '',
    `----------------------------------------`,
    `*SERVICES & ITEMS:*`
  ].filter(Boolean);

  receipt.items.forEach((item, index) => {
    const stampNotice = item.hasStamps ? ' [All stamps included]' : '';
    lines.push(`${index + 1}. ${item.title} (x${item.quantity}) - ${formatCurrency(item.total, receipt.currency)}${stampNotice}`);
    if (item.description) {
      lines.push(`   _${item.description}_`);
    }
  });

  lines.push(`----------------------------------------`);
  lines.push(`Subtotal: ${formatCurrency(receipt.subtotal, receipt.currency)}`);
  
  if (receipt.discountTotal > 0) {
    const promoNote = receipt.promotions.discountPercent > 0 ? ` (${receipt.promotions.discountPercent}% Academic Promo)` : '';
    lines.push(`Discount Applied${promoNote}: -${formatCurrency(receipt.discountTotal, receipt.currency)}`);
  }

  lines.push(`*TOTAL: ${formatCurrency(receipt.total, receipt.currency)}*`);
  lines.push(`Amount Paid: ${formatCurrency(receipt.amountPaid, receipt.currency)}`);
  
  if (receipt.balanceDue > 0) {
    lines.push(`*BALANCE DUE: ${formatCurrency(receipt.balanceDue, receipt.currency)}*`);
  } else {
    lines.push(`Status: ✅ PAID IN FULL`);
  }

  const perks = [];
  if (receipt.promotions.freeTShirt2026) perks.push('🎁 Free 2026 Graduate T-Shirt included');
  if (receipt.promotions.spotifyPremium) perks.push('🎵 1 Month Spotify Premium Bonus');
  if (receipt.promotions.freeLegalConsultation) perks.push('⚖️ Free Legalisation Consultation');

  if (perks.length > 0) {
    lines.push(`----------------------------------------`);
    lines.push(`*BONUS PERKS APPLIED:*`);
    perks.forEach(p => lines.push(p));
  }

  lines.push(`----------------------------------------`);
  lines.push(`Official Seal: ${receipt.officialStamp ? 'VERIFIED & CERTIFIED' : 'Standard'}`);
  lines.push(`Beware of fraudulent services. Check official channels at reoxy.co.zw.`);
  lines.push(`© 2026 РеOкси AO`);

  return lines.join('\n');
};
