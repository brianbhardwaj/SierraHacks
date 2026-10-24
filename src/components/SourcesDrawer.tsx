import { useEffect, useState } from 'react'
import { SOURCES, type SourceGroup } from '../data/facts'
import { OPEN_SOURCES } from './Cite'

const groups: SourceGroup[] = ['Ecosystems', 'Pesticide use', 'Take action', 'Tools']

/** A quiet green gradient tab at the very bottom that expands in place. */
export function SourcesDrawer() {
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)

  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<number>).detail
      setOpen(true)
      setFlash(id)
      window.setTimeout(() => {
        document.getElementById(`src-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 380)
      window.setTimeout(() => setFlash(null), 2600)
    }
    window.addEventListener(OPEN_SOURCES, onOpen)
    return () => window.removeEventListener(OPEN_SOURCES, onOpen)
  }, [])

  return (
    <section className={`src-drawer${open ? ' open' : ''}`} aria-label="Sources">
      <button
        type="button"
        className="src-tab"
        aria-expanded={open}
        aria-controls="src-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Sources &amp; data notes ({SOURCES.length})</span>
        <span className="src-chev" aria-hidden="true">⌃</span>
      </button>
      <div id="src-panel" className="src-panel">
        <div className="src-inner">
          <p className="note light">
            Every number on this site traces to one of these. Nothing is
            estimated or invented. Where a figure is old, a beekeeper poll, or
            only one of several causes, the page says so.
          </p>
          {groups.map((g) => (
            <div key={g}>
              <h4>{g}</h4>
              <ol className="sources">
                {SOURCES.filter((s) => s.group === g).map((s) => (
                  <li key={s.id} id={`src-${s.id}`} className={flash === s.id ? 'flash' : ''}>
                    <span className="sid">{s.id}</span>
                    <div>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                      <small>
                        {s.org}. Used for: {s.used}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
