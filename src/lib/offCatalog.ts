const FIELDS =
  'code,product_name,generic_name,brands,quantity,image_front_small_url,image_front_url,image_url,categories,labels,labels_tags,ingredients_text,packaging'

export async function offByBarcode(barcode: string) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
  if (!res.ok) throw new Error(`off ${res.status}`)
  return res.json() as Promise<{ status?: number; product?: Record<string, unknown> }>
}

export async function offByName(q: string) {
  const res = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&fields=${FIELDS}`,
  )
  if (!res.ok) throw new Error(`off ${res.status}`)
  return res.json() as Promise<{ products?: Record<string, unknown>[] }>
}

export function isCatalogBody(body: unknown): body is { status?: number; product?: unknown; products?: unknown[] } {
  if (!body || typeof body !== 'object') return false
  const row = body as { error?: unknown; product?: unknown; products?: unknown; status?: number }
  if (row.error && row.product == null && row.products == null) return false
  return row.product != null || Array.isArray(row.products) || row.status === 0 || row.status === 1
}
