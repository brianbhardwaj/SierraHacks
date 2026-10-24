/** Pull a barcode/GTIN or a search phrase out of a camera scan (barcode or QR). */
export function parseScanned(raw: string): { barcode?: string; query?: string } {
  const t = raw.trim()
  if (!t) return {}

  const gs1 = t.match(/(?:[?&/](?:01|gtin|gtin14)=|\/01\/)(\d{8,14})/i)
  if (gs1) return { barcode: gs1[1] }

  const compact = t.replace(/[\s-]/g, '')
  if (/^\d{8,14}$/.test(compact)) return { barcode: compact }

  try {
    const url = new URL(t)
    const fromParam =
      url.searchParams.get('gtin') ||
      url.searchParams.get('gtin14') ||
      url.searchParams.get('barcode') ||
      url.searchParams.get('ean')
    if (fromParam && /^\d{8,14}$/.test(fromParam)) return { barcode: fromParam }
    const inPath = url.pathname.match(/(\d{8,14})/)
    if (inPath) return { barcode: inPath[1] }
    const slug = decodeURIComponent(url.pathname.split('/').filter(Boolean).slice(-1)[0] ?? '')
      .replace(/[-_]+/g, ' ')
      .replace(/\.(html?|php)$/i, '')
    const words = slug.replace(/[^a-zA-Z0-9 ]/g, ' ').trim()
    if (words.length >= 3) return { query: words }
  } catch {
    /* not a URL */
  }

  const digits = t.replace(/\D/g, '')
  if (digits.length >= 8 && digits.length <= 14) return { barcode: digits }
  return { query: t.slice(0, 80) }
}
