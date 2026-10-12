export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; prefix: boolean }> = {
  USD: { symbol: '$', rate: 1.0, prefix: true },
};

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatFullCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function formatPercent(val: number): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

/**
 * Sanitizes a string for CSV export to prevent Formula Injection (CWE-1236).
 * Prepend a single quote if the value begins with formula characters: =, +, -, @, \t, \r
 */
function sanitizeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  
  // Guard against formula injection triggers
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  if (formulaTriggers.some((char) => str.startsWith(char))) {
    str = `'${str}`;
  }

  // Escape inner quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Type-safe CSV export utility with formula injection mitigation and object URL cleanup.
 */
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string): void {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => sanitizeCsvValue(obj[header]))
      .join(',')
  );

  const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const csvContent = [headerRow, ...rows].join('\r\n');
  
  // Prepend UTF-8 BOM for proper character decoding in Excel
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedFilename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Prevent memory leak by revoking the Object URL after download trigger
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}
