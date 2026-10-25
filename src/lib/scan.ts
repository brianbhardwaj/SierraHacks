export type ScanTarget = { barcode?: string; query: string; qr: string }

/** Turn a barcode or QR payload into a product lookup. */
export function interpretScan(raw: string): ScanTarget {
  const text = raw.trim()
  const digits = text.replace(/\D/g, '')
  if (/^\d{8,14}$/.test(text.replace(/\s/g, '')) || (digits.length >= 8 && digits.length <= 14 && /^\d+$/.test(text.replace(/\s/g, '')))) {
    return { barcode: digits, query: digits, qr: text }
  }
  const embedded = text.match(/\b(\d{8,14})\b/)
  if (embedded) return { barcode: embedded[1], query: embedded[1], qr: text }
  try {
    const u = new URL(text)
    const fromQuery = u.searchParams.get('ean') || u.searchParams.get('gtin') || u.searchParams.get('barcode') || u.searchParams.get('code')
    if (fromQuery && /^\d{8,14}$/.test(fromQuery)) return { barcode: fromQuery, query: fromQuery, qr: text }
    const slug = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || '').replace(/[-_]/g, ' ')
    return { query: slug || u.hostname, qr: text }
  } catch {
    return { query: text, qr: text }
  }
}
