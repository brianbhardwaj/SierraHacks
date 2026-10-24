export const OPEN_SOURCES = 'unspray:open-sources'

/** Opens the green Sources tab at the bottom and jumps to the source. */
export function openSource(id: number) {
  window.dispatchEvent(new CustomEvent(OPEN_SOURCES, { detail: id }))
}

export function Cite({ n }: { n: number[] }) {
  if (n.length === 0) return null
  return (
    <sup className="cite">
      {n.map((id, i) => (
        <a
          key={id}
          href={`#src-${id}`}
          aria-label={`Source ${id}`}
          onClick={(e) => {
            e.preventDefault()
            openSource(id)
          }}
        >
          {id}
          {i < n.length - 1 ? ',' : ''}
        </a>
      ))}
    </sup>
  )
}

/** Turn "[11]" or "[11, 13]" markers in plain text into source links. */
export function LinkedText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+(?:,\s*\d+)*\])/g)
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/)
        if (!m) return <span key={i}>{part}</span>
        const ids = m[1].split(',').map((s) => Number(s.trim()))
        return <Cite key={i} n={ids} />
      })}
    </>
  )
}
